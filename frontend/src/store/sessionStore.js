import axios from "axios";
const API_URL="http://localhost:5000/api/session";

const sessionClient=axios.create({
    baseURL:API_URL,
    timeout:0,
    headers:{
        "Content-Type":"application/json"
    }
})
sessionClient.interceptors.request.use((config)=>{
    const token=localStorage.getItem("auth_token");
    if(token){
        config.headers.Authorization=`Bearer ${token}`;
    }
    return config;
})

sessionClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("Chatbot API Error:", error);
    return Promise.reject(error);
  }
);

export const getSessions=async()=>{
    try{
    const response=await sessionClient.get("/recent");
    return response.data;
    }
    catch(error){
        console.error("error",error);
    }
}

export const getStats=async()=>{
    try{
        const response=await sessionClient.get("/stats");
        return response.data;
    }
    catch(error){
        console.error("error",error);
    }
}
