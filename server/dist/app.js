"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const urlRoutes_1 = __importDefault(require("./routes/urlRoutes"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const urlController_1 = require("./controller/urlController");
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
// Middleware
app.use(express_1.default.json());
app.use((0, cors_1.default)());
// Url Routes
app.use('/api/v1/urls', urlRoutes_1.default);
app.use('/api/v1/auth', authRoutes_1.default); // Mount the auth routes
//Redirect route
app.get('/:shortId', urlController_1.redirectToLongUrl);
exports.default = app; // Export for use in server.ts
