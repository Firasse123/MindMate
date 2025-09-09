import express from "express";
const quizRouter=express.Router();
import { verifyToken  } from "../middleware/VerifyToken.js";
import {getAllQuiz,getQuiz,createQuiz,submitQuiz} from "../controllers/quiz-controller.js"
quizRouter.get("/",verifyToken,getAllQuiz);
quizRouter.get("/:ficheId/:quizId",verifyToken,getQuiz);
quizRouter.post("/",verifyToken,createQuiz);
quizRouter.post("/submit",verifyToken,submitQuiz)

export default quizRouter;