import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
const app = express();
import { config } from 'dotenv';
import morgan from 'morgan';
import userRoutes from './routes/user.routes.js'
import courseRoutes from './routes/course.routes.js'
import paymentRoutes from './routes/payment.route.js'
import errorMiddleware from './middlewares/errorhandler.js'
config();
app.use(express.json())

app.use(express.urlencoded({extended:true}))
app.use(morgan('dev'));
//allowing the frontend to send req to backend from different server
app.use(cors({
    origin:[process.env.FRONTEND_URL],
    credentials:true
}));
//would be used to parse cookies which will be containing the token 
app.use(cookieParser());

app.use('/ping',(req,res)=>{
    res.send('pong');
});

app.use('/api/v1/user', userRoutes);
app.use('/api/v1/course', courseRoutes);
app.use('/api/v1/payment', paymentRoutes);


app.all('*',(req,res)=>{
    res.status(404).send('OOPS!! 404 Page Not found');
});
app.use(errorMiddleware);

export default app;