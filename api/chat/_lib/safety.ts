import Anthropic from "@anthropic-ai/sdk";
import { getDb } from "./db";

// ══════════════════════════════════════════
// CRISE (auto-resposta + alerta admin)
// ══════════════════════════════════════════
const CRISIS_PATTERNS = [
  /não aguento mais viver/i, /quero morrer/i, /me matar/i, /tirar minha vida/i,
  /acabar com tudo/i, /me machucar/i, /automutila/i, /suic[íi]d/i,
  /sem saída nenhuma/i, /ninguém sentiria minha falta/i,
];

// ══════════════════════════════════════════
// LINHAS VERMELHAS (bloqueio + alerta admin)
// ══════════════════════════════════════════
const RED_LINE_PATTERNS: { type: string; severity: "critical" | "high" | "medium"; patterns: RegExp[] }[] = [
  {
    type: "homicide",
    severity: "critical",
    patterns: [
      /vou matar (ela|ele|você|voce|minha|meu|essa|esse)/i,
      /quero matar (algu[eé]m|ela|ele|minha|meu)/i,
      /planejando matar/i,
      /como mato/i,
      /matar minha (esposa|marido|namorad|filh|mae|pai|chefe|vizin)/i,
    ],
  },
  {
    type: "threats",
    severity: "high",
    patterns: [
      /vou te destruir/i,
      /vou acabar com (você|voce|ele|ela|sua vida)/i,
      /você vai se arrepender/i,
      /vou fazer você pagar/i,
      /ameaça de morte/i,
    ],
  },
  {
    type: "racism",
    severity: "high",
    patterns: [
      /raça inferior/i,
      /ódio racial/i,
      /[nm]igger/i,
      /exterminar (negros|judeus|muçulmanos|indios|ciganos)/i,
    ],
  },
  {
    type: "child_safety",
    severity: "critical",
    patterns: [
      /crian[cç]a.*sexu/i,
      /menor.*sexu/i,
      /pedofil/i,
      /abuso.*crian[cç]/i,
      /pornografia.*crian[cç]/i,
    ],
  },
  {
    type: "abortion",
    severity: "medium",
    patterns: [
      /como faço (para|pra) abortar/i,
      /como induzir aborto/i,
      /remédio para abortar/i,
    ],
  },
];

export interface RedLineResult {
  detected: boolean;
  type: string;
  severity: "critical" | "high" | "medium";
}

export function quickSafetyScreen(message: string): boolean {
  return CRISIS_PATTERNS.some((p) => p.test(message));
}

export function quickRedLineCheck(message: string): RedLineResult {
  for (const group of RED_LINE_PATTERNS) {
    if (group.patterns.some(p => p.test(message))) {
      return { detected: true, type: group.type, severity: group.severity };
    }
  }
  return { detected: false, type: "none", severity: "medium" };
}

export async function recordAdminAlert(
  userId: string,
  conversationId: string,
  alertType: string,
  severity: "critical" | "high" | "medium",
  triggerMessage: string,
  blockConversation: boolean
): Promise<void> {
  const db = getDb();
  await db.from("chat_admin_alerts").insert({
    user_id: userId,
    conversation_id: conversationId,
    alert_type: alertType,
    severity,
    trigger_message: triggerMessage.slice(0, 500),
    status: "pending",
  });

  if (blockConversation) {
    await db.from("conversations")
      .update({ admin_blocked: true, block_reason: alertType })
      .eq("id", conversationId);
  }
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
    if (category === "self_harm" || category === "severe_distress" || category === "suicidal_ideation") {
      return `Eu quero parar tudo por um momento, porque o que você compartilhou é mais importante do que qualquer reflexão filosófica.\n\nO que você está sentindo merece apoio de verdade, de uma pessoa preparada para isso. Por favor, considere conversar agora com o CVV — é gratuito, sigiloso e funciona 24 horas: ligue 188 ou acesse cvv.org.br para chat.\n\nEu continuo aqui se você quiser conversar, mas queria que você soubesse dessas opções primeiro. Você não precisa passar por isso sozinho.`;
    }
    return `O que você descreveu merece atenção de um profissional de saúde. Cuidar disso com ajuda qualificada é exatamente o que um estoico faria.\n\nQuando quiser continuar nossas reflexões, estarei aqui.`;
  }
  return `I want to pause for a moment. Please consider reaching out to a crisis helpline in your country. You deserve real human support. I'm still here if you want to talk.`;
}

export function buildBlockedResponse(language = "pt-BR"): string {
  if (language.startsWith("pt")) {
    return `Esta conversa foi temporariamente pausada para revisão. Se você precisar de ajuda imediata em caso de crise, ligue 188 (CVV — gratuito, 24h).\n\nAssim que a revisão for concluída, você poderá continuar suas reflexões.`;
  }
  return `This conversation has been temporarily paused for review. If you need immediate crisis support, please call your local helpline.`;
}
