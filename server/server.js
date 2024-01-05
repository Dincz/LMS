import app from './app.js';
import connectionToDb from './config/connectDb.js';
import cloudinary from 'cloudinary'

const PORT = process.env.PORT || 5002;

cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});




app.listen(PORT,async()=>{
    await connectionToDb();
    console.log(`App is running on ${PORT}`)
});


