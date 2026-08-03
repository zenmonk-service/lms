import { backendClient } from "@/config/server";

export const PUT = async (
  request: Request,
  context: { params: { uuid: string } } | { params: Promise<{ uuid: string }> },
) => {
  const params = await context.params;
  const { uuid } = params;
  try {
    const data = await request.json();
    const response = await backendClient.put(`/users/${uuid}`, data);

    return backendClient.toNextResponse(response);
  } catch (err: any) {
    return backendClient.errorResponse({
      data: err?.response?.data,
      status: err?.response?.status,
    });
  }
};

export const GET = async (
  request: Request,
  context: { params: { uuid: string } } | { params: Promise<{ uuid: string }> },
) => {
  const params = await context.params;
  const { uuid } = params;
  try {
    const response = await backendClient.get(`/users/${uuid}`);

    return backendClient.toNextResponse(response);
  } catch (err: any) {
    return backendClient.errorResponse({
      data: err?.response?.data,
      status: err?.response?.status,
    });
  }
};
