import express from "express";
const router=express.Router()
import authRouter from "./user-routes.js"
import FicheRouter from "./fiche-route.js"
import chatbotRouter from "./chatbot-route.js"

router.use("/auth",authRouter);
router.use("/fiche",FicheRouter);
router.use("/chatbot",chatbotRouter);
export default router;