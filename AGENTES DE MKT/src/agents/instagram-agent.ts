import { callClaude, parseClaudeJson } from "../config/claude-api";
import { BRAND_SYSTEM_PROMPT, INSTAGRAM_GUIDELINES } from "./prompts/brand-voice";
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

  const prompt = `${BRAND_SYSTEM_PROMPT}

${INSTAGRAM_GUIDELINES}

═══ DADOS DO DIA ═══
Data: ${ctx.dateFormatted} (${ctx.weekday})
Formato principal de hoje: ${todayFormat}
Ensinamento: "${ctx.teaching.originalText}" — ${ctx.teaching.philosopher}, ${ctx.teaching.work}, ${ctx.teaching.bookChapter}
Tema: ${ctx.teaching.theme}
Domínio prático: ${ctx.domain}
Eventos do dia: ${calendarStr}
Tendências: ${ctx.trendingTopics || "Nenhuma identificada"}

═══ TAREFA ═══
Gere conteúdo para Instagram no formato JSON abaixo:

{
  "reels": {
    "hook": "Frase de abertura impactante (primeiros 3 segundos do vídeo)",
    "script": "Roteiro completo do Reels para Alex gravar (30-60 segundos). Inclua marcações [PAUSA], [ENFATIZAR], [OLHAR CÂMERA]. Tom Andrea Vermont.",
    "visualNotes": "Notas de produção: cenário, ângulo, transições sugeridas",
    "duration": "Duração estimada",
    "cta": "Call to action final",
    "hashtags": ["lista", "de", "hashtags"]
  },
  "carousel": ${todayFormat === "carousel" ? `{
    "title": "Título do carrossel (slide 1)",
    "slides": ["Texto slide 2", "Texto slide 3", "Texto slide 4", "Texto slide 5", "Texto slide 6 (resumo)"],
    "lastSlideCta": "Texto do último slide com CTA para newsletter",
    "hashtags": ["lista", "de", "hashtags"]
  }` : "null"},
  "staticPost": {
    "quoteText": "A citação exata para o post visual",
    "caption": "Legenda do post (3-5 linhas, tom conversacional, termina com pergunta)",
    "hashtags": ["lista", "de", "hashtags"]
  },
  "storyIdeas": [
    "Ideia de Story 1 (enquete, caixinha ou preview)",
    "Ideia de Story 2",
    "Ideia de Story 3"
  ]
}

RESPONDA APENAS COM O JSON.`;

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
