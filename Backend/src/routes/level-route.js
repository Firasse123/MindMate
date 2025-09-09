import express from "express";
const levelRouter=express.Router();
import { verifyToken  } from "../middleware/VerifyToken.js";
import {getLevel,awardXP} from "../controllers/progress-controller.js"
levelRouter.get("/level/:userId",verifyToken,getLevel);
levelRouter.post("/award-xp",verifyToken,awardXP)
export default levelRouter;