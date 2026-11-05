import { backendClient } from "@/config/server";

export const POST = async (
  request: Request,
  { params }: { params: Promise<{ team_uuid: string }> },
) => {
  try {
    const { team_uuid } = await params;
    const body = await request.json();
    const response = await backendClient.post(
      `/teams/${team_uuid}/members`,
      body,
    );
    return backendClient.toNextResponse(response);
  } catch (err: any) {
    return backendClient.errorResponse({
      data: err?.response?.data,
      status: err?.response?.status,
    });
  }
};
