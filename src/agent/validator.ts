import Anthropic from "@anthropic-ai/sdk";
import { config } from "../config/env";
import { NewsletterContent } from "./content-generator";
import { TeachingEntry } from "./stoic-knowledge";

export interface ValidationResult {
  quoteMatch: boolean;
  sourceMatch: boolean;
  noHallucination: boolean;
  warnings: string[];
}

/**
 * Validação em 3 camadas:
 * 1. Verifica se a citação corresponde à original (match direto)
 * 2. Verifica se a referência bibliográfica está correta
 * 3. Chama Claude como "revisor" para detectar fatos inventados
 */
export async function validateContent(
  content: NewsletterContent,
  teaching: TeachingEntry
): Promise<ValidationResult> {
  const warnings: string[] = [];

  // 1. Verificar citação (normaliza espaços e pontuação)
  const normalize = (s: string) =>
    s.toLowerCase().replace(/[""'']/g, '"').replace(/\s+/g, " ").trim();

  const quoteMatch =
    normalize(content.quote.text) === normalize(teaching.originalText);

  if (!quoteMatch) {
    warnings.push(
      `Citação alterada. Original: "${teaching.originalText.slice(0, 80)}..." | Gerada: "${content.quote.text.slice(0, 80)}..."`
    );
  }

  // 2. Verificar referência bibliográfica
  const sourceMatch =
    content.quote.source.includes(teaching.work) &&
    content.quote.source.includes(teaching.philosopher);

  if (!sourceMatch) {
    warnings.push(
      `Referência incorreta. Esperado: ${teaching.philosopher}, ${teaching.work} | Recebido: ${content.quote.source}`
    );
  }

  // 3. Verificação anti-alucinação via Claude (segunda chamada)
  let noHallucination = true;
  try {
    const anthropic = new Anthropic({ apiKey: config.anthropic.apiKey });

    const reviewResponse = await anthropic.messages.create({
      model: config.anthropic.model,
      max_tokens: 300,
      temperature: 0,
      messages: [
        {
          role: "user",
          content: `Você é um revisor rigoroso de conteúdo sobre filosofia estoica.

Analise o texto abaixo e identifique APENAS problemas factuais graves:
- Citações atribuídas ao filósofo errado
- Datas históricas incorretas
- Fatos inventados sobre filósofos estoicos
- Conceitos estoicos descritos incorretamente

TEXTO PARA REVISÃO:
"${content.contextBody}"

Referência declarada: ${teaching.philosopher}, ${teaching.work}, ${teaching.bookChapter}

Se NÃO encontrar problemas factuais graves, responda apenas: OK
Se encontrar problemas, liste-os brevemente (máx 2 frases cada).`,
        },
      ],
    });

    const reviewText = reviewResponse.content.find((b) => b.type === "text");
    if (reviewText && reviewText.type === "text") {
      const reviewContent = reviewText.text.trim();
      if (reviewContent !== "OK") {
        noHallucination = false;
        warnings.push(`Revisor detectou possível problema: ${reviewContent}`);
      }
    }
  } catch {
    warnings.push("Não foi possível executar revisão anti-alucinação (falha na API).");
  }

  return { quoteMatch, sourceMatch, noHallucination, warnings };
}
