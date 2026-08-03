import { backendClient } from "@/config/server";

export const GET = async (request: Request) => {
  try {
    const { searchParams } = new URL(request.url);
    const response = await backendClient.get(`/users/employee-code`, {
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
