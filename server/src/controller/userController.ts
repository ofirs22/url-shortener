import { Request, Response, NextFunction } from 'express';

import userModel from '../model/User';
import { IUser } from '../model/User';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const signupUser = async(req: Request, res: Response, next: NextFunction): Promise<void | any> => {
    const { email, password } = req.body;

    if((!email) || (!password)){
        console.log("inside if")
        return res.status(400).send({success: false, message: "Email and password are required"})
    }
    try{
        const user:IUser | null = await userModel.findOne({ email });
        if(user){
            return res.status(400).send({ success: false, message: `User with email ${email} already exists` });
        }
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const newUser:IUser = new userModel({ email, password: hashedPassword });
        await newUser.save();
        return res.status(201).send({ success: true, message: 'User created successfully' });
    } catch (error) {
        console.log(error)
        return res.status(500).send({ error: `Internal Server Error: ${error}` });
    }
}

const loginUser = async(req: Request, res: Response, next: NextFunction): Promise<void | any> => {
    const { email, password } = req.body;
    try {
        // Check if the user exists
        const user = await userModel.findOne({ email });
        if (!user) {
          return res.status(404).json({ success: false, message: 'User not found' });
        }
    
        // Compare the provided password with the hashed password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
          return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }
    
        // Generate a JWT token
        const token = jwt.sign(
          { id: user._id, email: user.email },
          process.env.JWT_SECRET || 'defaultSecret', // Use a secure secret in production
          { expiresIn: '1h' } // Token expires in 1 hour
        );
    
        return res.status(201).json({
          success: true,
          message: 'Login successful',
          token,
          user: {
            id: user._id,
            email: user.email,
          },
        });
      } catch (error:any) {
        return res.status(500).json({
          success: false,
          message: 'Internal Server Error',
          error: error.message,
        });
      }
    
}

export { signupUser, loginUser };