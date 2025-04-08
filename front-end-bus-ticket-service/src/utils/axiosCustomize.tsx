import axios from "axios";
import NProgress from "nprogress";

NProgress.configure({ showSpinner: false });

const instance = axios.create({
    baseURL: "http://localhost:85/api/v1",
});

// Thêm token vào request
instance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers["Authorization"] = `Bearer ${token}`;
        }
        NProgress.start();
        return config;
    },
    (error) => {
        NProgress.done();
        return Promise.reject(error);
    }
);

// Xử lý response
instance.interceptors.response.use(
    (response) => {
        NProgress.done();
        return response.data; 
    },
    (error) => {
        NProgress.done();
        
        if (error.response) {
            const { data, status } = error.response;
            
            // Kiểm tra mã lỗi từ server
            if (status === 401 || data?.EC === -999) {
                localStorage.removeItem("token"); // Xóa token nếu hết hạn
                window.location.href = "/login";
            }
        } else {
            console.error("Network error:", error);
        }
        
        return Promise.reject(error);
    }
);

export default instance;
