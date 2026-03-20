import mongoose from 'mongoose';

// Function to connect to MongoDB database using mongoose
export const connectDB = async()=>{
    try{
      // connect to MongoDB database using mongoose connect method and connection string from environment variable
       const connectionInstances = await mongoose.connect(`${process.env.MONGODB_URL}/pingup`);
       // log success message with the host name of the connected database
       console.log(`MongoDB Connection Successful HOST => ${connectionInstances.connection.host}`);
    }catch(err){
       console.log(`MongoDB Connection Failed => ${err.message}`);
       process.exit(1);
    }
}