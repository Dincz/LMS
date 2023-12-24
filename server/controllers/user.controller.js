import { regSchema , logSchema } from "../validator/userReq.js";
import AppError from '../utils/error.js'
import User from '../models/user.model.js'
import bcrypt from 'bcryptjs'
import { token } from "morgan";
import cloudinary from 'cloudinary'
import fs from 'fs/promises'
import sendEmail from "../utils/sendEmail.js";
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
        secure_url: 'https://unsplash.com/photos/vXInUOv1n84'
    }
   });

   if(!user){
        return next(new AppError("User Registration failed" , 400));
   }
   console.log("FINE")
//    console.log("FINE"+JSON.stringify(req.file))
//    console.log("FINE"+req.file)
   if(req.file){
    console.log("inside if ")
    try {
        const result = await cloudinary.v2.uploader.upload(req.file.path, {
            folder: "lms",
            width: 250,
            height: 250,
            gravity: "faces",
            crop: "fill"
        });
        if(result){
            user.avatar.public_id = result.public_id;
            user.avatar.secure_url = result.secure_url;

             fs.rm( `uploads/${req.file.filename}`)
        }
    } catch (e) {
        console.log(e)
        return next(e || new AppError('File upload failed',500)); 
    }
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

const forgotPassword = async (req, res, next) => {
    const{ email } = req.body;

    if(!email){
       return next(new AppError("Email is required", 400));
    }

    const user = await User.findOne({email});
    if(!user){
       return next(new AppError("Email is not registered", 400));
    }
    console.log("All good")
    const resetToken = await user.generatePasswordResetToken();
    console.log("resetTOken" + resetToken)
    await user.save();

    const resetPasswordURL = `/reset-password/${resetToken}`; //later add frontend url

    const subject = "Reset Password"
    const message = `you can reset your password by clicking <a href=${resetPasswordURL} target= "_blank">Reset your password</a>\nIf the above link does not work for some reason then copy paste this link in new tab ${resetPasswordURL}.\n If you have not requested this, kindly ignore. `
    console.log("all fineeeeeeeee")
    try{
    console.log("all finee44444444444eeeeeee")
       await sendEmail(email, subject, message);

       res.status(200).json({
           success: true,
           message: `Reset password token has been sent to ${email} successfully`
       })
    }catch(e){
        console.log("nope::::::::::::")
       user.forgotPasswordExpiry = undefined;
       user.forgotPasswordToken = undefined;

       await user.save();
       return next(new AppError(e.message, 500));

   }
}


const resetPassword = async(req, res) =>{
    
}
export {
    register,
    login,
    logout,
    getProfile,
    forgotPassword,
    resetPassword
}