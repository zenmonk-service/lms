import { backendClient } from "@/config/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  try {
    const response = await backendClient.get(`/attendances`, {
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

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const response = await backendClient.post(`/attendances`, body);

    return backendClient.toNextResponse(response);
  } catch (err: any) {
    return backendClient.errorResponse({
      data: err?.response?.data,
      status: err?.response?.status,
    });
  }
}
