import { backendClient } from "@/config/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const resp = await backendClient.post(`/leave-types`, body);

    return backendClient.toNextResponse(resp);
  } catch (err: any) {
    return backendClient.errorResponse({
      data: err?.response?.data,
      status: err?.response?.status,
    });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();

    const resp = await backendClient.put(
      `/leave-types/${body.leave_type_uuid}`,
      body,
    );

    return backendClient.toNextResponse(resp);
  } catch (err: any) {
    return backendClient.errorResponse({
      data: err?.response?.data,
      status: err?.response?.status,
    });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const resp = await backendClient.get(`/leave-types`, {
      params: Object.fromEntries(searchParams),
    });
    return backendClient.toNextResponse(resp);
  } catch (err: any) {
    return backendClient.errorResponse({
      data: err?.response?.data,
      status: err?.response?.status,
    });
  }
}
