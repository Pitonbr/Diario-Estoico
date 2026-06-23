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
}

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

  // 3. Gerar conteúdo via Claude
  console.log("\n🤖 Gerando conteúdo via Claude API...");
  const editionNumber = await getNextEditionNumber();

  const prompt = buildNewsletterPrompt({
    teaching,
    domain,
    dayContext,
    editionNumber,
    date,
    dayOfYear: doy,
  });

  const anthropic = new Anthropic({ apiKey: config.anthropic.apiKey });

  const response = await anthropic.messages.create({
    model: config.anthropic.model,
    max_tokens: 2000,
    temperature: 0.7,
    messages: [{ role: "user", content: prompt }],
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

  let content: NewsletterContent;
  try {
    content = JSON.parse(cleanJson);
  } catch {
    throw new Error(`Erro ao parsear JSON do Claude:\n${cleanJson.slice(0, 500)}`);
  }

  console.log(`   ✓ Conteúdo gerado: "${content.subjectLine}"`);

  // 4. Validação (double-check)
  console.log("\n🔍 Validando conteúdo...");
  const validation = await validateContent(content, teaching);
  console.log(`   Citação correta: ${validation.quoteMatch ? "✓" : "✗"}`);
  console.log(`   Referência correta: ${validation.sourceMatch ? "✓" : "✗"}`);
  console.log(`   Sem alucinação: ${validation.noHallucination ? "✓" : "⚠️"}`);

  // Se citação foi alterada, forçar a original
  if (!validation.quoteMatch) {
    console.log("   ⚠️  Corrigindo citação para a original...");
    content.quote.text = teaching.originalText;
  }

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
  };
}
