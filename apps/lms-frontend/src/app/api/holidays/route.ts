import { backendClient } from "@/config/server";

export const GET = async (request: Request) => {
  const { searchParams } = new URL(request.url);

  try {
    const response = await backendClient.get(`/holidays`, {
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
