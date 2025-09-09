import express from "express";
import {createQuiz} from "./controllers/quiz-controller.js" // your function
const router = express.Router();

// Temporary test route
router.get("/test-create-quiz", async (req, res) => {
  // Mock userId
  req.userId = "68ae10c7edf487bc1d44821d"; 

  // Mock request body
  req.body = {
    fiche_id: "68af0c4d0ea56372bfb032ab",
    question_count: 5,
    difficulty: "medium"
  };

  await createQuiz(req, res);
});

export default router;
