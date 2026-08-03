import { backendClient } from "@/config/server";

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const response = await backendClient.post(`/attendances/bulk`, data);

    return backendClient.toNextResponse(response);
  } catch (err: any) {
    return backendClient.errorResponse({
      data: err.response?.data,
      status: err.response?.status,
    });
  }
}
