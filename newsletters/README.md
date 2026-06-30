# Arquivo de Newsletters — Diário Estoico

Este diretório contém todas as edições do Diário Estoico enviadas aos assinantes,
em formato Markdown, ordenadas por data de publicação.

## Estrutura

```
newsletters/
  2026-06-30-edicao-0181.md
  2026-07-01-edicao-0182.md
  ...
```

## Para que serve este arquivo

1. **Memória do agente** — o agente de conteúdo consulta as edições anteriores para evitar
   repetir ensinamentos, citações e ângulos já usados
2. **Acesso dos assinantes** — os assinantes poderão acessar o histórico completo via website
3. **Futuros produtos** — compilações de edições por tema virarão livros, e-books e cursos
4. **Rastreabilidade** — cada edição tem data, filósofo, tema e domínio prático registrados

## Formato de cada edição (Markdown com frontmatter)

```markdown
---
edition: 181
date: 2026-06-30
philosopher: "Marco Aurélio"
work: "Meditações"
domain: pessoal
subject: "O que Marco Aurélio fazia antes de sair da cama"
---

# O que Marco Aurélio fazia antes de sair da cama
*30 de junho de 2026 — Edição #181*

## A Citação
> "De manhã, quando acordar tarde e com dificuldade..."
> — Marco Aurélio, Meditações, V.1

## [contexto, aplicação, reflexões]
```

## Nota técnica

As newsletters são geradas automaticamente pelo pipeline de IA (GitHub Actions, 08:00 BRT)
e arquivadas aqui imediatamente após o envio bem-sucedido aos assinantes.
