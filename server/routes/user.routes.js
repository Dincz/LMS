import { Router } from "express";
import { forgotPassword, getProfile, login, logout, register, resetPassword,changePassword,updateUser } from "../controllers/user.controller.js";
import upload from "../middlewares/multer.middleware.js";
import { isLoggedIn } from "../middlewares/auth.middleware.js";
const route = Router();

route.post('/register',upload.single("avatar"),register);
route.post('/login',login);
route.post('/logout',logout);
route.get('/getProfile',isLoggedIn ,getProfile);
route.post('/reset', forgotPassword);
route.post("/reset-token/:resetToken", resetPassword);
route.post("/change-password",isLoggedIn,changePassword);
route.put("/update/:id", isLoggedIn, upload.single("avatar"), updateUser);


export default route;