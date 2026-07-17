/**
 * ═══════════════════════════════════════════════════════════════
 * CAMADA DE SEGURANÇA — Detecção de Crise
 * ═══════════════════════════════════════════════════════════════
 * Roda ANTES do motor socrático em toda mensagem.
 * Se detectar crise, o motor socrático é ignorado e a resposta
 * é de acolhimento + direcionamento a ajuda humana.
 */

import Anthropic from "@anthropic-ai/sdk";
import { config } from "../config/env";

export interface SafetyResult {
  isCrisis: boolean;
  category: "none" | "self_harm" | "severe_distress" | "violence" | "medical";
  confidence: number;
}

// Triagem rápida por palavras-chave (camada 1 — instantânea, sem custo de API)
const CRISIS_PATTERNS = [
  /não aguento mais viver/i,
  /quero morrer/i,
  /me matar/i,
  /tirar minha vida/i,
  /acabar com tudo/i,
  /me machucar/i,
  /automutila/i,
  /suic[íi]d/i,
  /sem saída nenhuma/i,
  /ninguém sentiria minha falta/i,
];

export function quickSafetyScreen(message: string): boolean {
  return CRISIS_PATTERNS.some((p) => p.test(message));
}

// Análise contextual (camada 2 — via Claude, quando triagem rápida sinaliza OU a cada N mensagens)
export async function contextualSafetyCheck(
  recentMessages: { role: string; content: string }[]
): Promise<SafetyResult> {
  const anthropic = new Anthropic({ apiKey: config.anthropic.apiKey });

  const conversationText = recentMessages
    .slice(-6)
    .map((m) => `${m.role === "user" ? "Pessoa" : "Chat"}: ${m.content}`)
    .join("\n");

  const response = await anthropic.messages.create({
    model: config.anthropic.model,
    max_tokens: 200,
    temperature: 0,
    messages: [
      {
        role: "user",
        content: `Você é um classificador de segurança para um chat de reflexão filosófica. Analise a conversa e classifique o estado da pessoa.

CONVERSA:
${conversationText}

Responda APENAS com JSON:
{"isCrisis": boolean, "category": "none|self_harm|severe_distress|violence|medical", "confidence": 0.0-1.0}

Critérios:
- self_harm: ideação suicida, autolesão, desejo de morrer
- severe_distress: crise emocional aguda que precisa de apoio humano imediato (não apenas tristeza ou estresse comum)
- violence: intenção de machucar terceiros
- medical: sintomas físicos/psiquiátricos graves descritos
- none: conversa normal, mesmo que sobre temas difíceis

IMPORTANTE: conversas sobre dificuldades, tristeza, ansiedade comum e dilemas de vida são NORMAIS para este chat (category: none). Só sinalize crise quando houver risco real.`,
      },
    ],
  });

  const text = response.content.find((b) => b.type === "text");
  if (!text || text.type !== "text") {
    return { isCrisis: false, category: "none", confidence: 0 };
  }

  try {
    const clean = text.text.replace(/```json\n?|```\n?/g, "").trim();
    return JSON.parse(clean) as SafetyResult;
  } catch {
    return { isCrisis: false, category: "none", confidence: 0 };
  }
}

// Resposta de crise (substitui o motor socrático)
export function buildCrisisResponse(category: SafetyResult["category"], language = "pt-BR"): string {
  if (language.startsWith("pt")) {
    if (category === "self_harm" || category === "severe_distress") {
      return `Eu quero parar tudo por um momento, porque o que você compartilhou é mais importante do que qualquer reflexão filosófica.

O que você está sentindo merece apoio de verdade, de uma pessoa preparada para isso. Por favor, considere conversar agora com o CVV — é gratuito, sigiloso e funciona 24 horas: ligue 188 ou acesse cvv.org.br para chat.

Eu continuo aqui se você quiser conversar, mas queria que você soubesse dessas opções primeiro. Você não precisa passar por isso sozinho.`;
    }
    if (category === "medical") {
      return `O que você descreveu me parece algo que merece atenção de um profissional de saúde — e isso está além do que uma conversa filosófica pode (e deve) alcançar.

Não deixe para depois: procure um médico ou psicólogo para avaliar isso direito. Cuidar do corpo e da mente com ajuda qualificada é exatamente o que um estoico faria.

Quando quiser continuar nossas reflexões, estarei aqui.`;
    }
  }
  // Fallback EN
  return `I want to pause everything for a moment, because what you shared matters more than any philosophical reflection. Please consider reaching out to a crisis helpline in your country — you deserve real human support. I'm still here if you want to talk, but I wanted you to know about those options first.`;
}
