import app from './app';
import mongooseSingleton from './config/db.config';
import RedisClient from './config/redis.config';


const PORT = process.env.PORT || 3080;

// Connect to MongoDB
(async () => {
    const mongooseInstance =  mongooseSingleton.getInstance();
    await mongooseInstance.connect();
})();

(async () => {
    await RedisClient.getInstance();
})();


// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});