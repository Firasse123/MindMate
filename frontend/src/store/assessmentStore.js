import axios from "axios";
const API_URL="http://localhost:5000/api/assessment";

const assessementClient=axios.create({
    baseURL:API_URL,
    timeout:30000,
    headers:{
        "Content-Type":"application/json"
    }
})
assessementClient.interceptors.request.use((config)=>{
    const token=localStorage.getItem("auth_token");
    if(token){
        config.headers.Authorization=`Bearer ${token}`;
    }
    return config;
})

assessementClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("Assessment Error:", error);
    return Promise.reject(error);
  }
);

export const generateAssessment=async(sheetId)=>{
    try{
        const response=await assessementClient.post("/generate",
            {sheetId}
        )
        return response.data;
    }
    catch(error){
        console.error("error",error);
    }
}

export const submitAssessment=async(assessmentId,answers)=>{
    try{
        const response=await assessementClient.post("/submit",
            {assessmentId,answers}
        )
        return response.data;
    }
    catch(error){
        console.error("error",error);
    }
}

export const generatePersonalizedPath=async(assessmentId)=>{
    try{
    const response=await assessementClient.post("/path",
        {assessmentId}
    )
    return response.data;
}
catch(error){
    console.error("error",error);
}
}
