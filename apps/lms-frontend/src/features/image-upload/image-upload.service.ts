import { bffClient } from "@/config/client";

export const imageUpload = (payload: FormData) => {
  return bffClient.post("/upload", payload, {
    headers: {
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_IMAGE_SERVICE_API_KEY}`,
    },
  });
};