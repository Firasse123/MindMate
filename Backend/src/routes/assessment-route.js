// In your routes file
import { generateAssessment, submitAssessment,generatePersonalizedPath } from '../controllers/assessement-controller.js';
import { verifyToken  } from "../middleware/VerifyToken.js";
import express from "express";
const assessementRouter=express.Router();

assessementRouter.post('/generate', verifyToken, generateAssessment);
assessementRouter.post('/submit', verifyToken, submitAssessment);
assessementRouter.post('/path', verifyToken, generatePersonalizedPath);

export default assessementRouter;