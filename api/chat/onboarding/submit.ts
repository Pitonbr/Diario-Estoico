import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getDb } from "../_lib/db";
import { buildInitialProfile } from "../_lib/onboarding";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { email, authId, answers, displayName, termsAccepted, privacyAccepted } = req.body || {};

  if (!email || !answers || !displayName || termsAccepted !== true || privacyAccepted !== true) {
    return res.status(400).json({ error: "Dados inválidos" });
  }

  const db = getDb();
  const preferredLanguage = (answers["q1_language"] as string) || "pt-BR";
  const now = new Date().toISOString();

  const { data: user, error } = await db.from("chat_users").upsert(
    { email, auth_id: authId, display_name: displayName, preferred_language: preferredLanguage,
      terms_accepted_at: now, terms_version: "1.0.0", privacy_accepted_at: now,
      onboarding_completed_at: now },
    { onConflict: "email" }
  ).select().single();

  if (error || !user) return res.status(500).json({ error: "Erro ao criar usuário" });

  const { communicationStyle, lifeContext } = buildInitialProfile(answers);
  await db.from("user_profiles").upsert(
    { user_id: user.id, onboarding_answers: answers,
      communication_style: communicationStyle, life_context: lifeContext },
    { onConflict: "user_id" }
  );

  res.json({ userId: user.id, profile: { communicationStyle, lifeContext } });
}
