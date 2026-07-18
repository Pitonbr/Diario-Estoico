import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getDb } from "../_lib/db";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { userId } = req.body || {};
  if (!userId) return res.status(400).json({ error: "userId inválido" });

  const db = getDb();
  const { data, error } = await db.from("conversations")
    .insert({ user_id: userId, mode: "text" }).select().single();
  if (error || !data) return res.status(500).json({ error: "Erro ao criar conversa" });

  const { data: user } = await db.from("chat_users")
    .select("display_name").eq("id", userId).single();

  const greeting = user?.display_name
    ? `Olá, ${user.display_name}. O que está na sua mente hoje?`
    : "Olá. O que está na sua mente hoje?";

  res.json({ conversationId: data.id, greeting });
}
