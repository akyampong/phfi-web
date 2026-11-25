import { buttonPrimary } from "@/components/ui/styles";

/**
 * For pages that need someone signed in (their account, the team inbox): a short reason and a
 * Sign in button that opens the sign-in modal. Once signed in, the page refreshes into itself.
 */
export function SignInPrompt({ title, text }: { title: string; text: string }) {
  return (
    <div className="flex min-h-[55svh] flex-col items-start justify-center">
      <h1 className="text-page-sm text-ink">{title}</h1>
      <p className="mt-4 max-w-[46ch] text-[1.0625rem] leading-relaxed text-body">{text}</p>
      <a href="#sign-in" className={`${buttonPrimary} mt-8`}>
        Sign in
      </a>
    </div>
  );
}
