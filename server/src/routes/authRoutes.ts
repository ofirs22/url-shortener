import express from 'express';
import { signupUser, loginUser } from '../controller/userController';
import { authenticate } from '../middlewares/auth.middleware';

const router = express.Router();

router.post('/signup', signupUser);
router.post('/login', loginUser);

router.get('/protected', authenticate, (req, res) => {
    res.status(200).json({ success: true, message: 'Protected route accessed' });
});

export default router;