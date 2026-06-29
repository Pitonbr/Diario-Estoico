import { Resend } from "resend";
import { render } from "@react-email/render";
import React from "react";

import { config } from "../config/env";
import { DiarioEstoicoEmail, DiarioEstoicoEmailProps } from "./templates/diario-estoico";

const resend = new Resend(config.resend.apiKey);

export interface SendResult {
  success: boolean;
  resendId?: string;
  error?: string;
}

/**
 * Renderiza o template React Email e envia via Resend
 */
export async function sendNewsletter(
  props: DiarioEstoicoEmailProps,
  subjectLine: string
): Promise<SendResult> {
  try {
    // Renderizar React Email para HTML
    const emailElement = React.createElement(DiarioEstoicoEmail, props);
    const html = await render(emailElement);

    // Enviar via Resend
    const { data, error } = await resend.emails.send({
      from: `${config.email.senderName} <${config.email.senderEmail}>`,
      to: [config.email.recipientEmail],
      subject: subjectLine,
      html,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, resendId: data?.id };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro desconhecido";
    return { success: false, error: message };
  }
}

/**
 * Envio para múltiplos destinatários (expansão futura)
 */
export async function sendToList(
  props: DiarioEstoicoEmailProps,
  subjectLine: string,
  recipients: string[]
): Promise<SendResult[]> {
  const results: SendResult[] = [];

  for (const email of recipients) {
    try {
      const emailElement = React.createElement(DiarioEstoicoEmail, props);
      const html = await render(emailElement);

      const { data, error } = await resend.emails.send({
        from: `${config.email.senderName} <${config.email.senderEmail}>`,
        to: [email],
        subject: subjectLine,
        html,
      });

      results.push(
        error
          ? { success: false, error: error.message }
          : { success: true, resendId: data?.id }
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro desconhecido";
      results.push({ success: false, error: message });
    }
  }

  return results;
}
