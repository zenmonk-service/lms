import { backendClient } from "@/config/server";

export const GET = async (request: Request) => {
  try {
    const response = await backendClient.get(`/roles`);

    return backendClient.toNextResponse(response);
  } catch (err: any) {
    return backendClient.errorResponse({
      data: err?.response?.data,
      status: err?.response?.status,
    });
  }
};

export const POST = async (request: Request) => {
  const body = await request.json();
  try {
    const response = await backendClient.post(`/roles`, body);

    return backendClient.toNextResponse(response);
  } catch (err: any) {
    return backendClient.errorResponse({
      data: err?.response?.data,
      status: err?.response?.status,
    });
  }
};
