import { GoogleGenerativeAI } from "@google/generative-ai";
import Assessment from "../models/Assessment.js";
import PersonalizedPath from "../models/PersonalizedPath.js"


   export const getPersonalizedPath=async(req,res)=>{
    try{
        const paths=await PersonalizedPath.find({
            user:req.userId,
            status:"active"
        })
        .populate("fiche","title classification.domain")
        .populate('assessment', 'score strengths weaknesses')
        .sort({ createdAt: -1 });

        res.json(paths);
    }
    catch(error){
        res.status(500).json({error:error.message});
    }
   };


