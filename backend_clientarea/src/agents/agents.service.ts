import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class AgentsService implements OnModuleInit, OnModuleDestroy {
  private redisClient: RedisClientType;

  async onModuleInit() {
    // Initialize Redis client
    this.redisClient = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
    });

    this.redisClient.on('error', (err) => {
      console.error('Redis Client Error:', err);
    });

    await this.redisClient.connect();
    //('Redis connected for AgentsService');
  }

  async onModuleDestroy() {
    if (this.redisClient) {
      await this.redisClient.quit();
    }
  }

  /**
   * Get online agents by company
   * Similar to getCompanyOnlineUsersByAPI in backend_v2
   */
  async getOnlineAgents(companyName: string): Promise<any[]> {
    try {
      //(`🔍 [AgentsService] Getting online agents for company: ${companyName}`);

      // Slugify company name (same as backend_v2)
      const slugifiedCompanyName = this.slugify(companyName);
      const companyOnlineUsersKey = `company:${slugifiedCompanyName}:online_users`;

      //(`🔍 [AgentsService] Redis key: ${companyOnlineUsersKey}`);

      // Get all online user IDs from sorted set
      const onlineUserIds = await this.redisClient.zRange(companyOnlineUsersKey, 0, -1) as string[];

      //(`📊 [AgentsService] Found ${onlineUserIds?.length || 0} online user IDs: ${JSON.stringify(onlineUserIds)}`);

      if (!onlineUserIds || onlineUserIds.length === 0) {
        //(`⚠️ [AgentsService] No online users found for company: ${companyName}`);
        return [];
      }

      // Get user details for each online user
      const onlineAgents = [];
      for (const userId of onlineUserIds) {
        const userDataKey = `user:${userId}`;
        //(`🔍 [AgentsService] Reading user data from Redis: ${userDataKey}`);

        const userData = await this.redisClient.hGetAll(userDataKey);

        if (userData && Object.keys(userData).length > 0) {
          //(`✅ [AgentsService] User data found for ID ${userId}: ${Object.keys(userData).length} fields`);

          // Remove sensitive data
          const agentData = { ...userData };
          delete agentData.token;
          delete agentData.company_uuid;
          delete agentData.uuid;
          onlineAgents.push(agentData);

          //(`✅ [AgentsService] Added agent ${userId} (${agentData.email || agentData.name}) to list`);
        } else {
          console.warn(`⚠️ [AgentsService] No user data found in Redis for user ID: ${userId}`);
        }
      }

      //(`✅ [AgentsService] Returning ${onlineAgents.length} online agents for company: ${companyName}`);
      return onlineAgents;
    } catch (error) {
      console.error(`❌ [AgentsService] Error getting online agents for ${companyName}:`, error);
      return [];
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
   * Get agent detail by ID
   */
  async getAgentDetail(agentId: string): Promise<any> {
    try {
      const userDataKey = `user:${agentId}`;
      const userData = await this.redisClient.hGetAll(userDataKey);

      if (!userData || Object.keys(userData).length === 0) {
        return null;
      }

      // Remove sensitive data
      const agentData = { ...userData };
      delete agentData.token;
      delete agentData.password;

      return agentData;
    } catch (error) {
      console.error('Error getting agent detail:', error);
      return null;
    }
  }
}

