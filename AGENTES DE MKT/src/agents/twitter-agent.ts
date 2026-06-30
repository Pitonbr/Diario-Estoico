import { callClaude, parseClaudeJson } from "../config/claude-api";
import { BRAND_SYSTEM_PROMPT, TWITTER_GUIDELINES } from "./prompts/brand-voice";
import { TWITTER_PROMPT, TWITTER_THREAD_SCHEMA } from "./prompts/twitter.prompt";
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

  const prompt = TWITTER_PROMPT
    .replace("{{BRAND_SYSTEM_PROMPT}}", BRAND_SYSTEM_PROMPT)
    .replace("{{TWITTER_GUIDELINES}}", TWITTER_GUIDELINES)
    .replace("{{CITACAO}}", ctx.teaching.originalText)
    .replace("{{FILOSOFO}}", ctx.teaching.philosopher)
    .replace("{{OBRA}}", ctx.teaching.work)
    .replace("{{TEMA}}", ctx.teaching.theme)
    .replace("{{DOMINIO}}", ctx.domain)
    .replace("{{IS_THREAD_DAY}}", isThreadDay ? "SIM" : "NÃO")
    .replace("{{EVENTOS}}", ctx.calendarEvents.map(e => e.name).join(", ") || "Nenhum")
    .replace("{{TENDENCIAS}}", ctx.trendingTopics || "Nenhuma")
    .replace("{{THREAD_SCHEMA}}", isThreadDay ? TWITTER_THREAD_SCHEMA : "null");

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
