import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';

/**
 * PRODUCTION REQUIREMENTS:
 * - maxmemory-policy: noeviction (do not evict session/billing data)
 * - persistence: AOF or RDB+AOF enabled
 */
@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: Redis;
  private readonly prefix = 'autowhats:';

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const host = this.configService.get<string>('REDIS_HOST', 'localhost');
    const port = this.configService.get<number>('REDIS_PORT', 6379);

    this.client = new Redis({
      host,
      port,
      maxRetriesPerRequest: null,
    });
  }

  private getKey(key: string): string {
    return key.startsWith(this.prefix) ? key : `${this.prefix}${key}`;
  }

  async get(key: string): Promise<string | null> {
    return this.client.get(this.getKey(key));
  }

  async setex(key: string, seconds: number, value: string): Promise<'OK'> {
    return this.client.setex(this.getKey(key), seconds, value);
  }

  async incr(key: string): Promise<number> {
    return this.client.incr(this.getKey(key));
  }

  async incrby(key: string, value: number): Promise<number> {
    return this.client.incrby(this.getKey(key), value);
  }

  async expire(key: string, seconds: number): Promise<number> {
    return this.client.expire(this.getKey(key), seconds);
  }

  async del(key: string): Promise<number> {
    return this.client.del(this.getKey(key));
  }

  async hget(key: string, field: string): Promise<string | null> {
    return this.client.hget(this.getKey(key), field);
  }

  async hset(key: string, field: string, value: string): Promise<number> {
    return this.client.hset(this.getKey(key), field, value);
  }

  /**
   * Atomic SET if Not Exists with Expiry (Distributed Lock)
   * @param key Key name (prefixed automatically)
   * @param value Lock value
   * @param ttlSeconds Expiry in seconds
   * @returns true if acquired, false if already exists
   */
  async setNXWithExpiry(
    key: string,
    value: string,
    ttlSeconds: number,
  ): Promise<boolean> {
    const result = await this.client.set(
      this.getKey(key),
      value,
      'EX',
      ttlSeconds,
      'NX',
    );
    return result === 'OK';
  }

  // Legacy/Alias for compatibility
  async setNX(key: string, seconds: number, value: string): Promise<boolean> {
    return this.setNXWithExpiry(key, value, seconds);
  }

  onModuleDestroy() {
    if (this.client) {
      this.client.disconnect();
    }
  }
}
