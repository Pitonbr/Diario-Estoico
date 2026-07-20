import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getDb } from "../_lib/db";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { userId } = req.body || {};

  // Valida UUID antes de tocar no banco
  const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!userId || !UUID_RE.test(userId)) {
    return res.status(400).json({ error: "userId inválido ou ausente" });
  }

  const db = getDb();

  // Verifica se o usuário existe antes de criar a conversa
  const { data: user, error: userErr } = await db.from("chat_users")
    .select("id, display_name, blocked_at").eq("id", userId).single();

  if (userErr || !user) {
    return res.status(404).json({ error: "Usuário não encontrado. Refaça o cadastro." });
  }

  if (user.blocked_at) {
    return res.status(403).json({ error: "Conta bloqueada." });
  }

  const { data: convo, error: convoErr } = await db.from("conversations")
    .insert({ user_id: userId, mode: "text" }).select("id").single();

  if (convoErr || !convo) {
    console.error("[conversations/start] erro ao criar conversa:", convoErr?.message);
    return res.status(500).json({ error: "Erro ao criar conversa" });
  }

  const greeting = user.display_name
    ? `Olá, ${user.display_name}. O que está na sua mente hoje?`
    : "Olá. O que está na sua mente hoje?";

  res.json({ conversationId: convo.id, greeting });
}
