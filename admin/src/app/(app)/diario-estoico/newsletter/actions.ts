"use server";

import { createClient } from "@/lib/supabase/server";

interface FullContent {
  subjectLine: string;
  preheader?: string;
  editionLabel?: string;
  dayLabel?: string;
  dateFormatted?: string;
  quote?: { text: string; author: string; source: string };
  contextTitle?: string;
  contextBody?: string;
  applicationTitle?: string;
  applicationBody?: string;
  ctaQuestions?: string[];
  eventConnection?: string;
  bibliographicRef?: string;
}

function buildHtml(c: FullContent, editionNumber: number): string {
  const questions = (c.ctaQuestions ?? [])
    .map((q) => `<li style="margin-bottom:10px;">${q}</li>`)
    .join("");

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${c.subjectLine}</title></head>
<body style="margin:0;padding:0;background:#f0ebe0;font-family:Georgia,'Times New Roman',serif;">
<div style="padding:40px 20px;">
<div style="max-width:560px;margin:0 auto;background:#1c1c18;border-radius:4px;overflow:hidden;">
  <div style="padding:40px 48px 24px;border-bottom:1px solid #2e2e24;">
    <p style="margin:0 0 8px;color:#9a7c35;font-size:10px;letter-spacing:4px;text-transform:uppercase;font-family:Arial,sans-serif;">Diário Estoico</p>
    <p style="margin:0;color:#6a6050;font-size:12px;font-family:Arial,sans-serif;">${c.editionLabel ?? `Edição #${editionNumber}`} · ${c.dayLabel ?? ""}</p>
    <p style="margin:4px 0 0;color:#8a8070;font-size:11px;font-family:Arial,sans-serif;">${c.dateFormatted ?? ""}</p>
  </div>

  ${c.quote ? `
  <div style="padding:32px 48px 0;">
    <div style="border-left:3px solid #c9a227;padding-left:20px;">
      <p style="margin:0 0 10px;color:#c4bdb0;font-style:italic;font-size:16px;line-height:1.7;">"${c.quote.text}"</p>
      <p style="margin:0;color:#6a6050;font-size:11px;letter-spacing:1px;font-family:Arial,sans-serif;text-transform:uppercase;">— ${c.quote.author}</p>
    </div>
  </div>` : ""}

  ${c.contextTitle ? `
  <div style="padding:28px 48px 0;">
    <h2 style="margin:0 0 12px;color:#c9a227;font-size:13px;letter-spacing:2px;text-transform:uppercase;font-family:Arial,sans-serif;">${c.contextTitle}</h2>
    <p style="margin:0;color:#c4bdb0;font-size:15px;line-height:1.85;">${(c.contextBody ?? "").replace(/\n\n/g, "</p><p style='margin:14px 0 0;color:#c4bdb0;font-size:15px;line-height:1.85;'>")}</p>
  </div>` : ""}

  ${c.eventConnection ? `
  <div style="padding:20px 48px 0;">
    <p style="margin:0;color:#8a8070;font-size:13px;font-style:italic;line-height:1.7;border-top:1px solid #2e2e24;padding-top:20px;">${c.eventConnection}</p>
  </div>` : ""}

  ${c.applicationTitle ? `
  <div style="padding:28px 48px 0;">
    <h2 style="margin:0 0 12px;color:#c9a227;font-size:13px;letter-spacing:2px;text-transform:uppercase;font-family:Arial,sans-serif;">${c.applicationTitle}</h2>
    <p style="margin:0;color:#c4bdb0;font-size:15px;line-height:1.85;">${c.applicationBody ?? ""}</p>
  </div>` : ""}

  ${questions ? `
  <div style="padding:28px 48px 0;">
    <p style="margin:0 0 12px;color:#9a7c35;font-size:10px;letter-spacing:3px;text-transform:uppercase;font-family:Arial,sans-serif;">Reflexão</p>
    <ul style="margin:0;padding-left:16px;color:#a4998c;font-size:14px;line-height:1.8;">${questions}</ul>
  </div>` : ""}

  <div style="padding:32px 48px;border-top:1px solid #2e2e24;margin-top:32px;">
    ${c.bibliographicRef ? `<p style="margin:0 0 12px;color:#4a4a40;font-size:11px;font-family:Arial,sans-serif;font-style:italic;">${c.bibliographicRef}</p>` : ""}
    <p style="margin:0;color:#4a4a40;font-size:11px;font-family:Arial,sans-serif;line-height:1.6;">Diário Estoico · São Paulo, Brasil<br>
    Para cancelar, responda "cancelar" a este email.</p>
  </div>
</div>
</div>
</body></html>`;
}

export async function resendNewsletterAction(editionNumber: number) {
  const supabase = await createClient();

  const { data: row } = await supabase
    .from("sent_newsletters")
    .select("edition_number, subject_line, full_content")
    .eq("edition_number", editionNumber)
    .limit(1)
    .single();

  if (!row) return { error: "Edição não encontrada." };

  const content = row.full_content as FullContent;
  const html = buildHtml(content, editionNumber);
  const subject = row.subject_line;

  const { data: subscribers } = await supabase
    .from("subscribers")
    .select("email")
    .eq("active", true);

  if (!subscribers || subscribers.length === 0) {
    return { error: "Nenhum assinante ativo para reenviar." };
  }

  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) return { error: "RESEND_API_KEY não configurada." };

  const from = "Diário Estoico <newsletter@diarioestoico.com.br>";
  let sent = 0;
  const errors: string[] = [];

  for (const sub of subscribers) {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to: [sub.email], subject, html }),
    });
    if (res.ok) {
      sent++;
    } else {
      const body = await res.text();
      errors.push(`${sub.email}: ${body.slice(0, 80)}`);
    }
  }

  if (errors.length > 0) {
    return {
      error: `Enviado para ${sent}/${subscribers.length}. Erros: ${errors.slice(0, 3).join("; ")}`,
    };
  }
  return { success: true, sent };
}
