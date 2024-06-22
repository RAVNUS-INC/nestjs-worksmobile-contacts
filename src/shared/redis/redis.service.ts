import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class RedisService {
  constructor(@Inject(CACHE_MANAGER) private readonly cache: Cache) {}

  async get<T = any>(key: string): Promise<T> {
    return (await this.cache.get(key)) as T;
  }

  async set(key: string, value: string, ttl?: number): Promise<boolean> {
    await this.cache.set(key, value, ttl);

    return true;
  }

  async del(key: string): Promise<boolean> {
    await this.cache.del(key);
    return true;
  }
}
