/**
 * Módulo de expansão para Instagram
 *
 * Futura integração para adaptar o conteúdo da newsletter
 * em posts para Instagram (carrossel, stories, reels).
 *
 * Estrutura planejada:
 * - Adaptar contextBody → carrossel de 5-7 slides
 * - Quote → imagem com citação (template Canva-like)
 * - CTA → stories com enquete
 *
 * APIs candidatas:
 * - Instagram Graph API (publicação direta)
 * - Buffer/Hootsuite API (scheduling)
 * - Canva Connect API (geração de imagens)
 */

export interface InstagramPost {
  type: "carousel" | "single" | "story" | "reel";
  caption: string;
  slides?: string[];  // URLs das imagens
  hashtags: string[];
  scheduledAt: Date;
}

export async function adaptForInstagram(
  _newsletterId: string
): Promise<InstagramPost> {
  throw new Error("Módulo Instagram ainda não implementado");
}
