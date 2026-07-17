/**
 * ═══════════════════════════════════════════════════════════════
 * SERVIDOR API — Fastify
 * ═══════════════════════════════════════════════════════════════
 */

import Fastify from "fastify";
import cors from "@fastify/cors";
import rateLimit from "@fastify/rate-limit";
import { z } from "zod";

import { config } from "./config/env";
import { getSupabase } from "./database/client";
import { processMessage } from "./engine/conversation-engine";
import { processEndedConversation } from "./engine/memory-processor";
import { ONBOARDING_QUESTIONS, buildInitialProfile } from "./engine/onboarding";

const app = Fastify({ logger: true });

const FREE_MONTHLY_LIMIT = 50; // mensagens/mês no plano free

async function main() {
  await app.register(cors, { origin: true });
  await app.register(rateLimit, { max: 30, timeWindow: "1 minute" });

  // ═══ Health ═══
  app.get("/health", async () => ({ status: "ok", service: "chat-estoico" }));

  // ═══ Onboarding: perguntas ═══
  app.get("/onboarding/questions", async () => ({
    questions: ONBOARDING_QUESTIONS,
    termsVersion: "1.0.0",
  }));

  // ═══ Onboarding: submeter (cria usuário + perfil) ═══
  const onboardingSchema = z.object({
    email: z.string().email(),
    authId: z.string().uuid().optional(),
    answers: z.record(z.union([z.string(), z.array(z.string())])),
    displayName: z.string().min(1).max(60),
    termsAccepted: z.literal(true),  // LGPD: obrigatório
    privacyAccepted: z.literal(true),
  });

  app.post("/onboarding/submit", async (request, reply) => {
    const parsed = onboardingSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: "Dados inválidos", details: parsed.error.issues });
    }

    const { email, authId, answers, displayName } = parsed.data;
    const db = getSupabase();

    const preferredLanguage = (answers["q1_language"] as string) || "pt-BR";
    const now = new Date().toISOString();

    // Criar/atualizar usuário
    const { data: user, error: userError } = await db
      .from("chat_users")
      .upsert(
        {
          email,
          auth_id: authId,
          display_name: displayName,
          preferred_language: preferredLanguage,
          terms_accepted_at: now,
          terms_version: "1.0.0",
          privacy_accepted_at: now,
          onboarding_completed_at: now,
        },
        { onConflict: "email" }
      )
      .select()
      .single();

    if (userError || !user) {
      return reply.status(500).send({ error: "Erro ao criar usuário" });
    }

    // Criar perfil inicial
    const { communicationStyle, lifeContext } = buildInitialProfile(answers);

    await db.from("user_profiles").upsert(
      {
        user_id: user.id,
        onboarding_answers: answers,
        communication_style: communicationStyle,
        life_context: lifeContext,
      },
      { onConflict: "user_id" }
    );

    return { userId: user.id, profile: { communicationStyle, lifeContext } };
  });

  // ═══ Iniciar conversa ═══
  app.post("/conversations/start", async (request, reply) => {
    const schema = z.object({ userId: z.string().uuid() });
    const parsed = schema.safeParse(request.body);
    if (!parsed.success) return reply.status(400).send({ error: "userId inválido" });

    const db = getSupabase();
    const { data, error } = await db
      .from("conversations")
      .insert({ user_id: parsed.data.userId, mode: "text" })
      .select()
      .single();

    if (error || !data) return reply.status(500).send({ error: "Erro ao criar conversa" });

    // Mensagem de abertura personalizada
    const { data: user } = await db
      .from("chat_users")
      .select("display_name")
      .eq("id", parsed.data.userId)
      .single();

    const greeting = user?.display_name
      ? `Olá, ${user.display_name}. O que está na sua mente hoje?`
      : "Olá. O que está na sua mente hoje?";

    return { conversationId: data.id, greeting };
  });

  // ═══ Enviar mensagem ═══
  const messageSchema = z.object({
    userId: z.string().uuid(),
    conversationId: z.string().uuid(),
    message: z.string().min(1).max(4000),
  });

  app.post("/conversations/message", async (request, reply) => {
    const parsed = messageSchema.safeParse(request.body);
    if (!parsed.success) return reply.status(400).send({ error: "Dados inválidos" });

    const { userId, conversationId, message } = parsed.data;
    const db = getSupabase();

    // ═══ Freemium: verificar limite mensal ═══
    const { data: user } = await db
      .from("chat_users")
      .select("plan, monthly_message_count, monthly_reset_at")
      .eq("id", userId)
      .single();

    if (!user) return reply.status(404).send({ error: "Usuário não encontrado" });

    // Reset mensal
    const resetDate = new Date(user.monthly_reset_at);
    const now = new Date();
    if (now.getTime() - resetDate.getTime() > 30 * 24 * 60 * 60 * 1000) {
      await db
        .from("chat_users")
        .update({ monthly_message_count: 0, monthly_reset_at: now.toISOString() })
        .eq("id", userId);
      user.monthly_message_count = 0;
    }

    if (user.plan === "free" && user.monthly_message_count >= FREE_MONTHLY_LIMIT) {
      return reply.status(429).send({
        error: "limit_reached",
        message: "Você atingiu o limite de mensagens deste mês no plano gratuito.",
      });
    }

    // ═══ Processar ═══
    const result = await processMessage(userId, conversationId, message);

    // Incrementar contador
    await db
      .from("chat_users")
      .update({ monthly_message_count: user.monthly_message_count + 1 })
      .eq("id", userId);

    return {
      reply: result.reply,
      safetyFlag: result.safetyFlag,
      messagesRemaining: user.plan === "free"
        ? FREE_MONTHLY_LIMIT - user.monthly_message_count - 1
        : null,
    };
  });

  // ═══ Encerrar conversa (dispara processamento de memória) ═══
  app.post("/conversations/end", async (request, reply) => {
    const schema = z.object({ conversationId: z.string().uuid() });
    const parsed = schema.safeParse(request.body);
    if (!parsed.success) return reply.status(400).send({ error: "conversationId inválido" });

    // Processar memória de forma assíncrona (não bloqueia resposta)
    processEndedConversation(parsed.data.conversationId).catch((err) =>
      console.error("Erro no processamento de memória:", err)
    );

    return { status: "processing" };
  });

  // ═══ Histórico de conversas ═══
  app.get("/conversations/:userId", async (request, reply) => {
    const { userId } = request.params as { userId: string };
    const db = getSupabase();

    const { data } = await db
      .from("conversations")
      .select("id, started_at, ended_at, session_summary, themes_discussed, message_count")
      .eq("user_id", userId)
      .order("started_at", { ascending: false })
      .limit(20);

    return { conversations: data || [] };
  });

  // ═══ LGPD: exportar dados do usuário ═══
  app.get("/lgpd/export/:userId", async (request) => {
    const { userId } = request.params as { userId: string };
    const db = getSupabase();

    const [user, profile, conversations, insights] = await Promise.all([
      db.from("chat_users").select("*").eq("id", userId).single(),
      db.from("user_profiles").select("*").eq("user_id", userId).single(),
      db.from("conversations").select("*").eq("user_id", userId),
      db.from("profile_insights").select("*").eq("user_id", userId),
    ]);

    return {
      exportedAt: new Date().toISOString(),
      user: user.data,
      profile: profile.data,
      conversations: conversations.data,
      insights: insights.data,
    };
  });

  // ═══ LGPD: deletar dados (direito ao esquecimento) ═══
  app.delete("/lgpd/delete/:userId", async (request) => {
    const { userId } = request.params as { userId: string };
    const db = getSupabase();

    // Cascade delete configurado no schema — deletar usuário limpa tudo
    await db.from("chat_users").delete().eq("id", userId);

    return { status: "deleted", deletedAt: new Date().toISOString() };
  });

  await app.listen({ port: config.port, host: "0.0.0.0" });
  console.log(`🏛️ Chat Estoico API rodando na porta ${config.port}`);
}

main().catch(console.error);
