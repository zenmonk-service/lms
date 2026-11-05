import { backendClient } from "@/config/server";

export const GET = async (
  _request: Request,
  { params }: { params: Promise<{ uuid: string }> },
) => {
  try {
    const { uuid } = await params;
    const response = await backendClient.get(`/users/${uuid}/chain`);
    return backendClient.toNextResponse(response);
  } catch (err: any) {
    return backendClient.errorResponse({
      data: err?.response?.data,
      status: err?.response?.status,
    });
  }
};
