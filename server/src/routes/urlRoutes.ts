import express from 'express';
import { createShortUrl, getUrlAnalytics, getShortUrl, getUserUrls, updateLongUrl, deleteUrl } from '../controller/urlController';
import { authenticate } from '../middlewares/auth.middleware';

const router = express.Router();

// Route for creating a short URL
router.post('/shorten', createShortUrl);

// Route for getting the URL analytics
router.get('/analytics/:shortId/:userId', authenticate, getUrlAnalytics);


// Route for getting the short URL
router.get('/:shortId', getShortUrl);

router.get('/getuserurls/:userId', authenticate, getUserUrls);

router.put('/updatelongurl/:userId', authenticate, updateLongUrl);

router.delete('/deleteurl/:userId/:shortUrl', authenticate, deleteUrl)

export default router;