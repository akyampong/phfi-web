import "server-only";

type Email = { to: string; subject: string; text: string; html: string };

/**
 * Sends an email through Resend (resend.com) when RESEND_API_KEY is set, from EMAIL_FROM
 * (an address on a domain verified in Resend). Without a key, in development the email is
 * printed in the dev server's terminal instead, so sign-in works with nothing set up; on the
 * live site it's an error, and nothing is printed (codes must not end up in logs).
 */
export async function sendEmail(email: Email): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    if (process.env.NODE_ENV === "production") {
      console.error(`[email] RESEND_API_KEY isn't set, so "${email.subject}" was not sent.`);
    } else {
      console.info(`\n[email] To: ${email.to}\n[email] Subject: ${email.subject}\n\n${email.text}\n`);
    }
    return;
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || "Purpose House <onboarding@resend.dev>",
        to: email.to,
        subject: email.subject,
        text: email.text,
        html: email.html,
      }),
    });
    if (!response.ok) console.error(`[email] Resend refused "${email.subject}": ${response.status} ${(await response.text()).slice(0, 300)}`);
  } catch (error) {
    console.error(`[email] Could not reach Resend for "${email.subject}":`, error);
  }
}

/** The sign-in code email: the code large, and that it expires. */
export function signInCodeEmail(to: string, code: string, minutes: number): Email {
  const subject = `${code} is your Purpose House sign-in code`;
  const text = `Your sign-in code is ${code}\n\nEnter it on the sign-in page. It works for ${minutes} minutes.\n\nIf you didn't ask to sign in, you can ignore this email.\n\nPurpose House Fellowship International`;
  const html = `<!doctype html><html><body style="margin:0;padding:32px 16px;background:#f5f5f3;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1b1b1b">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:440px;background:#ffffff;border-radius:16px;padding:32px">
<tr><td style="font-size:15px;color:#6b6b6b">Purpose House Fellowship International</td></tr>
<tr><td style="padding-top:20px;font-size:22px;font-weight:600">Your sign-in code</td></tr>
<tr><td style="padding-top:20px;font-size:36px;font-weight:600;letter-spacing:8px">${code}</td></tr>
<tr><td style="padding-top:20px;font-size:15px;line-height:1.6;color:#333333">Enter it on the sign-in page. It works for ${minutes} minutes.</td></tr>
<tr><td style="padding-top:24px;font-size:13px;line-height:1.6;color:#6b6b6b">If you didn’t ask to sign in, you can ignore this email.</td></tr>
</table></td></tr></table></body></html>`;
  return { to, subject, text, html };
}
