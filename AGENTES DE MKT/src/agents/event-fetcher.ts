import Anthropic from "@anthropic-ai/sdk";
import { config } from "../config/env";
import { getTodayEvents, CalendarEvent } from "../config/calendar";

export interface DayContext {
  calendarEvents: CalendarEvent[];
  trendingTopics: string;
  eventTags: string[];
}

/**
 * Busca contexto do dia: datas comemorativas + tendências de negócios/mentoria
 */
export async function fetchDayContext(date: Date): Promise<DayContext> {
  const calendarEvents = getTodayEvents(date);

  // Busca tendências via Claude com web search
  const trendingTopics = await fetchTrendingTopics(date);

  // Extrai tags dos eventos para matching com ensinamentos
  const eventTags = calendarEvents.flatMap((e) =>
    e.stoicConnection
      .toLowerCase()
      .split(/[\s:,]+/)
      .filter((w) => w.length > 3)
  );

  return { calendarEvents, trendingTopics, eventTags };
}

async function fetchTrendingTopics(date: Date): Promise<string> {
  try {
    const anthropic = new Anthropic({ apiKey: config.anthropic.apiKey });

    const dateStr = date.toLocaleDateString("pt-BR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    const response = await anthropic.messages.create({
      model: config.anthropic.model,
      max_tokens: 500,
      tools: [{ type: "web_search_20250305", name: "web_search" }],
      messages: [
        {
          role: "user",
          content: `Hoje é ${dateStr}. Busque 2-3 temas relevantes de HOJE nos seguintes domínios:

1. Negócios/empreendedorismo no Brasil ou no mundo (lançamentos, IPOs, fusões, tendências)
2. Desenvolvimento pessoal/mentoria (eventos, conferências, temas trending)
3. Eventos esportivos ou culturais relevantes

Responda APENAS com um parágrafo curto (3-4 frases) listando os temas mais relevantes do dia. Sem formatação, sem bullet points. Se não encontrar nada específico de hoje, mencione tendências da semana.`,
        },
      ],
    });

    const textBlock = response.content.find((b) => b.type === "text");
    return textBlock ? textBlock.text : "";
  } catch (error) {
    console.warn("⚠️  Não foi possível buscar tendências. Usando apenas calendário fixo.");
    return "";
  }
}
