import express, { urlencoded } from "express"
import testRouter from "./src/testRouter.js";

const app=express();
import dotenv from "dotenv";
import axios from 'axios';
import ImageKit from "imagekit"; // ✅ Add this import
dotenv.config()
import route from "./src/routes/index.js"
import {connectDB,disconnectDB} from "./src/db/connection.js"
import cors from "cors";

app.use(
  cors({
    origin: "http://localhost:3000", // Next.js dev server
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'] // Add this line
  })
);

app.use(express.json())
app.use("/api",route)
app.use("/api", testRouter);


const imageKit= new ImageKit({
  urlEndpoint:process.env.IMAGE_KIT_ENDPOINT,
  publicKey:process.env.IMAGE_KIT_PUBLIC_KEY,
  privateKey:process.env.IMAGE_KIT_PRIVATE_KEY
});

app.get("/api/upload",(req,res)=>{
  const result=imageKit.getAuthenticationParameters();
  res.send(result);
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

