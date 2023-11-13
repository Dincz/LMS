import { Router } from "express";
import { getProfile, login, logout, register } from "../controllers/user.controller.js";
import isLoggedIn from "../middlewares/auth.middleware.js";

const route = Router();

route.post('/register',register);
route.post('/login',login);
route.get('/logout',logout);
route.get('/getProfile',isLoggedIn ,getProfile);


export default route;