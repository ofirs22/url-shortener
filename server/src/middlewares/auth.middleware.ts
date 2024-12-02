import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const authenticate = (req: Request, res: Response, next: NextFunction): void | any => {
  const userId = req.params.userId;
  const token = req.headers.authorization?.split(' ')[1]; // Extract token from "Bearer <token>"

  if (!token) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }

  try {
    // Decode token and cast it to the custom type
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'defaultSecret') as { id: string; email: string };
    if(userId !== decoded.id){
      return res.status(401).send({success: false, message: 'UserId is not matching'})
    }
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

const isAuthenticated = (req: Request): string | null | undefined => {
  try{
    const token = req.headers.authorization?.split(' ')[1];
    if(!token){
      return null;
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'defaultSecret') as { id: string; email: string };
    if(decoded){
      return decoded?.id
    }
  }
  catch(error){
    return null;
  }
}

export {
  isAuthenticated,  
  authenticate
}