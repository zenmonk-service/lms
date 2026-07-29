import { BackendErrorPayload, NormalizedApiError } from "./api-error.types";

function isBackendErrorPayload(data: unknown): data is BackendErrorPayload {
  return (
    typeof data === "object" &&
    data !== null &&
    "title" in data &&
    "description" in data
  );
}

function buildFieldErrors(error: unknown): Record<string, string> | undefined {
  if (!Array.isArray(error)) return undefined;
  return error.reduce<Record<string, string>>((acc, e) => {
    if (e?.path) acc[e.path] = e.message;
    return acc;
  }, {});
}

export function normalizeApiError(err: any): NormalizedApiError {
  const status = err?.response?.status ?? 500;
  const data = err?.response?.data;

  if (isBackendErrorPayload(data)) {
    return {
      status,
      title: data.title,
      message: data.description || "Something went wrong.",
      fieldErrors: buildFieldErrors(data.error),
      raw: data,
    };
  }

  return {
    status,
    title: "Error",
    message: err?.message ?? "Something went wrong.",
  };
}