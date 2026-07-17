/**
 * Seed de Embeddings — gera vetores para busca semântica (RAG)
 * Roda uma vez após popular stoic_teachings, e novamente quando
 * novos ensinamentos forem adicionados.
 */
import OpenAI from "openai";
import { getSupabase } from "./client";
import { config } from "../config/env";

const openai = new OpenAI({ apiKey: config.openai.apiKey });

async function main() {
  console.log("🏛️ Chat Estoico — Gerando embeddings da biblioteca...\n");
  const db = getSupabase();

  const { data: teachings } = await db
    .from("stoic_teachings")
    .select("teaching_key, philosopher, work, theme, original_text, tags");

  if (!teachings || teachings.length === 0) {
    console.error("✗ Nenhum ensinamento encontrado. Rode o seed do Diário Estoico primeiro.");
    return;
  }

  console.log(`Encontrados ${teachings.length} ensinamentos.\n`);
  let done = 0, skipped = 0;

  for (const t of teachings) {
    // Verificar se já existe embedding
    const { data: existing } = await db
      .from("teaching_embeddings")
      .select("id")
      .eq("teaching_key", t.teaching_key)
      .single();

    if (existing) { skipped++; continue; }

    // Texto rico para o embedding: tema + tags + texto original
    const contentText = `${t.theme}. ${(t.tags || []).join(", ")}. ${t.original_text} (${t.philosopher}, ${t.work})`;

    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: contentText,
    });

    const { error } = await db.from("teaching_embeddings").insert({
      teaching_key: t.teaching_key,
      content_text: contentText,
      embedding: response.data[0].embedding,
    });

    if (error) {
      console.error(`  ✗ ${t.teaching_key}: ${error.message}`);
    } else {
      done++;
      if (done % 10 === 0) console.log(`  ${done} embeddings gerados...`);
    }
  }

  console.log(`\n✓ Concluído: ${done} novos, ${skipped} já existiam.`);
}

main().catch(console.error);
