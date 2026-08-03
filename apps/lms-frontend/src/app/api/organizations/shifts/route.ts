import { backendClient } from "@/config/server";

export const GET = async (request: Request) => {
  try {
    const response = await backendClient.get(`/organizations/shifts`);

    return backendClient.toNextResponse(response);
  } catch (err: any) {
    return backendClient.errorResponse({
      data: err?.response?.data,
      status: err?.response?.status,
    });
  }
};
