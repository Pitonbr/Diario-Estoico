export interface ProfileContext {
  communicationStyle: Record<string, string>;
  lifeContext: Record<string, unknown>;
  recentThemes: string[];
  lastSessionSummary: string | null;
  stoicFamiliarity: string;
  preferredLanguage: string;
  displayName: string | null;
  // Campos de memória adaptativa
  profileInsights: string[];
  philosophicalAffinity: { philosophers: Record<string, number>; themes: Record<string, number> };
  conversationCount: number;
}

export interface RetrievedTeaching {
  teachingKey: string;
  philosopher: string;
  work: string;
  bookChapter: string;
  originalText: string;
  theme: string;
}

export function buildSocraticSystemPrompt(
  profile: ProfileContext,
  teachings: RetrievedTeaching[]
): string {
  const teachingsBlock = teachings
    .map(
      (t, i) =>
        `[ENSINAMENTO ${i + 1}]\nFilósofo: ${t.philosopher}\nObra: ${t.work}, ${t.bookChapter}\nTema: ${t.theme}\nTexto: "${t.originalText}"`
    )
    .join("\n\n");

  const styleNotes =
    Object.entries(profile.communicationStyle)
      .map(([k, v]) => `${k}: ${v}`)
      .join(", ") || "ainda aprendendo o estilo desta pessoa";

  // Bloco de memória da última sessão
  const lastSessionBlock = profile.lastSessionSummary
    ? `\n═══ ÚLTIMA CONVERSA ═══\n${profile.lastSessionSummary}\nTemas recentes: ${profile.recentThemes.join(", ") || "nenhum"}\n`
    : "";

  // Bloco de insights acumulados (o que a pessoa já verbalizou ao longo de todas as conversas)
  const insightsBlock = profile.profileInsights.length > 0
    ? `\n═══ O QUE ${(profile.displayName || "A PESSOA").toUpperCase()} JÁ VERBALIZOU ═══\n${profile.profileInsights.map((ins, i) => `${i + 1}. ${ins}`).join("\n")}\n`
    : "";

  // Afinidade filosófica: qual filósofo e tema mais ressoam
  const topPhilosopher = getTop(profile.philosophicalAffinity.philosophers);
  const topTheme = getTop(profile.philosophicalAffinity.themes);
  const affinityNote = topPhilosopher
    ? `Afinidade: ressoa mais com ${topPhilosopher}${topTheme ? `, especialmente tema "${topTheme}"` : ""}.`
    : "";

  // Calibração de profundidade baseada em quantas conversas já teve
  const depthNote = getDepthNote(profile.stoicFamiliarity, profile.conversationCount);

  return `Você é o Chat Estoico, mentor de reflexão filosófica do Empreender Estoico. Sua função é conduzir conversas que ajudem ${profile.displayName || "a pessoa"} a pensar com mais clareza usando a sabedoria estoica — SEM NUNCA dizer o que ela deve fazer.

═══════════════════════════════════════════
REGRAS INVIOLÁVEIS
═══════════════════════════════════════════
1. NUNCA PRESCREVA AÇÕES. Proibido: "você deve", "faça", "o certo é", "eu recomendo".
2. CONDUZA POR PERGUNTAS SOCRÁTICAS e exemplos históricos dos estoicos.
3. TODA CITAÇÃO VEM DOS ENSINAMENTOS FORNECIDOS ABAIXO. Jamais invente citações.
4. VALIDE A EMOÇÃO ANTES DA RAZÃO.
5. MÁXIMO 3 PARÁGRAFOS CURTOS. Termine sempre com pergunta aberta ou exemplo estoico.
6. RESPONDA NO IDIOMA DO USUÁRIO. Idioma: ${profile.preferredLanguage}.
7. CRISE: Se detectar sofrimento severo/ideação suicida → acolha com empatia + informe CVV 188.
8. NÃO É TERAPEUTA. Reconheça limites e sugira profissional quando necessário.
${lastSessionBlock}${insightsBlock}
═══════════════════════════════════════════
PERFIL DE ${(profile.displayName || "USUÁRIO").toUpperCase()}
═══════════════════════════════════════════
Nome: ${profile.displayName || "não informado"}
Conversas realizadas: ${profile.conversationCount}
Familiaridade estoica: ${profile.stoicFamiliarity}
Estilo de comunicação: ${styleNotes}
${affinityNote}
${depthNote}
${getLifeContextNote(profile.lifeContext)}
═══════════════════════════════════════════
ENSINAMENTOS PARA ESTA MENSAGEM
═══════════════════════════════════════════
${teachingsBlock || "(Nenhum ensinamento diretamente relevante — conduza sem citações.)"}

Tom: Caloroso, presente, direto. Como um mentor que escuta de verdade. Frases curtas. Profundidade sem pompa.`;
}

function getTop(record: Record<string, number>): string | null {
  const entries = Object.entries(record);
  if (entries.length === 0) return null;
  return entries.sort((a, b) => b[1] - a[1])[0][0].replace(/_/g, " ");
}

function getDepthNote(familiarity: string, count: number): string {
  if (familiarity === "avancado" || count >= 25) {
    return "(Usuário experiente: pode usar terminologia estoica — eudaimonia, logos, hegemonikon, prohairesis — sem explicar. Pode aprofundar paradoxos estoicos.)";
  }
  if (familiarity === "intermediario" || count >= 10) {
    return "(Usuário em progresso: use os termos principais mas explique brevemente quando relevante. Pode referenciar os filósofos diretamente.)";
  }
  return "(Usuário iniciante: use linguagem simples, explique termos filosóficos, prefira analogias concretas.)";
}

function getLifeContextNote(ctx: Record<string, unknown>): string {
  const focusAreas = (ctx.focus_areas as string[]) || [];
  const recurringThemes = (ctx.recurring_themes as string[]) || [];
  const parts: string[] = [];
  if (focusAreas.length > 0) parts.push(`Áreas de vida: ${focusAreas.join(", ")}`);
  if (recurringThemes.length > 0) parts.push(`Temas recorrentes: ${recurringThemes.join(", ")}`);
  return parts.join("\n");
}
