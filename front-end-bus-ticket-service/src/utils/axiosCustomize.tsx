import axios from "axios";
import { useNavigate } from "react-router-dom";

const instance = axios.create({
  baseURL: "http://localhost:8000/api/v1",
  withCredentials: true,
});

// Add a request interceptor
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers!["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Process the response and handle errors
instance.interceptors.response.use(
  (response) => response.data, 
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      if (status === 401 || data?.EC === -999) {
        const navigate = useNavigate();
        localStorage.removeItem("token");
        localStorage.removeItem('persist:user');
        navigate("/login");
      }
    }
    return Promise.reject(error);
  }
);

export default instance;
