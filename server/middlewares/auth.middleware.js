import User from "../models/user.model.js";
import AppError from "../utils/error.js";
import  jwt  from "jsonwebtoken";
const isLoggedIn = async (req, res, next) => {
    const { token } = req.cookies;

    if(!token){
        return next(new AppError("Unauthenticated, please login again", 401))
    }

    const userDetails = await jwt.verify(token, process.env.JWT_SECRET);

    req.user = userDetails;

    next();
}


const authorizedRoles = (...roles) => async(req, res, next) => {
    console.log(req.user)
    const currentUserRole = req.user.role;
    if(!roles.includes(currentUserRole)){
        return next(
         new AppError("You do not have permission to access this route",403)
        )
    }
    next();
}

const authorizedSubscriber = async (req, res, next)=>{
   const user = await User.findById(req.user.id);
 
   if (user.role !== "ADMIN" && user.subscription.status !== "active") {
    return next(new AppError("Please subscribe to access this route.", 403));
  }
    next()
}
export {
    isLoggedIn,
    authorizedRoles,
    authorizedSubscriber
}