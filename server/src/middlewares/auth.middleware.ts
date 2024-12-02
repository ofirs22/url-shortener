import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const authenticate = (req: Request, res: Response, next: NextFunction): void | any => {
  const userId = req.params.userId;
  //split the token from Bearer
  const token = req.headers.authorization?.split(' ')[1]; // Extract token from "Bearer <token>"

  if (!token) {
    //if token not exists
    return res.status(401).json({ success: false, message: 'No token provided' });
  }

  try {
    // Decode token and cast it to the custom type
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'defaultSecret') as { id: string; email: string };
    if(userId !== decoded.id){
      //if user id is different than the id extracted from the token return 401
      return res.status(401)
      .send({
        success: false, 
        message: 'UserId is not matching'
      })
    }
    //in case user verified go to next function
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
};
//check if user is authenticated or not
const isAuthenticated = (req: Request): string | null | undefined => {
  try{

    const token = req.headers.authorization?.split(' ')[1];
    if(!token){
      return null;
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'defaultSecret') as { id: string; email: string };
    if(decoded){
      //if token verified just return the userId
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