import { callClaude, parseClaudeJson } from "../config/claude-api";
import { BRAND_SYSTEM_PROMPT } from "./prompts/brand-voice";
import { DayContext, GeneratedContent, AgentResult } from "../config/types";
import { sendNewsletter } from "../email/sender";
import { DiarioEstoicoEmailProps } from "../email/templates/diario-estoico";

interface NewsletterOutput {
  subjectLine: string;
  preheader: string;
  contextTitle: string;
  contextBody: string;
  applicationTitle: string;
  applicationBody: string;
  ctaQuestions: string[];
  eventConnection: string;
}

const DOMAIN_LABELS: Record<string, string> = {
  pessoal: "Desenvolvimento Pessoal",
  financeiro: "Finanças e Investimentos",
  empreendedor: "Empreendedorismo e Negócios",
};

export async function runNewsletterAgent(ctx: DayContext, sendEmail = true): Promise<AgentResult> {
  console.log("📧 Newsletter Agent: gerando email...");

  const calendarStr = ctx.calendarEvents.length > 0
    ? ctx.calendarEvents.map(e => `${e.name}: ${e.stoicConnection}`).join("; ")
    : "Sem data especial";

  const prompt = `${BRAND_SYSTEM_PROMPT}

═══ NEWSLETTER DIÁRIA — DIÁRIO ESTOICO ═══
Máximo 350-450 palavras. 2 minutos de leitura.

Data: ${ctx.dateFormatted} | Dia ${ctx.dayOfYear}/365 | Edição #${ctx.editionNumber}
Domínio: ${DOMAIN_LABELS[ctx.domain]}
Citação: "${ctx.teaching.originalText}" — ${ctx.teaching.philosopher}, ${ctx.teaching.work}, ${ctx.teaching.bookChapter}
Tema: ${ctx.teaching.theme}
Eventos: ${calendarStr}
Tendências: ${ctx.trendingTopics || "Nenhuma"}

Gere o conteúdo em JSON:
{
  "subjectLine": "Assunto do email com emoji (máx 60 chars)",
  "preheader": "Preview text (máx 100 chars)",
  "contextTitle": "Título envolvente (5-8 palavras)",
  "contextBody": "3-4 parágrafos (máx 200 palavras). Conecte ensinamento ao dia de hoje. Tom Andrea Vermont: direto, emocional, sem enrolação. Exemplos concretos. Separar parágrafos com \\n\\n.",
  "applicationTitle": "${DOMAIN_LABELS[ctx.domain]}",
  "applicationBody": "Dica prática acionável HOJE (2-3 frases)",
  "ctaQuestions": ["Pergunta reflexiva 1", "Pergunta orientada à ação 2"],
  "eventConnection": "1 frase conectando evento/tendência ao ensinamento (ou vazio se não houver)"
}

A citação DEVE ser IDÊNTICA à fornecida. NÃO invente fatos.
RESPONDA APENAS COM O JSON.`;

  try {
    const raw = await callClaude(prompt, 2000);
    const output = parseClaudeJson<NewsletterOutput>(raw);

    const emailProps: DiarioEstoicoEmailProps = {
      dayLabel: `Dia ${ctx.dayOfYear} de 365`,
      dateFormatted: ctx.dateFormatted,
      editionLabel: `Edição #${ctx.editionNumber}`,
      quote: {
        text: ctx.teaching.originalText, // Sempre usar a original, não a gerada
        author: ctx.teaching.philosopher,
        source: `${ctx.teaching.work}, ${ctx.teaching.bookChapter}`,
      },
      contextTitle: output.contextTitle,
      contextBody: output.contextBody,
      applicationTitle: output.applicationTitle,
      applicationBody: output.applicationBody,
      ctaQuestions: output.ctaQuestions,
      bibliographicRef: `${ctx.teaching.philosopher}. ${ctx.teaching.work}. ${ctx.teaching.bookChapter}.`,
      eventConnection: output.eventConnection || undefined,
      preheader: output.preheader,
    };

    // Enviar email se solicitado
    let sendResult = { success: false, resendId: undefined as string | undefined };
    if (sendEmail) {
      console.log("   📤 Enviando email...");
      sendResult = await sendNewsletter(emailProps, output.subjectLine);
      if (sendResult.success) {
        console.log(`   ✓ Email enviado! ID: ${sendResult.resendId}`);
      } else {
        console.error(`   ✗ Falha no envio`);
      }
    }

    const contents: GeneratedContent[] = [{
      platform: "newsletter",
      format: "email",
      title: output.subjectLine,
      body: `${output.contextTitle}\n\n${output.contextBody}\n\n⚡ ${output.applicationTitle}\n${output.applicationBody}\n\n🎯 Reflexão:\n1. ${output.ctaQuestions[0]}\n2. ${output.ctaQuestions[1]}`,
      cta: output.ctaQuestions.join(" | "),
      scheduledTime: "08:00",
      metadata: {
        type: "email",
        subjectLine: output.subjectLine,
        preheader: output.preheader,
        sent: sendResult.success,
        resendId: sendResult.resendId,
        emailProps, // Salva props completas para re-envio se necessário
      },
    }];

    console.log(`   ✓ Newsletter gerada: "${output.subjectLine}"`);
    return { agent: "newsletter", platform: "newsletter", contents, generatedAt: new Date().toISOString(), teachingKey: ctx.teaching.id, status: "success" };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Erro desconhecido";
    console.error(`   ✗ Erro: ${msg}`);
    return { agent: "newsletter", platform: "newsletter", contents: [], generatedAt: new Date().toISOString(), teachingKey: ctx.teaching.id, status: "error", error: msg };
  }
}
