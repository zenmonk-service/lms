import axios from "axios";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH;
const API_URL = `${basePath ?? ""}/api`;

const forwardIncomingCookies = async (config: any) => {
  const isServer = globalThis.window === undefined;
  if (!isServer) return config;

  try {
    const { headers } = await import("next/headers");
    const requestHeaders = await headers();
    const cookieHeader = requestHeaders.get("cookie");

    if (cookieHeader) {
      config.headers = config.headers || {};
      config.headers.Cookie = cookieHeader;
    }
  } catch {
    // no-op outside request context
  }

  return config;
};

export const apiRoutesAxiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

export const servicesAxiosInstance = axios.create({
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

servicesAxiosInstance.interceptors.request.use(
  forwardIncomingCookies,
  (error) => Promise.reject(error),
);

// Backward compatibility for existing imports in feature services.
const axiosInterceptorInstance = apiRoutesAxiosInstance;

export default axiosInterceptorInstance;
