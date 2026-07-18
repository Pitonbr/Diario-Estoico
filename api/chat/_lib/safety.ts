import Anthropic from "@anthropic-ai/sdk";

const CRISIS_PATTERNS = [
  /não aguento mais viver/i, /quero morrer/i, /me matar/i, /tirar minha vida/i,
  /acabar com tudo/i, /me machucar/i, /automutila/i, /suic[íi]d/i,
  /sem saída nenhuma/i, /ninguém sentiria minha falta/i,
];

export function quickSafetyScreen(message: string): boolean {
  return CRISIS_PATTERNS.some((p) => p.test(message));
}

export async function contextualSafetyCheck(
  recentMessages: { role: string; content: string }[]
): Promise<{ isCrisis: boolean; category: string; confidence: number }> {
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
  const text = recentMessages.slice(-6)
    .map(m => `${m.role === "user" ? "Pessoa" : "Chat"}: ${m.content}`)
    .join("\n");

  const res = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 100,
    temperature: 0,
    messages: [{
      role: "user",
      content: `Analise e classifique: ${text}\n\nResponda APENAS JSON: {"isCrisis": boolean, "category": "none|self_harm|severe_distress|violence|medical", "confidence": 0.0-1.0}\n\nSó sinalize crise com risco real — tristeza/ansiedade comum é "none".`,
    }],
  });

  const block = res.content.find(b => b.type === "text");
  if (!block || block.type !== "text") return { isCrisis: false, category: "none", confidence: 0 };
  try {
    return JSON.parse(block.text.replace(/```json\n?|```\n?/g, "").trim());
  } catch {
    return { isCrisis: false, category: "none", confidence: 0 };
  }
}

export function buildCrisisResponse(category: string, language = "pt-BR"): string {
  if (language.startsWith("pt")) {
    if (category === "self_harm" || category === "severe_distress") {
      return `Eu quero parar tudo por um momento, porque o que você compartilhou é mais importante do que qualquer reflexão filosófica.\n\nO que você está sentindo merece apoio de verdade, de uma pessoa preparada para isso. Por favor, considere conversar agora com o CVV — é gratuito, sigiloso e funciona 24 horas: ligue 188 ou acesse cvv.org.br para chat.\n\nEu continuo aqui se você quiser conversar, mas queria que você soubesse dessas opções primeiro. Você não precisa passar por isso sozinho.`;
    }
    return `O que você descreveu merece atenção de um profissional de saúde. Cuidar disso com ajuda qualificada é exatamente o que um estoico faria.\n\nQuando quiser continuar nossas reflexões, estarei aqui.`;
  }
  return `I want to pause for a moment. Please consider reaching out to a crisis helpline in your country. You deserve real human support. I'm still here if you want to talk.`;
}
