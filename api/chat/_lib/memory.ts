import Anthropic from "@anthropic-ai/sdk";
import { getDb } from "./db";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

// Progressão de familiaridade: iniciante → intermediario → avancado
const FAMILIARITY_THRESHOLDS = [
  { min: 25, level: "avancado" },
  { min: 10, level: "intermediario" },
  { min: 3, level: "explorando" },
];

export async function processEndedConversation(conversationId: string): Promise<void> {
  const db = getDb();

  const { data: convo } = await db.from("conversations").select("id, user_id")
    .eq("id", conversationId).single();
  if (!convo) return;

  const { data: messages } = await db.from("messages").select("role, content")
    .eq("conversation_id", conversationId).order("created_at", { ascending: true });
  if (!messages || messages.length < 4) return;

  const transcript = messages
    .map(m => `${m.role === "user" ? "PESSOA" : "CHAT"}: ${m.content}`)
    .join("\n\n");

  // Conta total de conversas para determinar familiaridade
  const { count: totalConvos } = await db.from("conversations")
    .select("id", { count: "exact", head: true })
    .eq("user_id", convo.user_id);

  const response = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 900,
    temperature: 0.3,
    messages: [{
      role: "user",
      content: `Analise esta conversa e extraia aprendizados sobre a pessoa.

CONVERSA:
${transcript.slice(0, 12000)}

Responda APENAS JSON:
{
  "summary": "Resumo em 2-3 frases do que foi discutido e como a pessoa se encontra",
  "themes": ["temas centrais, máx 4"],
  "userInsights": ["frases que A PRÓPRIA PESSOA verbalizou como descoberta ou reflexão — máx 3, citação próxima da fala real"],
  "communicationSignals": {
    "tone": "direto|reflexivo|vulneravel|resistente",
    "depth": "pratico|filosofico|emocional",
    "pace": "rapido|explorador|contemplativo",
    "formality": "informal|semiformal|formal",
    "emotional_expression": "alto|medio|baixo"
  },
  "lifeContextUpdates": {
    "focus_areas": ["máx 3 — áreas da vida mencionadas: trabalho, relacionamentos, saúde, propósito, etc"],
    "recurring_themes": ["máx 3 — padrões que voltaram nesta conversa"]
  },
  "philosophicalProgress": "primeira_conversa|aprofundando|consolidando|avancado"
}`,
    }],
  });

  const textBlock = response.content.find(b => b.type === "text");
  if (!textBlock || textBlock.type !== "text") return;

  let analysis: {
    summary: string;
    themes: string[];
    userInsights: string[];
    communicationSignals: Record<string, string>;
    lifeContextUpdates: { focus_areas: string[]; recurring_themes: string[] };
    philosophicalProgress: string;
  };
  try {
    analysis = JSON.parse(textBlock.text.replace(/```json\n?|```\n?/g, "").trim());
  } catch { return; }

  // Atualiza a conversa encerrada
  await db.from("conversations").update({
    ended_at: new Date().toISOString(),
    session_summary: analysis.summary,
    themes_discussed: analysis.themes,
    user_insights: analysis.userInsights,
  }).eq("id", conversationId);

  // Carrega o perfil atual
  const { data: profile } = await db.from("user_profiles")
    .select("communication_style, life_context").eq("user_id", convo.user_id).single();

  const existingContext = (profile?.life_context || {}) as Record<string, unknown>;

  // Merge acumulativo de áreas de vida e temas recorrentes (mantém os 10 mais recentes)
  const newFocus = [...new Set([
    ...((existingContext.focus_areas as string[]) || []),
    ...(analysis.lifeContextUpdates.focus_areas || [])
  ])].slice(-10);

  const newThemes = [...new Set([
    ...((existingContext.recurring_themes as string[]) || []),
    ...(analysis.lifeContextUpdates.recurring_themes || [])
  ])].slice(-10);

  // Calcula novo nível de familiaridade estoica baseado em contagem de conversas
  const completedCount = (totalConvos || 0);
  const newFamiliarity = FAMILIARITY_THRESHOLDS.find(t => completedCount >= t.min)?.level
    || (existingContext.stoic_familiarity as string)
    || "iniciante";

  await db.from("user_profiles").update({
    communication_style: analysis.communicationSignals,
    life_context: {
      ...existingContext,
      focus_areas: newFocus,
      recurring_themes: newThemes,
      stoic_familiarity: newFamiliarity,
      total_conversations: completedCount,
    },
    updated_at: new Date().toISOString(),
  }).eq("user_id", convo.user_id);

  // Salva insights que a pessoa verbalizou (apenas os novos, evita duplicatas por conteúdo similar)
  if (analysis.userInsights.length > 0) {
    const { data: existingInsights } = await db.from("profile_insights")
      .select("insight_content").eq("user_id", convo.user_id).limit(20);

    const existingTexts = (existingInsights || []).map(i => i.insight_content.toLowerCase());

    const newInsights = analysis.userInsights.filter(insight => {
      const lower = insight.toLowerCase();
      return !existingTexts.some(ex => similarity(ex, lower) > 0.7);
    });

    if (newInsights.length > 0) {
      await db.from("profile_insights").insert(
        newInsights.map(insight => ({
          user_id: convo.user_id,
          conversation_id: conversationId,
          insight_type: "progress",
          insight_content: insight,
          confidence: 0.85,
        }))
      );
    }
  }
}

// Similaridade simples por palavras compartilhadas (evita salvar insights redundantes)
function similarity(a: string, b: string): number {
  const wordsA = new Set(a.split(/\s+/).filter(w => w.length > 3));
  const wordsB = new Set(b.split(/\s+/).filter(w => w.length > 3));
  if (wordsA.size === 0 || wordsB.size === 0) return 0;
  let shared = 0;
  wordsA.forEach(w => { if (wordsB.has(w)) shared++; });
  return shared / Math.max(wordsA.size, wordsB.size);
}
