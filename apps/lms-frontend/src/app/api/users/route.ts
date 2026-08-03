import { backendClient } from "@/config/server";

export const POST = async (request: Request) => {
  try {
    const data = await request.json();
    const response = await backendClient.post(`/users`, data);

    return backendClient.toNextResponse(response);
  } catch (err: any) {
    return backendClient.errorResponse({
      data: err?.response?.data,
      status: err?.response?.status,
    });
  }
};

export const GET = async (request: Request) => {
  try {
    const { searchParams } = new URL(request.url);
    const response = await backendClient.get(`/users`, {
      params: Object.fromEntries(searchParams),
    });
    return backendClient.toNextResponse(response);
  } catch (err: any) {
    return backendClient.errorResponse({
      data: err?.response?.data,
      status: err?.response?.status,
    });
  }
};
