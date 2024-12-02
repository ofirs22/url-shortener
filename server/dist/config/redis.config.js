"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const redis_1 = require("redis");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
class RedisClient {
    static getClient() {
        throw new Error('Method not implemented.');
    }
    static mockReturnValue(arg0) {
        throw new Error('Method not implemented.');
    }
    constructor() {
        this.client = (0, redis_1.createClient)({
            password: process.env.REDIS_API_KEY || undefined, // Use API key if provided
            socket: {
                host: process.env.REDIS_URL || 'localhost',
                port: 17315,
            }
        });
        this.client.on('error', (err) => console.error('Redis Client Error', err));
    }
    // Initialize and connect to Redis
    static getInstance() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!RedisClient.instance) {
                const instance = new RedisClient();
                yield instance.connect();
                RedisClient.instance = instance;
            }
            return RedisClient.instance;
        });
    }
    connect() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.client.isOpen) {
                yield this.client.connect();
                console.log('Connected to Redis');
            }
        });
    }
    // Expose the Redis client
    getClient() {
        return this.client;
    }
    // Gracefully close the Redis connection
    disconnect() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.client.isOpen) {
                yield this.client.quit();
                console.log('Redis connection closed');
            }
        });
    }
}
exports.default = RedisClient;
