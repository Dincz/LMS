import { regSchema } from "../validator/userReq";

const register = async(req, res, next) =>{
   const result = await regSchema.validate(req.body)
   const userExists = await User.findOne({ email: result.email });
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

   res.status(201).json({
    success:true,
    message:'User registered successfully',
    user
   })
};

const login = (req, res) =>{

};

const logout = (req, res) =>{

};

const getProfile = (req, res) =>{

};

export {
    register,
    login,
    logout,
    getProfile
}