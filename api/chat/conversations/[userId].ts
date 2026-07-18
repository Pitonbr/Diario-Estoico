import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getDb } from "../_lib/db";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const { userId } = req.query;
  if (!userId || typeof userId !== "string") return res.status(400).json({ error: "userId inválido" });

  const db = getDb();
  const { data } = await db.from("conversations")
    .select("id, started_at, ended_at, session_summary, themes_discussed, message_count")
    .eq("user_id", userId)
    .order("started_at", { ascending: false })
    .limit(20);

  res.json({ conversations: data || [] });
}
