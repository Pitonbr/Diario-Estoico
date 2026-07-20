import { createClient } from "@/lib/supabase/server";

interface SendGiftEmailParams {
  displayName: string;
  email: string;
  durationDays: number;
  products: string[];
  giftToken: string;
}

function buildProductsListHtml(products: string[]): string {
  const labels: Record<string, string> = {
    newsletter: "Diário Estoico — Newsletter diária de filosofia estoica",
    chat: "Chat Estoico — IA conversacional estoica (plano premium)",
  };
  return products
    .map((p) => `<p class="product-item">${labels[p] ?? p}</p>`)
    .join("\n");
}

function buildProductsText(products: string[]): string {
  const labels: Record<string, string> = {
    newsletter: "- Diário Estoico (Newsletter)",
    chat: "- Chat Estoico Premium",
  };
  return products.map((p) => labels[p] ?? `- ${p}`).join("\n");
}

function replaceVariables(
  template: string,
  vars: Record<string, string>
): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? `{{${key}}}`);
}

export async function sendGiftInviteEmail(params: SendGiftEmailParams): Promise<void> {
  const supabase = await createClient();

  const { data: tmpl, error } = await supabase
    .from("email_templates")
    .select("subject, html_body, text_body")
    .eq("template_key", "gift_invite")
    .eq("active", true)
    .single();

  if (error || !tmpl) {
    throw new Error(`Template 'gift_invite' não encontrado: ${error?.message ?? "inativo"}`);
  }

  const baseUrl =
    process.env.BACKEND_URL ?? "https://diario-estoico-henna.vercel.app";
  const giftLink = `${baseUrl}/api/chat/convite/activate?token=${params.giftToken}`;

  const vars: Record<string, string> = {
    display_name: params.displayName,
    duration_days: String(params.durationDays),
    products_list: buildProductsListHtml(params.products),
    products_text: buildProductsText(params.products),
    gift_link: giftLink,
  };

  const subject = replaceVariables(tmpl.subject, vars);
  const htmlBody = replaceVariables(tmpl.html_body, vars);
  const textBody = tmpl.text_body ? replaceVariables(tmpl.text_body, vars) : undefined;

  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) throw new Error("RESEND_API_KEY não configurada");

  const payload: Record<string, unknown> = {
    from: "Empreender Estoico <contato@diarioestoico.com.br>",
    to: [params.email],
    subject,
    html: htmlBody,
  };
  if (textBody) payload.text = textBody;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Resend error ${res.status}: ${body}`);
  }
}
