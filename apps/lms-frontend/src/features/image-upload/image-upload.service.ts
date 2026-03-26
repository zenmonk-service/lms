import { servicesAxiosInstance } from "@/config/axios";

export const imageUpload = (payload: FormData) => {
  return servicesAxiosInstance.post(`${process.env.NEXT_PUBLIC_IMAGE_SERVICE_API_URL}`, payload ,{
    headers: {
      'Authorization': `Bearer ${process.env.NEXT_PUBLIC_IMAGE_SERVICE_API_KEY}`
    },
  });

}