import { regSchema , logSchema } from "../validator/userReq.js";
import AppError from '../utils/error.js'
import User from '../models/user.model.js'
import bcrypt from 'bcryptjs'
import { token } from "morgan";
const cookieOptions = {
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7days
    httpOnly:true,
    secure:true,
};
const register = async(req, res, next) =>{
   const result = await regSchema.validate(req.body)
   const { value:{ fullName , password , email} } = result; 
   const userExists = await User.findOne({ email:email });
   console.log(userExists)
   if (userExists) {
       return next(new AppError("User Already Exists", 400));
   }
   
   const user = await User.create({
    fullName,
    password,
    email,
    avatar:{
        public_id: email,
        secure_url: 'wwww.google.com'
    }
   });

   if(!user){
        return next(new AppError("User Registration failed" , 400));
   }

   await user.save();

   user.password = undefined ;
   console.log(user)
   console.log(JSON.stringify(user))
   const token = await user.generateJWTToken(); // Fix the method name to generateJWTToken

   res.cookie('token', token , cookieOptions)
   res.status(201).json({
    success:true,
    message:'User registered successfully',
    user
   })

   
};

const login = async (req, res, next) =>{
    try {
        const result = await logSchema.validate(req.body)
        const { value:{ email,password } } = result; 
        const  user = await User.findOne({
            email: email
        }).select('+password');
        if(!user || !user.comparePassword(password)){
            return next(new AppError('Email and password does not match',400))
        }
        const token = await user.generateJWTToken();
        console.log("::::::::::::::"+user.password)
        console.log("::::::JJJ::::::::"+JSON.stringify(user.password))
        user.password = undefined ;
    
       res.cookie('token', token , cookieOptions)
    
       res.status(200).json({
        success:true,
        message:'User loggedin successfully',
        user
       })
    } catch (error) {
        return next(new AppError(error.message,500));      
    }



};

const logout = (req, res) =>{
    res.cookie('token', null , {
        maxAge: 0, // 7days
        httpOnly:true,
        secure:true,
    });
    res.status(200).json({
        success:true,
        message:'User logged out successfully', 
    })    
};

const getProfile = async(req, res) =>{   
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);
        res.status(200).json({
            success:true,
            message:'User details', 
            user
        })  
    } catch (error) {
        return next(new AppError('failed to fetch user details',400));      
        
    }

};

export {
    register,
    login,
    logout,
    getProfile
}