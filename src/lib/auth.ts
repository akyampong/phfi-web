import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { emailOTP } from "better-auth/plugins";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { sendEmail, signInCodeEmail } from "@/lib/email";

const CODE_MINUTES = 10;
const google =
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
    ? { clientId: process.env.GOOGLE_CLIENT_ID, clientSecret: process.env.GOOGLE_CLIENT_SECRET, prompt: "select_account" as const }
    : undefined;

/** Whether "Continue with Google" is set up (GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET). */
export const googleEnabled = Boolean(google);

/**
 * Sign-in, with no passwords: "Continue with Google", or an email address and a six-digit code
 * sent to it. Signing in either way with the same address reaches the same account. Accounts
 * are open to everyone; the team's inbox is limited to TEAM_EMAILS (see lib/team.ts), which is
 * safe because both ways prove the person owns the address.
 */
export const auth = betterAuth({
  appName: "Purpose House Fellowship International",
  database: drizzleAdapter(db, { provider: "pg", schema }),
  socialProviders: google ? { google } : {},
  account: {
    // Google confirms the address, so a Google sign-in joins an account first made by email
    accountLinking: { enabled: true, trustedProviders: ["google"] },
  },
  user: {
    // People can delete their own account from /account
    deleteUser: { enabled: true },
  },
  session: {
    // Keep a short-lived copy of the session in a signed cookie,
    // so the navbar does not hit the database on every page view.
    cookieCache: { enabled: true, maxAge: 5 * 60 },
  },
  plugins: [
    emailOTP({
      otpLength: 6,
      expiresIn: CODE_MINUTES * 60,
      allowedAttempts: 5,
      storeOTP: "hashed",
      async sendVerificationOTP({ email, otp, type }) {
        if (type !== "sign-in") return;
        // Not awaited, so how long sending takes doesn't reveal anything about the address
        void sendEmail(signInCodeEmail(email, otp, CODE_MINUTES));
      },
    }),
    // nextCookies must stay last so it can set cookies from server actions.
    nextCookies(),
  ],
});

export type Session = typeof auth.$Infer.Session;
