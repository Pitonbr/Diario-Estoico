import { callClaude, parseClaudeJson } from "../config/claude-api";
import { BRAND_SYSTEM_PROMPT, YOUTUBE_GUIDELINES } from "./prompts/brand-voice";
import { YOUTUBE_PROMPT, YOUTUBE_LONGFORM_SCHEMA } from "./prompts/youtube.prompt";
import { DayContext, GeneratedContent, AgentResult } from "../config/types";

interface YouTubeOutput {
  short: { title: string; script: string; thumbnailText: string; hashtags: string[] };
  longform: {
    title: string; description: string; thumbnailText: string;
    outline: { timestamp: string; section: string; content: string }[];
    tags: string[];
  } | null;
}

export async function runYouTubeAgent(ctx: DayContext, isLongformDay: boolean): Promise<AgentResult> {
  console.log("▶️  YouTube Agent: gerando roteiros...");

  const prompt = YOUTUBE_PROMPT
    .replace("{{BRAND_SYSTEM_PROMPT}}", BRAND_SYSTEM_PROMPT)
    .replace("{{YOUTUBE_GUIDELINES}}", YOUTUBE_GUIDELINES)
    .replace("{{CITACAO}}", ctx.teaching.originalText)
    .replace("{{FILOSOFO}}", ctx.teaching.philosopher)
    .replace("{{OBRA}}", ctx.teaching.work)
    .replace("{{CAPITULO}}", ctx.teaching.bookChapter)
    .replace("{{TEMA}}", ctx.teaching.theme)
    .replace("{{DOMINIO}}", ctx.domain)
    .replace("{{IS_LONGFORM_DAY}}", isLongformDay ? "SIM (1 vídeo de 8-12 min)" : "NÃO (apenas Short)")
    .replace("{{LONGFORM_SCHEMA}}", isLongformDay ? YOUTUBE_LONGFORM_SCHEMA : "null");

  try {
    const raw = await callClaude(prompt, 3000);
    const output = parseClaudeJson<YouTubeOutput>(raw);

    const contents: GeneratedContent[] = [{
      platform: "youtube", format: "short", title: output.short.title,
      body: output.short.script, hashtags: output.short.hashtags,
      visualNotes: `Thumbnail: ${output.short.thumbnailText}`,
      scheduledTime: "08:30", metadata: { type: "short" },
    }];

    if (output.longform) {
      const fullScript = output.longform.outline.map(s => `[${s.timestamp}] ${s.section}\n${s.content}`).join("\n\n");
      contents.push({
        platform: "youtube", format: "longform", title: output.longform.title,
        body: fullScript, visualNotes: `Thumbnail: ${output.longform.thumbnailText}\n\nDescrição:\n${output.longform.description}`,
        scheduledTime: "10:00", metadata: { type: "longform", sections: output.longform.outline.length, tags: output.longform.tags },
      });
    }

    console.log(`   ✓ ${contents.length} peça(s) gerada(s) para YouTube`);
    return { agent: "youtube", platform: "youtube", contents, generatedAt: new Date().toISOString(), teachingKey: ctx.teaching.id, status: "success" };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Erro desconhecido";
    return { agent: "youtube", platform: "youtube", contents: [], generatedAt: new Date().toISOString(), teachingKey: ctx.teaching.id, status: "error", error: msg };
  }
}
