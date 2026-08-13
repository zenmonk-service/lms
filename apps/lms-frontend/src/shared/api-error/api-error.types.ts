export interface BackendErrorPayload {
  method?: string;
  type?: string;
  title: string;
  description: string;
  error: unknown;
  message?: string;
}

export interface NormalizedApiError {
  status: number;
  title: string;
  message: string;
  fieldErrors?: Record<string, string>;
  raw?: unknown;
}