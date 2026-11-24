import "server-only";
import { getSession } from "./session";

/**
 * The PHFI team: who can read prayer requests and messages in /inbox. Set TEAM_EMAILS to their
 * email addresses, separated by commas. Each needs an account too (scripts/add-team-member.ts).
 */
export function isTeamEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const team = (process.env.TEAM_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return team.includes(email.toLowerCase());
}

/**
 * The signed-in user, if they're on the team; null otherwise. Check this in every page and
 * server action that touches the inbox: hiding a button is not enough.
 */
export async function getTeamSession() {
  const session = await getSession();
  return session && isTeamEmail(session.user.email) ? session : null;
}
