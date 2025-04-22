import axios from "axios";

const instance = axios.create({
  baseURL: "http://localhost:8000/api/v1",
});

// Thêm token vào request
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

// Xử lý response
instance.interceptors.response.use(
  (response) => response.data, 
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      if (status === 401 || data?.EC === -999) {
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default instance;
