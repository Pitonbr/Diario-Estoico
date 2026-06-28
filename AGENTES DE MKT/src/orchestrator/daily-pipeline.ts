import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import dayOfYear from "dayjs/plugin/dayOfYear";
import fs from "fs";
import path from "path";

import { config } from "../config/env";
import { callClaudeWithSearch } from "../config/claude-api";
import { DayContext } from "../config/types";
import { runInstagramAgent } from "../agents/instagram-agent";
import { runTikTokAgent } from "../agents/tiktok-agent";
import { runYouTubeAgent } from "../agents/youtube-agent";
import { runTwitterAgent } from "../agents/twitter-agent";
import { runCafeEstoicoAgent } from "../agents/cafe-estoico-agent";

// Importações do diário estoico original (newsletter)
import stoicLibrary from "../../data/stoic-library.json";
import { getTodayEvents } from "../config/calendar";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(dayOfYear);

// ── Seleção simples de ensinamento (pode ser substituída pela versão com Supabase) ──
function selectTeaching() {
  const pool = stoicLibrary.teachings;
  const selected = pool[Math.floor(Math.random() * pool.length)];
  const domains = ["pessoal", "financeiro", "empreendedor"] as const;
  const domain = domains[Math.floor(Math.random() * domains.length)];
  return { teaching: selected, domain };
}

async function main() {
  const now = dayjs().tz(config.timezone);
  const date = now.toDate();
  const dateStr = now.format("YYYY-MM-DD");
  const weekdayMap: Record<number, string> = {
    0: "domingo", 1: "segunda-feira", 2: "terça-feira", 3: "quarta-feira",
    4: "quinta-feira", 5: "sexta-feira", 6: "sábado",
  };

  console.log("═══════════════════════════════════════════════════");
  console.log("  🏛️  DIÁRIO ESTOICO — Pipeline Multicanal Diário");
  console.log(`  📅  ${dateStr} (${weekdayMap[now.day()]})`);
  console.log("═══════════════════════════════════════════════════\n");

  // ── 1. Montar contexto do dia ──
  console.log("📅 Montando contexto do dia...");
  const { teaching, domain } = selectTeaching();
  const calendarEvents = getTodayEvents(date);

  let trendingTopics = "";
  try {
    trendingTopics = await callClaudeWithSearch(
      `Hoje é ${now.format("DD/MM/YYYY")}. Busque 2-3 temas trending de hoje em negócios, empreendedorismo ou desenvolvimento pessoal no Brasil. Responda em 2-3 frases curtas.`
    );
  } catch { console.warn("   ⚠️  Sem tendências do dia"); }

  const ctx: DayContext = {
    date,
    dayOfYear: now.dayOfYear(),
    dateFormatted: now.format("DD [de] MMMM [de] YYYY"),
    weekday: weekdayMap[now.day()],
    calendarEvents: calendarEvents.map(e => ({ name: e.name, category: e.category, stoicConnection: e.stoicConnection })),
    trendingTopics,
    teaching: { id: teaching.id, philosopher: teaching.philosopher, work: teaching.work, bookChapter: teaching.bookChapter, theme: teaching.theme, originalText: teaching.originalText, practicalDomains: teaching.practicalDomains, tags: teaching.tags },
    domain,
    editionNumber: now.dayOfYear(),
  };

  console.log(`   Filósofo: ${teaching.philosopher} — ${teaching.work}`);
  console.log(`   Tema: ${teaching.theme} | Domínio: ${domain}\n`);

  // ── 2. Rodar todos os agentes ──
  const isLongformDay = [1, 3].includes(now.day()); // seg e qua = long-form YouTube
  const isThreadDay = [2, 4].includes(now.day());    // ter e qui = thread Twitter

  const results = await Promise.allSettled([
    runCafeEstoicoAgent(ctx),
    runInstagramAgent(ctx),
    runTikTokAgent(ctx),
    runYouTubeAgent(ctx, isLongformDay),
    runTwitterAgent(ctx, isThreadDay),
  ]);

  // ── 3. Consolidar e salvar resultados ──
  const outputDir = path.join(process.cwd(), "output", dateStr);
  fs.mkdirSync(outputDir, { recursive: true });

  const agentNames = ["cafe-estoico", "instagram", "tiktok", "youtube", "twitter"];
  let totalContents = 0;
  let errors = 0;

  results.forEach((result, i) => {
    if (result.status === "fulfilled") {
      const agentResult = result.value;
      totalContents += agentResult.contents.length;
      if (agentResult.status === "error") errors++;

      // Salvar output de cada agente
      const filename = `${agentNames[i]}.json`;
      fs.writeFileSync(path.join(outputDir, filename), JSON.stringify(agentResult, null, 2), "utf-8");

      // Salvar roteiros em texto legível
      if (agentResult.contents.length > 0) {
        const readableFile = `${agentNames[i]}-roteiros.txt`;
        const readable = agentResult.contents.map((c, j) => {
          return `═══ ${c.title || `Peça ${j + 1}`} ═══\nFormato: ${c.format} | Horário: ${c.scheduledTime || "—"}\nDuração: ${c.duration || "—"}\n\n${c.body}\n\n${c.visualNotes ? `📹 Notas visuais: ${c.visualNotes}\n` : ""}${c.hashtags ? `#️⃣ Hashtags: ${c.hashtags.join(" ")}\n` : ""}${c.cta ? `🎯 CTA: ${c.cta}\n` : ""}`;
        }).join("\n\n" + "─".repeat(60) + "\n\n");

        fs.writeFileSync(path.join(outputDir, readableFile), readable, "utf-8");
      }
    } else {
      errors++;
      console.error(`   ✗ ${agentNames[i]}: ${result.reason}`);
    }
  });

  // ── 4. Gerar resumo diário ──
  const summary = {
    date: dateStr,
    weekday: weekdayMap[now.day()],
    teaching: { id: teaching.id, philosopher: teaching.philosopher, theme: teaching.theme },
    domain,
    totalContents,
    errors,
    agents: agentNames,
    outputDir,
  };
  fs.writeFileSync(path.join(outputDir, "daily-summary.json"), JSON.stringify(summary, null, 2), "utf-8");

  // ── Resumo no console ──
  console.log("\n═══════════════════════════════════════════════════");
  console.log("  ✅  PIPELINE CONCLUÍDO");
  console.log(`  📦  ${totalContents} peças de conteúdo geradas`);
  console.log(`  ${errors > 0 ? `⚠️  ${errors} erro(s)` : "✓  Sem erros"}`);
  console.log(`  📂  Output: ${outputDir}`);
  console.log("═══════════════════════════════════════════════════");
  console.log("\n  Arquivos gerados:");
  console.log("  • cafe-estoico-roteiros.txt  (roteiro do vídeo matinal)");
  console.log("  • instagram-roteiros.txt     (reels, carrossel, post, stories)");
  console.log("  • tiktok-roteiros.txt        (2 vídeos: emocional + prático)");
  console.log("  • youtube-roteiros.txt       (short + long-form se aplicável)");
  console.log("  • twitter-roteiros.txt       (4 tweets + thread se aplicável)");
  console.log("  • daily-summary.json         (resumo consolidado)\n");
}

main().catch(console.error);
