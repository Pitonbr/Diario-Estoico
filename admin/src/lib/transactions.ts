import { createClient } from "@/lib/supabase/server";
export * from "./transactions-config";
import type { TransactionType, TransactionCategory } from "./transactions-config";

export interface Transaction {
  id: string;
  type: TransactionType;
  source: string;
  category: TransactionCategory;
  amount_cents: number;
  description: string | null;
  occurred_at: string;
  created_at: string;
}

export interface FinancialSummary {
  totalIncomeCents: number;
  totalExpenseCents: number;
  balanceCents: number;
  transactions: Transaction[];
}

export async function getFinancialSummary(months = 3): Promise<FinancialSummary> {
  const db = await createClient();
  const since = new Date();
  since.setMonth(since.getMonth() - months);
  const sinceStr = since.toISOString().slice(0, 10);

  const { data, error } = await db
    .from("transactions")
    .select("*")
    .gte("occurred_at", sinceStr)
    .order("occurred_at", { ascending: false });

  if (error) throw new Error(`Erro ao buscar transações: ${error.message}`);

  const transactions = (data ?? []) as Transaction[];
  const totalIncomeCents = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount_cents, 0);
  const totalExpenseCents = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount_cents, 0);

  return {
    totalIncomeCents,
    totalExpenseCents,
    balanceCents: totalIncomeCents - totalExpenseCents,
    transactions,
  };
}

export async function addTransaction(tx: Omit<Transaction, "id" | "created_at">): Promise<void> {
  const db = await createClient();
  const { error } = await db.from("transactions").insert(tx);
  if (error) throw new Error(`Erro ao inserir transação: ${error.message}`);
}

export async function deleteTransaction(id: string): Promise<void> {
  const db = await createClient();
  const { error } = await db.from("transactions").delete().eq("id", id);
  if (error) throw new Error(`Erro ao excluir transação: ${error.message}`);
}

export function formatBRL(cents: number): string {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
