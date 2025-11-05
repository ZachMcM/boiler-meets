import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { username } from "better-auth/plugins";
import { db } from "../db";
import * as schema from "../db/schema";
import { sendEmail } from "./mailer";
import { eq } from "drizzle-orm";

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
      lastPasswordReset: {
        type: "date",
        required: false,
      },
      notifications: {
        type: "string",
        required: true,
        default: "[]",
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    // requireEmailVerification: true,
    sendResetPassword: async ({ user, url, token }, request) => {
      try {
        const now = new Date();
        const last = (user as any)?.lastPasswordReset
          ? new Date((user as any).lastPasswordReset)
          : new Date(0);
        const oneDayMs = 24 * 60 * 60 * 1000;
        if (now.getTime() - last.getTime() < oneDayMs) {
          // Prevent sending another reset email within 24 hours
          throw new Error(
            "Password reset already requested within the last 24 hours. Please try again later."
          );
        }
      } catch (err) {
        // If parsing fails or other error, throw to stop sending
        throw err;
      }

      await sendEmail({
        to: user.email,
        subject: "Reset your password",
        text: `Click the link to reset your password: ${url}`,
      });
    },
    onPasswordReset: async ({ user }, request) => {
      // Set lastPasswordReset timestamp in DB after successful password reset
      try {
        if (user?.id) {
          await db
            .update(schema.user)
            .set({ lastPasswordReset: new Date() })
            .where(eq(schema.user.id, user.id));
        }
      } catch (e) {
        console.error(
          "Failed to update lastPasswordReset for user",
          user?.email,
          e
        );
      }
      console.log(`Password reset for ${user?.email}!`);
    },
    resetPasswordTokenExpiresIn: 3600,
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url, token }, request) => {
      await sendEmail({
        to: user.email,
        subject: "Verify your email address",
        text: `Hello ${
          user.name ?? ""
        },\n\nPlease verify your email address by clicking the link: ${url}\n\nIf you didn't request this, you can ignore this email.`,
        html: `<p>Hello ${
          user.name ?? ""
        },</p><p>Please verify your email address by clicking the link below:</p><p><a href="${url}">Verify email</a></p>`,
      });
    },
    async afterEmailVerification(user, request) {
      // Your custom logic here, e.g., grant access to premium features
      console.log(`${user.email} has been successfully verified!`);
    },
  },
  session: {
    cookieCache: {
      enabled: true,
    },
  },
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
