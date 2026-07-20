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

  // Tenta upsert; se falhar, tenta buscar o usuário existente pelo email
  let userId: string | null = null;
  {
    const { data: upserted, error: upsertErr } = await db.from("chat_users").upsert(
      { email, display_name: displayName, preferred_language: preferredLanguage,
        terms_accepted_at: now, terms_version: "1.0.0", privacy_accepted_at: now,
        onboarding_completed_at: now },
      { onConflict: "email" }
    ).select("id").single();

    if (upserted?.id) {
      userId = upserted.id;
    } else {
      // Upsert retornou vazio (versão do Supabase JS com comportamento de update sem retorno)
      console.warn("[onboarding/submit] upsert sem retorno, buscando por email:", upsertErr?.message);
      const { data: existing } = await db.from("chat_users")
        .select("id").eq("email", email).single();
      userId = existing?.id ?? null;
    }
  }

  if (!userId) {
    return res.status(500).json({ error: "Não foi possível criar ou recuperar o usuário" });
  }

  const { communicationStyle, lifeContext } = buildInitialProfile(answers);
  await db.from("user_profiles").upsert(
    { user_id: userId, onboarding_answers: answers,
      communication_style: communicationStyle, life_context: lifeContext },
    { onConflict: "user_id" }
  ).catch((e: Error) => console.warn("[onboarding/submit] user_profiles upsert:", e?.message));

  res.json({ userId, profile: { communicationStyle, lifeContext } });
}
