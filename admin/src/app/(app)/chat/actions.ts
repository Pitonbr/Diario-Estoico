"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// ── Alertas ──────────────────────────────────────────────

export async function resolveAlertAction(formData: FormData) {
  const alertId = formData.get("alertId") as string;
  const action = formData.get("action") as string;
  const notes = (formData.get("notes") as string) || null;

  if (!alertId || !action) throw new Error("Dados inválidos");

  const db = await createClient();

  const { data: alert } = await db.from("chat_admin_alerts")
    .select("conversation_id, user_id").eq("id", alertId).single();

  if (!alert) throw new Error("Alerta não encontrado");

  if (action === "approve") {
    if (alert.conversation_id) {
      await db.from("conversations")
        .update({ admin_blocked: false, block_reason: null })
        .eq("id", alert.conversation_id);
    }
    await db.from("chat_admin_alerts").update({
      status: "approved",
      admin_notes: notes,
      reviewed_at: new Date().toISOString(),
    }).eq("id", alertId);

  } else if (action === "block_user") {
    if (alert.user_id) {
      await db.from("chat_users").update({
        blocked_at: new Date().toISOString(),
        block_reason: notes || "Bloqueado por revisão de conteúdo",
      }).eq("id", alert.user_id);
    }
    await db.from("chat_admin_alerts").update({
      status: "user_blocked",
      admin_notes: notes,
      reviewed_at: new Date().toISOString(),
    }).eq("id", alertId);

  } else if (action === "end_conversation") {
    if (alert.conversation_id) {
      await db.from("conversations").update({
        ended_at: new Date().toISOString(),
        admin_blocked: false,
        session_summary: "Conversa encerrada por revisão administrativa.",
      }).eq("id", alert.conversation_id);
    }
    await db.from("chat_admin_alerts").update({
      status: "conversation_ended",
      admin_notes: notes,
      reviewed_at: new Date().toISOString(),
    }).eq("id", alertId);
  }

  revalidatePath("/chat/alertas");
}

// ── Financeiro Chat ──────────────────────────────────────

export async function addChatFinancialAction(formData: FormData) {
  const type = formData.get("type") as string;
  const category = formData.get("category") as string;
  const description = formData.get("description") as string;
  const amount = parseFloat(formData.get("amount") as string);
  const occurred_at = formData.get("occurred_at") as string;

  if (!type || !category || !amount || !occurred_at) throw new Error("Dados inválidos");

  const db = await createClient();
  await db.from("chat_financials").insert({
    type,
    category,
    description: description || "",
    amount_cents: Math.round(amount * 100),
    occurred_at,
  });

  revalidatePath("/chat/financeiro");
}

export async function deleteChatFinancialAction(id: string) {
  const db = await createClient();
  await db.from("chat_financials").delete().eq("id", id);
  revalidatePath("/chat/financeiro");
}
