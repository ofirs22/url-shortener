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
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
class MongooseSingleton {
    constructor() {
        this.isConnected = false;
        // Private constructor to prevent instantiation
    }
    static getInstance() {
        if (!MongooseSingleton.instance) {
            MongooseSingleton.instance = new MongooseSingleton();
        }
        return MongooseSingleton.instance;
    }
    connect() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isConnected) {
                console.log('Database already connected');
                return;
            }
            try {
                console.log(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.CLUSTER}.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`);
                yield mongoose_1.default.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.CLUSTER}.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`);
                this.isConnected = true;
                console.log('Database connected successfully');
            }
            catch (error) {
                console.error('Database connection failed:', error);
                process.exit(1); // Exit process if connection fails
            }
        });
    }
    disconnect() {
        return __awaiter(this, void 0, void 0, function* () {
            return mongoose_1.default.disconnect().then(() => {
                this.isConnected = false;
                console.log('Database disconnected');
            });
        });
    }
}
exports.default = MongooseSingleton;
