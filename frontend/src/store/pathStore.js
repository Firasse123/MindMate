import axios from "axios";
const API_URL="http://localhost:5000/api/paths";

const pathClient=axios.create({
    baseURL:API_URL,
    timeout:10000,
    headers:{
        "Content-Type":"application/json"
    }
})
pathClient.interceptors.request.use((config)=>{
    const token=localStorage.getItem("auth_token");
    if(token){
        config.headers.Authorization=`Bearer ${token}`;
    }
    return config;
})

pathClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error(" PersonalizedPath Error:", error);
    return Promise.reject(error);
  }
);

export const getPersonalizedPath=async()=>{
    try{
    const response=await pathClient.get("/")
    return response.data;
}
catch(error){
    console.error("error",error);
}
}

