import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { db } from "@/db";
import * as schema from "@/db/schema";

export const auth = betterAuth({
  appName: "Purpose House Fellowship International",
  database: drizzleAdapter(db, { provider: "sqlite", schema }),
  emailAndPassword: {
    enabled: true,
    // No public sign-up: accounts are for the PHFI team (the prayer and message inbox), and
    // are created with scripts/add-team-member.ts. Otherwise anyone could register with a
    // team member's address before they do.
    disableSignUp: true,
  },
  session: {
    // Keep a short-lived copy of the session in a signed cookie,
    // so the navbar does not hit the database on every page view.
    cookieCache: { enabled: true, maxAge: 5 * 60 },
  },
  // nextCookies must stay last so it can set cookies from server actions.
  plugins: [nextCookies()],
});

export type Session = typeof auth.$Infer.Session;
