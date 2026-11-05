import { backendClient } from "@/config/server";

export const DELETE = async (
  _request: Request,
  { params }: { params: Promise<{ team_uuid: string; user_uuid: string }> },
) => {
  try {
    const { team_uuid, user_uuid } = await params;
    const response = await backendClient.delete(
      `/teams/${team_uuid}/members/${user_uuid}`,
    );
    return backendClient.toNextResponse(response);
  } catch (err: any) {
    return backendClient.errorResponse({
      data: err?.response?.data,
      status: err?.response?.status,
    });
  }
};
