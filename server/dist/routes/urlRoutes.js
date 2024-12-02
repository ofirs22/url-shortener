"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const urlController_1 = require("../controller/urlController");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = express_1.default.Router();
// Route for creating a short URL
router.post('/shorten', urlController_1.createShortUrl);
// Route for getting the URL analytics
router.get('/analytics/:shortId/:userId', auth_middleware_1.authenticate, urlController_1.getUrlAnalytics);
// Route for getting the short URL
router.get('/:shortId', urlController_1.getShortUrl);
router.get('/getuserurls/:userId', auth_middleware_1.authenticate, urlController_1.getUserUrls);
router.put('/updatelongurl/:userId', auth_middleware_1.authenticate, urlController_1.updateLongUrl);
router.delete('/deleteurl/:userId/:shortUrl', auth_middleware_1.authenticate, urlController_1.deleteUrl);
exports.default = router;
