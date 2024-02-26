// outsource dependencies
import * as redis from 'redis';

// local dependencies
import { Logger } from '../service';
import { REDIS_URL } from '../constant';

class Redis {
  private CONNECTED = false;

  private client: redis.RedisClientType<redis.RedisDefaultModules & redis.RedisModules, redis.RedisFunctions, redis.RedisScripts>;
  // private client: redis.RedisClientType;

  constructor (options: redis.RedisClientOptions) {
    // this.client = forceCast<redis.RedisClientType>(redis.createClient(options));
    this.client = redis.createClient(options);
    this.client.on('connect', () => Logger.important('REDIS', `Trying to establish Redis connection ${REDIS_URL}`));
    this.client.on('error', error => Logger.error('REDIS', { message: error.message, stack: error.stack }));
    this.client.on('ready', () => {
      Logger.debug('REDIS', 'Connection ready');
      this.CONNECTED = true;
    });
    this.client.on('stopped', () => {
      Logger.debug('REDIS', 'Connection stopped');
      this.CONNECTED = true;
    });
  }

  // NOTE is singleton
  private static instance: Redis;

  public static create () { this.instance = new Redis({ url: REDIS_URL }); }

  public static get (key): Promise<string> {
    return this.instance.client.get(key as any);
  }

  public static del (key): Promise<number> {
    return this.instance.client.del(key as any);
  }

  public static set (key, value): Promise<unknown> {
    return this.instance.client.set(key, value);
  }

  public static async initialize () {
    await this.instance.client.connect();
  }
}

// NOTE create server instance
Redis.create();
export { Redis };
export default Redis;