import { NextResponse } from "next/server";
import { HttpError } from "./error-handler";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
type QueryValue = string | number | boolean | null | undefined | object;

interface RequestOptions extends Omit<RequestInit, "method" | "body"> {
  method?: HttpMethod;
  body?: unknown;
  params?: Record<string, QueryValue>;
}

export class HttpClient {
  constructor(
    private readonly baseURL: string,
    private readonly getHeaders?: () => Promise<HeadersInit>,
    private readonly throwOnError: boolean = false,
  ) {}

  private async request(path: string, options: RequestOptions = {}) {
    const extraHeaders = this.getHeaders ? await this.getHeaders() : {};

    const headers = new Headers({
      ...extraHeaders,
      ...options.headers,
    });
    const isFormData =
      typeof FormData !== "undefined" && options.body instanceof FormData;

    if (!isFormData) {
      headers.set("Content-Type", "application/json");
    }

    let body: any;
    if (options.body) {
      if (isFormData || typeof options.body === "string") {
        body = options.body;
      } else {
        body = JSON.stringify(options.body);
      }
    }

    let url = `${this.baseURL}${path}`;
    if (options.params) {
      const searchParams = new URLSearchParams();
      Object.keys(options.params).forEach((key) => {
        const value = options.params![key];
        if (value === undefined || value === null) {
          searchParams.delete(key);
        } else {
          if (typeof value === "object") {
            Object.entries(value).forEach(([childKey, childValue]) => {
              searchParams.append(`${key}[${childKey}]`, childValue);
            });
          } else {
            searchParams.append(key, String(value));
          }
        }
      });
      url += `?${searchParams.toString()}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
      credentials: "include",
      body,
    });

    if (this.throwOnError && !response.ok) {
      // only throw error for bffClient
      let data: unknown;

      try {
        data = await response.json();
      } catch {
        data = {
          title: response.statusText || "Request Failed",
          description: "Something went wrong.",
        };
      }

      throw new HttpError(response.status, data);
    }

    return response;
  }

  async get(path: string, init?: Omit<RequestOptions, "method">) {
    return this.request(path, {
      ...init,
      method: "GET",
    });
  }

  async post(
    path: string,
    body?: unknown,
    init?: Omit<RequestOptions, "method" | "body">,
  ) {
    return this.request(path, {
      ...init,
      method: "POST",
      body,
    });
  }

  async put(
    path: string,
    body?: unknown,
    init?: Omit<RequestOptions, "method" | "body">,
  ) {
    return this.request(path, {
      ...init,
      method: "PUT",
      body,
    });
  }

  async patch(
    path: string,
    body?: unknown,
    init?: Omit<RequestOptions, "method" | "body">,
  ) {
    return this.request(path, {
      ...init,
      method: "PATCH",
      body,
    });
  }

  async delete(path: string, init?: Omit<RequestOptions, "method">) {
    return this.request(path, {
      ...init,
      method: "DELETE",
    });
  }

  async toNextResponse(response: Response) {
    return new NextResponse(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    });
  }

  async errorResponse({ status, data }: { status: number; data: unknown }) {
    const message = data ?? {
      title: "Internal Server Error",
      description: "Something went wrong.",
    };
    return NextResponse.json(message, { status: status ?? 500 });
  }
}
