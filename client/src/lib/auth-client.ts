import { createAuthClient } from "better-auth/react"
import {
  inferAdditionalFields,
  usernameClient,
} from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_SERVER_URL,
  fetchOptions: {
    credentials: "include", // Required for cross-origin cookies
  },
  plugins: [
    inferAdditionalFields({
      user: {
        major: {
          type: "string",
          required: false
        },
        year: {
          type: "string",
          required: false
        },
        bio: {
          type: "string",
          required: false
        },
        birthdate: {
          type: "date",
          required: false
        },
      }
    }),
    usernameClient()
  ],
})

export async function fetchUserSession() {
  const response = await authClient.getSession({ query: {
    disableCookieCache: false
  }});

  return response;
}