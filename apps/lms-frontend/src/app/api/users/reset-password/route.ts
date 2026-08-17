import { ssoClient } from "@/config/server";

export const POST = async (request: Request) => {
  try {
    const data = await request.json();
    const response = await ssoClient.post(`/password/reset`, data);

    return ssoClient.toNextResponse(response);
  } catch (err: any) {
    return ssoClient.errorResponse({
      data: err?.response?.data,
      status: err?.response?.status,
    });
  }
};

export const GET = async (request: Request) => {
  try {
    const { searchParams } = new URL(request.url);
    const response = await ssoClient.get(`/password/reset`, {
      params: Object.fromEntries(searchParams),
    });

    return ssoClient.toNextResponse(response);
  } catch (err: any) {
    return ssoClient.errorResponse({
      data: err?.response?.data,
      status: err?.response?.status,
    });
  }
};
