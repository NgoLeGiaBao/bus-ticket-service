import { AuthResponse, LoginParams, RegisterParams } from "../interfaces/Auth";
import axios from "../utils/axiosCustomize"

//-- Authentication --//
// Login function
export const postLogin = async (params: LoginParams): Promise<AuthResponse> => {
    try {
      const response = await axios.post<AuthResponse>("/identity/auth/login", params);
      return response
    } catch (error: any) {
      throw new Error(error?.response?.data?.message || "Login failed");
    }
  };
  
// Register function
export const postRegister = async (params: RegisterParams): Promise<AuthResponse> => {
    try {
      const response = await axios.post<AuthResponse>("/identity/auth/register", params);
      return response;
    } catch (error: any) {
      throw new Error(error?.response?.data?.message || "Registration failed");
    }
  };
  
// Logout function
export const postLogout = async (): Promise<AuthResponse> => {
    try {
      const response = await axios.post<AuthResponse>("/identity/auth/logout");
      return response
    } catch (error: unknown) {
      if (error instanceof Error) {
        // Xử lý lỗi nếu có
        throw new Error(error.message || "Logout failed");
      }
      throw new Error("An unexpected error occurred");
    }
  };