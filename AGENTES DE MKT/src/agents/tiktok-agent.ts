import { callClaude, parseClaudeJson } from "../config/claude-api";
import { BRAND_SYSTEM_PROMPT, TIKTOK_GUIDELINES } from "./prompts/brand-voice";
import { DayContext, GeneratedContent, AgentResult } from "../config/types";

interface TikTokOutput {
  video1: { hook: string; script: string; visualNotes: string; duration: string; hashtags: string[]; soundSuggestion: string };
  video2: { hook: string; script: string; visualNotes: string; duration: string; hashtags: string[]; soundSuggestion: string };
}

export async function runTikTokAgent(ctx: DayContext): Promise<AgentResult> {
  console.log("🎵 TikTok Agent: gerando roteiros...");

  const prompt = `${BRAND_SYSTEM_PROMPT}\n\n${TIKTOK_GUIDELINES}

═══ DADOS DO DIA ═══
Ensinamento: "${ctx.teaching.originalText}" — ${ctx.teaching.philosopher}, ${ctx.teaching.work}
Tema: ${ctx.teaching.theme} | Domínio: ${ctx.domain}
Tendências: ${ctx.trendingTopics || "Nenhuma"}

═══ TAREFA ═══
Gere 2 roteiros de TikTok para Alex gravar. Formato JSON:

{
  "video1": {
    "hook": "Pergunta/frase de impacto para os primeiros 2 segundos",
    "script": "Roteiro completo (30-60s). Marcações: [PAUSA], [ZOOM], [TEXTO NA TELA: xxx]. Tom direto, emocional, estilo Andrea Vermont. O espectador deve sentir que esse vídeo foi feito PRA ELE.",
    "visualNotes": "Formato sugerido: greenscreen/talking head/etc + transições",
    "duration": "30s ou 60s",
    "hashtags": ["#estoicismo", "#filosofia", "..."],
    "soundSuggestion": "Tipo de som/música que combina (épica, calma, etc)"
  },
  "video2": { ... mesmo formato, ângulo diferente do ensinamento ... }
}

Video 1: abordagem EMOCIONAL (conectar com dor/desejo do público)
Video 2: abordagem PRÁTICA (dica acionável em 30 segundos)

RESPONDA APENAS COM O JSON.`;

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
