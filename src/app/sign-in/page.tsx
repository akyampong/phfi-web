import type { Metadata } from "next";
import { Suspense } from "react";
import { SignInForm } from "./sign-in-form";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false },
};

/** Sign-in for the PHFI team (there's no public sign-up: see lib/auth.ts). */
export default function SignInPage() {
  return (
    <div className="container-page">
      <div className="mx-auto flex min-h-[70svh] max-w-[26rem] flex-col justify-center py-16">
        <h1 className="text-headline text-ink">Sign in</h1>
        <p className="mt-3 text-[1rem] leading-relaxed text-body">For the Purpose House team, to read prayer requests and messages.</p>
        <Suspense>
          <SignInForm />
        </Suspense>
      </div>
    </div>
  );
}
