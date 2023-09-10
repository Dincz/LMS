import { Schema , model } from "mongoose";
import bcrypt from "bcryptjs";
const userSchema = new schema({
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
})

const User = ('User',userSchema);

export default User ;