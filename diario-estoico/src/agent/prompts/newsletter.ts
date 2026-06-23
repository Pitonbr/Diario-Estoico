import { TeachingEntry, PracticalDomain } from "../stoic-knowledge";
import { DayContext } from "../event-fetcher";

export interface PromptInput {
  teaching: TeachingEntry;
  domain: PracticalDomain;
  dayContext: DayContext;
  editionNumber: number;
  date: Date;
  dayOfYear: number;
}

const DOMAIN_LABELS: Record<PracticalDomain, string> = {
  pessoal: "Desenvolvimento Pessoal",
  financeiro: "Finanças e Investimentos",
  empreendedor: "Empreendedorismo e Negócios",
};

export function buildNewsletterPrompt(input: PromptInput): string {
  const { teaching, domain, dayContext, editionNumber, date, dayOfYear } = input;

  const dateStr = date.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const calendarStr =
    dayContext.calendarEvents.length > 0
      ? dayContext.calendarEvents
          .map((e) => `• ${e.name} (${e.category}) — Conexão estoica: ${e.stoicConnection}`)
          .join("\n")
      : "Nenhuma data comemorativa relevante hoje.";

  const trendingStr =
    dayContext.trendingTopics || "Nenhuma tendência específica identificada.";

  return `Você é o editor da newsletter "Diário Estoico", uma publicação diária que conecta a sabedoria estoica à vida moderna de empreendedores e profissionais brasileiros.

══════════════════════════════════
DADOS DO DIA
══════════════════════════════════
Data: ${dateStr}
Dia do ano: ${dayOfYear}/365
Edição: #${editionNumber}
Domínio prático de hoje: ${DOMAIN_LABELS[domain]}

══════════════════════════════════
ENSINAMENTO SELECIONADO
══════════════════════════════════
Filósofo: ${teaching.philosopher}
Obra: ${teaching.work}
Referência: ${teaching.bookChapter}
Tema: ${teaching.theme}
Citação original: "${teaching.originalText}"

══════════════════════════════════
CONTEXTO DO DIA
══════════════════════════════════
Datas comemorativas:
${calendarStr}

Tendências atuais (negócios/mentoria):
${trendingStr}

══════════════════════════════════
INSTRUÇÕES DE GERAÇÃO
══════════════════════════════════

Gere o conteúdo da newsletter seguindo EXATAMENTE esta estrutura JSON:

{
  "subjectLine": "Assunto do email — curto, impactante, com emoji relevante (máx 60 caracteres)",
  "preheader": "Texto de preview do email (máx 100 caracteres)",
  "dayLabel": "Dia ${dayOfYear} de 365",
  "dateFormatted": "${dateStr}",
  "editionLabel": "Edição #${editionNumber}",

  "quote": {
    "text": "A citação original EXATA fornecida acima, sem alterações",
    "author": "${teaching.philosopher}",
    "source": "${teaching.work}, ${teaching.bookChapter}"
  },

  "contextTitle": "Título curto e envolvente para a contextualização (5-8 palavras)",
  "contextBody": "Contextualização em 3-4 parágrafos (máx 200 palavras total). DEVE:\n- Conectar o ensinamento estoico ao momento atual\n- Se houver data comemorativa, fazer o cruzamento\n- Se houver tendência de negócios, conectar naturalmente\n- Usar exemplos concretos e casos reais validados\n- Tom: conversacional mas profundo, como mentor falando com empreendedor\n- NUNCA inventar fatos ou atribuir citações falsas",

  "applicationTitle": "${DOMAIN_LABELS[domain]}",
  "applicationBody": "Uma dica prática específica de ${domain} baseada no ensinamento (2-3 frases). Deve ser acionável HOJE.",

  "ctaQuestions": [
    "Primeira pergunta reflexiva — tipo call-to-action, provocadora, pessoal",
    "Segunda pergunta — conectada à aplicação prática, orientada à ação"
  ],

  "bibliographicRef": "${teaching.philosopher}. ${teaching.work}. ${teaching.bookChapter}.",
  "eventConnection": "Breve menção ao evento/tendência do dia cruzado com o ensinamento (1 frase). Se não houver evento relevante, omitir este campo."
}

REGRAS CRÍTICAS:
1. A citação (quote.text) DEVE ser IDÊNTICA à fornecida acima. Não altere uma palavra.
2. NÃO invente fatos, datas históricas ou citações que não estejam na referência bibliográfica.
3. Se mencionar algum caso de negócios, use apenas casos amplamente conhecidos e verificáveis.
4. O tom deve ser caloroso e inspirador, nunca pedante ou acadêmico.
5. Limite total: ~350-450 palavras (2 minutos de leitura).
6. Responda APENAS com o JSON. Sem texto antes ou depois. Sem markdown. Sem backticks.`;
}
