/**
 * Teste local do motor socrático — simula uma conversa sem precisar do PWA.
 * Uso: npm run test-engine
 */
import { buildSocraticSystemPrompt, ProfileContext, RetrievedTeaching } from "./socratic-prompt";
import Anthropic from "@anthropic-ai/sdk";
import { config } from "../config/env";

const anthropic = new Anthropic({ apiKey: config.anthropic.apiKey });

// Perfil simulado (como viria do onboarding)
const mockProfile: ProfileContext = {
  communicationStyle: {
    tone: "direto",
    depth: "pratico",
    pace: "rapido",
    formality: "informal",
    emotional_expression: "medio",
  },
  lifeContext: { focus_areas: ["carreira", "controle emocional"] },
  recentThemes: [],
  lastSessionSummary: null,
  stoicFamiliarity: "iniciante",
  preferredLanguage: "pt-BR",
  displayName: "Alex",
};

// Ensinamentos simulados (como viriam do RAG)
const mockTeachings: RetrievedTeaching[] = [
  {
    teachingKey: "epi-ench-01",
    philosopher: "Epicteto",
    work: "Enchiridion (Manual)",
    bookChapter: "Capítulo 1",
    originalText:
      "De todas as coisas existentes, algumas estão em nosso poder e outras não. Em nosso poder estão opinião, movimento, desejo, aversão — em resumo, tudo o que é ação nossa.",
    theme: "dicotomia do controle",
  },
  {
    teachingKey: "sen-cart-05",
    philosopher: "Sêneca",
    work: "Cartas a Lucílio",
    bookChapter: "Carta 13",
    originalText:
      "Sofremos mais frequentemente na imaginação do que na realidade. Há mais coisas que nos assustam do que coisas que nos esmagam.",
    theme: "ansiedade antecipada",
  },
];

// Mensagens de teste (simula um usuário real)
const TEST_MESSAGES = [
  "Estou muito ansioso com uma reunião importante amanhã. Pode dar tudo errado e eu perder o contrato.",
  "É que se eu perder esse contrato, vou ter que demitir gente da equipe. A responsabilidade é toda minha.",
  "Verdade... a preparação está feita. Acho que o que me apavora é não controlar a decisão deles.",
];

async function runTest() {
  console.log("═══════════════════════════════════════════");
  console.log("  🏛️  TESTE DO MOTOR SOCRÁTICO");
  console.log("═══════════════════════════════════════════\n");

  const systemPrompt = buildSocraticSystemPrompt(mockProfile, mockTeachings);
  const history: { role: "user" | "assistant"; content: string }[] = [];

  for (const userMsg of TEST_MESSAGES) {
    console.log(`\n👤 USUÁRIO: ${userMsg}\n`);
    history.push({ role: "user", content: userMsg });

    const response = await anthropic.messages.create({
      model: config.anthropic.model,
      max_tokens: 800,
      temperature: 0.8,
      system: systemPrompt,
      messages: history,
    });

    const text = response.content.find((b) => b.type === "text");
    const reply = text && text.type === "text" ? text.text : "(sem resposta)";

    console.log(`🏛️  CHAT ESTOICO:\n${reply}\n`);
    console.log("─".repeat(50));

    history.push({ role: "assistant", content: reply });
  }

  // ═══ Verificação de regras ═══
  console.log("\n═══ VERIFICAÇÃO DE REGRAS ═══");
  const allReplies = history.filter((h) => h.role === "assistant").map((h) => h.content).join("\n");

  const prescriptivePatterns = [/você deve/i, /minha sugestão é/i, /eu recomendo que você/i, /faça isso/i, /o certo é/i];
  const violations = prescriptivePatterns.filter((p) => p.test(allReplies));

  if (violations.length === 0) {
    console.log("✓ Nenhuma prescrição de ação detectada");
  } else {
    console.log(`✗ ATENÇÃO: padrões prescritivos encontrados: ${violations.map(String).join(", ")}`);
  }

  const endsWithQuestion = history
    .filter((h) => h.role === "assistant")
    .every((h) => /[?？]\s*$|\?["']?\s*$/m.test(h.content.trim().slice(-80)));
  console.log(endsWithQuestion ? "✓ Respostas terminam com pergunta/convite" : "⚠️ Nem todas as respostas terminam com pergunta");

  console.log("\n✓ Teste concluído\n");
}

runTest().catch(console.error);
