// outsource dependencies
import * as redis from 'redis';

// local dependencies
import { Logger } from '../service';
import { REDIS_URL } from '../constant';

class Redis {
  private CONNECTED = false;

  private client: redis.RedisClientType<redis.RedisDefaultModules & redis.RedisModules, redis.RedisFunctions, redis.RedisScripts>;

  constructor (options: redis.RedisClientOptions) {
    this.client = redis.createClient(options);
    this.client.on('connect', () => Logger.important('REDIS', `Trying to establish Redis connection ${REDIS_URL}`));
    this.client.on('error', error => Logger.error('REDIS', { message: error.message, stack: error.stack }));
    this.client.on('ready', () => {
      Logger.debug('REDIS', 'Connection ready');
      this.CONNECTED = true;
    });
    this.client.on('stopped', () => {
      Logger.debug('REDIS', 'Connection closed');
      this.CONNECTED = false;
    });
  }

  // NOTE is singleton
  private static instance: Redis;

  public static create () {
    this.instance = new Redis({
      url: REDIS_URL,
      pingInterval: 3e4,
      socket: {
        // NOTE each try increases the delay until it meets 30s
        // reconnectStrategy: retries => Math.min(retries * 5e2, 3e4),
        // NOTE after 20 tries no sense to continue
        reconnectStrategy: retries => retries > 20 ? false : retries * 5e2,
      }
    });
  }

  public static get (key): Promise<string> {
    return this.instance.client.get(key);
  }

  public static del (key): Promise<number> {
    return this.instance.client.del(key);
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
