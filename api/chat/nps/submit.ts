import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getDb } from "../_lib/db";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { userId, conversationId, score, feedbackText } = req.body || {};
  if (!userId || score === undefined || score === null) {
    return res.status(400).json({ error: "Dados inválidos" });
  }
  if (typeof score !== "number" || score < 0 || score > 10) {
    return res.status(400).json({ error: "Score deve ser entre 0 e 10" });
  }

  const db = getDb();
  await db.from("chat_nps").insert({
    user_id: userId,
    conversation_id: conversationId || null,
    score,
    feedback_text: feedbackText || null,
  });

  res.json({ status: "ok" });
}
