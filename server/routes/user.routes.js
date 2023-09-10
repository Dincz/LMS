import { Router } from "express";
import { getProfile, login, logout, register } from "../controllers/user.controller";

const route = Router();

route.post('/register',register);
route.post('/login',login);
route.get('/logout',logout);
route.get('/aboutMe',getProfile);


export default route;