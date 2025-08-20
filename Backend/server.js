import express from "express"
const app=express();
import dotenv from "dotenv";
dotenv.config()

import {connectDB,disconnectDB} from "./src/db/connection.js"

app.use(express.json())


app.get("/",(req,res)=>{
    res.send("Backend is running")
})

const PORT=process.env.PORT|| 5000;

connectDB().then(()=>
 {
    app.listen(PORT,()=>{
    console.log(`Server Open and Connected to the Database on port ${PORT}`)
})
 }
)
.catch((error)=>{
    console.log(error)
})

