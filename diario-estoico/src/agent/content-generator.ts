import Anthropic from "@anthropic-ai/sdk";
import dayjs from "dayjs";
import dayOfYear from "dayjs/plugin/dayOfYear";

import { config } from "../config/env";
import { selectTeachingForToday } from "./stoic-knowledge";
import { fetchDayContext } from "./event-fetcher";
import { buildNewsletterPrompt } from "./prompts/newsletter";
import { validateContent, ValidationResult } from "./validator";
import { getNextEditionNumber } from "../database/queries";

dayjs.extend(dayOfYear);

export interface NewsletterContent {
  subjectLine: string;
  preheader: string;
  dayLabel: string;
  dateFormatted: string;
  editionLabel: string;
  quote: {
    text: string;
    author: string;
    source: string;
  };
  contextTitle: string;
  contextBody: string;
  applicationTitle: string;
  applicationBody: string;
  ctaQuestions: string[];
  bibliographicRef: string;
  eventConnection?: string;
}

export interface GenerationResult {
  content: NewsletterContent;
  teachingKey: string;
  philosopher: string;
  sourceWork: string;
  domain: string;
  externalEvent: string | null;
  validation: ValidationResult;
  attempts: number;
}

const MAX_GENERATION_ATTEMPTS = 3;

/**
 * Pipeline completo de geração de conteúdo:
 * 1. Seleciona ensinamento (anti-repetição)
 * 2. Busca contexto do dia (calendário + web trends)
 * 3. Gera conteúdo via Claude API
 * 4. Valida (double-check anti-alucinação)
 * 5. Retorna conteúdo pronto para template
 */
export async function generateDailyContent(): Promise<GenerationResult> {
  const now = dayjs();
  const date = now.toDate();
  const doy = now.dayOfYear();

  console.log(`\n🏛️  Diário Estoico — Geração para ${now.format("DD/MM/YYYY")}`);
  console.log(`   Dia ${doy}/365\n`);

  // 1. Buscar contexto do dia
  console.log("📅 Buscando contexto do dia...");
  const dayContext = await fetchDayContext(date);

  if (dayContext.calendarEvents.length > 0) {
    console.log(
      `   Eventos: ${dayContext.calendarEvents.map((e) => e.name).join(", ")}`
    );
  }

  // 2. Selecionar ensinamento
  console.log("📜 Selecionando ensinamento...");
  const { teaching, domain } = await selectTeachingForToday(
    dayContext.eventTags
  );
  console.log(`   Filósofo: ${teaching.philosopher}`);
  console.log(`   Obra: ${teaching.work}, ${teaching.bookChapter}`);
  console.log(`   Tema: ${teaching.theme}`);
  console.log(`   Domínio: ${domain}`);

  // 3. Gerar conteúdo via Claude (com correção automática em caso de alucinação)
  const editionNumber = await getNextEditionNumber();

  const basePrompt = buildNewsletterPrompt({
    teaching,
    domain,
    dayContext,
    editionNumber,
    date,
    dayOfYear: doy,
  });

  const anthropic = new Anthropic({ apiKey: config.anthropic.apiKey });

  let content: NewsletterContent;
  let validation: ValidationResult;
  let attempt = 0;
  let correctionNotice = "";

  do {
    attempt++;
    console.log(
      `\n🤖 Gerando conteúdo via Claude API... (tentativa ${attempt}/${MAX_GENERATION_ATTEMPTS})`
    );

    const response = await anthropic.messages.create({
      model: config.anthropic.model,
      max_tokens: 2000,
      temperature: 0.7,
      messages: [{ role: "user", content: basePrompt + correctionNotice }],
    });

    const textBlock = response.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      throw new Error("Claude não retornou conteúdo de texto");
    }

    // Parse do JSON (com limpeza de possíveis backticks)
    const cleanJson = textBlock.text
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    try {
      content = JSON.parse(cleanJson);
    } catch {
      throw new Error(`Erro ao parsear JSON do Claude:\n${cleanJson.slice(0, 500)}`);
    }

    console.log(`   ✓ Conteúdo gerado: "${content.subjectLine}"`);

    // Citação e referência bibliográfica são sempre forçadas para os valores
    // reais da base (fonte da verdade), eliminando esse vetor de alucinação
    // antes mesmo de validar.
    content.quote.text = teaching.originalText;
    content.quote.source = `${teaching.philosopher}, ${teaching.work}, ${teaching.bookChapter}`;

    // 4. Validação (double-check anti-alucinação)
    console.log("🔍 Validando conteúdo...");
    validation = await validateContent(content, teaching);
    console.log(`   Citação correta: ${validation.quoteMatch ? "✓" : "✗"}`);
    console.log(`   Referência correta: ${validation.sourceMatch ? "✓" : "✗"}`);
    console.log(`   Sem alucinação: ${validation.noHallucination ? "✓" : "⚠️"}`);

    if (!validation.noHallucination && attempt < MAX_GENERATION_ATTEMPTS) {
      console.log("   ⚠️  Revisor encontrou problema factual. Regenerando conteúdo...");
      correctionNotice = `\n\nATENÇÃO: numa tentativa anterior, o revisor identificou este problema factual: "${validation.warnings.join(
        " "
      )}". Gere uma nova versão que corrija esse problema, mantendo fidelidade estrita aos fatos sobre ${teaching.philosopher} e ${teaching.work}.`;
    }
  } while (!validation.noHallucination && attempt < MAX_GENERATION_ATTEMPTS);

  const externalEvent =
    dayContext.calendarEvents.length > 0
      ? dayContext.calendarEvents[0].name
      : dayContext.trendingTopics
        ? "Tendência do dia"
        : null;

  return {
    content,
    teachingKey: teaching.id,
    philosopher: teaching.philosopher,
    sourceWork: teaching.work,
    domain,
    externalEvent,
    validation,
    attempts: attempt,
  };
}
