import { GoogleGenerativeAI } from "@google/generative-ai";
import ChatBot from "../models/Chatbot.js";
import User from "../models/User.js";
const genAI=new GoogleGenerativeAI(process.env.GEMINI_API_KEY);


export const generate=async (req,res)=>{
        const {prompt}=req.body;
        const userId=req.userId;
        if(!prompt || !userId){
            return res.status(400).json({error:"Message and userId are required"});
        }
        try{
        await ChatBot.create({userId, role:"user",content:prompt});
        const history=await ChatBot.find({userId}).sort({timestamp:1});
            const formattedHistory=history.map(msg=>({
                role:msg.role,
                parts:[{text:msg.content}]
            }))


    const model=genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result=await model.generateContent({ contents: formattedHistory });
    const aiReply=result.response.text();
        if (!aiReply || aiReply.trim() === "") {
            return res.status(500).json({ error: "AI did not generate a reply" });
}
    await ChatBot.create({userId,role:"assistant",content:aiReply});
        res.json({ reply: aiReply });

}


    catch(error){
        res.status(500).json({error:error.message});
    }


}

export const getHistory=async (req,res)=>{
    const userId=req.userId;
    if(!userId){
        return res.status(400).json({message:"user not found"});
    }
    const history=await ChatBot.find({userId}).sort({timestamp:-1}).limit(20);
    res.json(history)
    

}