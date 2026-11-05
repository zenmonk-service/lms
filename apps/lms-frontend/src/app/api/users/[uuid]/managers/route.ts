import { backendClient } from "@/config/server";

export const PUT = async (
  request: Request,
  { params }: { params: Promise<{ uuid: string }> },
) => {
  try {
    const { uuid } = await params;
    const body = await request.json();
    const response = await backendClient.put(`/users/${uuid}/managers`, body);
    return backendClient.toNextResponse(response);
  } catch (err: any) {
    return backendClient.errorResponse({
      data: err?.response?.data,
      status: err?.response?.status,
    });
  }
};
