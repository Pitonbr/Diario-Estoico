import { callClaude, parseClaudeJson } from "../config/claude-api";
import { BRAND_SYSTEM_PROMPT } from "./prompts/brand-voice";
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

  const prompt = `${BRAND_SYSTEM_PROMPT}

═══ CAFÉ ESTOICO — RITUAL MATINAL DIÁRIO ═══
Este é um vídeo de 2-3 minutos que Alex grava toda manhã, como um ritual.
O espectador deve sentir que está tomando café COM Alex e recebendo sabedoria para o dia.
Tom: íntimo, direto, como mentor falando com amigo. NÃO é palestra. É conversa.

═══ DADOS DO DIA ═══
Data: ${ctx.dateFormatted} (${ctx.weekday})
Edição: #${ctx.editionNumber}
Ensinamento: "${ctx.teaching.originalText}" — ${ctx.teaching.philosopher}, ${ctx.teaching.work}, ${ctx.teaching.bookChapter}
Tema: ${ctx.teaching.theme} | Domínio: ${ctx.domain}
Eventos: ${ctx.calendarEvents.map(e => e.name).join(", ") || "Nenhum especial"}

═══ TAREFA ═══
{
  "title": "Título do episódio do Café Estoico (curto, ex: 'O dia que Sêneca perdeu tudo')",
  "greeting": "Abertura (5-10 segundos): saudação + gancho. Ex: 'Bom dia. Hoje eu quero te contar algo que um escravo disse há 2.000 anos e que pode mudar como você vê o problema que está enfrentando agora.'",
  "script": "Roteiro completo de 2-3 minutos. Estrutura: (1) História/contexto do ensinamento (30s), (2) A citação e o que ela realmente significa (30s), (3) Como aplicar isso HOJE no seu trabalho/vida (30s), (4) Reflexão final (15s). Marcações: [PAUSA], [ENFATIZAR], [OLHAR DIRETO PRA CÂMERA], [TOM MAIS BAIXO]. Deve soar como conversa íntima, não como aula.",
  "closingCta": "Encerramento (10s): CTA para newsletter + despedida. Ex: 'Se isso fez sentido, eu envio um aprofundamento disso todo dia por email. Link na bio. Bom dia e bom café.'",
  "visualNotes": "Notas de gravação: cenário (ex: com xícara de café, luz natural), enquadramento, look",
  "duration": "Duração total estimada"
}

RESPONDA APENAS COM O JSON.`;

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
