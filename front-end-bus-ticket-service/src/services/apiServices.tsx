import axios from "../utils/axiosCustomize"

//-- Authentication --//
// Login
export const postLogin = (params: any) => axios.post("/auth/login", params);
// Logout
export const postLogout = () => axios.post("/auth/logout");
