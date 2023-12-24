import mongoose, { Schema , model } from "mongoose";
import bcrypt from 'bcryptjs';
import jwt from "jsonwebtoken";
import crypto from 'crypto'
const userSchema = new Schema({
    fullName:{
        type:'String',
        trim:true,
        lowercase:true
    },
    email:{
        type:'String',
        trim:true,
        lowercase:true
    },
    password:{
        type:'String',
        trim:true,
        lowercase:true,
        select:false
    },
    avatar:{
        public_id:{
            type:'String'
        },
        secure_url:{    
            type:'String'
        }
    },
    role:{
        type:'String',
        enum:['USER','ADMIN'],
        default:'USER'
    },
    forgotPasswordToken : String,
    forgotPasswordExpiry : Date
},{
    timestamps: true
}
);
userSchema.pre('save', async function(next){
    if(!this.isModified('password')){
        return next();
    }
    this.password = await bcrypt.hash(this.password, 10);
    next();
});
userSchema.methods = {
    generateJWTToken: async function(){
        console.log("NOOOOOOOOOOOOOOO"+process.env.JWT_SECRET)
        return await jwt.sign(
            { id: this._id, email: this.email, subscription: this.subscription, role: this.role },
            process.env.JWT_SECRET,
            {
                expiresIn: 1200,
            }
        )
    },
    comparePassword: async function(plainTextPassword){
        return await bcrypt.compare(plainTextPassword, this.password)
    },
    generatePasswordResetToken: async function(){
        const resetToken = crypto.randomBytes(20).toString("hex");

        this.forgotPasswordToken = crypto
            .createHash("sha256")
            .update(resetToken)
            .digest("hex")
        ;    
        this.forgotPasswordExpiry = Date.now() + 15 * 60 * 1000;  //15 min from now

        return resetToken;
    }
}


const User = model('User',userSchema);

export default User;