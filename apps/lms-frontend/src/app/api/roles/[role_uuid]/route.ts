import { backendClient } from "@/config/server";

export const PUT = async (
  request: Request,
  { params }: {  params: Promise<{ role_uuid: string }>  },
) => {
  const body = await request.json();
  const { role_uuid } = await params;

  try {
    const response = await backendClient.put(`/roles/${role_uuid}`, body);

    return backendClient.toNextResponse(response);
  } catch (err: any) {
    return backendClient.errorResponse({
      data: err?.response?.data,
      status: err?.response?.status,
    });
  }
};
