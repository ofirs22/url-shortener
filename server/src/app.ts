import express, { Application } from 'express';
import urlRoutes from './routes/urlRoutes';
import authRoutes from './routes/authRoutes';
import { redirectToLongUrl } from './controller/urlController';
import cors from 'cors';

const app: Application = express();

// Middleware
app.use(express.json());
app.use(cors());


// Url Routes
app.use('/api/v1/urls', urlRoutes);

app.use('/api/v1/auth', authRoutes); // Mount the auth routes

//Redirect route
app.get('/:shortId', redirectToLongUrl);

export default app; // Export for use in server.ts
