"use server";

import { createClient } from "@/lib/supabase/server";
import { sendGiftInviteEmail } from "@/lib/email";
import { revalidatePath } from "next/cache";

export interface CreateGiftInviteInput {
  displayName: string;
  email: string;
  phone: string;
  products: string[];
  durationDays: number;
  notes: string;
}

export async function createGiftInviteAction(input: CreateGiftInviteInput) {
  const { displayName, email, phone, products, durationDays, notes } = input;

  if (!displayName || !email || products.length === 0) {
    return { error: "Nome, email e ao menos um produto são obrigatórios." };
  }

  const supabase = await createClient();

  const { data: invite, error: insertErr } = await supabase
    .from("gift_invites")
    .insert({
      display_name: displayName,
      email,
      phone: phone || null,
      products,
      duration_days: durationDays,
      notes: notes || null,
      status: "pending",
    })
    .select("id, token")
    .single();

  if (insertErr || !invite) {
    return { error: `Erro ao criar convite: ${insertErr?.message ?? "desconhecido"}` };
  }

  try {
    await sendGiftInviteEmail({
      displayName,
      email,
      durationDays,
      products,
      giftToken: invite.token,
    });

    await supabase
      .from("gift_invites")
      .update({ email_sent_at: new Date().toISOString() })
      .eq("id", invite.id);
  } catch (emailErr) {
    return {
      error: `Convite criado (ID ${invite.id}), mas o email falhou: ${emailErr instanceof Error ? emailErr.message : String(emailErr)}`,
    };
  }

  revalidatePath("/admin/convites");
  return { success: true, inviteId: invite.id };
}

export async function listGiftInvitesAction() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("gift_invites")
    .select(
      "id, display_name, email, phone, products, duration_days, status, email_sent_at, activated_at, created_at"
    )
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) return { error: error.message, invites: [] };
  return { invites: data ?? [], error: null };
}
