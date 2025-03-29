import axios from "axios";
import Cookies from "js-cookie";
import { API_BASE_URL } from "./constants";

// Create a function to get the current token
const getToken = () => Cookies.get("access_token");

// Create a new axios instance with interceptors to handle token refreshing
const axiosWithAuth = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Authorization: `Bearer ${getToken()}`,
  },
});

// Add a request interceptor to always use the latest token
axiosWithAuth.interceptors.request.use(
  (config) => {
    // Get the latest token before each request
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor to handle 401 errors
axiosWithAuth.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Redirect to login page or refresh token
      console.error("Authentication error:", error);
      // Redirect to login page
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosWithAuth;
