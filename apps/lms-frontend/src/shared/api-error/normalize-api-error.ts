import { HttpError } from "@/config/error-handler";
import { BackendErrorPayload, NormalizedApiError } from "./api-error.types";

function isBackendErrorPayload(data: unknown): data is BackendErrorPayload {
  return (
    typeof data === "object" &&
    data !== null &&
    ("title" in data || "message" in data)
  );
}

function buildFieldErrors(error: unknown): Record<string, string> | undefined {
  if (!Array.isArray(error)) return undefined;

  return error.reduce<Record<string, string>>((acc, e) => {
    if (e?.path) {
      acc[e.path] = e.message;
    }

    return acc;
  }, {});
}

export function normalizeApiError(err: unknown): NormalizedApiError {
  if (err instanceof HttpError) {
    const data = err.response.data;

    if (isBackendErrorPayload(data)) {
      const message =
        typeof data.error === "string"
          ? data.error
          : typeof data.description === "string"
            ? data.description
            : typeof data.message === "string"
              ? data.message
              : "Something went wrong.";

      return {
        status: err.response.status,
        title: data.title,
        message,
        fieldErrors: buildFieldErrors(err),
        raw: data,
      };
    }

    return {
      status: err.response.status,
      title: "Error",
      message: err.message,
      raw: data,
    };
  }

  if (err instanceof Error) {
    return {
      status: 500,
      title: "Internal Server Error",
      message: err.message,
    };
  }

  return {
    status: 500,
    title: "Internal Server Error",
    message: "Something went wrong.",
  };
}
