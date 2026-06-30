# Arquivo de Conteúdo Orgânico

Este diretório armazena todas as peças de conteúdo geradas pelos agentes do Diário Estoico,
organizadas por status de revisão e data.

## Estrutura

```
content-archive/
  approved/
    YYYY-MM-DD/
      {agente}-{formato}-{titulo}.json
  rejected/
    YYYY-MM-DD/
      {agente}-{formato}-{titulo}.json
```

## Como funciona

- Cada peça é gerada automaticamente todo dia às 07:00 BRT pelos agentes de conteúdo
- Alex revisa no painel admin (diario-estoico-admin.vercel.app/marketing)
- Ao **aprovar** ou **rejeitar**, a peça é arquivada aqui automaticamente com todos os dados
- Peças rejeitadas ficam em `rejected/` — não são descartadas, podem ser reavaliadas

## Para que serve este arquivo

1. **Banco de dados de conteúdo** — histórico completo de tudo que foi criado
2. **Reaproveitamento inteligente** — peças aprovadas podem alimentar novos agentes
3. **Futuros produtos** — livros, treinamentos, compilações temáticas por filósofo ou tema
4. **Anti-repetição** — os agentes consultam este arquivo para evitar repetir ângulos já explorados
5. **Melhoria contínua** — peças rejeitadas ensinam ao agente o que não funciona

## Formato de cada arquivo JSON

```json
{
  "agent": "cafe-estoico",
  "platform": "instagram",
  "format": "video_script",
  "date": "2026-06-30",
  "title": "O aviso que Marco Aurélio dava a si mesmo toda manhã",
  "body": "roteiro completo...",
  "hashtags": ["#estoicismo", "#filosofia"],
  "cta": "Link na bio...",
  "visualNotes": "Gravar com xícara de café, luz natural...",
  "duration": "2-3 minutos",
  "qualityRating": 5,
  "status": "approved",
  "archivedAt": "2026-06-30T10:00:00Z"
}
```
