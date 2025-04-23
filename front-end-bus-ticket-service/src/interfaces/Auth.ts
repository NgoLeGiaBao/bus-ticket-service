export interface User {
    id: string;
    username: string;
    phoneNumber: string;
    email: string;
    passwordHash: string;
    avatarUrl: string | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string | null;
    refreshTokens: string[];
  }
  
  export interface AuthResponse {
    success: boolean;
    message: string;
    data: any | null; 
    error: string | null;
  }
  
  export interface LoginParams {
    phoneNumber: string;
    password: string;
  }
  
  export interface RegisterParams {
    phoneNumber: string;
    username: string;
    password: string;
    email: string;
  }
  