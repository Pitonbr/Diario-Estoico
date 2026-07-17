/**
 * ═══════════════════════════════════════════════════════════════
 * ONBOARDING — Definição do Quiz Inicial
 * ═══════════════════════════════════════════════════════════════
 * 10 perguntas que estabelecem o perfil-base sem parecer teste
 * psicológico. Cada resposta mapeia para dimensões do perfil.
 */

export interface OnboardingQuestion {
  id: string;
  question: string;
  type: "single" | "multi";
  options: { value: string; label: string; maps: Record<string, string | string[]> }[];
}

export const ONBOARDING_QUESTIONS: OnboardingQuestion[] = [
  {
    id: "q1_language",
    question: "Em qual idioma você prefere conversar?",
    type: "single",
    options: [
      { value: "pt-BR", label: "Português", maps: { preferred_language: "pt-BR" } },
      { value: "en", label: "English", maps: { preferred_language: "en" } },
      { value: "es", label: "Español", maps: { preferred_language: "es" } },
    ],
  },
  {
    id: "q2_name",
    question: "Como você gostaria de ser chamado(a)?",
    type: "single",
    options: [], // Campo de texto livre no front
  },
  {
    id: "q3_familiarity",
    question: "Qual sua relação com o estoicismo hoje?",
    type: "single",
    options: [
      { value: "none", label: "Nunca estudei, só ouvi falar", maps: { stoic_familiarity: "iniciante" } },
      { value: "some", label: "Já li alguns textos ou vi vídeos", maps: { stoic_familiarity: "intermediario" } },
      { value: "deep", label: "Estudo há tempos, conheço os autores", maps: { stoic_familiarity: "avancado" } },
    ],
  },
  {
    id: "q4_focus",
    question: "Quais áreas da vida você mais quer refletir? (escolha até 3)",
    type: "multi",
    options: [
      { value: "career", label: "Carreira e negócios", maps: { focus_areas: ["carreira"] } },
      { value: "anxiety", label: "Ansiedade e controle emocional", maps: { focus_areas: ["controle emocional"] } },
      { value: "relationships", label: "Relacionamentos", maps: { focus_areas: ["relacionamentos"] } },
      { value: "purpose", label: "Propósito e direção de vida", maps: { focus_areas: ["propósito"] } },
      { value: "money", label: "Dinheiro e ambição", maps: { focus_areas: ["dinheiro"] } },
      { value: "habits", label: "Disciplina e hábitos", maps: { focus_areas: ["disciplina"] } },
      { value: "loss", label: "Perdas e mudanças difíceis", maps: { focus_areas: ["adversidade"] } },
    ],
  },
  {
    id: "q5_dilemma",
    question: "Seu sócio (ou colega próximo) toma uma decisão importante sem te consultar. Sua primeira reação interna costuma ser:",
    type: "single",
    options: [
      { value: "confront", label: "Quero resolver isso agora, na conversa direta", maps: { tone: "direto", pace: "rapido" } },
      { value: "process", label: "Preciso de um tempo para processar antes de reagir", maps: { tone: "reflexivo", pace: "explorador" } },
      { value: "analyze", label: "Analiso friamente: qual foi o impacto real?", maps: { tone: "direto", depth: "pratico" } },
      { value: "feel", label: "Sinto o golpe primeiro, penso depois", maps: { emotional_expression: "alto", pace: "explorador" } },
    ],
  },
  {
    id: "q6_style",
    question: "Numa boa conversa, você prefere:",
    type: "single",
    options: [
      { value: "direct", label: "Ir direto ao ponto, sem rodeios", maps: { tone: "direto", depth: "pratico" } },
      { value: "explore", label: "Explorar o contexto, entender as camadas", maps: { tone: "reflexivo", depth: "filosofico" } },
    ],
  },
  {
    id: "q7_depth",
    question: "O que te atrai mais no estoicismo?",
    type: "single",
    options: [
      { value: "practical", label: "Ferramentas práticas para o dia a dia", maps: { depth: "pratico" } },
      { value: "philosophy", label: "A profundidade filosófica das ideias", maps: { depth: "filosofico" } },
      { value: "stories", label: "As histórias dos filósofos e como viveram", maps: { depth: "filosofico" } },
    ],
  },
  {
    id: "q8_moment",
    question: "Como você descreveria seu momento atual?",
    type: "single",
    options: [
      { value: "building", label: "Construindo algo novo (projeto, empresa, fase)", maps: { life_moment: "construção" } },
      { value: "crisis", label: "Atravessando uma dificuldade", maps: { life_moment: "adversidade" } },
      { value: "transition", label: "Em transição, decidindo caminhos", maps: { life_moment: "transição" } },
      { value: "growth", label: "Estável, buscando evoluir", maps: { life_moment: "crescimento" } },
    ],
  },
  {
    id: "q9_formality",
    question: "Prefere que eu fale com você de forma:",
    type: "single",
    options: [
      { value: "casual", label: "Descontraída, como um amigo", maps: { formality: "informal" } },
      { value: "formal", label: "Mais formal e estruturada", maps: { formality: "formal" } },
    ],
  },
  {
    id: "q10_frequency",
    question: "Com que frequência você imagina conversar por aqui?",
    type: "single",
    options: [
      { value: "daily", label: "Todo dia, como um ritual", maps: { usage_intent: "diario" } },
      { value: "weekly", label: "Algumas vezes por semana", maps: { usage_intent: "semanal" } },
      { value: "asneeded", label: "Quando surgir algo para refletir", maps: { usage_intent: "sob demanda" } },
    ],
  },
];

/**
 * Consolida as respostas do onboarding em um perfil inicial
 */
export function buildInitialProfile(answers: Record<string, string | string[]>) {
  const communicationStyle: Record<string, string> = {
    tone: "reflexivo",
    depth: "pratico",
    pace: "explorador",
    formality: "informal",
    emotional_expression: "medio",
  };
  const lifeContext: Record<string, unknown> = {
    focus_areas: [],
    stoic_familiarity: "iniciante",
  };

  for (const q of ONBOARDING_QUESTIONS) {
    const answer = answers[q.id];
    if (!answer) continue;

    const values = Array.isArray(answer) ? answer : [answer];
    for (const val of values) {
      const option = q.options.find((o) => o.value === val);
      if (!option) continue;

      for (const [key, mapVal] of Object.entries(option.maps)) {
        if (key === "focus_areas") {
          lifeContext.focus_areas = [
            ...new Set([...(lifeContext.focus_areas as string[]), ...(mapVal as string[])]),
          ];
        } else if (key === "stoic_familiarity" || key === "life_moment" || key === "usage_intent" || key === "preferred_language") {
          lifeContext[key] = mapVal;
        } else {
          communicationStyle[key] = mapVal as string;
        }
      }
    }
  }

  return { communicationStyle, lifeContext };
}
