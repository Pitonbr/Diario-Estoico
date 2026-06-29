import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import dayOfYear from "dayjs/plugin/dayOfYear";
import fs from "fs";
import path from "path";

import { config } from "../config/env";
import { callClaudeWithSearch } from "../config/claude-api";
import { DayContext, AgentResult } from "../config/types";
import { getTodayEvents } from "../config/calendar";
import stoicLibrary from "../../data/stoic-library.json";

import { runCafeEstoicoAgent } from "../agents/cafe-estoico-agent";
import { runInstagramAgent } from "../agents/instagram-agent";
import { runTikTokAgent } from "../agents/tiktok-agent";
import { runYouTubeAgent } from "../agents/youtube-agent";
import { runTwitterAgent } from "../agents/twitter-agent";
import { runNewsletterAgent } from "../agents/newsletter-agent";
import { runResponseManager } from "../agents/response-manager";
import { runAnalyticsAgent } from "../agents/analytics-agent";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(dayOfYear);

const WEEKDAYS: Record<number, string> = {
  0: "domingo", 1: "segunda-feira", 2: "terça-feira", 3: "quarta-feira",
  4: "quinta-feira", 5: "sexta-feira", 6: "sábado",
};

async function buildContext(): Promise<DayContext> {
  const now = dayjs().tz(config.timezone);
  const date = now.toDate();
  const pool = stoicLibrary.teachings;
  const teaching = pool[Math.floor(Math.random() * pool.length)];
  const domains = ["pessoal", "financeiro", "empreendedor"] as const;
  const domain = domains[Math.floor(Math.random() * domains.length)];
  const calendarEvents = getTodayEvents(date);

  let trendingTopics = "";
  try {
    trendingTopics = await callClaudeWithSearch(
      `Hoje é ${now.format("DD/MM/YYYY")}. Cite 2-3 temas trending de negócios ou desenvolvimento pessoal no Brasil. Responda em 2-3 frases.`
    );
  } catch { /* ok */ }

  return {
    date,
    dayOfYear: now.dayOfYear(),
    dateFormatted: now.format("DD [de] MMMM [de] YYYY"),
    weekday: WEEKDAYS[now.day()],
    calendarEvents: calendarEvents.map(e => ({ name: e.name, category: e.category, stoicConnection: e.stoicConnection })),
    trendingTopics,
    teaching: {
      id: teaching.id, philosopher: teaching.philosopher, work: teaching.work,
      bookChapter: teaching.bookChapter, theme: teaching.theme,
      originalText: teaching.originalText, practicalDomains: teaching.practicalDomains,
      tags: teaching.tags,
    },
    domain,
    editionNumber: now.dayOfYear(),
  };
}

function saveResult(agentName: string, result: AgentResult) {
  const dateStr = dayjs().tz(config.timezone).format("YYYY-MM-DD");
  const outputDir = path.join(process.cwd(), "output", dateStr);
  fs.mkdirSync(outputDir, { recursive: true });

  // JSON estruturado
  fs.writeFileSync(path.join(outputDir, `${agentName}.json`), JSON.stringify(result, null, 2), "utf-8");

  // Texto legível para gravação/postagem
  if (result.contents.length > 0) {
    const readable = result.contents.map((c, i) => {
      const lines = [`═══ ${c.title || `Peça ${i + 1}`} ═══`];
      if (c.format) lines.push(`Formato: ${c.format}`);
      if (c.scheduledTime) lines.push(`Horário sugerido: ${c.scheduledTime}`);
      if (c.duration) lines.push(`Duração: ${c.duration}`);
      lines.push("", c.body);
      if (c.visualNotes) lines.push("", `📹 Notas visuais: ${c.visualNotes}`);
      if (c.audioNotes) lines.push(`🎵 Áudio: ${c.audioNotes}`);
      if (c.hashtags?.length) lines.push(`#️⃣  ${c.hashtags.join(" ")}`);
      if (c.cta) lines.push(`🎯 CTA: ${c.cta}`);
      if (c.slides?.length) {
        lines.push("", "📑 Slides:");
        c.slides.forEach((s, j) => lines.push(`  [${j + 1}] ${s}`));
      }
      return lines.join("\n");
    }).join("\n\n" + "─".repeat(60) + "\n\n");

    fs.writeFileSync(path.join(outputDir, `${agentName}-roteiros.txt`), readable, "utf-8");
  }

  console.log(`\n📂 Output salvo em: output/${dateStr}/${agentName}*`);
}

async function main() {
  const agentName = process.argv[2];
  if (!agentName) {
    console.log(`
🏛️  Diário Estoico — Executar Agente Individual

Uso: npx tsx src/orchestrator/run-single.ts <agente>

Agentes disponíveis:
  cafe          ☕ Café Estoico (roteiro vídeo matinal)
  instagram     📸 Instagram (reels, carrossel, post, stories)
  tiktok        🎵 TikTok (2 vídeos)
  youtube       ▶️  YouTube (short + long-form)
  twitter       🐦 Twitter/X (tweets + thread)
  newsletter    📧 Newsletter (email + envio)
  responses     💬 Response Manager (templates de resposta)
  analytics     📊 Analytics (relatório semanal)
`);
    return;
  }

  const now = dayjs().tz(config.timezone);
  console.log(`\n🏛️  Diário Estoico — Agente: ${agentName.toUpperCase()}`);
  console.log(`📅 ${now.format("DD/MM/YYYY")} (${WEEKDAYS[now.day()]})\n`);

  let result: AgentResult;

  // Agentes que não precisam de contexto do dia
  if (agentName === "responses") {
    result = await runResponseManager();
    saveResult("response-manager", result);
    return;
  }
  if (agentName === "analytics") {
    result = await runAnalyticsAgent();
    saveResult("analytics", result);
    return;
  }

  // Montar contexto
  console.log("📅 Montando contexto do dia...");
  const ctx = await buildContext();
  console.log(`   ${ctx.teaching.philosopher} — ${ctx.teaching.work}`);
  console.log(`   Tema: ${ctx.teaching.theme} | Domínio: ${ctx.domain}\n`);

  const isLongformDay = [1, 3].includes(now.day());
  const isThreadDay = [2, 4].includes(now.day());

  switch (agentName) {
    case "cafe":
      result = await runCafeEstoicoAgent(ctx);
      saveResult("cafe-estoico", result);
      break;
    case "instagram":
      result = await runInstagramAgent(ctx);
      saveResult("instagram", result);
      break;
    case "tiktok":
      result = await runTikTokAgent(ctx);
      saveResult("tiktok", result);
      break;
    case "youtube":
      result = await runYouTubeAgent(ctx, isLongformDay);
      saveResult("youtube", result);
      break;
    case "twitter":
      result = await runTwitterAgent(ctx, isThreadDay);
      saveResult("twitter", result);
      break;
    case "newsletter":
      result = await runNewsletterAgent(ctx, true);
      saveResult("newsletter", result);
      break;
    default:
      console.error(`❌ Agente desconhecido: ${agentName}`);
      console.log("   Use: cafe | instagram | tiktok | youtube | twitter | newsletter | responses | analytics");
  }
}

main().catch(console.error);
