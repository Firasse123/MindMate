import express from "express"
const app=express();
import dotenv from "dotenv";
dotenv.config()

app.get("/",(req,res)=>{
    res.send("Backend is running")
})

const PORT=process.env.PORT|| 5000;
app.listen(PORT,()=>{
    console.log(`Server running on port ${PORT}`)
})