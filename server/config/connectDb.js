import mongoose  from "mongoose";

mongoose.set('strictQuery',false);

const connectionToDb = async() =>{
    try{
        console.log(process.env.MONGO_URI);
    const { connection } = await mongoose.connect(
        process.env.MONGO_URI || `mongodb://localhost:27017`
    );
    if(connection){
        console.log(`Connected to Db:${connection.host}`);
    }
}catch(e){
    console.log(e);
    process.exit(1);
}
}

export default connectionToDb;