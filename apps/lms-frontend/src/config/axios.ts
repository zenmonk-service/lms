import axios from "axios";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH;
const API_URL = `${basePath ?? ""}/api`;

const axiosInterceptorInstance = axios.create({
    baseURL: API_URL
});

export default axiosInterceptorInstance;
