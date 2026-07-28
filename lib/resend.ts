import { Resend } from "resend";

let resendClient: Resend | null = null;

/**
 * Lazily creates the Resend client so a missing RESEND_API_KEY only
 * surfaces when an email actually needs to be sent, rather than crashing
 * the whole module graph on import.
 */
export function getResendClient(): Resend {
  if (resendClient) return resendClient;

  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    throw new Error(
      "Missing RESEND_API_KEY environment variable. Add it to your .env.local file."
    );
  }

  resendClient = new Resend(apiKey);
  return resendClient;
}
