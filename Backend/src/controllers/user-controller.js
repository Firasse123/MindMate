import User from "../models/User.js";
import {createToken} from "../utils/token.js";
import {hash,compare} from "bcrypt"
import { COOKIE_NAME } from "../utils/constant.js";




export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.json({ message: "Get all users", data: users });
    } catch (error) {
        res.status(500).json({ message: "Internal server error", cause: error.message });
    }
};



export const userRegister = async(req, res) => {
    try{
        const {name,email,password}=req.body;
        const existingUser=await User.findOne({email});
        if(existingUser){
           return res.status(401).json({message:"User already exists"});
        }
        const hashedPassword=await hash(password,10);
        const user=new User({name,email,password:hashedPassword})
        await user.save();
        res.status(201).json({message:"User registered successfully"})

    }catch(error){
        res.status(500).json({message:"Internal server error"});
    }
};

export const userLogin = async(req, res) => {
    try{
        const {email,password}=req.body;
        const user=await User.findOne({email})
        if(!user){
            return res.status(401).json({message:"Invalid email or password"});
        }
        const isPasswordValid=await compare(password,user.password);
        if(!isPasswordValid){
            return res.status(401).json({message:"Invalid email or password"});
        }
         res.clearCookie(COOKIE_NAME,{
        httpOnly:true,
        domain:"localhost",
        signed:true,
        path:"/"
    });
      const token=createToken(user._id.toString(),user.email,"7d");
    const expires=new Date();
    expires.setDate(expires.getDate()+7);
    res.cookie(COOKIE_NAME,
        token,
        {path:"/",domain:"localhost",expires,
            httpOnly:true,
            signed:true
        }
    )


        return res.status(200).json({message:"Login successful",data:user})

    }
    catch(error){
        res.status(500).json({message:"Error",cause:error.message})
    }
}


