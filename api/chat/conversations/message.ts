import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getDb } from "../_lib/db";
import { processMessage } from "../_lib/engine";

const FREE_MONTHLY_LIMIT = 50;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { userId, conversationId, message } = req.body || {};
  if (!userId || !conversationId || !message) {
    return res.status(400).json({ error: "Dados inválidos" });
  }

  const db = getDb();

  const { data: user } = await db.from("chat_users")
    .select("plan, monthly_message_count, monthly_reset_at").eq("id", userId).single();
  if (!user) return res.status(404).json({ error: "Usuário não encontrado" });

  // Reset mensal
  const resetDate = new Date(user.monthly_reset_at);
  const now = new Date();
  if (now.getTime() - resetDate.getTime() > 30 * 24 * 60 * 60 * 1000) {
    await db.from("chat_users")
      .update({ monthly_message_count: 0, monthly_reset_at: now.toISOString() })
      .eq("id", userId);
    user.monthly_message_count = 0;
  }

  if (user.plan === "free" && user.monthly_message_count >= FREE_MONTHLY_LIMIT) {
    return res.status(429).json({
      error: "limit_reached",
      message: "Você atingiu o limite de mensagens deste mês no plano gratuito.",
    });
  }

  const result = await processMessage(userId, conversationId, message);

  await db.from("chat_users")
    .update({ monthly_message_count: user.monthly_message_count + 1 })
    .eq("id", userId);

  res.json({
    reply: result.reply,
    safetyFlag: result.safetyFlag,
    messagesRemaining: user.plan === "free"
      ? FREE_MONTHLY_LIMIT - user.monthly_message_count - 1
      : null,
  });
}
