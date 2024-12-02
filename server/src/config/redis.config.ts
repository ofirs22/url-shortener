import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

class RedisClient {

  private static instance: RedisClient;
  private client;
  
  private constructor() {
    //connect instance the first time in the constructor only once, constructor cant be called from outside the class
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
    //if instance not exist create it
    if (!RedisClient.instance) {
      const instance = new RedisClient();
      await instance.connect();
      RedisClient.instance = instance;
    }
    //return the existing instance or the newly created one
    return RedisClient.instance;
  }
  
  private async connect(): Promise<void> {
    //if client not already connected 
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