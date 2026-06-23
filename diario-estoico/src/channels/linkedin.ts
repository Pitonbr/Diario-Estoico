/**
 * Módulo de expansão para LinkedIn
 *
 * Adapta conteúdo da newsletter para posts no LinkedIn.
 * Foco: tom profissional, insights de negócios, liderança.
 *
 * Estrutura planejada:
 * - Post de texto com hook + ensinamento + CTA
 * - Newsletter LinkedIn (artigo longo)
 * - Carousel PDF nativo
 */

export interface LinkedInPost {
  type: "text" | "article" | "carousel";
  content: string;
  hashtags: string[];
  scheduledAt: Date;
}

export async function adaptForLinkedIn(
  _newsletterId: string
): Promise<LinkedInPost> {
  throw new Error("Módulo LinkedIn ainda não implementado");
}
