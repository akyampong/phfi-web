import "server-only";
import { cache } from "react";
import { headers } from "next/headers";
import { auth } from "./auth";

/**
 * Reads the signed-in user for this request.
 * Wrapped in React `cache` so several components can call it during one render
 * without repeating the lookup. Call it only inside a <Suspense> boundary.
 */
export const getSession = cache(async () => {
  return auth.api.getSession({ headers: await headers() });
});
