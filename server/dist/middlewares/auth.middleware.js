"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = exports.isAuthenticated = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authenticate = (req, res, next) => {
    var _a;
    const userId = req.params.userId;
    const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(' ')[1]; // Extract token from "Bearer <token>"
    if (!token) {
        return res.status(401).json({ success: false, message: 'No token provided' });
    }
    try {
        // Decode token and cast it to the custom type
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'defaultSecret');
        if (userId !== decoded.id) {
            return res.status(401).send({ success: false, message: 'UserId is not matching' });
        }
        next();
    }
    catch (error) {
        return res.status(401).json({ success: false, message: 'Invalid token' });
    }
};
exports.authenticate = authenticate;
const isAuthenticated = (req) => {
    var _a;
    try {
        const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(' ')[1];
        if (!token) {
            return null;
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'defaultSecret');
        if (decoded) {
            return decoded === null || decoded === void 0 ? void 0 : decoded.id;
        }
    }
    catch (error) {
        return null;
    }
};
exports.isAuthenticated = isAuthenticated;
