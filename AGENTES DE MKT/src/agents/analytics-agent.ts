import fs from "fs";
import path from "path";
import dayjs from "dayjs";
import { callClaude, parseClaudeJson } from "../config/claude-api";
import { BRAND_SYSTEM_PROMPT } from "./prompts/brand-voice";
import { AgentResult, GeneratedContent } from "../config/types";

interface WeeklyReport {
  summary: string;
  topPerformers: string[];
  suggestions: string[];
  nextWeekThemes: string[];
  contentGaps: string[];
}

/**
 * Agente de Analytics — gera relatório semanal com sugestões de melhoria.
 * Analisa os outputs da semana e sugere otimizações.
 */
export async function runAnalyticsAgent(): Promise<AgentResult> {
  console.log("📊 Analytics Agent: gerando relatório semanal...");

  // Coletar outputs dos últimos 7 dias
  const outputBase = path.join(process.cwd(), "output");
  const today = dayjs();
  const weekSummaries: string[] = [];

  for (let i = 0; i < 7; i++) {
    const dateStr = today.subtract(i, "day").format("YYYY-MM-DD");
    const summaryPath = path.join(outputBase, dateStr, "daily-summary.json");

    if (fs.existsSync(summaryPath)) {
      try {
        const data = JSON.parse(fs.readFileSync(summaryPath, "utf-8"));
        weekSummaries.push(`${dateStr}: ${data.totalContents} peças, ${data.errors} erros, filósofo: ${data.teaching?.philosopher || "?"}, tema: ${data.teaching?.theme || "?"}`);
      } catch { /* skip */ }
    }
  }

  const weekData = weekSummaries.length > 0
    ? weekSummaries.join("\n")
    : "Sem dados de outputs anteriores disponíveis.";

  const prompt = `${BRAND_SYSTEM_PROMPT}

═══ RELATÓRIO SEMANAL — DIÁRIO ESTOICO ═══
Analise a produção da semana e gere recomendações.

Dados da semana:
${weekData}

Gere um relatório em JSON:
{
  "summary": "Resumo da semana em 3-4 frases (produção, consistência, observações)",
  "topPerformers": [
    "3 tipos de conteúdo que provavelmente performaram melhor (baseado nos temas e formatos)"
  ],
  "suggestions": [
    "5 sugestões concretas de melhoria para a próxima semana (formatos, horários, temas, parcerias)"
  ],
  "nextWeekThemes": [
    "3 temas sugeridos para a próxima semana (com justificativa de por que são relevantes agora)"
  ],
  "contentGaps": [
    "2-3 lacunas de conteúdo identificadas (temas estoicos importantes que não foram cobertos)"
  ]
}

RESPONDA APENAS COM O JSON.`;

  try {
    const raw = await callClaude(prompt, 1500);
    const output = parseClaudeJson<WeeklyReport>(raw);

    const reportText = [
      "═══ RELATÓRIO SEMANAL — DIÁRIO ESTOICO ═══",
      `Período: ${today.subtract(6, "day").format("DD/MM")} a ${today.format("DD/MM/YYYY")}`,
      "",
      "📋 RESUMO", output.summary, "",
      "🏆 DESTAQUES DA SEMANA", ...output.topPerformers.map((t, i) => `${i + 1}. ${t}`), "",
      "💡 SUGESTÕES PARA PRÓXIMA SEMANA", ...output.suggestions.map((s, i) => `${i + 1}. ${s}`), "",
      "🎯 TEMAS SUGERIDOS", ...output.nextWeekThemes.map((t, i) => `${i + 1}. ${t}`), "",
      "🔍 LACUNAS IDENTIFICADAS", ...output.contentGaps.map((g, i) => `${i + 1}. ${g}`),
    ].join("\n");

    const contents: GeneratedContent[] = [{
      platform: "newsletter",
      format: "email",
      title: `Relatório Semanal — ${today.format("DD/MM/YYYY")}`,
      body: reportText,
      metadata: { type: "weekly_report", ...output },
    }];

    // Salvar relatório
    const reportDir = path.join(outputBase, "reports");
    fs.mkdirSync(reportDir, { recursive: true });
    fs.writeFileSync(
      path.join(reportDir, `weekly-${today.format("YYYY-MM-DD")}.txt`),
      reportText, "utf-8"
    );

    console.log("   ✓ Relatório semanal gerado");
    return { agent: "analytics", platform: "newsletter", contents, generatedAt: new Date().toISOString(), teachingKey: "n/a", status: "success" };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Erro desconhecido";
    return { agent: "analytics", platform: "newsletter", contents: [], generatedAt: new Date().toISOString(), teachingKey: "n/a", status: "error", error: msg };
  }
}
