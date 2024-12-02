import express from 'express';
import { signupUser, loginUser } from '../controller/userController';
import { authenticate } from '../middlewares/auth.middleware';

const router = express.Router();

router.post('/signup', signupUser);
router.post('/login', loginUser);


export default router;