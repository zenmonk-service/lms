import axiosInterceptorInstance from "@/config/axios";

export const imageUpload = (payload: FormData) => {
  return axiosInterceptorInstance.post("/upload", payload, {
    headers: {
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_IMAGE_SERVICE_API_KEY}`,
      "Content-Type": "multipart/form-data",
    },
  });
};