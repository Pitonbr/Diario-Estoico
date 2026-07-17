/**
 * ═══════════════════════════════════════════════════════════════
 * PROCESSADOR DE MEMÓRIA — Aprendizado Pós-Conversa
 * ═══════════════════════════════════════════════════════════════
 * Roda de forma assíncrona quando uma conversa termina.
 * É a camada de "machine learning adaptativo": extrai padrões,
 * atualiza o perfil, e alimenta a memória de longo prazo.
 */

import Anthropic from "@anthropic-ai/sdk";
import { config } from "../config/env";
import { getSupabase } from "../database/client";

const anthropic = new Anthropic({ apiKey: config.anthropic.apiKey });

interface SessionAnalysis {
  summary: string;
  themes: string[];
  userInsights: string[];
  communicationSignals: {
    tone: string;
    depth: string;
    pace: string;
    formality: string;
    emotional_expression: string;
  };
  lifeContextUpdates: Record<string, unknown>;
}

/**
 * Processa uma conversa finalizada:
 * 1. Gera resumo da sessão
 * 2. Extrai temas e insights que O USUÁRIO verbalizou
 * 3. Detecta sinais de estilo de comunicação
 * 4. Atualiza o perfil persistente
 */
export async function processEndedConversation(conversationId: string): Promise<void> {
  const db = getSupabase();

  // Buscar conversa e mensagens
  const { data: convo } = await db
    .from("conversations")
    .select("id, user_id")
    .eq("id", conversationId)
    .single();

  if (!convo) return;

  const { data: messages } = await db
    .from("messages")
    .select("role, content")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (!messages || messages.length < 4) return; // Conversa muito curta, sem aprendizado

  const transcript = messages
    .map((m) => `${m.role === "user" ? "PESSOA" : "CHAT"}: ${m.content}`)
    .join("\n\n");

  // Análise via Claude
  const response = await anthropic.messages.create({
    model: config.anthropic.model,
    max_tokens: 1000,
    temperature: 0.3,
    messages: [
      {
        role: "user",
        content: `Analise esta conversa de reflexão filosófica e extraia aprendizados sobre a pessoa.

CONVERSA:
${transcript.slice(0, 12000)}

Responda APENAS com JSON:
{
  "summary": "Resumo da sessão em 2-3 frases (o que a pessoa trouxe, como a conversa evoluiu)",
  "themes": ["temas discutidos, máx 4"],
  "userInsights": ["insights que A PRÓPRIA PESSOA verbalizou — frases dela que mostram descoberta ou clareza. Máx 3. Se não houver, array vazio."],
  "communicationSignals": {
    "tone": "direto|reflexivo",
    "depth": "pratico|filosofico",
    "pace": "rapido|explorador",
    "formality": "informal|formal",
    "emotional_expression": "alto|medio|baixo"
  },
  "lifeContextUpdates": {
    "focus_areas": ["áreas de vida mencionadas: carreira, relacionamentos, saúde, dinheiro, propósito, etc"],
    "recurring_themes": ["padrões que se repetem nas falas da pessoa"]
  }
}

REGRAS:
- Seja factual. Extraia apenas o que está explícito ou fortemente implícito na conversa.
- NÃO faça diagnósticos psicológicos. Apenas sinais de estilo de comunicação e contexto de vida.
- userInsights são momentos onde a pessoa mesma chegou a uma conclusão — são ouro para retomar em conversas futuras.`,
      },
    ],
  });

  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") return;

  let analysis: SessionAnalysis;
  try {
    const clean = textBlock.text.replace(/```json\n?|```\n?/g, "").trim();
    analysis = JSON.parse(clean);
  } catch {
    console.error("Erro ao parsear análise de sessão");
    return;
  }

  // ═══ Atualizar conversa com resumo ═══
  await db
    .from("conversations")
    .update({
      ended_at: new Date().toISOString(),
      session_summary: analysis.summary,
      themes_discussed: analysis.themes,
      user_insights: analysis.userInsights,
    })
    .eq("id", conversationId);

  // ═══ Atualizar perfil (merge com dados existentes) ═══
  const { data: profile } = await db
    .from("user_profiles")
    .select("communication_style, life_context")
    .eq("user_id", convo.user_id)
    .single();

  const existingContext = (profile?.life_context || {}) as Record<string, unknown>;
  const existingFocus = (existingContext.focus_areas as string[]) || [];
  const existingThemes = (existingContext.recurring_themes as string[]) || [];

  const newFocus = [...new Set([...existingFocus, ...(analysis.lifeContextUpdates.focus_areas as string[] || [])])].slice(0, 10);
  const newThemes = [...new Set([...existingThemes, ...(analysis.lifeContextUpdates.recurring_themes as string[] || [])])].slice(0, 10);

  await db
    .from("user_profiles")
    .update({
      communication_style: analysis.communicationSignals,
      life_context: {
        ...existingContext,
        focus_areas: newFocus,
        recurring_themes: newThemes,
      },
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", convo.user_id);

  // ═══ Registrar insights individuais ═══
  if (analysis.userInsights.length > 0) {
    await db.from("profile_insights").insert(
      analysis.userInsights.map((insight) => ({
        user_id: convo.user_id,
        conversation_id: conversationId,
        insight_type: "progress",
        insight_content: insight,
        confidence: 0.8,
      }))
    );
  }

  console.log(`✓ Memória processada para conversa ${conversationId}`);
}
