import { callClaude, parseClaudeJson } from "../config/claude-api";
import { BRAND_SYSTEM_PROMPT } from "./prompts/brand-voice";
import { CAFE_ESTOICO_PROMPT } from "./prompts/cafe-estoico.prompt";
import { DayContext, GeneratedContent, AgentResult } from "../config/types";

interface CafeOutput {
  title: string;
  greeting: string;
  script: string;
  closingCta: string;
  visualNotes: string;
  duration: string;
}

/**
 * Agente "Café Estoico" — gera o roteiro do vídeo matinal diário
 * Inspirado no "Café com Destino" do Tiago Brunet
 * Publicado às 7:30 no Instagram Reels, YouTube Shorts e TikTok
 */
export async function runCafeEstoicoAgent(ctx: DayContext): Promise<AgentResult> {
  console.log("☕ Café Estoico Agent: gerando roteiro matinal...");

  const prompt = CAFE_ESTOICO_PROMPT
    .replace("{{BRAND_SYSTEM_PROMPT}}", BRAND_SYSTEM_PROMPT)
    .replace("{{DATA_FORMATADA}}", ctx.dateFormatted)
    .replace("{{WEEKDAY}}", ctx.weekday)
    .replace("{{EDICAO}}", String(ctx.editionNumber))
    .replace("{{CITACAO}}", ctx.teaching.originalText)
    .replace("{{FILOSOFO}}", ctx.teaching.philosopher)
    .replace("{{OBRA}}", ctx.teaching.work)
    .replace("{{CAPITULO}}", ctx.teaching.bookChapter)
    .replace("{{TEMA}}", ctx.teaching.theme)
    .replace("{{DOMINIO}}", ctx.domain)
    .replace("{{EVENTOS}}", ctx.calendarEvents.map(e => e.name).join(", ") || "Nenhum especial");

  try {
    const raw = await callClaude(prompt, 1500);
    const output = parseClaudeJson<CafeOutput>(raw);

    const fullScript = `${output.greeting}\n\n${output.script}\n\n${output.closingCta}`;

    const contents: GeneratedContent[] = [{
      platform: "instagram", // Publicado simultaneamente em IG, YT, TikTok
      format: "video_script",
      title: `☕ Café Estoico #${ctx.editionNumber}: ${output.title}`,
      body: fullScript,
      cta: output.closingCta,
      visualNotes: output.visualNotes,
      duration: output.duration,
      scheduledTime: "07:30",
      metadata: { type: "cafe_estoico", crossPost: ["instagram", "youtube", "tiktok"] },
    }];

    console.log(`   ✓ Roteiro "Café Estoico" gerado: "${output.title}"`);
    return { agent: "cafe-estoico", platform: "instagram", contents, generatedAt: new Date().toISOString(), teachingKey: ctx.teaching.id, status: "success" };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Erro desconhecido";
    return { agent: "cafe-estoico", platform: "instagram", contents: [], generatedAt: new Date().toISOString(), teachingKey: ctx.teaching.id, status: "error", error: msg };
  }
}
