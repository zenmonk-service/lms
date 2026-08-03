import { backendClient } from "@/config/server";

export const GET = async (request: Request) => {
  try {
    const response = await backendClient.get(`/attendances/missing`, {
      params: Object.fromEntries(new URL(request.url).searchParams),
    });
    return backendClient.toNextResponse(response);
  } catch (err: any) {
    return backendClient.errorResponse({
      data: err?.response?.data,
      status: err?.response?.status,
    });
  }
};

export const POST = async (request: Request) => {
  try {
    const data = await request.json();
    const response = await backendClient.post(`/attendances/missing`, data);

    return backendClient.toNextResponse(response);
  } catch (err: any) {
    return backendClient.errorResponse({
      data: err?.response?.data,
      status: err?.response?.status,
    });
  }
};
