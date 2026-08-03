import { ssoClient } from "@/config/server";

export const POST = async (request: Request) => {
  const data = await request.json();
  try {
    const response = await ssoClient.post("/login", data, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return ssoClient.toNextResponse(response);
  } catch (err: any) {

    return ssoClient.errorResponse({
      status: err?.response?.status,
      data: err?.response?.message,
    });

  }
};
