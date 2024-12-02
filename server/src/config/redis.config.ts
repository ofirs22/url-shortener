import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

class RedisClient {
  static getClient() {
    throw new Error('Method not implemented.');
  }
  static mockReturnValue(arg0: { getClient: jest.Mock<any, any, any>; }) {
    throw new Error('Method not implemented.');
  }
  private static instance: RedisClient;
  private client;

  private constructor() {
    this.client = createClient({
      password: process.env.REDIS_API_KEY || undefined, // Use API key if provided
      socket: {
        host: process.env.REDIS_URL || 'localhost',
        port: 17315,
      }
    });

    this.client.on('error', (err) => console.error('Redis Client Error', err));
  }

  // Initialize and connect to Redis
  public static async getInstance(): Promise<RedisClient> {
    if (!RedisClient.instance) {
      const instance = new RedisClient();
      await instance.connect();
      RedisClient.instance = instance;
    }
    return RedisClient.instance;
  }

  private async connect(): Promise<void> {
    if (!this.client.isOpen) {
      await this.client.connect();
      console.log('Connected to Redis');
    }
  }

  // Expose the Redis client
  public getClient() {
    return this.client;
  }

  // Gracefully close the Redis connection
  public async disconnect(): Promise<void> {
    if (this.client.isOpen) {
      await this.client.quit();
      console.log('Redis connection closed');
    }
  }
}

export default RedisClient;