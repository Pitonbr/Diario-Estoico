/**
 * ═══════════════════════════════════════════════════════════════
 * RAG — Busca Semântica na Biblioteca Estoica
 * ═══════════════════════════════════════════════════════════════
 * Converte a mensagem do usuário em embedding e recupera os
 * ensinamentos mais relevantes. Única fonte de citações do motor.
 */

import OpenAI from "openai";
import { getSupabase } from "../database/client";
import { config } from "../config/env";
import { RetrievedTeaching } from "../engine/socratic-prompt";

const openai = new OpenAI({ apiKey: config.openai.apiKey });

export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text.slice(0, 8000),
  });
  return response.data[0].embedding;
}

/**
 * Recupera os N ensinamentos mais relevantes para a mensagem do usuário.
 * Combina a mensagem atual com o contexto recente para melhor matching.
 */
export async function retrieveTeachings(
  userMessage: string,
  recentContext: string[] = [],
  matchCount = 3
): Promise<RetrievedTeaching[]> {
  // Query combinada: mensagem atual (peso maior) + contexto recente
  const queryText = [userMessage, ...recentContext.slice(-2)].join("\n");

  const embedding = await generateEmbedding(queryText);

  const db = getSupabase();
  const { data, error } = await db.rpc("match_teachings", {
    query_embedding: embedding,
    match_count: matchCount,
  });

  if (error || !data) {
    console.error("Erro no RAG:", error?.message);
    return [];
  }

  // Filtro de relevância mínima (evita citações forçadas)
  const relevant = data.filter((d: { similarity: number }) => d.similarity > 0.35);

  // Buscar dados completos dos ensinamentos
  if (relevant.length === 0) return [];

  const keys = relevant.map((r: { teaching_key: string }) => r.teaching_key);
  const { data: teachings } = await db
    .from("stoic_teachings")
    .select("teaching_key, philosopher, work, book_chapter, original_text, theme")
    .in("teaching_key", keys);

  if (!teachings) return [];

  return teachings.map((t) => ({
    teachingKey: t.teaching_key,
    philosopher: t.philosopher,
    work: t.work,
    bookChapter: t.book_chapter,
    originalText: t.original_text,
    theme: t.theme,
  }));
}
