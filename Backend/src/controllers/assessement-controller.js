import { GoogleGenerativeAI } from "@google/generative-ai";
import Assessment from "../models/Assessment.js";
import PersonalizedPath from "../models/PersonalizedPath.js"
import Fiche from "../models/Fiche.js";
import { pipeline } from "@xenova/transformers";
import LevelService from "../services/levelService.js";
import StudySession from "../models/StudySession.js";

const genAI= new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
let nliPipeline;
(async () => {
    nliPipeline = await pipeline("text-classification", "Xenova/roberta-large-mnli");
})();

async function checkShortAnswer(correctAnswer, studentAnswer) {
    if (!nliPipeline) throw new Error("NLI pipeline not initialized yet");
    
    const result = await nliPipeline(`${studentAnswer} </s> ${correctAnswer}`);
    // The model returns labels: ENTAILMENT, CONTRADICTION, NEUTRAL
    // We treat ENTAILMENT as correct
    return result[0].label === "ENTAILMENT";
}
export const generateAssessment=async(req,res)=>{
    const {sheetId}=req.body;
    const userId=req.userId;
    if(!sheetId || !userId){
        res.status(404).json({error:"sheetId and userId are required"});
    }

    try{
        const sheet=await Fiche.findById(sheetId);
        if(!sheet){
            res.status(404).json({error:"sheet Not Found"})
        }
        const model=genAI.getGenerativeModel({model:"gemini-1.5-flash"});
        const prompt = `
        Based on the following study material, create exactly 10 assessment questions to evaluate understanding:
        
        Title: ${sheet.title}
        Content: ${sheet.content}
        
        Requirements:
        - Create 10 questions of varying difficulty (3 easy, 4 medium, 3 hard)
        - Mix question types: multiple choice, true/false, short answer
        - Cover all major concepts from the material
        - Each question should test a specific learning objective
        
        Format your response as a JSON array with this structure:
        [
            {
                "questionNumber": 1,
                "question": "Question text here",
                "type": "multiple_choice", // or "true_false" or "short_answer"
                "options": ["A) option1", "B) option2", "C) option3", "D) option4"], // only for multiple_choice
                "correctAnswer": "A",
                "explanation": "Detailed explanation of why this is correct",
                "difficulty": "easy", // easy, medium, hard
                "concept": "Main concept being tested"
            }
        ]
        
        Return only valid JSON, no additional text.
        `;

    
    const result=await model.generateContent(prompt);
    const questionsJson=result.response.text();

    let questions;
    try{
        questions = JSON.parse(questionsJson.replace(/```json\n?|\n?```/g, ''));
    }
    catch (parseError) {
            console.error("JSON parsing failed:", questionsJson);
            return res.status(500).json({ error: "Failed to parse AI response" });
        }
    const assessment=await Assessment.create({
        user: userId,
        fiche: sheetId,
        questions: questions,
        status: 'active',
        startedAt: new Date()
    });
       res.json({
            assessmentId: assessment._id,
            questions: questions.map(q => ({
                questionNumber: q.questionNumber,
                question: q.question,
                type: q.type,
                options: q.options,
                difficulty: q.difficulty
            })) // Don't send correct answers to frontend
        });
    }
   catch(error){
         console.error("Assessment generation error:", error);
        res.status(500).json({ error: error.message });

}
}

export const submitAssessment=async(req,res)=>{
    const {assessmentId,answers}=req.body;
    const userId=req.userId;
    try{
        const assessment=await Assessment.findOne({
            _id:assessmentId,
            user:userId,
            status:"active"
        });
          if (!assessment) {
            return res.status(404).json({ error: "Assessment not found" });
        }

        const results=[];
        let correctCount=0;
        const WeakAreas=[];
        const strongAreas=[];
        for(const userAnswer of answers){
            const question=assessment.questions.find(q=>q.questionNumber==userAnswer.questionNumber);
            if(!question) continue;
            let isCorrect=false;
            if(question.type=="short_answer"){
                try{
                    isCorrect=await checkShortAnswer(question.correctAnswer,userAnswer.answer);
                }
                catch(error){
                    console.error("Error checking short answer:", error);
                    isCorrect = false;
                }
            }
            else{
                isCorrect=userAnswer.answer.toLowerCase() ===question.correctAnswer.toLowerCase();
            }
            if (isCorrect){
                correctCount++;
                strongAreas.push(question.concept);
            }
            else{
            WeakAreas.push(question.concept);
            }
            results.push({
                questionNumber: userAnswer.questionNumber,
                question: question.question,
                userAnswer: userAnswer.answer,
                correctAnswer: question.correctAnswer,
                isCorrect: isCorrect,
                explanation: question.explanation,
                concept: question.concept,
                difficulty: question.difficulty
            });
        }

        const score=Math.round((correctCount/assessment.questions.length)*100);
        const strengths=[...strongAreas];
        const weaknesses=[...WeakAreas];

        assessment.userAnswers=answers;
        assessment.results=results;
        assessment.score=score;
        assessment.strengths=strengths;
        assessment.weaknesses=weaknesses;
        assessment.status="completed";
        assessment.completedAt=new Date();
        await assessment.save();

        
       res.json({
            score,
            correctCount,
            totalQuestions: assessment.questions.length,
            results,
            strengths,
            weaknesses,
            assessmentId: assessment._id
        });
    }
    catch(error){
        console.error("Assessment submission error:", error);
        res.status(500).json({ error: error.message });
    }
}


const cleanPathData = (pathData) => {
    if (pathData.phases) {
        pathData.phases.forEach(phase => {
            // Ensure focus is valid
            if (!['weakness', 'strength', 'mixed'].includes(phase.focus)) {
                phase.focus = 'mixed';
            }
            
            // Clean activities
            if (phase.activities) {
                phase.activities.forEach(activity => {
                    // Ensure difficulty is valid
                    if (!['easy', 'medium', 'hard'].includes(activity.difficulty)) {
                        activity.difficulty = 'medium';
                    }
                    
                    // Ensure type is valid
                    if (!['review', 'practice', 'quiz', 'video', 'reading'].includes(activity.type)) {
                        activity.type = 'review';
                    }
                });
            }
        });
    }
    
    return pathData;
};


export const generatePersonalizedPath=async(req,res)=>{
    const {assessmentId}=req.body;
    const userId=req.userId;
    try{
        const assessment=await Assessment.findOne({
            _id:assessmentId,
            user:userId,
            status:"completed"
        }).populate("fiche");

        if(!assessment){
            res.status(404).json({error:"Completed assessment not found"})
        }
    const model=genAI.getGenerativeModel({model:"gemini-1.5-flash"});
const prompt = `
        Create a personalized learning path based on this assessment:
        
        Subject: ${assessment.fiche.classification.domain}
        Title: ${assessment.fiche.title}
        Score: ${assessment.score}%
        Strengths: ${assessment.strengths.join(', ')}
        Weaknesses: ${assessment.weaknesses.join(', ')}
        
        Assessment Details:
        ${assessment.results.map(r => 
            `Q${r.questionNumber}: ${r.isCorrect ? 'Correct' : 'Incorrect'} - ${r.concept} (${r.difficulty})`
        ).join('\n')}
        
      Create a structured learning path that:

1. Prioritizes weak areas while maintaining confidence through some strength reinforcement.
2. Progresses from easier to harder concepts.
3. Includes various learning activities.
4. Provides estimated time for each activity.
5. Sets clear milestones.

STRICT REQUIREMENTS:

- "difficulty" must be EXACTLY: "easy", "medium", or "hard".
- "type" must be EXACTLY:  "practice", "video", or "reading".
- "focus" must be EXACTLY: "weakness", "strength", or "mixed".
- Each activity MUST include a "resourceLink" field:
    - If "type" is "video", the link MUST be a YouTube URL related to the concept.
    - If "type" is "reading" , the link MUST be a Wikipedia article related to the concept.
    - If "type" is "practice", put "resourceLink": "LINK" — this is a placeholder you will replace in your app.  
- Do not use any other sources.

Format as JSON, exactly like this example:

{
  "pathTitle": "Biology Foundations",
  "estimatedDuration": "4 hours",
  "overview": "A personalized path to strengthen weak areas in cell biology.",
  "phases": [
    {
      "phaseNumber": 1,
      "title": "Cell Structure Basics",
      "focus": "weakness",
      "estimatedTime": "45 minutes",
      "activities": [
        {
          "type": "video",
          "title": "Introduction to Cell Organelles",
          "description": "Watch this video for a clear breakdown of cell parts and their functions.",
          "concepts": ["cell structure", "organelles"],
          "difficulty": "easy",
          "estimatedTime": "15 minutes",
          "resourceLink": "https://www.youtube.com/watch?v=URUJD5NEXC8"
        },
        {
          "type": "reading",
          "title": "Cell Membrane Function",
          "description": "Read this article to understand how the cell membrane regulates substances.",
          "concepts": ["cell membrane"],
          "difficulty": "medium",
          "estimatedTime": "20 minutes",
          "resourceLink": "https://en.wikipedia.org/wiki/Cell_membrane"
        },
        {
          "type": "practice",
          "title": "Quiz on Cell Organelles",
          "description": "Practice what you learned by answering quiz questions.",
          "concepts": ["cell structure", "organelles"],
          "difficulty": "medium",
          "estimatedTime": "10 minutes",
          "resourceLink": "LINK"
        }
      ]
    }
  ],
  "milestones": [
    {
      "after_phase": 1,
      "title": "Checkpoint: Identify Organelles",
      "criteria": "Be able to label and describe the function of major cell organelles."
    }
  ]
}

        `;
        const result=await model.generateContent(prompt);
        const pathJson=result.response.text();

        let pathData;
        try{
            pathData = JSON.parse(pathJson.replace(/```json\n?|\n?```/g, ''));
            pathData = cleanPathData(pathData); // Add this line

            
        }
        catch (parseError) {
            console.error("Path JSON parsing failed:", pathJson);
            return res.status(500).json({ error: "Failed to parse AI-generated path" });
        }
        const personalizedPath=await PersonalizedPath.create({
            user:userId,
            assessment:assessmentId,
            fiche:assessment.fiche._id,
            pathData:pathData,
            currentPhase:1,
            status:"active",
            createdAt:new Date()
        });
        await LevelService.awardXP(userId, "PERSONALIZED_PATH_CREATED");

  res.json({
            pathId: personalizedPath._id,
            path: pathData
        });

    } catch (error) {
        console.error("Path generation error:", error);
        res.status(500).json({ error: error.message });
    }
   }