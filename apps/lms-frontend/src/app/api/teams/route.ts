import { backendClient } from "@/config/server";

const fail = (err: any) =>
  backendClient.errorResponse({
    data: err?.response?.data,
    status: err?.response?.status,
  });

export const GET = async (request: Request) => {
  try {
    const { searchParams } = new URL(request.url);
    const response = await backendClient.get(`/teams`, {
      params: Object.fromEntries(searchParams),
    });
    return backendClient.toNextResponse(response);
  } catch (err: any) {
    return fail(err);
  }
};

export const POST = async (request: Request) => {
  try {
    const body = await request.json();
    const response = await backendClient.post(`/teams`, body);
    return backendClient.toNextResponse(response);
  } catch (err: any) {
    return fail(err);
  }
};
