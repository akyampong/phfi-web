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
