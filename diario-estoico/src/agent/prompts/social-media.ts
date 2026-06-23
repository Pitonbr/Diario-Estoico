/**
 * Prompts para adaptação de conteúdo em redes sociais
 *
 * Cada canal tem necessidades diferentes:
 * - Instagram: visual, curto, hashtags, emojis
 * - LinkedIn: profissional, insights, sem emojis excessivos
 * - Twitter/X: ultra-curto, provocador, thread-friendly
 *
 * Será implementado quando os módulos de canais estiverem ativos.
 */

export function buildInstagramPrompt(_content: Record<string, unknown>): string {
  throw new Error("Prompt Instagram ainda não implementado");
}

export function buildLinkedInPrompt(_content: Record<string, unknown>): string {
  throw new Error("Prompt LinkedIn ainda não implementado");
}

export function buildTwitterPrompt(_content: Record<string, unknown>): string {
  throw new Error("Prompt Twitter ainda não implementado");
}
