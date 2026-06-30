import { callClaude, parseClaudeJson } from "../config/claude-api";
import { BRAND_SYSTEM_PROMPT, INSTAGRAM_GUIDELINES } from "./prompts/brand-voice";
import { INSTAGRAM_PROMPT, INSTAGRAM_CAROUSEL_SCHEMA } from "./prompts/instagram.prompt";
import { DayContext, GeneratedContent, AgentResult } from "../config/types";

interface InstagramOutput {
  reels: {
    hook: string;
    script: string;
    visualNotes: string;
    duration: string;
    cta: string;
    hashtags: string[];
  };
  carousel: {
    title: string;
    slides: string[];
    lastSlideCta: string;
    hashtags: string[];
  } | null;
  staticPost: {
    quoteText: string;
    caption: string;
    hashtags: string[];
  };
  storyIdeas: string[];
}

// Mapa de formato por dia da semana
const WEEKDAY_FORMAT: Record<string, ContentFormat> = {
  "segunda-feira": "reels",
  "terça-feira": "carousel",
  "quarta-feira": "reels",
  "quinta-feira": "static_post",
  "sexta-feira": "reels",
  "sábado": "carousel",
  "domingo": "static_post",
};

type ContentFormat = "reels" | "carousel" | "static_post";

export async function runInstagramAgent(ctx: DayContext): Promise<AgentResult> {
  console.log("📸 Instagram Agent: gerando conteúdo...");

  const todayFormat = WEEKDAY_FORMAT[ctx.weekday] || "reels";
  const calendarStr = ctx.calendarEvents.length > 0
    ? ctx.calendarEvents.map(e => `${e.name}: ${e.stoicConnection}`).join("; ")
    : "Sem data especial";

  const prompt = INSTAGRAM_PROMPT
    .replace("{{BRAND_SYSTEM_PROMPT}}", BRAND_SYSTEM_PROMPT)
    .replace("{{INSTAGRAM_GUIDELINES}}", INSTAGRAM_GUIDELINES)
    .replace("{{DATA_FORMATADA}}", ctx.dateFormatted)
    .replace("{{WEEKDAY}}", ctx.weekday)
    .replace("{{TODAY_FORMAT}}", todayFormat)
    .replace("{{CITACAO}}", ctx.teaching.originalText)
    .replace("{{FILOSOFO}}", ctx.teaching.philosopher)
    .replace("{{OBRA}}", ctx.teaching.work)
    .replace("{{CAPITULO}}", ctx.teaching.bookChapter)
    .replace("{{TEMA}}", ctx.teaching.theme)
    .replace("{{DOMINIO}}", ctx.domain)
    .replace("{{EVENTOS}}", calendarStr)
    .replace("{{TENDENCIAS}}", ctx.trendingTopics || "Nenhuma identificada")
    .replace("{{CAROUSEL_SCHEMA}}", todayFormat === "carousel" ? INSTAGRAM_CAROUSEL_SCHEMA : "null");

  try {
    const raw = await callClaude(prompt, 2500);
    const output = parseClaudeJson<InstagramOutput>(raw);

    const contents: GeneratedContent[] = [];

    // Reels
    contents.push({
      platform: "instagram",
      format: "reels",
      title: output.reels.hook,
      body: output.reels.script,
      hashtags: output.reels.hashtags,
      cta: output.reels.cta,
      visualNotes: output.reels.visualNotes,
      duration: output.reels.duration,
      scheduledTime: "07:00",
      metadata: { type: "reels" },
    });

    // Carousel (se aplicável)
    if (output.carousel) {
      contents.push({
        platform: "instagram",
        format: "carousel",
        title: output.carousel.title,
        body: output.carousel.lastSlideCta,
        slides: output.carousel.slides,
        hashtags: output.carousel.hashtags,
        cta: output.carousel.lastSlideCta,
        scheduledTime: "12:00",
        metadata: { type: "carousel", slideCount: output.carousel.slides.length + 2 },
      });
    }

    // Static post
    contents.push({
      platform: "instagram",
      format: "static_post",
      title: output.staticPost.quoteText,
      body: output.staticPost.caption,
      hashtags: output.staticPost.hashtags,
      scheduledTime: "19:00",
      metadata: { type: "static_post" },
    });

    // Stories
    output.storyIdeas.forEach((idea, i) => {
      contents.push({
        platform: "instagram",
        format: "story",
        title: `Story ${i + 1}`,
        body: idea,
        scheduledTime: `${9 + i * 4}:00`,
        metadata: { type: "story" },
      });
    });

    console.log(`   ✓ ${contents.length} peças geradas para Instagram`);
    return { agent: "instagram", platform: "instagram", contents, generatedAt: new Date().toISOString(), teachingKey: ctx.teaching.id, status: "success" };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Erro desconhecido";
    console.error(`   ✗ Erro no Instagram Agent: ${msg}`);
    return { agent: "instagram", platform: "instagram", contents: [], generatedAt: new Date().toISOString(), teachingKey: ctx.teaching.id, status: "error", error: msg };
  }
}
