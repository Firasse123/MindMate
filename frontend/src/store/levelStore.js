import axios from "axios";
const API_URL="http://localhost:5000/api/progress";

const levelClient=axios.create({
    baseURL:API_URL,
    timeout:10000,
    headers:{
        "Content-Type":"application/json"
    }
})
levelClient.interceptors.request.use((config)=>{
    const token=localStorage.getItem("auth_token");
    if(token){
        config.headers.Authorization=`Bearer ${token}`;
    }
    return config;
})

levelClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("Chatbot API Error:", error);
    return Promise.reject(error);
  }
);

export const getLevel=async(userId)=>{
    try{
        const response=await levelClient.get(`/level/${userId}`);
        return response.data;
    }
    catch(error){
        console.error("error",error);
    }
}

export const awardXP=async(activityType,metadata={})=>{
    try{
        const response=await levelClient.post("/award-xp",
            {activityType,metadata}
        )
        return response.data;
    }
    catch(error){
        console.error("error",error);
    }
}

