import { Router } from "express";
import { forgotPassword, getProfile, login, logout, register, resetPassword } from "../controllers/user.controller.js";
import isLoggedIn from "../middlewares/auth.middleware.js";
import upload from "../middlewares/multer.middleware.js";
const route = Router();

route.post('/register',upload.single("avatar"),register);
route.post('/login',login);
route.get('/logout',logout);
route.get('/getProfile',isLoggedIn ,getProfile);
route.post('/forget-password', forgotPassword);
route.post('/reset-password', resetPassword);


export default route;