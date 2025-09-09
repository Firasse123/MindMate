import axios from "axios";
const API_URL="http://localhost:5000/api/fiche";

const sheetClient=axios.create({
    baseURL:API_URL,
    timeout:0,
    headers:{
        "Content-Type":"application/json"
    }
})
sheetClient.interceptors.request.use((config)=>{
    const token=localStorage.getItem("auth_token");
    if(token){
        config.headers.Authorization=`Bearer ${token}`;
    }
    return config;
})

sheetClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("Chatbot API Error:", error);
    return Promise.reject(error);
  }
);

export const generateSheet=async(domain,difficulty,text)=>{
  try{
    const response=await sheetClient.post("/generate",
      {domain,difficulty,text}
    )
    return response.data.fiche

  }
  catch(error){
    console.error("Error",error);
    throw error;
  }
}

export const evaluateSheet=async(fiche_content)=>{
  try{
    const response=await sheetClient.post("/evaluate",
      {fiche_content}
    );
    return response.data.fiche;

  }
  catch(error){
    console.error("error",error);
    throw error;
  }
}
export const getFilteredSheets=async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      // Add pagination
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      
      // Add filters
      if (params.search) queryParams.append('search', params.search);
      if (params.domain && params.domain !== 'all') queryParams.append('domain', params.domain);
      if (params.difficulty && params.difficulty !== 'all') queryParams.append('difficulty', params.difficulty);
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      
      const queryString = queryParams.toString();
      
      const url = queryString ? `filter/?${queryString}` : '/';
      const response = await sheetClient.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching sheets:', error);
      throw error;
    }
  }

  export const getAllSheets=async()=>{
    try{
      const response=await sheetClient.get("/");
      return response.data;

    }
    catch(error){
      console.error("error",error);
      }
  }
export const showSheet=async(id)=>{
  try{
    const response=await sheetClient.get(`/${id}`);
    return response;

  }
  catch(error){
    console.error("error",error);
  }
}

export const deleteSheet=async(id)=>{
  try{
    await sheetClient.delete(`/${id}`);
  }
  catch(error){
    console.error("error",error);
  }
}

export const editSheet=async(id,content)=>{
  try{
    const response=await sheetClient.put(`/${id}`,
      {content}
    );
    return response.data;
  }
  catch(error){
    console.error("error",error);
  }
} 
export const getAvailableDomains=async()=>{
  try{
    const response=await sheetClient.get(`/meta/domains`
    );
    return response.data;
  }
  catch(error){
    console.error("error",error);
  }
} 
export const getAvailableDifficulties=async()=>{
  try{
    const response=await sheetClient.get(`/meta/difficulties`);
    return response.data;
  }
  catch(error){
    console.error("error",error);
  }
} 


