import axios from "axios";
import authService from "./auth";
import toast from "react-hot-toast";
import { auth } from "../firebase";
import logger from "./logger";
const api = axios.create({
  baseURL: import.meta.env.VITE_APP_API_HOME_ENDPOINT || "http://localhost:5000",
});
api.interceptors.request.use(
  async (config) => {
    // Always add x-api-key
    config.headers["x-api-key"] = import.meta.env.VITE_X_API_KEY;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);
export default api;