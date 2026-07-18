import type { VercelRequest, VercelResponse } from "@vercel/node";
import { processEndedConversation } from "../_lib/memory";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { conversationId } = req.body || {};
  if (!conversationId) return res.status(400).json({ error: "conversationId inválido" });

  // Assíncrono — não bloqueia resposta
  processEndedConversation(conversationId).catch(err =>
    console.error("Erro no processamento de memória:", err)
  );

  res.json({ status: "processing" });
}
