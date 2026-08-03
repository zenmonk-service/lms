import { backendClient } from "@/config/server";

export const GET = async (request: Request) => {
  try {
    const { searchParams } = new URL(request.url);

    const response = await backendClient.get(`/payrolls`, {
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

export const POST = async (request: Request) => {
  try {
    const body = await request.json();

    const response = await backendClient.post(`/payrolls`, body);
    return backendClient.toNextResponse(response);
  } catch (err: any) {
    return backendClient.errorResponse({
      data: err?.response?.data,
      status: err?.response?.status,
    });
  }
};
