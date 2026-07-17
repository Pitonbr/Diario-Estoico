/**
 * ═══════════════════════════════════════════════════════════════
 * MOTOR DE CONVERSAÇÃO — Pipeline Principal
 * ═══════════════════════════════════════════════════════════════
 * Fluxo por mensagem:
 * 1. Segurança (triagem rápida + contextual)
 * 2. Recuperação de perfil (memória)
 * 3. RAG (ensinamentos relevantes)
 * 4. Geração socrática (Claude)
 * 5. Persistência (mensagem + metadados)
 */

import Anthropic from "@anthropic-ai/sdk";
import { config } from "../config/env";
import { getSupabase } from "../database/client";
import { buildSocraticSystemPrompt, ProfileContext } from "./socratic-prompt";
import { retrieveTeachings } from "./rag";
import {
  quickSafetyScreen,
  contextualSafetyCheck,
  buildCrisisResponse,
} from "../safety/crisis-detection";

const anthropic = new Anthropic({ apiKey: config.anthropic.apiKey });

export interface ChatResponse {
  reply: string;
  teachingsUsed: string[];
  safetyFlag: string | null;
}

export async function processMessage(
  userId: string,
  conversationId: string,
  userMessage: string
): Promise<ChatResponse> {
  const db = getSupabase();

  // ═══ 1. SEGURANÇA ═══
  let safetyFlag: string | null = null;

  const quickFlag = quickSafetyScreen(userMessage);
  if (quickFlag) {
    // Buscar contexto recente para análise contextual
    const { data: recentMsgs } = await db
      .from("messages")
      .select("role, content")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: false })
      .limit(6);

    const context = (recentMsgs || []).reverse();
    context.push({ role: "user", content: userMessage });

    const safetyResult = await contextualSafetyCheck(context);

    if (safetyResult.isCrisis && safetyResult.confidence > 0.6) {
      // Buscar idioma do usuário
      const { data: user } = await db
        .from("chat_users")
        .select("preferred_language")
        .eq("id", userId)
        .single();

      const crisisReply = buildCrisisResponse(
        safetyResult.category,
        user?.preferred_language || "pt-BR"
      );

      // Log de auditoria
      await db.from("safety_events").insert({
        user_id: userId,
        conversation_id: conversationId,
        event_type: "crisis_detected",
        action_taken: `category=${safetyResult.category}, resources_provided`,
      });

      // Persistir mensagens
      await persistMessages(conversationId, userMessage, crisisReply, [], "crisis_detected");

      return { reply: crisisReply, teachingsUsed: [], safetyFlag: "crisis_detected" };
    }
  }

  // ═══ 2. PERFIL (memória) ═══
  const profile = await loadProfile(userId);

  // ═══ 3. RAG ═══
  const { data: recentForRag } = await db
    .from("messages")
    .select("content")
    .eq("conversation_id", conversationId)
    .eq("role", "user")
    .order("created_at", { ascending: false })
    .limit(2);

  const recentContext = (recentForRag || []).map((m) => m.content);
  const teachings = await retrieveTeachings(userMessage, recentContext);

  // ═══ 4. GERAÇÃO SOCRÁTICA ═══
  const systemPrompt = buildSocraticSystemPrompt(profile, teachings);

  // Histórico da conversa (últimas 12 mensagens)
  const { data: history } = await db
    .from("messages")
    .select("role, content")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true })
    .limit(12);

  const messages = [
    ...(history || []).map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
    { role: "user" as const, content: userMessage },
  ];

  const response = await anthropic.messages.create({
    model: config.anthropic.model,
    max_tokens: 800,
    temperature: 0.8,
    system: systemPrompt,
    messages,
  });

  const textBlock = response.content.find((b) => b.type === "text");
  const reply = textBlock && textBlock.type === "text"
    ? textBlock.text
    : "Desculpe, tive um problema para processar. Pode repetir?";

  // ═══ 5. PERSISTÊNCIA ═══
  const teachingKeys = teachings.map((t) => t.teachingKey);
  await persistMessages(conversationId, userMessage, reply, teachingKeys, safetyFlag);

  // Atualizar afinidade filosófica (contadores de temas/filósofos)
  if (teachings.length > 0) {
    updateAffinity(userId, teachings).catch(() => {});
  }

  return { reply, teachingsUsed: teachingKeys, safetyFlag };
}

// ─── Helpers ───

async function loadProfile(userId: string): Promise<ProfileContext> {
  const db = getSupabase();

  const { data: user } = await db
    .from("chat_users")
    .select("display_name, preferred_language")
    .eq("id", userId)
    .single();

  const { data: profile } = await db
    .from("user_profiles")
    .select("communication_style, life_context")
    .eq("user_id", userId)
    .single();

  // Última conversa finalizada com resumo
  const { data: lastConvo } = await db
    .from("conversations")
    .select("session_summary, themes_discussed")
    .eq("user_id", userId)
    .not("session_summary", "is", null)
    .order("ended_at", { ascending: false })
    .limit(1)
    .single();

  const lifeContext = (profile?.life_context || {}) as Record<string, unknown>;

  return {
    communicationStyle: (profile?.communication_style || {}) as Record<string, string>,
    lifeContext,
    recentThemes: (lastConvo?.themes_discussed || []) as string[],
    lastSessionSummary: lastConvo?.session_summary || null,
    stoicFamiliarity: (lifeContext.stoic_familiarity as string) || "iniciante",
    preferredLanguage: user?.preferred_language || "pt-BR",
    displayName: user?.display_name || null,
  };
}

async function persistMessages(
  conversationId: string,
  userMessage: string,
  assistantReply: string,
  teachingsUsed: string[],
  safetyFlag: string | null
) {
  const db = getSupabase();
  await db.from("messages").insert([
    { conversation_id: conversationId, role: "user", content: userMessage },
    {
      conversation_id: conversationId,
      role: "assistant",
      content: assistantReply,
      teachings_used: teachingsUsed,
      safety_flag: safetyFlag,
    },
  ]);

  // Incrementar contador
  await db.rpc("increment_message_count", { convo_id: conversationId }).then(
    () => {},
    () => {} // Se a função não existir ainda, ignora
  );
}

async function updateAffinity(userId: string, teachings: { philosopher: string; theme: string }[]) {
  const db = getSupabase();
  const { data: profile } = await db
    .from("user_profiles")
    .select("philosophical_affinity")
    .eq("user_id", userId)
    .single();

  const affinity = (profile?.philosophical_affinity || { philosophers: {}, themes: {} }) as {
    philosophers: Record<string, number>;
    themes: Record<string, number>;
  };

  for (const t of teachings) {
    const phKey = t.philosopher.toLowerCase().replace(/\s/g, "_");
    affinity.philosophers[phKey] = (affinity.philosophers[phKey] || 0) + 1;
    affinity.themes[t.theme] = (affinity.themes[t.theme] || 0) + 1;
  }

  await db
    .from("user_profiles")
    .update({ philosophical_affinity: affinity, updated_at: new Date().toISOString() })
    .eq("user_id", userId);
}
