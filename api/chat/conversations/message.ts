import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getDb } from "../_lib/db";
import { processMessage } from "../_lib/engine";
import { quickRedLineCheck, recordAdminAlert, buildBlockedResponse } from "../_lib/safety";

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

  // 1. Verifica usuário: existência, bloqueio e limite mensal
  const { data: user } = await db.from("chat_users")
    .select("plan, monthly_message_count, monthly_reset_at, blocked_at, preferred_language")
    .eq("id", userId).single();
  if (!user) return res.status(404).json({ error: "Usuário não encontrado" });

  if (user.blocked_at) {
    return res.status(403).json({
      error: "user_blocked",
      reply: buildBlockedResponse(user.preferred_language || "pt-BR"),
    });
  }

  // 2. Verifica se a conversa está bloqueada por revisão admin
  const { data: convo } = await db.from("conversations")
    .select("admin_blocked, block_reason").eq("id", conversationId).single();

  if (convo?.admin_blocked) {
    return res.status(403).json({
      error: "conversation_blocked",
      reply: buildBlockedResponse(user.preferred_language || "pt-BR"),
    });
  }

  // 3. Reset mensal
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

  // 4. Detecção de linha vermelha (ANTES de chamar Claude)
  const redLine = quickRedLineCheck(message);
  if (redLine.detected) {
    // Bloqueia conversa se severity crítico ou alto
    const shouldBlock = redLine.severity === "critical" || redLine.severity === "high";

    recordAdminAlert(userId, conversationId, redLine.type, redLine.severity, message, shouldBlock)
      .catch(() => {});

    if (shouldBlock) {
      return res.json({
        reply: buildBlockedResponse(user.preferred_language || "pt-BR"),
        safetyFlag: `redline_${redLine.type}`,
        messagesRemaining: null,
      });
    }
    // severity "medium" (ex: aborto): só alerta, não bloqueia — continua normal
  }

  // 5. Processa mensagem normalmente
  let result;
  try {
    result = await processMessage(userId, conversationId, message);
  } catch (err) {
    console.error("[message] processMessage falhou:", err instanceof Error ? err.message : String(err));
    return res.status(500).json({
      reply: "Tive um problema para responder. Pode tentar de novo?",
      safetyFlag: null,
      messagesRemaining: user.plan === "free"
        ? FREE_MONTHLY_LIMIT - user.monthly_message_count
        : null,
    });
  }

  await db.from("chat_users")
    .update({ monthly_message_count: user.monthly_message_count + 1 })
    .eq("id", userId);

  // 6. Se foi detectada crise pelo engine → também registra alerta admin
  if (result.safetyFlag === "crisis_detected") {
    recordAdminAlert(
      userId, conversationId, "suicidal_ideation", "high", message, false
    ).catch(() => {});
  }

  res.json({
    reply: result.reply,
    safetyFlag: result.safetyFlag,
    messagesRemaining: user.plan === "free"
      ? FREE_MONTHLY_LIMIT - user.monthly_message_count - 1
      : null,
  });
}
