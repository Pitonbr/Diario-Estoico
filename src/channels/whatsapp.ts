import { config } from "../config/env";
import { NewsletterContent } from "../agent/content-generator";

export interface WhatsAppSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

const GRAPH_API_VERSION = "v21.0";

/**
 * Envia uma mensagem de texto livre via WhatsApp Cloud API (Meta).
 *
 * Importante: mensagens de texto livre só são entregues a números de teste
 * cadastrados no app da Meta, ou a destinatários dentro da janela de 24h
 * após eles terem enviado uma mensagem para o número do negócio. Para
 * envio em produção a clientes reais fora dessa janela, é necessário usar
 * um template de mensagem aprovado pela Meta (ver sendWhatsAppTemplate).
 */
export async function sendWhatsAppText(
  phone: string,
  text: string
): Promise<WhatsAppSendResult> {
  if (!config.whatsapp.accessToken || !config.whatsapp.phoneNumberId) {
    return { success: false, error: "WhatsApp não configurado (faltam credenciais)" };
  }

  try {
    const url = `https://graph.facebook.com/${GRAPH_API_VERSION}/${config.whatsapp.phoneNumberId}/messages`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.whatsapp.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: phone,
        type: "text",
        text: { body: text },
      }),
    });

    const data = (await response.json()) as {
      error?: { message?: string };
      messages?: { id: string }[];
    };

    if (!response.ok) {
      return { success: false, error: data?.error?.message ?? "Erro desconhecido" };
    }

    return { success: true, messageId: data?.messages?.[0]?.id };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro desconhecido";
    return { success: false, error: message };
  }
}

/**
 * Envia uma mensagem baseada em template aprovado pela Meta. Necessário
 * para alcançar destinatários fora da janela de 24h (caso de produção).
 */
export async function sendWhatsAppTemplate(
  phone: string,
  templateName: string,
  languageCode = "pt_BR",
  bodyParams: string[] = []
): Promise<WhatsAppSendResult> {
  if (!config.whatsapp.accessToken || !config.whatsapp.phoneNumberId) {
    return { success: false, error: "WhatsApp não configurado (faltam credenciais)" };
  }

  try {
    const url = `https://graph.facebook.com/${GRAPH_API_VERSION}/${config.whatsapp.phoneNumberId}/messages`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.whatsapp.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: phone,
        type: "template",
        template: {
          name: templateName,
          language: { code: languageCode },
          components: bodyParams.length
            ? [
                {
                  type: "body",
                  parameters: bodyParams.map((text) => ({ type: "text", text })),
                },
              ]
            : undefined,
        },
      }),
    });

    const data = (await response.json()) as {
      error?: { message?: string };
      messages?: { id: string }[];
    };

    if (!response.ok) {
      return { success: false, error: data?.error?.message ?? "Erro desconhecido" };
    }

    return { success: true, messageId: data?.messages?.[0]?.id };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro desconhecido";
    return { success: false, error: message };
  }
}

export async function sendWhatsAppToList(
  phones: string[],
  text: string
): Promise<WhatsAppSendResult[]> {
  const results: WhatsAppSendResult[] = [];
  for (const phone of phones) {
    results.push(await sendWhatsAppText(phone, text));
  }
  return results;
}

/**
 * Converte o conteúdo da newsletter em texto formatado para WhatsApp
 * (negrito com *texto*, itálico com _texto_).
 */
export function formatWhatsAppMessage(content: NewsletterContent): string {
  const lines = [
    `🏛️ *${content.dayLabel}* — ${content.dateFormatted}`,
    `_${content.editionLabel}_`,
    "",
    `"${content.quote.text}"`,
    `— ${content.quote.author}, ${content.quote.source}`,
    "",
    `*${content.contextTitle}*`,
    content.contextBody,
    "",
    `*${content.applicationTitle}*`,
    content.applicationBody,
  ];

  if (content.eventConnection) {
    lines.push("", `📅 ${content.eventConnection}`);
  }

  if (content.ctaQuestions.length > 0) {
    lines.push("", "💭 " + content.ctaQuestions.join("\n💭 "));
  }

  lines.push("", `📖 ${content.bibliographicRef}`);

  return lines.join("\n");
}
