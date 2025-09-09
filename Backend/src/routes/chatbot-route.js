import express from "express";
const chatbotRouter=express.Router();
import {generate,getHistory,deleteChat} from "../controllers/chatbot-controller.js"
import { verifyToken  } from "../middleware/VerifyToken.js";
chatbotRouter.post("/",verifyToken,generate)
chatbotRouter.get("/history",verifyToken,getHistory)
chatbotRouter.delete("/",verifyToken,deleteChat)
export default chatbotRouter;