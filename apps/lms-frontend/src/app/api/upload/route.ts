import { backendClient, fileServiceClient } from "@/config/server";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const response = await fileServiceClient.post(``, formData, {
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_IMAGE_SERVICE_API_KEY}`,
      },
    });

    return backendClient.toNextResponse(response);
  } catch (err: any) {
    return backendClient.errorResponse({
      data: err?.response?.data ?? {
        message: err?.message ?? "Unknown error",
      },
      status: err?.response?.status ?? 500,
    });
  }
}
