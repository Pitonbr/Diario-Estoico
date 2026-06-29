import { callClaude, parseClaudeJson } from "../config/claude-api";
import { BRAND_SYSTEM_PROMPT, TWITTER_GUIDELINES } from "./prompts/brand-voice";
import { DayContext, GeneratedContent, AgentResult } from "../config/types";

interface TwitterOutput {
  morningTweet: { text: string; hashtags: string[] };
  citationTweet: { text: string; hashtags: string[] };
  engagementTweet: { text: string; hashtags: string[] };
  eveningTweet: { text: string; hashtags: string[] };
  thread: { tweets: string[]; hashtags: string[] } | null;
}

export async function runTwitterAgent(ctx: DayContext, isThreadDay: boolean): Promise<AgentResult> {
  console.log("🐦 Twitter/X Agent: gerando tweets...");

  const prompt = `${BRAND_SYSTEM_PROMPT}\n\n${TWITTER_GUIDELINES}

═══ DADOS DO DIA ═══
Ensinamento: "${ctx.teaching.originalText}" — ${ctx.teaching.philosopher}, ${ctx.teaching.work}
Tema: ${ctx.teaching.theme} | Domínio: ${ctx.domain}
Gerar thread hoje: ${isThreadDay ? "SIM" : "NÃO"}
Eventos: ${ctx.calendarEvents.map(e => e.name).join(", ") || "Nenhum"}
Tendências: ${ctx.trendingTopics || "Nenhuma"}

═══ TAREFA ═══
{
  "morningTweet": { "text": "Tweet matinal (máx 280 chars). Reflexão do dia, tom inspirador.", "hashtags": ["#estoicismo"] },
  "citationTweet": { "text": "Citação estoica + aplicação em 1 frase (máx 280 chars)", "hashtags": [] },
  "engagementTweet": { "text": "Pergunta provocadora para gerar respostas (máx 280 chars)", "hashtags": [] },
  "eveningTweet": { "text": "Reflexão noturna ou dica prática para encerrar o dia (máx 280 chars)", "hashtags": [] },
  "thread": ${isThreadDay ? `{
    "tweets": [
      "Tweet 1: Hook (curiosidade/polêmica, máx 280 chars)",
      "Tweet 2: Contexto histórico (máx 280 chars)",
      "Tweet 3: O ensinamento central (máx 280 chars)",
      "Tweet 4: Aplicação prática moderna (máx 280 chars)",
      "Tweet 5: Exemplo real de negócios/vida (máx 280 chars)",
      "Tweet 6: Conclusão + CTA (assine o Diário Estoico, link na bio)"
    ],
    "hashtags": ["#estoicismo", "#filosofia"]
  }` : "null"}
}

CADA tweet deve ter EXATAMENTE no máximo 280 caracteres.
RESPONDA APENAS COM O JSON.`;

  try {
    const raw = await callClaude(prompt, 2000);
    const output = parseClaudeJson<TwitterOutput>(raw);

    const contents: GeneratedContent[] = [
      { platform: "twitter", format: "tweet", title: "Tweet matinal", body: output.morningTweet.text, hashtags: output.morningTweet.hashtags, scheduledTime: "07:00", metadata: { slot: "morning" } },
      { platform: "twitter", format: "tweet", title: "Citação", body: output.citationTweet.text, hashtags: output.citationTweet.hashtags, scheduledTime: "10:00", metadata: { slot: "citation" } },
      { platform: "twitter", format: "tweet", title: "Engajamento", body: output.engagementTweet.text, hashtags: output.engagementTweet.hashtags, scheduledTime: "14:00", metadata: { slot: "engagement" } },
      { platform: "twitter", format: "tweet", title: "Reflexão noturna", body: output.eveningTweet.text, hashtags: output.eveningTweet.hashtags, scheduledTime: "21:00", metadata: { slot: "evening" } },
    ];

    if (output.thread) {
      contents.push({
        platform: "twitter", format: "thread", title: "Thread semanal",
        body: output.thread.tweets.join("\n\n---\n\n"),
        slides: output.thread.tweets,
        hashtags: output.thread.hashtags,
        scheduledTime: "12:00", metadata: { slot: "thread", tweetCount: output.thread.tweets.length },
      });
    }

    console.log(`   ✓ ${contents.length} peça(s) gerada(s) para X/Twitter`);
    return { agent: "twitter", platform: "twitter", contents, generatedAt: new Date().toISOString(), teachingKey: ctx.teaching.id, status: "success" };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Erro desconhecido";
    return { agent: "twitter", platform: "twitter", contents: [], generatedAt: new Date().toISOString(), teachingKey: ctx.teaching.id, status: "error", error: msg };
  }
}
