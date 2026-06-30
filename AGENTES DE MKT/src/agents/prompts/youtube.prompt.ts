export const YOUTUBE_PROMPT = `{{BRAND_SYSTEM_PROMPT}}

{{YOUTUBE_GUIDELINES}}

═══ DADOS DO DIA ═══
Ensinamento: "{{CITACAO}}" — {{FILOSOFO}}, {{OBRA}}, {{CAPITULO}}
Tema: {{TEMA}} | Domínio: {{DOMINIO}}
Gerar long-form hoje: {{IS_LONGFORM_DAY}}

═══ TAREFA ═══
{
  "short": {
    "title": "Título SEO para YouTube Short (máx 60 chars, curiosidade + keyword)",
    "script": "Roteiro de 30-60 segundos. Hook forte, 1 insight, CTA. Marcações [CORTE], [TEXTO NA TELA].",
    "thumbnailText": "Texto para thumbnail (3-5 palavras de impacto)",
    "hashtags": ["#shorts", "#estoicismo", "..."]
  },
  "longform": {{LONGFORM_SCHEMA}}
}

RESPONDA APENAS COM O JSON.`;

export const YOUTUBE_LONGFORM_SCHEMA = `{
    "title": "Título SEO completo (curiosidade + keyword, ex: 'O que MARCO AURÉLIO ensinou sobre LIDERAR sob pressão')",
    "description": "Descrição do vídeo (primeiras 2 linhas = gancho, depois link newsletter, depois resumo)",
    "thumbnailText": "Texto da thumbnail (máx 5 palavras)",
    "outline": [
      {"timestamp": "0:00", "section": "Introdução/Hook", "content": "Roteiro detalhado desta seção (2-3 parágrafos)"},
      {"timestamp": "2:00", "section": "Ponto 1: [nome]", "content": "Roteiro detalhado"},
      {"timestamp": "5:00", "section": "Ponto 2: [nome]", "content": "Roteiro detalhado"},
      {"timestamp": "8:00", "section": "Ponto 3: [nome]", "content": "Roteiro detalhado"},
      {"timestamp": "10:00", "section": "Aplicação prática", "content": "Roteiro com exemplo real"},
      {"timestamp": "11:00", "section": "Conclusão + CTA", "content": "Resumo + convite newsletter"}
    ],
    "tags": ["estoicismo", "filosofia", "marco aurelio", "..."]
  }`;
