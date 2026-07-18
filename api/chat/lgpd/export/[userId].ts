import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getDb } from "../../_lib/db";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const { userId } = req.query;
  if (!userId || typeof userId !== "string") return res.status(400).json({ error: "userId inválido" });

  const db = getDb();
  const [user, profile, conversations, insights] = await Promise.all([
    db.from("chat_users").select("*").eq("id", userId).single(),
    db.from("user_profiles").select("*").eq("user_id", userId).single(),
    db.from("conversations").select("*").eq("user_id", userId),
    db.from("profile_insights").select("*").eq("user_id", userId),
  ]);

  res.json({
    exportedAt: new Date().toISOString(),
    user: user.data, profile: profile.data,
    conversations: conversations.data, insights: insights.data,
  });
}
