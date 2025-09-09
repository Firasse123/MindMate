from fastapi import FastAPI
from src.creation.generateFiche import LlamaFicheGenerator
from pydantic import BaseModel
import json
from typing import Optional
from src.evaluation.evaluateFiche import LLamaEvaluateFiche
import re
from src.Quiz.createQuiz import LlamaQuizGenerator
app=FastAPI()

class FicheRequest(BaseModel):
    domain: str
    difficulty: str
    text: str

class FicheEvaluate(BaseModel):
    fiche_content: str

class QuizCreation(BaseModel):
    question_count:int
    difficulty:str
    fiche_content:str
    fiche_title:str
    fiche_id:str


@app.post("/generate-fiche")
def generate_fiche_endpoint(req:FicheRequest):
    generator=LlamaFicheGenerator(
        domain=req.domain,
        difficulty=req.difficulty,
        text=req.text
    )

    fiche_json=generator.generate_fiche()
    return {"fiche": fiche_json}



@app.post("/evaluate-fiche")
def evaluate_fiche_endpoint(req: FicheEvaluate):
    evaluator = LLamaEvaluateFiche(fiche_content=req.fiche_content)
    fiche_json = evaluator.evaluateFiche()
    
    return  fiche_json

@app.post("/create-quiz")
def create_quiz_endpoint(req: QuizCreation):
    QuizGenerator = LlamaQuizGenerator(
        question_count=req.question_count,
        difficulty=req.difficulty,
        fiche_content=req.fiche_content,
        fiche_title=req.fiche_title,
        fiche_id=req.fiche_id
    )

    try:
        quiz_json_str = QuizGenerator.generate_quiz()
        quiz_json = json.loads(quiz_json_str)
    except json.JSONDecodeError:
        return {"error": "Failed to decode JSON"}

    return {"Quiz": quiz_json}

