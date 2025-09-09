import express from "express";
const router=express.Router()
import authRouter from "./user-routes.js"
import FicheRouter from "./fiche-route.js"
import chatbotRouter from "./chatbot-route.js"
import quizRouter from "./quiz-route.js"
import levelRouter from "./level-route.js"
import sessionRouter from "./session-route.js";
import assessmentRouter from "./assessment-route.js";
import pathRouter from "./path-route.js";

router.use("/auth",authRouter);
router.use("/fiche",FicheRouter);
router.use("/chatbot",chatbotRouter);
router.use("/quiz",quizRouter)
router.use("/progress",levelRouter)
router.use("/session",sessionRouter)
router.use("/assessment",assessmentRouter);
router.use("/paths",pathRouter);

export default router;