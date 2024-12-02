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
exports.updateAnalytics = exports.deleteUrl = exports.updateLongUrl = exports.getUserUrls = exports.redirectToLongUrl = exports.getShortUrl = exports.getUrlAnalytics = exports.createShortUrl = void 0;
const redis_config_1 = __importDefault(require("../config/redis.config"));
const Url_1 = __importDefault(require("../model/Url"));
const base62_1 = require("../utils/base62");
const auth_middleware_1 = require("../middlewares/auth.middleware");
// Helper function to update analytics asynchronously
const updateAnalytics = (shortId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield Url_1.default.updateOne({ shortUrl: shortId }, {
            $inc: { 'analytics.clicks': 1 }, // Increment clicks by 1
            $set: { 'analytics.lastAccessed': new Date() }, // Update last accessed
        });
    }
    catch (error) {
        console.error(`Failed to update analytics for ${shortId}:`, error);
    }
});
exports.updateAnalytics = updateAnalytics;
//if user is logged in i send the user id to the db , if not the default is null
const createShortUrl = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { longUrl } = req.body;
    try {
        console.log(longUrl, "Long URL"); // Check the input long URL
        // Get the Redis client
        const redis = yield redis_config_1.default.getInstance();
        const client = redis.getClient();
        console.log("Connected to Redis client");
        // Check if the long URL already exists in the database
        const existingUrl = yield Url_1.default.findOne({ longUrl: longUrl });
        console.log(existingUrl, "Existing URL");
        if (existingUrl) {
            // Return existing short URL if long URL is found
            return res.status(201).send({
                success: true,
                shortUrl: `${process.env.BASE_SHORTENED_URL}/${existingUrl.shortUrl}`,
                message: 'Long URL already exists',
            });
        }
        // Get a unique sequence number from Redis
        const counterKey = 'url:counter';
        const sequenceId = yield client.incr(counterKey);
        console.log(sequenceId, "Sequence ID from Redis");
        // Encode the sequence ID into Base62 with a multiplier to avoid predictable short URLs
        const shortIdentifier = (0, base62_1.encodeBase62)(sequenceId * 5);
        console.log(shortIdentifier, "Generated Short Identifier");
        // Encode the sequence ID into a Base62 string
        const shortUrl = `${shortIdentifier}`;
        // Check if the user is authenticated
        const isLoggedIn = (0, auth_middleware_1.isAuthenticated)(req);
        console.log(isLoggedIn, "Is user logged in");
        let userId = null;
        if (isLoggedIn) {
            userId = isLoggedIn; // Assuming it returns a user ID
        }
        // Save the short URL and long URL mapping in the database
        const newUrl = new Url_1.default({ shortUrl: shortIdentifier, longUrl: longUrl, userId });
        yield newUrl.save();
        console.log("New URL saved to database");
        return res.status(201).send({
            success: true,
            shortUrl: `${process.env.BASE_SHORTENED_URL}/${shortUrl}`,
            message: 'Short URL created successfully',
        });
    }
    catch (error) {
        console.error("Error in createShortUrl function:", error); // Log the full error
        return res.status(500).send({
            error: `Internal Server Error: ${error.message || error}`,
        });
    }
});
exports.createShortUrl = createShortUrl;
const redirectToLongUrl = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { shortId } = req.params; // Extract the unique identifier from the URL
    try {
        // Get Redis client instance
        const redis = yield redis_config_1.default.getInstance();
        const client = redis.getClient();
        // First, check if the URL is cached in Redis
        const cachedLongUrl = yield client.get(shortId);
        if (cachedLongUrl) {
            // Extend Redis expiration for frequently accessed URLs
            const redisTTL = parseInt(process.env.REDIS_EXPIRATION || '3600', 10);
            yield client.expire(shortId, redisTTL);
            // Update analytics in the database asynchronously
            updateAnalytics(shortId);
            // If found in cache, redirect immediately
            return res.redirect(cachedLongUrl);
        }
        // If not in cache, query the database
        const urlEntry = yield Url_1.default.findOne({ shortUrl: shortId });
        if (!urlEntry) {
            // If the short URL doesn't exist, send a 404 response
            return res.status(404).send({ success: false, error: `${process.env.BASE_SHORTENED_URL}/${shortId} Short URL not found` });
        }
        // Cache the long URL in Redis for future requests
        const redisTTL = parseInt(process.env.REDIS_EXPIRATION || '3600', 10);
        //every time the url is accessed, the redis expiration is updated
        yield client.set(shortId, urlEntry.longUrl, { EX: redisTTL }); // Cache for 1 hour
        // Update analytics in the database asynchronously
        updateAnalytics(shortId);
        // Redirect to the long URL
        return res.redirect(urlEntry.longUrl);
    }
    catch (error) {
        // Handle unexpected errors
        return res.status(500).send({ error: `Internal Server Error: ${error}` });
    }
});
exports.redirectToLongUrl = redirectToLongUrl;
const getShortUrl = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { shortId } = req.params;
    // Get Redis client instance
    const redis = yield redis_config_1.default.getInstance();
    const client = redis.getClient();
    // First, check if the URL is cached in Redis
    const cachedLongUrl = yield client.get(shortId);
    if (cachedLongUrl) {
        return res.status(200).send({ success: true, shortUrl: `${process.env.BASE_SHORTENED_URL}/${cachedLongUrl}`, message: 'Short URL created successfully' });
    }
    const urlEntry = yield Url_1.default.findOne({ shortUrl: shortId });
    if (!urlEntry) {
        return res.status(404).send({ success: false, error: `${process.env.BASE_SHORTENED_URL}/${shortId} Short URL not found` });
    }
    return res.status(200).send({ success: true, longUrl: urlEntry === null || urlEntry === void 0 ? void 0 : urlEntry.longUrl, message: 'Short URL fetched successfully' });
});
exports.getShortUrl = getShortUrl;
const getUrlAnalytics = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { shortId } = req.params;
    try {
        const urlEntry = yield Url_1.default.findOne({ shortUrl: shortId });
        if (!urlEntry) {
            return res.status(404).send({ success: false, error: `${process.env.BASE_SHORTENED_URL}/${shortId} Short URL not found` });
        }
        return res.status(200).send({ success: true, clicks: (_a = urlEntry === null || urlEntry === void 0 ? void 0 : urlEntry.analytics) === null || _a === void 0 ? void 0 : _a.clicks, lastAccessed: (_b = urlEntry === null || urlEntry === void 0 ? void 0 : urlEntry.analytics) === null || _b === void 0 ? void 0 : _b.lastAccessed, message: 'URL analytics fetched successfully' });
    }
    catch (error) {
        return res.status(500).send({ error: `Internal Server Error: ${error}` });
    }
});
exports.getUrlAnalytics = getUrlAnalytics;
const getUserUrls = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.params.userId;
    try {
        //find all urls belong to the given user
        const urls = yield Url_1.default.find({ userId });
        if (urls.length) {
            return res.status(200).send({ success: true, urls, message: 'URLs fetched successfully' });
        }
        return res.status(404).send({ success: false, message: 'No URLs found for this user' });
    }
    catch (error) {
        res.status(500).send({ success: false, message: `internal server error ${error === null || error === void 0 ? void 0 : error.message}` });
    }
});
exports.getUserUrls = getUserUrls;
//let logged in user change the long url
const updateLongUrl = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { newLongUrl, shortUrl } = req.body;
    try {
        const isUrlExist = yield Url_1.default.findOne({ longUrl: newLongUrl });
        console.log(isUrlExist);
        if (isUrlExist) {
            return res.status(400).send({ success: false, message: `Long URL ${newLongUrl} already exists` });
        }
        const updatedUrl = yield Url_1.default.findOneAndUpdate({ shortUrl }, { longUrl: newLongUrl }, { new: true });
        const redis = yield redis_config_1.default.getInstance();
        const client = redis.getClient();
        const longUrl = yield client.get(shortUrl);
        if (longUrl !== null) {
            // Update the key if it exists
            client.set(shortUrl, newLongUrl);
        }
        return res.status(201).send({ success: true, message: `Url was updated successfuly`, newLongUrl: updatedUrl === null || updatedUrl === void 0 ? void 0 : updatedUrl.longUrl });
    }
    catch (error) {
        return res.status(500).send({ success: false, message: `internal server error ${error === null || error === void 0 ? void 0 : error.message}` });
    }
});
exports.updateLongUrl = updateLongUrl;
const deleteUrl = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { shortUrl } = req.params;
    try {
        const deletedUrl = yield Url_1.default.findOneAndDelete({ shortUrl });
        // Get Redis client instance
        const redis = yield redis_config_1.default.getInstance();
        const client = redis.getClient();
        const delEntry = yield client.del(shortUrl);
        return res.status(200).send({ success: true, message: `Short URL ${shortUrl} has been deleted successfully` });
    }
    catch (error) {
        return res.status(500).send({ success: false, message: `Internal server error ${error.message}` });
    }
});
exports.deleteUrl = deleteUrl;
