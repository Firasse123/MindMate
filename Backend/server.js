import express from "express"
const app=express();
import dotenv from "dotenv";
dotenv.config()
import route from "./src/routes/index.js"
import cookieParser from "cookie-parser";
import {connectDB,disconnectDB} from "./src/db/connection.js"

app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(express.json())

app.use("/api",route)



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

