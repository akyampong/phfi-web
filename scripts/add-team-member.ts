/**
 * Creates a sign-in for someone on the PHFI team, so they can read the inbox (/inbox).
 * Public sign-up is switched off, so this is the way accounts are made.
 *
 *   bun --env-file=.env.local scripts/add-team-member.ts name@example.com "Their Name"
 *
 * It asks for a password (at least 10 characters), or makes one up and shows it once if you
 * just press Enter. Then add their email to TEAM_EMAILS so the inbox lets them in.
 * Against the live database, use the live DATABASE_URL and DATABASE_AUTH_TOKEN instead.
 */
import { randomBytes } from "node:crypto";
import { auth } from "../src/lib/auth";

const [email, ...nameParts] = process.argv.slice(2);
const name = nameParts.join(" ").trim();
if (!email || !email.includes("@") || !name) {
  console.error('Usage: bun --env-file=.env.local scripts/add-team-member.ts name@example.com "Their Name"');
  process.exit(1);
}

const typed = prompt("Password (leave empty to make one up):")?.trim() ?? "";
if (typed && typed.length < 10) {
  console.error("Use at least 10 characters.");
  process.exit(1);
}
const password = typed || randomBytes(12).toString("base64url");

const ctx = await auth.$context;
const normalised = email.trim().toLowerCase();
if (await ctx.internalAdapter.findUserByEmail(normalised)) {
  console.error(`${normalised} already has an account.`);
  process.exit(1);
}
const user = await ctx.internalAdapter.createUser({ email: normalised, name, emailVerified: true }, { method: "email-password" });
await ctx.internalAdapter.linkAccount({
  userId: user.id,
  providerId: "credential",
  accountId: user.id,
  password: await ctx.password.hash(password),
});

console.log(`Created a sign-in for ${name} <${normalised}>.`);
if (!typed) console.log(`Their password (shown only now): ${password}`);
const team = (process.env.TEAM_EMAILS ?? "").toLowerCase().split(",").map((e) => e.trim());
if (!team.includes(normalised)) console.log(`Remember to add ${normalised} to TEAM_EMAILS, or the inbox won't let them in.`);
