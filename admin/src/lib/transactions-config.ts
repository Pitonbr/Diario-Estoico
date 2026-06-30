// Tipos e constantes sem dependências server-side — safe para client components

export type TransactionType = "income" | "expense";
export type IncomeCategory = "assinatura" | "produto" | "parceria" | "outro_receita";
export type ExpenseCategory = "midia_paga" | "sistema" | "producao" | "outro_despesa";
export type TransactionCategory = IncomeCategory | ExpenseCategory;

export const INCOME_CATEGORIES: { value: IncomeCategory; label: string }[] = [
  { value: "assinatura", label: "Assinatura" },
  { value: "produto", label: "Produto (curso, livro, etc.)" },
  { value: "parceria", label: "Parceria / Patrocínio" },
  { value: "outro_receita", label: "Outro (receita)" },
];

export const EXPENSE_CATEGORIES: { value: ExpenseCategory; label: string }[] = [
  { value: "midia_paga", label: "Mídia Paga (Meta/Google/TikTok Ads)" },
  { value: "sistema", label: "Sistema (API, hospedagem, ferramentas)" },
  { value: "producao", label: "Produção (design, edição, etc.)" },
  { value: "outro_despesa", label: "Outro (despesa)" },
];

export const CATEGORY_LABELS: Record<TransactionCategory, string> = {
  assinatura: "Assinatura",
  produto: "Produto",
  parceria: "Parceria",
  outro_receita: "Outro (receita)",
  midia_paga: "Mídia Paga",
  sistema: "Sistema",
  producao: "Produção",
  outro_despesa: "Outro (despesa)",
};
