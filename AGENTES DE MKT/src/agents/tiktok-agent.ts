import { callClaude, parseClaudeJson } from "../config/claude-api";
import { BRAND_SYSTEM_PROMPT, TIKTOK_GUIDELINES } from "./prompts/brand-voice";
import { TIKTOK_PROMPT } from "./prompts/tiktok.prompt";
import { DayContext, GeneratedContent, AgentResult } from "../config/types";

interface TikTokOutput {
  video1: { hook: string; script: string; visualNotes: string; duration: string; hashtags: string[]; soundSuggestion: string };
  video2: { hook: string; script: string; visualNotes: string; duration: string; hashtags: string[]; soundSuggestion: string };
}

export async function runTikTokAgent(ctx: DayContext): Promise<AgentResult> {
  console.log("🎵 TikTok Agent: gerando roteiros...");

  const prompt = TIKTOK_PROMPT
    .replace("{{BRAND_SYSTEM_PROMPT}}", BRAND_SYSTEM_PROMPT)
    .replace("{{TIKTOK_GUIDELINES}}", TIKTOK_GUIDELINES)
    .replace("{{CITACAO}}", ctx.teaching.originalText)
    .replace("{{FILOSOFO}}", ctx.teaching.philosopher)
    .replace("{{OBRA}}", ctx.teaching.work)
    .replace("{{TEMA}}", ctx.teaching.theme)
    .replace("{{DOMINIO}}", ctx.domain)
    .replace("{{TENDENCIAS}}", ctx.trendingTopics || "Nenhuma");

  try {
    const raw = await callClaude(prompt, 2000);
    const output = parseClaudeJson<TikTokOutput>(raw);

    const contents: GeneratedContent[] = [
      {
        platform: "tiktok", format: "reels", title: output.video1.hook, body: output.video1.script,
        hashtags: output.video1.hashtags, visualNotes: output.video1.visualNotes,
        audioNotes: output.video1.soundSuggestion, duration: output.video1.duration,
        scheduledTime: "07:30", metadata: { type: "emocional" },
      },
      {
        platform: "tiktok", format: "reels", title: output.video2.hook, body: output.video2.script,
        hashtags: output.video2.hashtags, visualNotes: output.video2.visualNotes,
        audioNotes: output.video2.soundSuggestion, duration: output.video2.duration,
        scheduledTime: "19:00", metadata: { type: "pratico" },
      },
    ];

    console.log(`   ✓ ${contents.length} vídeos gerados para TikTok`);
    return { agent: "tiktok", platform: "tiktok", contents, generatedAt: new Date().toISOString(), teachingKey: ctx.teaching.id, status: "success" };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Erro desconhecido";
    return { agent: "tiktok", platform: "tiktok", contents: [], generatedAt: new Date().toISOString(), teachingKey: ctx.teaching.id, status: "error", error: msg };
  }
}
