import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { createClient, RedisClientType } from 'redis';

/**
 * Slugify string (compatible with backend_v2)
 */
function slugify(text: string): string {
  if (!text || typeof text !== 'string') return '';
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
 * Save user to Redis for socket (agent online list).
 * Same format as backend_v2 createUserAuth so AgentsGateway can read.
 */
@Injectable()
export class AuthService implements OnModuleDestroy {
  private redisClient: RedisClientType;

  async onModuleInit() {
    try {
      this.redisClient = createClient({
        url: process.env.REDIS_URL || 'redis://localhost:6379',
      });
      this.redisClient.on('error', (err) => {
        console.error('Redis Client Error in AuthService:', err);
      });
      await this.redisClient.connect();
    } catch (error) {
      console.error('AuthService: Failed to connect Redis', error);
    }
  }

  async onModuleDestroy() {
    if (this.redisClient) {
      await this.redisClient.quit();
    }
  }

  /**
   * Save user data to Redis (user:agent_id hash, company:slug:online_users zset).
   * Frontend calls POST /login with session user data; we persist for socket/agents gateway.
   */
  async saveUserToSocket(data: Record<string, any>): Promise<void> {
    if (!this.redisClient || !data?.agent_id) return;

    const agentId = String(data.agent_id);
    const companyName = data.company_name ? slugify(data.company_name) : '';
    const departmentName = data.department_name ? slugify(data.department_name) : '';

    const fields: Record<string, string> = {};
    for (const [key, value] of Object.entries(data)) {
      if (value === undefined || value === null) continue;
      if (key === 'company_name') {
        fields[key] = companyName;
      } else if (key === 'department_name') {
        fields[key] = departmentName;
      } else {
        fields[key] = String(value);
      }
    }

    const userDataKey = `user:${agentId}`;
    await this.redisClient.hSet(userDataKey, fields);

    if (departmentName) {
      const usersInDepartmentKey = `company:${companyName}:dept:${departmentName}:users`;
      await this.redisClient.sAdd(usersInDepartmentKey, agentId);
    }

    const companyOnlineUsersKey = `company:${companyName}:online_users`;
    const now = Math.floor(Date.now() / 1000);
    await this.redisClient.zAdd(companyOnlineUsersKey, { score: now, value: agentId });
  }
}
