"use server";

import { revalidatePath } from "next/cache";
import {
  updateSubscriberApproval,
  toggleSubscriberActive,
  deleteSubscriber,
} from "@/lib/subscribers";

export async function approveSubscriberAction(id: string) {
  await updateSubscriberApproval(id, "approved");
  revalidatePath("/admin");
  revalidatePath("/admin/assinantes");
}

export async function rejectSubscriberAction(id: string) {
  await updateSubscriberApproval(id, "rejected");
  revalidatePath("/admin");
  revalidatePath("/admin/assinantes");
}

export async function toggleActiveAction(id: string, currentActive: boolean) {
  await toggleSubscriberActive(id, !currentActive);
  revalidatePath("/admin/assinantes");
}

export async function deleteSubscriberAction(id: string) {
  await deleteSubscriber(id);
  revalidatePath("/admin/assinantes");
}

export async function sendMessageAction(formData: FormData) {
  const recipientIds = formData.getAll("recipient_ids") as string[];
  const subject = formData.get("subject") as string;
  const body = formData.get("body") as string;
  const channel = formData.get("channel") as string;

  if (!subject || !body) throw new Error("Assunto e mensagem são obrigatórios");
  if (recipientIds.length === 0) throw new Error("Selecione ao menos um destinatário");

  if (channel === "email") {
    const { createClient } = await import("@/lib/supabase/server");
    const db = await createClient();
    const { data: subs } = await db
      .from("subscribers")
      .select("email, name")
      .in("id", recipientIds)
      .eq("channel", "email")
      .eq("active", true);

    if (!subs || subs.length === 0) throw new Error("Nenhum inscrito de email ativo selecionado");

    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);

    for (const sub of subs) {
      if (!sub.email) continue;
      await resend.emails.send({
        from: `Diário Estoico <${process.env.SENDER_EMAIL ?? "onboarding@resend.dev"}>`,
        to: sub.email,
        subject,
        text: body,
      });
    }
  }

  revalidatePath("/admin/assinantes");
}
