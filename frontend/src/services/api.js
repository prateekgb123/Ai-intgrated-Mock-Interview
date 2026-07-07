import axios from "axios";

const API = axios.create({
  baseURL: "https://ai-intgrated-mock-interview-server-k50e.onrender.com/api",
});

export default API;