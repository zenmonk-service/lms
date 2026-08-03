import { backendClient } from "@/config/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  try {
    const response = await backendClient.get(`/leave-requests/report`, {
      params: Object.fromEntries(searchParams),
    });

    return backendClient.toNextResponse(response);
  } catch (err: any) {
    return backendClient.errorResponse({
      data: err?.response?.data,
      status: err?.response?.status,
    });
  }
}
