import app from './app.js';
import connectionToDb from './config/connectDb.js';

const PORT = process.env.PORT || 5002;
app.listen(PORT,async()=>{
    await connectionToDb();
    console.log(`App is running on ${PORT}`)
});
