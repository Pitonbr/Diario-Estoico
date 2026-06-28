import { callClaude, parseClaudeJson } from "../config/claude-api";
import { BRAND_SYSTEM_PROMPT, YOUTUBE_GUIDELINES } from "./prompts/brand-voice";
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

  const prompt = `${BRAND_SYSTEM_PROMPT}\n\n${YOUTUBE_GUIDELINES}

═══ DADOS DO DIA ═══
Ensinamento: "${ctx.teaching.originalText}" — ${ctx.teaching.philosopher}, ${ctx.teaching.work}, ${ctx.teaching.bookChapter}
Tema: ${ctx.teaching.theme} | Domínio: ${ctx.domain}
Gerar long-form hoje: ${isLongformDay ? "SIM (1 vídeo de 8-12 min)" : "NÃO (apenas Short)"}

═══ TAREFA ═══
{
  "short": {
    "title": "Título SEO para YouTube Short (máx 60 chars, curiosidade + keyword)",
    "script": "Roteiro de 30-60 segundos. Hook forte, 1 insight, CTA. Marcações [CORTE], [TEXTO NA TELA].",
    "thumbnailText": "Texto para thumbnail (3-5 palavras de impacto)",
    "hashtags": ["#shorts", "#estoicismo", "..."]
  },
  "longform": ${isLongformDay ? `{
    "title": "Título SEO completo (curiosidade + keyword, ex: 'O que MARCO AURÉLIO ensinou sobre LIDERAR sob pressão')",
    "description": "Descrição do vídeo (primeiras 2 linhas = gancho, depois link newsletter, depois resumo)",
    "thumbnailText": "Texto da thumbnail (máx 5 palavras)",
    "outline": [
      {"timestamp": "0:00", "section": "Introdução/Hook", "content": "Roteiro detalhado desta seção (2-3 parágrafos)"},
      {"timestamp": "2:00", "section": "Ponto 1: [nome]", "content": "Roteiro detalhado"},
      {"timestamp": "5:00", "section": "Ponto 2: [nome]", "content": "Roteiro detalhado"},
      {"timestamp": "8:00", "section": "Ponto 3: [nome]", "content": "Roteiro detalhado"},
      {"timestamp": "10:00", "section": "Aplicação prática", "content": "Roteiro com exemplo real"},
      {"timestamp": "11:00", "section": "Conclusão + CTA", "content": "Resumo + convite newsletter"}
    ],
    "tags": ["estoicismo", "filosofia", "marco aurelio", "..."]
  }` : "null"}
}

RESPONDA APENAS COM O JSON.`;

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
