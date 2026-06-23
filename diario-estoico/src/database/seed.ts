import { getSupabase } from "./client";
import stoicLibrary from "../../data/stoic-library.json";

async function seed() {
  console.log("🏛️  Diário Estoico — Seed: populando base de ensinamentos...\n");

  const db = getSupabase();
  let inserted = 0;
  let skipped = 0;

  for (const teaching of stoicLibrary.teachings) {
    const { error } = await db.from("stoic_teachings").upsert(
      {
        teaching_key: teaching.id,
        philosopher: teaching.philosopher,
        work: teaching.work,
        book_chapter: teaching.bookChapter,
        theme: teaching.theme,
        original_text: teaching.originalText,
        practical_domains: teaching.practicalDomains,
        tags: teaching.tags,
        times_used: 0,
      },
      { onConflict: "teaching_key" }
    );

    if (error) {
      console.error(`  ✗ Erro em ${teaching.id}: ${error.message}`);
      skipped++;
    } else {
      inserted++;
    }
  }

  console.log(`\n✓ Seed concluído: ${inserted} inseridos, ${skipped} com erro`);
  console.log(`  Total na biblioteca: ${stoicLibrary.teachings.length}`);
}

seed().catch(console.error);
