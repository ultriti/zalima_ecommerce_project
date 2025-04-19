import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:5000/api/users",
    
})
export const googleAuth = (code) =>api.get(`/google/register?code=${code}`,{withCredentials: true,})