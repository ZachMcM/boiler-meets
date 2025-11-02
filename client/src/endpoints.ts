import type { DraggableModule } from "./components/ProfileModules";
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

export async function getUserByUsername(username: string) {
  const user = await serverRequest({
    endpoint: `/user/username/${username}`,
    method: "GET",
  });

  return user;
}

export const createMatch = async (firstUserId: string, secondUserId: string, matchType: "friend" | "romantic") => {
  return await serverRequest({
    endpoint: "/matches",
    method: "POST",
    body: JSON.stringify({ firstUserId, secondUserId, matchType }),
  });
};

export const getMatches = async (): Promise<Match[]> => {
  return await serverRequest({
    endpoint: "/matches",
    method: "GET",
  });
};

export const removeMatch = async (firstUserId: string, secondUserId: string) => {
  return await serverRequest({
    endpoint: "/matches",
    method: "DELETE",
    body: JSON.stringify({ firstUserId, secondUserId }),
  });
};

export const getProfileReactions = async (profileOwnerId: string) => {
  return await serverRequest({
    endpoint: `/profile-reactions/${profileOwnerId}`,
    method: "GET",
  });
};

export const addProfileReaction = async (
  profileOwnerId: string,
  targetId: string,
  targetType: string,
  emoji: string
) => {
  return await serverRequest({
    endpoint: "/profile-reactions",
    method: "POST",
    body: JSON.stringify({ profileOwnerId, targetId, targetType, emoji }),
  });
};

export const removeProfileReaction = async (reactionId: string) => {
  return await serverRequest({
    endpoint: `/profile-reactions/${reactionId}`,
    method: "DELETE",
  });
};
export const unitTestModifyProfile = async (profile: DraggableModule[]) => {
  return await serverRequest({
    endpoint: "/unit_testing/modify_profile",
    method: "POST",
    body: JSON.stringify(profile),
  });
}

export const unitTestGetProfile = async () => {
  return await serverRequest({
    endpoint: "/unit_testing/get_profile",
    method: "GET"
  });
}

export const getMatchMessages = async (matchId: string) => {
  return await serverRequest({
    endpoint: `/messages/match/${matchId}`,
    method: "GET"
  });
};

export type SubmitReportParams = {
  audioBlob: Blob;
  submissionDetails: string;
  incomingUserId: string;
  outgoingUserId: string;
};

export const submitReport = async ({
  audioBlob,
  submissionDetails,
  incomingUserId,
  outgoingUserId,
}: SubmitReportParams) => {
  const formData = new FormData();
  formData.append("audio", audioBlob, "call-recording.webm");
  formData.append("submissionDetails", submissionDetails);
  formData.append("incomingUserId", incomingUserId);
  formData.append("outgoingUserId", outgoingUserId);

  return await serverRequest({
    endpoint: "/reports",
    method: "POST",
    formData,
  });
};