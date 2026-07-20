import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getDb } from "../_lib/db";

const CHAT_PWA_URL =
  process.env.CHAT_PWA_URL ?? "https://chat-estoico.vercel.app";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const token = (req.query.token as string) || "";

  if (!token) {
    return res.redirect(302, `${CHAT_PWA_URL}?error=token_missing`);
  }

  const db = getDb();

  const { data: invite, error } = await db
    .from("gift_invites")
    .select("id, display_name, email, products, duration_days, status, token")
    .eq("token", token)
    .single();

  if (error || !invite) {
    return res.redirect(302, `${CHAT_PWA_URL}?error=invalid_token`);
  }

  if (invite.status !== "pending") {
    const reason =
      invite.status === "activated" ? "already_activated" : "expired";
    return res.redirect(302, `${CHAT_PWA_URL}?error=${reason}`);
  }

  const products = (invite.products as string[]) || [];

  // Subscribe to newsletter if product includes 'newsletter'
  if (products.includes("newsletter")) {
    await db.from("subscribers").upsert(
      {
        email: invite.email,
        name: invite.display_name,
        active: true,
        gift_invite_id: invite.id,
        trial_expires_at: new Date(
          Date.now() + invite.duration_days * 24 * 60 * 60 * 1000
        ).toISOString(),
      },
      { onConflict: "email" }
    );
  }

  // If chat product, redirect to PWA onboarding with gift token
  if (products.includes("chat")) {
    return res.redirect(
      302,
      `${CHAT_PWA_URL}/onboarding?gift=${token}`
    );
  }

  // Newsletter only: mark invite as activated and redirect to a success page
  await db
    .from("gift_invites")
    .update({ status: "activated", activated_at: new Date().toISOString() })
    .eq("id", invite.id);

  return res.redirect(302, `${CHAT_PWA_URL}?success=newsletter_activated`);
}
