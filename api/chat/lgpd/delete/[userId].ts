import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getDb } from "../../_lib/db";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  if (req.method !== "DELETE") return res.status(405).json({ error: "Method not allowed" });

  const { userId } = req.query;
  if (!userId || typeof userId !== "string") return res.status(400).json({ error: "userId inválido" });

  const db = getDb();
  await db.from("chat_users").delete().eq("id", userId);

  res.json({ status: "deleted", deletedAt: new Date().toISOString() });
}
