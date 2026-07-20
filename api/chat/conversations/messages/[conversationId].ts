import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getDb } from "../../_lib/db";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const { conversationId } = req.query;
  if (!conversationId || typeof conversationId !== "string") {
    return res.status(400).json({ error: "conversationId inválido" });
  }

  const db = getDb();
  const { data, error } = await db
    .from("messages")
    .select("id, role, content, created_at, teachings_used")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (error) return res.status(500).json({ error: "Erro ao buscar mensagens" });

  res.json({ messages: data || [] });
}
