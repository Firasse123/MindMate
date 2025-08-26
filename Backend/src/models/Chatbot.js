import express from "express";
import mongoose from "mongoose";
import User from "./User.js";

const ChatbotSchema=new mongoose.Schema({
    userId:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true},
    role:{
        type:String,
        enum:["user","assistant"],
        required:true
    },
    content:{type:String,required:true},
    timestamp:{type:Date,default:Date.now}
})

const ChatBot=mongoose.model("ChatBot",ChatbotSchema)
export default ChatBot;