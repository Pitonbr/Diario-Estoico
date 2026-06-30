export interface AgentDef {
  key: string;
  label: string;
  emoji: string;
  platforms: string[];
  promptFile: string | null;
  schedule: string;
  description: string;
  hasContentFeed: boolean;
}

export const AGENTS_REGISTRY: AgentDef[] = [
  {
    key: "cafe-estoico",
    label: "Café Estoico",
    emoji: "☕",
    platforms: ["Instagram", "YouTube", "TikTok"],
    promptFile: "AGENTES DE MKT/src/agents/prompts/cafe-estoico.prompt.ts",
    schedule: "07:30 BRT",
    description: "Roteiro do vídeo matinal diário (2-3 min), gravado por Alex com xícara de café.",
    hasContentFeed: true,
  },
  {
    key: "instagram",
    label: "Instagram",
    emoji: "📸",
    platforms: ["Instagram"],
    promptFile: "AGENTES DE MKT/src/agents/prompts/instagram.prompt.ts",
    schedule: "07:00, 12:00, 19:00 BRT",
    description: "Reels, carrossel, post estático e ideias de Stories para o dia.",
    hasContentFeed: true,
  },
  {
    key: "tiktok",
    label: "TikTok",
    emoji: "🎵",
    platforms: ["TikTok"],
    promptFile: "AGENTES DE MKT/src/agents/prompts/tiktok.prompt.ts",
    schedule: "07:30, 19:00 BRT",
    description: "2 vídeos por dia: abordagem emocional + abordagem prática.",
    hasContentFeed: true,
  },
  {
    key: "youtube",
    label: "YouTube",
    emoji: "▶️",
    platforms: ["YouTube"],
    promptFile: "AGENTES DE MKT/src/agents/prompts/youtube.prompt.ts",
    schedule: "08:30, 10:00 BRT",
    description: "YouTube Short diário + Long-form (segunda e quarta).",
    hasContentFeed: true,
  },
  {
    key: "twitter",
    label: "Twitter / X",
    emoji: "🐦",
    platforms: ["Twitter / X"],
    promptFile: "AGENTES DE MKT/src/agents/prompts/twitter.prompt.ts",
    schedule: "07:00, 10:00, 14:00, 21:00 BRT",
    description: "4 tweets por dia + thread semanal (terça e quinta).",
    hasContentFeed: true,
  },
  {
    key: "newsletter",
    label: "Newsletter",
    emoji: "📧",
    platforms: ["Email"],
    promptFile: null,
    schedule: "08:00 BRT",
    description: "Diário Estoico por email — gerenciado pelo pipeline principal (src/).",
    hasContentFeed: false,
  },
  {
    key: "response-manager",
    label: "Response Manager",
    emoji: "💬",
    platforms: ["Instagram", "TikTok", "Twitter / X"],
    promptFile: null,
    schedule: "Manual",
    description: "Templates de resposta para comentários e mensagens. Ainda não integrado.",
    hasContentFeed: false,
  },
  {
    key: "analytics",
    label: "Analytics",
    emoji: "📊",
    platforms: ["Todas"],
    promptFile: null,
    schedule: "Semanal",
    description: "Relatório semanal de performance. Ainda não integrado.",
    hasContentFeed: false,
  },
];

export function getAgent(key: string): AgentDef | undefined {
  return AGENTS_REGISTRY.find((a) => a.key === key);
}
