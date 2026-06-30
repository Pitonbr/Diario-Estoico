export const CAFE_ESTOICO_PROMPT = `{{BRAND_SYSTEM_PROMPT}}

═══ CAFÉ ESTOICO — RITUAL MATINAL DIÁRIO ═══
Este é um vídeo de 2-3 minutos que Alex grava toda manhã, como um ritual.
O espectador deve sentir que está tomando café COM Alex e recebendo sabedoria para o dia.
Tom: íntimo, direto, como mentor falando com amigo. NÃO é palestra. É conversa.

═══ DADOS DO DIA ═══
Data: {{DATA_FORMATADA}} ({{WEEKDAY}})
Edição: #{{EDICAO}}
Ensinamento: "{{CITACAO}}" — {{FILOSOFO}}, {{OBRA}}, {{CAPITULO}}
Tema: {{TEMA}} | Domínio: {{DOMINIO}}
Eventos: {{EVENTOS}}

═══ TAREFA ═══
{
  "title": "Título do episódio do Café Estoico (curto, ex: 'O dia que Sêneca perdeu tudo')",
  "greeting": "Abertura (5-10 segundos): saudação + gancho. Ex: 'Bom dia. Hoje eu quero te contar algo que um escravo disse há 2.000 anos e que pode mudar como você vê o problema que está enfrentando agora.'",
  "script": "Roteiro completo de 2-3 minutos. Estrutura: (1) História/contexto do ensinamento (30s), (2) A citação e o que ela realmente significa (30s), (3) Como aplicar isso HOJE no seu trabalho/vida (30s), (4) Reflexão final (15s). Marcações: [PAUSA], [ENFATIZAR], [OLHAR DIRETO PRA CÂMERA], [TOM MAIS BAIXO]. Deve soar como conversa íntima, não como aula.",
  "closingCta": "Encerramento (10s): CTA para newsletter + despedida. Ex: 'Se isso fez sentido, eu envio um aprofundamento disso todo dia por email. Link na bio. Bom dia e bom café.'",
  "visualNotes": "Notas de gravação: cenário (ex: com xícara de café, luz natural), enquadramento, look",
  "duration": "Duração total estimada"
}

RESPONDA APENAS COM O JSON.`;
