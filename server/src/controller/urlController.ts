import { Request, Response } from 'express';

import RedisClient from '../config/redis.config';
import UrlModel from '../model/Url';
import { encodeBase62 } from '../utils/base62';
import { IUrl } from '../model/Url';
import { isAuthenticated } from '../middlewares/auth.middleware'
import CronManager from '../config/cron.config';

// Helper function to update analytics asynchronously
const updateAnalytics = async (shortId: string) => {
    try {
      // when short url is clicked, update the analytics async
      await UrlModel.updateOne(
        { shortUrl: shortId },
        {
          $inc: { 'analytics.clicks': 1 }, // Increment clicks by 1
          $set: { 'analytics.lastAccessed': new Date() }, // Update last accessed
        }
      );
    } catch (error) {
      console.error(`Failed to update analytics for ${shortId}:`, error);
    }
  };
//if user is logged in i send the user id to the db , if not the default is null
const createShortUrl = async (req: Request, res: Response): Promise<void | any> => {
    const { longUrl } = req.body;
    try {
      console.log(longUrl, "Long URL"); // Check the input long URL
  
      // Get the Redis client
      const redis = await RedisClient.getInstance();
      const client = redis.getClient();
      console.log("Connected to Redis client");
  
      // Check if the long URL already exists in the database
      const existingUrl = await UrlModel.findOne({ longUrl: longUrl });
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
      const sequenceId = await client.incr(counterKey);
      console.log(sequenceId, "Sequence ID from Redis");
  
      // Encode the sequence ID into Base62 with a multiplier to avoid predictable short URLs
      const shortIdentifier = encodeBase62(sequenceId * 5);
      console.log(shortIdentifier, "Generated Short Identifier");
  
      // Encode the sequence ID into a Base62 string
      const shortUrl = `${shortIdentifier}`;
  
      // Check if the user is authenticated
      const isLoggedIn = isAuthenticated(req);
      console.log(isLoggedIn, "Is user logged in");
  
      let userId = null;
      if (isLoggedIn) {
        userId = isLoggedIn; // Assuming it returns a user ID
      }
  
      // Save the short URL and long URL mapping in the database
      const newUrl = new UrlModel({ shortUrl: shortIdentifier, longUrl: longUrl, userId });
      await newUrl.save();
      console.log("New URL saved to database");
      CronManager.addJob(shortIdentifier, '*/1 * * * *', async() =>{
        console.log(shortIdentifier, " Loop")
        const deletedUrl = await UrlModel.findOneAndDelete({shortUrl: shortIdentifier});
        
        client.del(shortUrl);
        if(deletedUrl){
          console.log('Short url has been deleted from the database and from cache');
        }
        CronManager.removeJob(shortIdentifier);
      });
      console.log(CronManager.listJobs())
      return res.status(201).send({
        success: true,
        shortUrl: `${process.env.BASE_SHORTENED_URL}/${shortUrl}`,
        message: 'Short URL created successfully',
      });
  
    } catch (error:any) {
      console.error("Error in createShortUrl function:", error); // Log the full error
      return res.status(500).send({
        error: `Internal Server Error: ${error.message || error}`,
      });
    }
  };


const redirectToLongUrl = async (req: Request, res: Response): Promise<void | any> => {
  const { shortId } = req.params; // Extract the unique identifier from the URL

  try {

    // Get Redis client instance
    const redis = await RedisClient.getInstance();
    const client = redis.getClient();

    // First, check if the URL is cached in Redis
    const cachedLongUrl = await client.get(shortId);

    if (cachedLongUrl) {
      
      // Extend Redis expiration for frequently accessed URLs
      const redisTTL = parseInt(process.env.REDIS_EXPIRATION || '3600', 10); 
      await client.expire(shortId, redisTTL);
      // Update analytics in the database asynchronously
      updateAnalytics(shortId);
      // If found in cache, redirect immediately
      return res.redirect(cachedLongUrl);
    }

    // If not in cache, query the database
    const urlEntry = await UrlModel.findOne({ shortUrl: shortId });

    if (!urlEntry) {
      // If the short URL doesn't exist, send a 404 response
      return res.status(404).send({ success: false, error: `${process.env.BASE_SHORTENED_URL}/${shortId} Short URL not found` });
    }
    // Cache the long URL in Redis for future requests
    const redisTTL = parseInt(process.env.REDIS_EXPIRATION || '3600', 10);
    //every time the url is accessed, the redis expiration is updated
    await client.set(shortId, urlEntry.longUrl, { EX: redisTTL }); // Cache for 1 hour
    // Update analytics in the database asynchronously
    updateAnalytics(shortId);
    // Redirect to the long URL
    return res.redirect(urlEntry.longUrl);
  } catch (error) {
    // Handle unexpected errors
    return res.status(500).send({ error: `Internal Server Error: ${error}` });
  }
};


const getShortUrl = async (req: Request, res: Response): Promise<void | any> => {
    const { shortId } = req.params;
    // Get Redis client instance
    const redis = await RedisClient.getInstance();
    const client = redis.getClient();

    // First, check if the URL is cached in Redis
    const cachedLongUrl = await client.get(shortId);
    if(cachedLongUrl){
      //return it in case its in the cache
      return res.status(200).send({ success: true, shortUrl: `${process.env.BASE_SHORTENED_URL}/${cachedLongUrl}`, message: 'Short URL created successfully' });
    }
    //in case its not in cache, fetch it from the db
    const urlEntry = await UrlModel.findOne({ shortUrl: shortId });
    if(!urlEntry){
      //return 404 if its not exist in db too
      return res.status(404).send({ success: false, error: `${process.env.BASE_SHORTENED_URL}/${shortId} Short URL not found` });
    }
    //return the short url
    return res.status(200).send({ success: true, longUrl: urlEntry?.longUrl, message: 'Short URL fetched successfully' });
};

const getUrlAnalytics = async(req: Request, res: Response):Promise<void | any> => {
    const { shortId } = req.params;

    try{
        //get the data from the db by short url
        const urlEntry:IUrl | null = await UrlModel.findOne({ shortUrl: shortId });
        if(!urlEntry){
          //if its not exist
            return res.status(404)
            .send({ 
              success: false, 
              error: `${process.env.BASE_SHORTENED_URL}/${shortId} Short URL not found` 
            });
        }
        //return only the analytics part
        return res.status(200)
        .send({ 
          success: true, 
          clicks: urlEntry?.analytics?.clicks, 
          lastAccessed: urlEntry?.analytics?.lastAccessed, 
          message: 'URL analytics fetched successfully' 
        });
    } catch (error) {
        return res.status(500).send({ error: `Internal Server Error: ${error}` });
    }
};


const getUserUrls = async(req:Request, res: Response):Promise<void | any> => {
    const userId = req.params.userId;

    try {
        //find all urls belong to the given user
        const urls = await UrlModel.find({userId});
        //if found
        if (urls.length) {
            return res.status(200).send({ success: true, urls, message: 'URLs fetched successfully'});
        }
        //if no urls for the given user
        return res.status(404)
        .send({ 
          success: false, 
          message: 'No URLs found for this user' 
        });
    }
    catch (error: any) {
        res.status(500).
        end({
          success: false, 
          message: `internal server error ${error?.message}`
        })
    }
}

//let logged in user change the long url
const updateLongUrl = async(req:Request, res: Response):Promise<void | any> => {

    const { newLongUrl, shortUrl } = req.body;

    try{
        //look for the new long url in the db
        const isUrlExist = await UrlModel.findOne({longUrl: newLongUrl});
        console.log(isUrlExist)
        //if it exists return 400 bad request with message that the url already exist in the db
        if(isUrlExist){
            return res.status(400).send({success: false, message: `Long URL ${newLongUrl} already exists`})
        }
        //update the db with the new long url
        const updatedUrl = await UrlModel
        .findOneAndUpdate({
          shortUrl}, 
          {longUrl: newLongUrl}, 
          {new: true});
          //get redis instance and connect to it
        const redis = await RedisClient.getInstance();
        const client = redis.getClient();
        //check if the short url exists in cache
        const longUrl = await client.get(shortUrl);
        //if it exists
        if(longUrl!== null){
          // Update the key if it exists
            client.set(shortUrl, newLongUrl);      
        }
        //return the new long url
        return res.status(201)
        .send({
          success: true, 
          message: `Url was updated successfuly`, 
          newLongUrl: updatedUrl?.longUrl
        })
    }
    catch(error:any){
        return res.status(500).send({success: false, message: `internal server error ${error?.message}`}) 
    }
}

const deleteUrl = async(req: Request, res: Response): Promise<void | any> =>{
    const { shortUrl } = req.params;
    try{
      //delete the url from the db
        const deletedUrl = await UrlModel.findOneAndDelete({shortUrl});
            // Get Redis client instance and connect
        const redis = await RedisClient.getInstance();
        const client = redis.getClient();
        //delete it from cache if it exists
        const delEntry = await client.del(shortUrl)
        //if cron job exist for this short url , remove it
        if(CronManager.getJob(shortUrl)){
          CronManager.removeJob(shortUrl);
        }
        
        return res.status(200)
        .send({
          success: true, 
          message: `Short URL ${shortUrl} has been deleted successfully`
        })
    }
    catch(error:any){
        return res.status(500).send({success: false, message: `Internal server error ${error.message}`})
    }
    
}

export { 
    createShortUrl,
    getUrlAnalytics,
    getShortUrl,
    redirectToLongUrl,
    getUserUrls,
    updateLongUrl,
    deleteUrl
};