import axios from "axios";
import { apiClient } from "../store/authStore";
const API_URL="http://localhost:5000/api/chatbot";

const chatbotClient=axios.create({
    baseURL:API_URL,
    timeout:10000,
    headers:{
        "Content-Type":"application/json"
    }
})
chatbotClient.interceptors.request.use((config)=>{
    const token=localStorage.getItem("auth_token");
    if(token){
        config.headers.Authorization=`Bearer ${token}`;
    }
    return config;
})

chatbotClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("Chatbot API Error:", error);
    return Promise.reject(error);
  }
);

export const getUserChats=async()=>{
    try{
    const response=await chatbotClient.get("/history");
    return response.data;
}
catch(error){
    console.error("Error sending messages:", error);
    throw error;
}
}

export const generateResponse=async(prompt)=>{
    try{
        const reply=await chatbotClient.post("/",{prompt})
        return reply.data;
    }
    catch(error){
        console.error("Error sending messages:",error);
        throw error;
    }
}

export const deleteResponse=async()=>{
    try{
        await chatbotClient.delete("/");

    }
    catch(error){
        console.error("Error sending messages:",error);
        throw error;

    }
}
