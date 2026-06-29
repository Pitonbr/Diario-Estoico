// ═══════════════════════════════════════════════════
// Tipos compartilhados entre todos os agentes
// ═══════════════════════════════════════════════════

export type Platform = "newsletter" | "instagram" | "tiktok" | "youtube" | "twitter" | "whatsapp";
export type ContentFormat = "reels" | "carousel" | "static_post" | "story" | "short" | "longform" | "tweet" | "thread" | "email" | "video_script";
export type PracticalDomain = "pessoal" | "financeiro" | "empreendedor";

export interface TeachingEntry {
  id: string;
  philosopher: string;
  work: string;
  bookChapter: string;
  theme: string;
  originalText: string;
  practicalDomains: string[];
  tags: string[];
}

export interface DayContext {
  date: Date;
  dayOfYear: number;
  dateFormatted: string;
  weekday: string;
  calendarEvents: { name: string; category: string; stoicConnection: string }[];
  trendingTopics: string;
  teaching: TeachingEntry;
  domain: PracticalDomain;
  editionNumber: number;
}

export interface GeneratedContent {
  platform: Platform;
  format: ContentFormat;
  title: string;
  body: string;
  hashtags?: string[];
  cta?: string;
  visualNotes?: string;      // Notas para design/gravação
  audioNotes?: string;       // Notas de narração/tom
  duration?: string;         // Duração estimada
  slides?: string[];         // Para carrosséis
  scheduledTime?: string;    // Horário sugerido de postagem
  metadata: Record<string, unknown>;
}

export interface AgentResult {
  agent: string;
  platform: Platform;
  contents: GeneratedContent[];
  generatedAt: string;
  teachingKey: string;
  status: "success" | "error";
  error?: string;
}
