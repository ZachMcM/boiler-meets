import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { username } from "better-auth/plugins";
import { db } from "../db";
import * as schema from "../db/schema";
import { sendEmail } from "./mailer";

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL!,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  trustedOrigins: [process.env.CLIENT_URL!],
  advanced: {
    defaultCookieAttributes: {
      sameSite: "none",
      secure: true,
    },
  },
  user: {
    additionalFields: {
      major: {
        type: "string",
        required: false,
      },
      year: {
        type: "string",
        required: false,
      },
      bio: {
        type: "string",
        required: false,
      },
      birthdate: {
        type: "date",
        required: false,
      },
      isBanned: {
        type: "boolean",
        input: false,
      },
      gender: {
        type: "string",
        required: true,
      },
      preference: {
        type: "string",
        required: true,
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    // requireEmailVerification: true,
  },
  // emailVerification: {
  //   sendOnSignUp: true,
  //   autoSignInAfterVerification: true,
  //   sendVerificationEmail: async ({ user, url, token }, request) => {
  //     await sendEmail({
  //       to: user.email,
  //       subject: "Verify your email address",
  //       text: `Hello ${
  //         user.name ?? ""
  //       },\n\nPlease verify your email address by clicking the link: ${url}\n\nIf you didn't request this, you can ignore this email.`,
  //       html: `<p>Hello ${
  //         user.name ?? ""
  //       },</p><p>Please verify your email address by clicking the link below:</p><p><a href="${url}">Verify email</a></p>`,
  //     });
  //   },
  //   async afterEmailVerification(user, request) {
  //     // Your custom logic here, e.g., grant access to premium features
  //     console.log(`${user.email} has been successfully verified!`);
  //   },
  // },
  plugins: [username()],
});

export async function sendVerificationEmail(
  {
    user,
    url,
    token,
  }: { user: { email: string; name?: string }; url: string; token?: string },
  request?: any
) {
  const subject = "Verify your email address";
  const text = `Hello ${
    user.name ?? ""
  },\n\nPlease verify your email address by clicking the link: ${url}\n\nIf you didn't request this, you can ignore this email.`;
  const html = `<p>Hello ${
    user.name ?? ""
  },</p><p>Please verify your email address by clicking the link below:</p><p><a href="${url}">Verify email</a></p>`;

  await sendEmail({
    to: user.email,
    subject,
    text,
    html,
  });
}
