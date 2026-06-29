import { callClaude, parseClaudeJson } from "../config/claude-api";
import { BRAND_SYSTEM_PROMPT } from "./prompts/brand-voice";
import { AgentResult, GeneratedContent } from "../config/types";

interface ResponseTemplates {
  welcomeNew: string[];
  thankYou: string[];
  questionAnswers: { trigger: string; response: string }[];
  objectionHandlers: { objection: string; response: string }[];
  engagementBoosters: string[];
}

/**
 * Agente de Respostas — gera templates de resposta para interações nas redes sociais.
 * Roda semanalmente. Gera um banco de respostas prontas que Alex pode usar/adaptar.
 */
export async function runResponseManager(): Promise<AgentResult> {
  console.log("💬 Response Manager: gerando templates de resposta...");

  const prompt = `${BRAND_SYSTEM_PROMPT}

═══ AGENTE DE RESPOSTAS ═══
Gere templates de resposta para interações do Diário Estoico nas redes sociais.
Alex usa esses templates para responder comentários e DMs de forma rápida e consistente.

{
  "welcomeNew": [
    "Resposta para novos seguidores (5 variações, calorosas, convidando para newsletter)"
  ],
  "thankYou": [
    "Respostas para elogios e agradecimentos (5 variações, genuínas, sem ser genéricas)"
  ],
  "questionAnswers": [
    {"trigger": "O que é estoicismo?", "response": "Resposta curta e envolvente (2-3 frases)"},
    {"trigger": "Por onde começo a estudar?", "response": "Recomendação prática"},
    {"trigger": "Estoicismo é ser frio/insensível?", "response": "Desmistificação empática"},
    {"trigger": "Qual livro devo ler primeiro?", "response": "Recomendação com justificativa"},
    {"trigger": "Como aplico isso no trabalho?", "response": "Exemplo prático direto"},
    {"trigger": "Isso é religião?", "response": "Esclarecimento respeitoso"},
    {"trigger": "Vocês vendem algo?", "response": "Explicação transparente do modelo (newsletter gratuita)"},
    {"trigger": "Como assino a newsletter?", "response": "Instruções claras com entusiasmo"}
  ],
  "objectionHandlers": [
    {"objection": "Filosofia não serve pra nada", "response": "Resposta que conecta com resultado prático"},
    {"objection": "Isso é coisa de coach", "response": "Diferenciação clara e respeitosa"},
    {"objection": "Muito antigo, não funciona mais", "response": "Argumento de atemporalidade com exemplo moderno"}
  ],
  "engagementBoosters": [
    "5 perguntas para postar nos comentários que geram discussão e engajamento"
  ]
}

Cada resposta deve ter no máximo 3 frases. Tom: caloroso, direto, Andrea Vermont.
RESPONDA APENAS COM O JSON.`;

  try {
    const raw = await callClaude(prompt, 3000);
    const output = parseClaudeJson<ResponseTemplates>(raw);

    const contents: GeneratedContent[] = [];

    // Formatar tudo como conteúdos individuais para o output
    const allResponses = [
      ...output.welcomeNew.map((r, i) => ({ title: `Boas-vindas ${i + 1}`, body: r, metadata: { category: "welcome" } })),
      ...output.thankYou.map((r, i) => ({ title: `Agradecimento ${i + 1}`, body: r, metadata: { category: "thanks" } })),
      ...output.questionAnswers.map(q => ({ title: `FAQ: ${q.trigger}`, body: q.response, metadata: { category: "faq", trigger: q.trigger } })),
      ...output.objectionHandlers.map(o => ({ title: `Objeção: ${o.objection}`, body: o.response, metadata: { category: "objection", trigger: o.objection } })),
      ...output.engagementBoosters.map((r, i) => ({ title: `Engajamento ${i + 1}`, body: r, metadata: { category: "engagement" } })),
    ];

    allResponses.forEach(r => {
      contents.push({
        platform: "instagram", // Aplicável a todas as plataformas
        format: "static_post",
        title: r.title,
        body: r.body,
        metadata: r.metadata,
      });
    });

    console.log(`   ✓ ${contents.length} templates de resposta gerados`);
    return { agent: "response-manager", platform: "instagram", contents, generatedAt: new Date().toISOString(), teachingKey: "n/a", status: "success" };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Erro desconhecido";
    return { agent: "response-manager", platform: "instagram", contents: [], generatedAt: new Date().toISOString(), teachingKey: "n/a", status: "error", error: msg };
  }
}
