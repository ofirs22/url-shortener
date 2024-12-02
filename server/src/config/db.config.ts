import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

class MongooseSingleton {
  private static instance: MongooseSingleton;
  private isConnected = false;

  private constructor() {
    // Private constructor to prevent instantiation
  }

  public static getInstance(): MongooseSingleton {
    if (!MongooseSingleton.instance) {
      MongooseSingleton.instance = new MongooseSingleton();
    }
    return MongooseSingleton.instance;
  }

  public async connect(): Promise<void> {
    if (this.isConnected) {
      console.log('Database already connected');
      return;
    }

    try {
        console.log(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.CLUSTER}.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`)
      await mongoose.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.CLUSTER}.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`);
      this.isConnected = true;
      console.log('Database connected successfully');
    } catch (error) {
      console.error('Database connection failed:', error);
      process.exit(1); // Exit process if connection fails
    }
  }

  public async disconnect(): Promise<void> {
    return mongoose.disconnect().then(() => {
      this.isConnected = false;
      console.log('Database disconnected');
    });
  }
}

export default MongooseSingleton;
