import express from "express";
import { verifyToken } from "../middleware/VerifyToken.js";
const sessionRouter=express.Router();
import { getRecentSessions,getStats } from "../controllers/session-controller.js";

sessionRouter.get("/recent",verifyToken,getRecentSessions)
sessionRouter.get("/stats",verifyToken,getStats)


export default sessionRouter;