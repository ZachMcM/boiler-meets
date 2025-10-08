import type { Match, User } from "./types/user";

export type serverRequestParams = {
  endpoint: string;
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: string;
  formData?: FormData;
  tokenOverride?: string;
};

export async function serverRequest({
  endpoint,
  method,
  body,
  formData,
}: serverRequestParams) {
  const headers = {} as any;

  // Only add Content-Type if body is provided (not for FormData)
  if (body !== undefined && !formData) {
    headers["Content-Type"] = "application/json";
  }

  const fetchOptions: RequestInit = {
    method,
    headers,
    credentials: "include", // Include cookies automatically
  };

  // Use formData if provided, otherwise use body
  if (formData !== undefined) {
    fetchOptions.body = formData;
  } else if (body !== undefined) {
    fetchOptions.body = body;
  }

  const res = await fetch(
    `${import.meta.env.VITE_SERVER_URL}${endpoint}`,
    fetchOptions
  );

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error);
  }

  return data;
}

export async function getUser(userId: string): Promise<User> {
  const user = await serverRequest({
    endpoint: `/users/${userId}`,
    method: "GET",
  });

  return user;
}

export const createMatch = async (firstUserId: string, secondUserId: string) => {
  return await serverRequest({
    endpoint: "/matches",
    method: "POST",
    body: JSON.stringify({ firstUserId, secondUserId }),
  });
};

export const getMatches = async (): Promise<Match[]> => {
  return await serverRequest({
    endpoint: "/matches",
    method: "GET",
  });
};