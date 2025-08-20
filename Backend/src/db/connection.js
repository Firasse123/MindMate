import mongoose from "mongoose"
const connectDB=async()=>{
    try{
        await mongoose.connect(process.env.MONGODB_URL)
    }
    catch(error){
        throw new Error("Failed to connect to the database")
    }}
    const disconnectDB=async()=>{
        try{
            await mongoose.disconnect();
        }
        catch(error){
            console.log(error)
        }
    }
export {connectDB,disconnectDB};
