import { backendClient } from "@/config/server";

type Params = { params: Promise<{ team_uuid: string }> };

const fail = (err: any) =>
  backendClient.errorResponse({
    data: err?.response?.data,
    status: err?.response?.status,
  });

export const GET = async (_request: Request, { params }: Params) => {
  try {
    const { team_uuid } = await params;
    const response = await backendClient.get(`/teams/${team_uuid}`);
    return backendClient.toNextResponse(response);
  } catch (err: any) {
    return fail(err);
  }
};

export const PUT = async (request: Request, { params }: Params) => {
  try {
    const { team_uuid } = await params;
    const body = await request.json();
    const response = await backendClient.put(`/teams/${team_uuid}`, body);
    return backendClient.toNextResponse(response);
  } catch (err: any) {
    return fail(err);
  }
};

export const DELETE = async (_request: Request, { params }: Params) => {
  try {
    const { team_uuid } = await params;
    const response = await backendClient.delete(`/teams/${team_uuid}`);
    return backendClient.toNextResponse(response);
  } catch (err: any) {
    return fail(err);
  }
};
