import axios from "axios";
const API_URL="http://localhost:5000/api/quiz";

const quizClient=axios.create({
    baseURL:API_URL,
    timeout:0,
    headers:{
        "Content-Type":"application/json"
    }
})
quizClient.interceptors.request.use((config)=>{
    const token=localStorage.getItem("auth_token");
    if(token){
        config.headers.Authorization=`Bearer ${token}`;
    }
    return config;
})

quizClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("Chatbot API Error:", error);
    return Promise.reject(error);
  }
);

export const createQuiz=async(sheet_id,question_count,difficulty)=>{
    try{
        const quiz=await quizClient.post("/",
            {fiche_id: sheet_id,question_count,difficulty}
        )
        return quiz.data;

    }
    catch(error){
        console.error("error",error);
    }
}

export const submitQuiz=async (quizId,answers,totalTimeSpent,scoreData)=>{
    try{
            const response=await quizClient.post("/submit",
            {quizId,answers,totalTimeSpent,scoreData}
        )
        return response;

    }
    catch(error){
        console.error("error",error);
    }
}

export const getAllQuiz=async()=>{
    try{
        const quiz=await quizClient.get("/");
        return quiz.data;

    }
    catch(error){
        console.error("error",error);

    }
}

