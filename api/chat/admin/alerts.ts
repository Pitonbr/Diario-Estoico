import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getDb } from "../_lib/db";

// Chave simples de admin — em produção usar JWT ou token fixo de env
const ADMIN_KEY = process.env.ADMIN_SECRET_KEY || "admin-estoico-2026";

function isAuthorized(req: VercelRequest): boolean {
  return req.headers["x-admin-key"] === ADMIN_KEY;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, PATCH, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-admin-key");
  if (req.method === "OPTIONS") return res.status(200).end();

  if (!isAuthorized(req)) return res.status(401).json({ error: "Não autorizado" });

  const db = getDb();

  if (req.method === "GET") {
    const status = (req.query.status as string) || "pending";
    const { data } = await db.from("chat_admin_alerts")
      .select("id, user_id, conversation_id, alert_type, severity, trigger_message, status, admin_notes, reviewed_at, created_at")
      .eq("status", status)
      .order("created_at", { ascending: false })
      .limit(50);
    return res.json({ alerts: data || [] });
  }

  if (req.method === "PATCH") {
    const { alertId, action, adminNotes } = req.body || {};
    if (!alertId || !action) return res.status(400).json({ error: "alertId e action obrigatórios" });

    // Busca o alerta para obter conversationId e userId
    const { data: alert } = await db.from("chat_admin_alerts")
      .select("conversation_id, user_id").eq("id", alertId).single();
    if (!alert) return res.status(404).json({ error: "Alerta não encontrado" });

    if (action === "approve") {
      // Libera a conversa
      if (alert.conversation_id) {
        await db.from("conversations")
          .update({ admin_blocked: false, block_reason: null })
          .eq("id", alert.conversation_id);
      }
      await db.from("chat_admin_alerts").update({
        status: "approved", admin_notes: adminNotes || null,
        reviewed_at: new Date().toISOString(),
      }).eq("id", alertId);

    } else if (action === "block_user") {
      // Bloqueia o usuário permanentemente
      if (alert.user_id) {
        await db.from("chat_users").update({
          blocked_at: new Date().toISOString(),
          block_reason: adminNotes || "Bloqueado por revisão de conteúdo",
        }).eq("id", alert.user_id);
      }
      await db.from("chat_admin_alerts").update({
        status: "user_blocked", admin_notes: adminNotes || null,
        reviewed_at: new Date().toISOString(),
      }).eq("id", alertId);

    } else if (action === "end_conversation") {
      // Encerra a conversa
      if (alert.conversation_id) {
        await db.from("conversations").update({
          ended_at: new Date().toISOString(),
          admin_blocked: false,
          session_summary: "Conversa encerrada por revisão administrativa.",
        }).eq("id", alert.conversation_id);
      }
      await db.from("chat_admin_alerts").update({
        status: "conversation_ended", admin_notes: adminNotes || null,
        reviewed_at: new Date().toISOString(),
      }).eq("id", alertId);
    } else {
      return res.status(400).json({ error: "Ação inválida" });
    }

    return res.json({ status: "ok" });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
