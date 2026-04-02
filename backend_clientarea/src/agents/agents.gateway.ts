import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    OnGatewayConnection,
    OnGatewayDisconnect,
    MessageBody,
    ConnectedSocket,
  } from '@nestjs/websockets';
  import { Server, Socket } from 'socket.io';
  import { Logger } from '@nestjs/common';
  import { AgentsService } from './agents.service';
  import { createClient, RedisClientType } from 'redis';

  @WebSocketGateway({
    cors: {
      origin: true,
      credentials: true,
    },
    namespace: '/',
    path: '/socket.io/',
    transports: ['polling'],
    allowEIO3: true,
    pingTimeout: 60000,
    pingInterval: 25000,
  })
  export class AgentsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private readonly logger = new Logger(AgentsGateway.name);
    private redisClient: RedisClientType;
    private socketToUser = new Map<string, any>(); // socketId -> user data

    constructor(private readonly agentsService: AgentsService) {
     //('✅ AgentsGateway initialized');
      this.initRedis().then(() => {
        // Start periodic check after Redis is connected
        this.startPeriodicCheck();
      });
    }

    async initRedis() {
      try {
        this.redisClient = createClient({
          url: process.env.REDIS_URL || 'redis://localhost:6379',
        });

        this.redisClient.on('error', (err) => {
          console.error('Redis Client Error in AgentsGateway:', err);
        });

        await this.redisClient.connect();
       //('✅ Redis connected for AgentsGateway');
      } catch (error) {
        this.logger.error('❌ Failed to connect Redis in AgentsGateway:', error);
      }
    }

    /**
     * Slugify string (same as backend_v2)
     */
    private slugify(text: string): string {
      return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
    }

    /**
     * Format avatar URL - ensure it's a full URL
     * Handles Laravel storage paths like: storage/app/public/assets/images/uploads/gravatar/fajar-67.png
     */
    private formatAvatarUrl(avatar: string | undefined, name: string, id: string | number): string {
      // If avatar is empty, use fallback
      if (!avatar || avatar === '' || avatar === 'null' || avatar === 'undefined') {
        // Use ui-avatars as fallback
        const displayName = name || `Agent ${id}`;
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=f5f7fb&color=000`;
      }

      // If avatar is already a full URL, return as is
      if (avatar.startsWith('http://') || avatar.startsWith('https://')) {
        return avatar;
      }

      // Handle Laravel storage paths
      let avatarPath = avatar;

      // If path starts with 'storage/app/public/', convert to '/storage/' format
      if (avatarPath.startsWith('storage/app/public/')) {
        avatarPath = '/storage/' + avatarPath.replace('storage/app/public/', '');
      } else if (avatarPath.startsWith('storage/') && !avatarPath.startsWith('storage/app/public/')) {
        // If starts with 'storage/' but not 'storage/app/public/', assume it's already in correct format
        avatarPath = '/' + avatarPath;
      } else if (!avatarPath.startsWith('/') && !avatarPath.includes('://')) {
        // If relative path without leading slash, assume it's storage path
        avatarPath = '/storage/' + avatarPath;
      }

      // Construct full URL
      const baseUrl = 'https://admin-chat.genio.id';
      let fullUrl = avatarPath.startsWith('/') ? baseUrl + avatarPath : `${baseUrl}/${avatarPath}`;

      // Validate URL format
      try {
        new URL(fullUrl);
        return fullUrl;
      } catch (e) {
        // If invalid, use fallback
        const displayName = name || `Agent ${id}`;
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=f5f7fb&color=000`;
      }
    }

    /**
     * Get current datetime in unix timestamp
     */
    private getCurrentDateTime(type: 'unix' | 'normal' = 'normal'): string | number {
      if (type === 'unix') {
        return Math.floor(Date.now() / 1000);
      }
      return new Date().toISOString().slice(0, 19).replace('T', ' ');
    }

    /**
     * Get online users in a company from Redis (primary source)
     * This reads from Redis where admin Laravel saves agent data on login
     */
    private async getCompanyOnlineUsersFromRedis(companyName: string): Promise<any[]> {
      try {
        const slugifiedCompanyName = this.slugify(companyName);
        const companyOnlineUsersKey = `company:${slugifiedCompanyName}:online_users`;

       //(`🔍 Reading online users from Redis for company: ${companyName} (key: ${companyOnlineUsersKey})`);

        // Get all online user IDs from sorted set in Redis
        const onlineUserIds = await this.redisClient.zRange(companyOnlineUsersKey, 0, -1) as string[];

       //(`📊 Found ${onlineUserIds?.length || 0} online user IDs in Redis: ${JSON.stringify(onlineUserIds)}`);

        if (!onlineUserIds || onlineUserIds.length === 0) {
          //(`⚠️ No online users found in Redis for company: ${companyName}`);
          return [];
        }

        // Get user details for each online user from Redis
        const onlineUsers = [];
        for (const userId of onlineUserIds) {
          const userDataKey = `user:${userId}`;
         //(`🔍 Reading user data from Redis: ${userDataKey}`);

          const userData = await this.redisClient.hGetAll(userDataKey);

          if (userData && Object.keys(userData).length > 0) {
           //(`✅ User data found for ID ${userId}: roles_id=${userData.roles_id || userData.id_roles}`);
           //(`📋 User data fields: ${Object.keys(userData).join(', ')}`);
           //(`📋 User data sample: name=${userData.name || 'N/A'}, name_agent=${userData.name_agent || 'N/A'}, email=${userData.email || 'N/A'}`);

            // Only include agents (roles_id = 4)
            if (userData.roles_id === '4' || userData.id_roles === '4') {
              // Check agent status - include if active (status = 1) or 'online' dari frontend
              // Status values: 0 = Inactive, 1 = Active, 2 = Pending, 9 = Suspended, 'online' = dari client area
              const statusVal = userData.status ? String(userData.status).toLowerCase() : '';
              const isActive = statusVal === '1' || statusVal === 'online';

              if (!isActive) {
                continue;
              }

              // Create agent data with all possible field mappings for frontend compatibility
              const agentData: any = {
                // Primary ID fields - map both ways for compatibility
                id: userData.id || userData.agent_id || userId,
                agent_id: userData.agent_id || userData.id || userId,

                // Name fields - use name_agent as primary, fallback to name or email
                name: userData.name_agent || userData.name || userData.email_agent || userData.email || '',
                name_agent: userData.name_agent || userData.name || userData.email_agent || userData.email || '',

                // Email fields
                email: userData.email_agent || userData.email || '',
                email_agent: userData.email_agent || userData.email || '',

                // Role fields
                roles_id: userData.roles_id || userData.id_roles || '4',
                id_roles: userData.id_roles || userData.roles_id || '4',

                // Company fields
                company_name: userData.company_name || '',
                id_company: userData.id_company || userData.company_id || '',

                // Department fields
                department_name: userData.department_name || '',
                id_department: userData.id_department || '',

                // Other fields - format avatar URL
                avatar: this.formatAvatarUrl(userData.avatar, userData.name_agent || userData.name || userData.email_agent || userData.email || '', userData.id || userData.agent_id || userId),
                phone: userData.phone_agent || userData.phone || '',
                phone_agent: userData.phone_agent || userData.phone || '',
                status: userData.status || '1',
                type_user: userData.type_user || 'agent',
                permission_name: userData.permission_name || 'Agent',
                full_access: userData.full_access || '0',
                uuid: userData.uuid || '',
                company_uuid: userData.company_uuid || '',
              };

              // Remove sensitive data
              delete agentData.token;
              delete agentData.password;

              onlineUsers.push(agentData);
             //(`✅ Added agent ${agentData.id} (${agentData.name}) to online list`);
            } else {
             //(`⏭️ Skipped user ${userId} (not an agent, roles_id=${userData.roles_id || userData.id_roles})`);
            }
          } else {
            // //(`⚠️ No user data found in Redis for user ID: ${userId}`);
          }
        }

       //(`📋 Total online agents found: ${onlineUsers.length}`);
        return onlineUsers;
      } catch (error) {
        this.logger.error(`❌ Error getting company online users from Redis for ${companyName}:`, error);
        return [];
      }
    }

    /**
     * Get online users in a company from socket rooms (fallback)
     */
    private async getCompanyOnlineUsers(companyName: string): Promise<any[]> {
      try {
        // First try to get from Redis (where admin Laravel saves data)
        const redisUsers = await this.getCompanyOnlineUsersFromRedis(companyName);
        if (redisUsers.length > 0) {
          return redisUsers;
        }

        // Fallback to socket rooms if Redis is empty
        const slugifiedCompanyName = this.slugify(companyName);
        const companyOnlineUserRoom = `company:${slugifiedCompanyName}:online_user_room`;

        const sockets = await this.server.in(companyOnlineUserRoom).fetchSockets();
        const onlineUsers = [];

        for (const socket of sockets) {
          const user = this.socketToUser.get(socket.id);
          if (user && user.id) {
            onlineUsers.push(user);
          }
        }

        // DISTINCT - remove duplicates by id
        const uniqueUsers = onlineUsers.filter((value, index, array) => {
          return index === onlineUsers.findIndex(other => {
            return other.id == value.id;
          });
        });

        return uniqueUsers;
      } catch (error) {
        this.logger.error('Error getting company online users:', error);
        return [];
      }
    }

    /**
     * Emit users.online event to all agents in company
     */
    private async emitOnlineUsers(companyName: string) {
      try {
       //(`📡 Starting emit online users for company: ${companyName}`);

        const onlineUsers = await this.getCompanyOnlineUsers(companyName);
        const slugifiedCompanyName = this.slugify(companyName);
        const companyOnlineUserRoom = `company:${slugifiedCompanyName}:online_user_room`;

        // Get sockets in room to see how many will receive the event
        const sockets = await this.server.in(companyOnlineUserRoom).fetchSockets();
        const socketCount = sockets.length;

       //(`📢 Emitting users.online to room: ${companyOnlineUserRoom}`);
       //(`👥 Online users to emit: ${onlineUsers.length}`);
       //(`🔌 Sockets in room: ${socketCount}`);

        if (onlineUsers.length > 0) {
          // this.logger.log(`📋 Agent list: ${onlineUsers.map(u => `${u.id || u.agent_id || 'N/A'} (${u.name || u.name_agent || u.email || 'N/A'})`).join(', ')}`);
        }

        this.server.to(companyOnlineUserRoom).emit('users.online', onlineUsers);

       //(`✅ Successfully emitted users.online to ${socketCount} socket(s) in ${companyOnlineUserRoom}`);
      } catch (error) {
        this.logger.error(`❌ Error emitting online users for ${companyName}:`, error);
      }
    }

    /**
     * Get user data from Redis by agent ID
     */
    private async getUserFromRedis(agentId: string): Promise<any> {
      try {
        const userDataKey = `user:${agentId}`;
        const userData = await this.redisClient.hGetAll(userDataKey);

        if (userData && Object.keys(userData).length > 0) {
         //(`✅ Found user data in Redis for agent ID: ${agentId}`);
          return userData;
        }

        //(`⚠️ No user data found in Redis for agent ID: ${agentId}`);
        return null;
      } catch (error) {
        this.logger.error(`❌ Error getting user from Redis for agent ID ${agentId}:`, error);
        return null;
      }
    }

    /**
     * Authenticate client and join company room
     */
    private async authenticateClient(client: Socket, userData: any) {
      const id = userData?.id ?? userData?.agent_id;
      if (!userData || !id || !userData.roles_id) {
        //(`⚠️ Invalid user data for authentication:`, userData);
        return false;
      }
      if (!userData.id) {
        userData = { ...userData, id };
      }

      const slugifiedCompanyName = this.slugify(userData.company_name || '');
      const companyOnlineUserRoom = `company:${slugifiedCompanyName}:online_user_room`;

      // Join company online user room
      client.join(companyOnlineUserRoom);
     //(`🏠 Client ${client.id} joined room: ${companyOnlineUserRoom}`);

      // Store user data in memory
      this.socketToUser.set(client.id, userData);
      (client as any).data = { user: userData };

     //(`✅ Client ${client.id} authenticated as agent ${userData.id} (${userData.email || userData.name})`);

      // Emit online users from Redis
      await this.emitOnlineUsers(userData.company_name);

      return true;
    }

    /**
     * Handle agent connection
     * Since we're using admin Laravel for login, we just need to:
     * 1. Join the company room
     * 2. Read online users from Redis (where admin Laravel saves data)
     * 3. Emit users.online event
     */
    async handleConnection(client: Socket) {
     //(`🔌 ========== NEW CLIENT CONNECTION ==========`);
     //(`🔌 Client ID: ${client.id}`);
     //(`🔌 Transport: ${client.conn.transport.name}`);
     //(`🔌 Handshake auth: ${JSON.stringify((client.handshake as any).auth)}`);
     //(`🔌 Handshake query: ${JSON.stringify((client.handshake as any).query)}`);
     //(`🔌 Request headers: ${JSON.stringify((client.request as any).headers)}`);

      // Get user data from multiple sources
      let user = (client.handshake as any).auth?.user ||
                 (client.request as any).session?.user ||
                 (client.handshake as any).query?.user;

      // Try to get from cookie if available
      const cookies = (client.request as any).headers?.cookie || '';
     //(`🍪 Cookies: ${cookies.substring(0, 100)}...`);

      // Try to parse user if it's a string
      let parsedUser = user;
      if (typeof user === 'string') {
        try {
          parsedUser = JSON.parse(user);
         //(`✅ Parsed user from string: ${JSON.stringify(parsedUser)}`);
        } catch (e) {
          //(`⚠️ Failed to parse user string: ${e.message}`);
        }
      }

      // If we have user data, authenticate immediately
      if (parsedUser && parsedUser.id && parsedUser.roles_id) {
        await this.authenticateClient(client, parsedUser);
      } else {
        // No user data on connection - client needs to authenticate via event
        //(`⚠️ ========== CLIENT CONNECTED WITHOUT VALID USER DATA ==========`);
        //(`⚠️ Client ID: ${client.id}`);
        //(`⚠️ Client should send 'authenticate' event with user data or agent_id`);
        //(`⚠️ Or we can try to get from Redis if agent_id is in query/cookie`);

        // Try to get agent_id from query
        const agentId = (client.handshake as any).query?.agent_id ||
                        (client.handshake as any).query?.id;

        if (agentId) {
         //(`🔍 Found agent_id in query: ${agentId}, trying to get from Redis`);
          const userFromRedis = await this.getUserFromRedis(String(agentId));
          if (userFromRedis) {
            await this.authenticateClient(client, userFromRedis);
          }
        } else {
          // Try to get company_name from query and auto-join room
          let companyName = (client.handshake as any).query?.company_name;

          // If no company_name in query, try to get from Redis (prefer demo-inc)
          if (!companyName) {
            const companies = await this.getAllCompaniesFromRedis();
            const validCompanies = companies.filter(c => c && c !== 'undefined' && c !== 'null' && c !== '');
            if (validCompanies.length > 0) {
              companyName = validCompanies.find(c => c === 'demo-inc') || validCompanies[0];
             //(`🔍 Auto-detected company from Redis during connect: ${companyName}`);
            }
          }

          if (companyName && companyName !== 'undefined' && companyName !== 'null') {
           //(`🏠 Auto-joining company room: ${companyName}`);
            const slugifiedCompanyName = this.slugify(companyName);
            const companyOnlineUserRoom = `company:${slugifiedCompanyName}:online_user_room`;
            client.join(companyOnlineUserRoom);
           //(`🏠 Client ${client.id} auto-joined room: ${companyOnlineUserRoom}`);

            // Immediately emit online users directly to client
            const onlineUsers = await this.getCompanyOnlineUsers(companyName);
           //(`📡 Auto-sending ${onlineUsers.length} online users to client ${client.id}`);
            client.emit('users.online', onlineUsers);
          }
        }
      }

     //(`🔌 ========== CONNECTION HANDLED ==========`);
    }

    /**
     * Handle agent disconnection
     */
    async handleDisconnect(client: Socket) {
     //(`🔌 ========== CLIENT DISCONNECTED ==========`);
     //(`🔌 Client ID: ${client.id}`);

      const user = this.socketToUser.get(client.id);

      if (user && user.id && user.roles_id) {
        // Agent disconnection
        const slugifiedCompanyName = this.slugify(user.company_name);

       //(`👤 Agent disconnecting: ${user.id} (${user.email || user.name})`);
       //(`🏢 Company: ${user.company_name}`);

        // Note: We don't remove from Redis here because admin Laravel handles that on logout
        // We only remove from memory and emit updated list

        // Remove from memory
        this.socketToUser.delete(client.id);
       //(`🗑️ Removed agent ${user.id} from memory`);

        // Emit updated online users to all agents in company (from Redis)
       //(`📡 Triggering emit online users after disconnect`);
        await this.emitOnlineUsers(user.company_name);
      } else {
        //(`⚠️ Client ${client.id} disconnected but no user data found in memory`);
      }

     //(`🔌 ========== DISCONNECTION HANDLED ==========`);
    }


    /**
     * Handle authenticate event
     * Client can send user data or agent_id to authenticate
     */
    @SubscribeMessage('authenticate')
    async handleAuthenticate(
      @ConnectedSocket() client: Socket,
      @MessageBody() data: { user?: any; agent_id?: string; company_name?: string },
    ) {
     //(`🔐 ========== AUTHENTICATE REQUEST ==========`);
     //(`🔐 Client ID: ${client.id}`);
     //(`🔐 Data: ${JSON.stringify(data)}`);

      let userData = data.user;

      // If agent_id provided, get from Redis
      if (!userData && data.agent_id) {
       //(`🔍 Getting user data from Redis for agent_id: ${data.agent_id}`);
        userData = await this.getUserFromRedis(data.agent_id);
        // Redis hash pakai agent_id, gateway expect id
        if (userData && !userData.id && userData.agent_id) {
          userData = { ...userData, id: userData.agent_id };
        }
      }

      // If company_name provided but no user data, try to emit for that company
      if (!userData && data.company_name) {
       //(`📡 Emitting online users for company: ${data.company_name}`);
        await this.emitOnlineUsers(data.company_name);
        return { success: true, message: 'Online users emitted for company' };
      }

      if (userData) {
        const authenticated = await this.authenticateClient(client, userData);
        return { success: authenticated, message: authenticated ? 'Authenticated successfully' : 'Authentication failed' };
      }

      //(`⚠️ Authentication failed: No user data or agent_id provided`);
      return { success: false, message: 'No user data or agent_id provided' };
    }

    /**
     * Handle request for online users
     */
    @SubscribeMessage('users.online')
    async handleGetOnlineUsers(
      @ConnectedSocket() client: Socket,
      @MessageBody() data?: { company_name?: string },
    ) {
     //(`📡 ========== USERS.ONLINE REQUEST ==========`);
     //(`📡 Client ID: ${client.id}`);
     //(`📡 Data: ${JSON.stringify(data)}`);

      const user = this.socketToUser.get(client.id);
      const companyName = data?.company_name || user?.company_name;

      if (companyName) {
       //(`📡 Request for company: ${companyName}`);
        const onlineUsers = await this.getCompanyOnlineUsers(companyName);
       //(`📡 Sending ${onlineUsers.length} online users to client ${client.id}`);
        client.emit('users.online', onlineUsers);
        return { success: true, data: onlineUsers };
      } else {
        //(`⚠️ users.online requested but no company_name found for client ${client.id}`);
        return { success: false, message: 'Company name not found' };
      }
    }

    /**
     * Handle join company room request
     * Frontend can call this to join the company room and receive users.online events
     * Accepts: company_name (string) or companyName (string) or just string
     */
    @SubscribeMessage('join.company')
    async handleJoinCompany(
      @ConnectedSocket() client: Socket,
      @MessageBody() data?: any,
    ) {
     //(`🏠 ========== JOIN COMPANY REQUEST ==========`);
     //(`🏠 Client ID: ${client.id}`);
     //(`🏠 Data: ${JSON.stringify(data)}`);

      // Accept multiple formats: { company_name: '...' }, { companyName: '...' }, or just 'company-name'
      let companyName: string | null = null;

      if (typeof data === 'string') {
        companyName = data;
      } else if (data && typeof data === 'object') {
        companyName = data.company_name || data.companyName || data.company || null;
      }

      // If still no company name, try to get from user data in memory
      if (!companyName) {
        const user = this.socketToUser.get(client.id);
        companyName = user?.company_name || null;
      }

      if (!companyName) {
        //(`⚠️ No company name provided for join.company request`);
        // Try to get from all companies in Redis and join the first one
        const companies = await this.getAllCompaniesFromRedis();
        if (companies.length > 0) {
          companyName = companies[0];
         //(`🔍 Auto-detected company from Redis: ${companyName}`);
        } else {
          return { success: false, message: 'Company name is required' };
        }
      }

      const slugifiedCompanyName = this.slugify(companyName);
      const companyOnlineUserRoom = `company:${slugifiedCompanyName}:online_user_room`;

      // Join the room
      client.join(companyOnlineUserRoom);
     //(`🏠 Client ${client.id} joined room: ${companyOnlineUserRoom}`);

      // Immediately emit online users for this company
      const onlineUsers = await this.getCompanyOnlineUsers(companyName);
     //(`📡 Sending ${onlineUsers.length} online users to client ${client.id} after join`);
      client.emit('users.online', onlineUsers);

      return { success: true, room: companyOnlineUserRoom, onlineUsers: onlineUsers.length };
    }

    /**
     * Handle reload event - also join company room if not already joined
     * If no company_name, try to join all companies and emit to client directly
     */
    @SubscribeMessage('reload')
    async handleReload(
      @ConnectedSocket() client: Socket,
      @MessageBody() data?: any,
    ) {
     //(`🔄 ========== RELOAD REQUESTED ==========`);
     //(`🔄 Client ID: ${client.id}`);
     //(`🔄 Data: ${JSON.stringify(data)}`);

      const user = this.socketToUser.get(client.id);
      let companyName = user?.company_name || data?.company_name || data?.companyName;

      // If no company_name, try to get from all companies in Redis
      if (!companyName) {
        const companies = await this.getAllCompaniesFromRedis();
        // Filter out invalid company names
        const validCompanies = companies.filter(c => c && c !== 'undefined' && c !== 'null' && c !== '');
        if (validCompanies.length > 0) {
          // Prefer demo-inc, otherwise use first valid company
          companyName = validCompanies.find(c => c === 'demo-inc') || validCompanies[0];
         //(`🔍 Auto-detected company from Redis: ${companyName}`);
        }
      }

      if (companyName && companyName !== 'undefined' && companyName !== 'null') {
        // Join room if not already joined
        const slugifiedCompanyName = this.slugify(companyName);
        const companyOnlineUserRoom = `company:${slugifiedCompanyName}:online_user_room`;
        client.join(companyOnlineUserRoom);
       //(`🏠 Client ${client.id} joined room during reload: ${companyOnlineUserRoom}`);

        // Get online users and emit directly to client (not just to room)
        const onlineUsers = await this.getCompanyOnlineUsers(companyName);
       //(`📡 Sending ${onlineUsers.length} online users directly to client ${client.id}`);
        client.emit('users.online', onlineUsers);

        // Also emit to room for other clients
        await this.emitOnlineUsers(companyName);
      } else {
        //(`⚠️ Reload requested but no valid company_name found for client ${client.id}`);
        // Fallback: emit all companies' online users to this client
        const companies = await this.getAllCompaniesFromRedis();
        const validCompanies = companies.filter(c => c && c !== 'undefined' && c !== 'null' && c !== '');
        for (const company of validCompanies) {
          const onlineUsers = await this.getCompanyOnlineUsers(company);
          if (onlineUsers.length > 0) {
           //(`📡 Fallback: Sending ${onlineUsers.length} online users from ${company} to client ${client.id}`);
            client.emit('users.online', onlineUsers);
            // Join the room too
            const slugifiedCompanyName = this.slugify(company);
            const companyOnlineUserRoom = `company:${slugifiedCompanyName}:online_user_room`;
            client.join(companyOnlineUserRoom);
           //(`🏠 Client ${client.id} joined room: ${companyOnlineUserRoom}`);
            break; // Only send first company's data
          }
        }
      }
    }

    /**
     * Get all companies with online users from Redis
     */
    private async getAllCompaniesFromRedis(): Promise<string[]> {
      try {
        // Get all keys matching pattern company:*:online_users
        const pattern = 'company:*:online_users';
        const keys = await this.redisClient.keys(pattern);

        // Extract company names from keys
        const companyNames = keys.map(key => {
          // key format: company:company-name:online_users
          const match = key.match(/^company:(.+):online_users$/);
          return match ? match[1] : null;
        }).filter(name => name !== null) as string[];

        return companyNames;
      } catch (error) {
        this.logger.error(`❌ Error getting companies from Redis:`, error);
        return [];
      }
    }

    /**
     * Periodic check for online users from Redis
     * This ensures we always have the latest data from admin Laravel
     */
    private async startPeriodicCheck() {
     //(`⏰ Starting periodic check for online users (every 5 seconds)`);

      // Check every 5 seconds for online users updates
      setInterval(async () => {
        try {
          // Get all unique company names from connected sockets
          const companyNamesFromSockets = new Set<string>();
          this.socketToUser.forEach((user) => {
            if (user && user.company_name) {
              companyNamesFromSockets.add(user.company_name);
            }
          });

          // Also get all companies from Redis (where admin Laravel saves data)
          const companiesFromRedis = await this.getAllCompaniesFromRedis();
         //(`🔍 Found ${companiesFromRedis.length} company(ies) with online users in Redis`);

          // Combine both sets
          const allCompanyNames = new Set<string>([
            ...Array.from(companyNamesFromSockets),
            ...companiesFromRedis
          ]);

          if (allCompanyNames.size > 0) {
           //(`🔄 Periodic check: Processing ${allCompanyNames.size} company(ies)`);

            // Emit for each company
            for (const companyName of allCompanyNames) {
             //(`🔄 Periodic check: Checking company ${companyName}`);
              await this.emitOnlineUsers(companyName);
            }
          } else {
           //(`🔄 Periodic check: No companies found`);
          }
        } catch (error) {
          this.logger.error(`❌ Error in periodic check:`, error);
        }
      }, 5000); // Check every 5 seconds
    }
  }

