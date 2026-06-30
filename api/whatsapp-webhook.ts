import { createClient } from "@supabase/supabase-js";
import { validateSignup } from "../src/security/signup-validator";

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || "";

function getSupabase() {
  return createClient(
    process.env.SUPABASE_URL || "",
    process.env.SUPABASE_SERVICE_KEY || ""
  );
}

/**
 * Webhook do WhatsApp Cloud API (Meta).
 *
 * GET  -> handshake de verificação exigido pela Meta ao configurar o webhook.
 * POST -> eventos: status de entrega das mensagens que enviamos, e mensagens
 *         recebidas (usado como cadastro automático: quem manda mensagem
 *         para o número do negócio é registrado como inscrito no canal
 *         whatsapp).
 */
export default async function handler(req: any, res: any) {
  if (req.method === "GET") {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      res.status(200).send(challenge);
    } else {
      res.status(403).send("Forbidden");
    }
    return;
  }

  if (req.method === "POST") {
    try {
      const body = req.body;
      console.log("Webhook recebido:", JSON.stringify(body));

      const value = body?.entry?.[0]?.changes?.[0]?.value;

      // Status de entrega das mensagens que enviamos (sent/delivered/read/failed)
      if (value?.statuses) {
        for (const status of value.statuses) {
          console.log(
            `[STATUS] ${status.status} | destinatário: ${status.recipient_id} | erro: ${JSON.stringify(
              status.errors ?? null
            )}`
          );
        }
      }

      // Mensagens recebidas: cadastro automático de inscrito via WhatsApp
      if (value?.messages) {
        const supabase = getSupabase();

        for (const msg of value.messages) {
          const phone = msg.from;
          const name = value.contacts?.[0]?.profile?.name ?? null;

          const validation = validateSignup(null, phone);
          const approvalStatus = validation.shouldPend ? "pending" : "approved";
          const approvedAt = validation.shouldPend ? null : new Date().toISOString();

          const { error } = await supabase
            .from("subscribers")
            .upsert(
              {
                channel: "whatsapp",
                phone,
                name,
                active: !validation.shouldPend,
                approval_status: approvalStatus,
                approved_at: approvedAt,
                signup_risk_score: validation.riskScore,
                risk_notes: validation.riskNotes,
              },
              { onConflict: "phone" }
            );

          if (error) {
            console.error("Erro ao cadastrar inscrito:", error.message);
          } else {
            console.log(`[CADASTRO] ${phone} (${name}) | risco: ${validation.riskScore} | status: ${approvalStatus}`);
          }
        }
      }

      res.status(200).send("OK");
    } catch (err) {
      console.error("Erro no webhook:", err);
      // Sempre responde 200 para a Meta não reenviar o mesmo evento em loop
      res.status(200).send("OK");
    }
    return;
  }

  res.status(405).send("Method Not Allowed");
}
