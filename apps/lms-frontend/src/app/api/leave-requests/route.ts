import { backendClient } from "@/config/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const resp = await backendClient.get(`/leave-requests`, {
      params: Object.fromEntries(searchParams),
    });

    return backendClient.toNextResponse(resp);
  } catch (err: any) {
    return backendClient.errorResponse({
      data: err?.response?.data,
      status: err?.response?.status,
    });
  }
}
