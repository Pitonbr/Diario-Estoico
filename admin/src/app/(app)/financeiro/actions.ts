"use server";

import { revalidatePath } from "next/cache";
import { addTransaction, deleteTransaction, TransactionType, TransactionCategory } from "@/lib/transactions";

export async function addTransactionAction(formData: FormData) {
  const type = formData.get("type") as TransactionType;
  const source = formData.get("source") as string;
  const category = formData.get("category") as TransactionCategory;
  const amountStr = formData.get("amount") as string;
  const description = (formData.get("description") as string) || null;
  const occurred_at = formData.get("occurred_at") as string;

  // Convert "1.234,56" or "1234.56" to cents
  const cleaned = amountStr.replace(/\./g, "").replace(",", ".");
  const amount_cents = Math.round(parseFloat(cleaned) * 100);

  if (!type || !source || !category || isNaN(amount_cents) || amount_cents <= 0 || !occurred_at) {
    throw new Error("Dados inválidos. Preencha todos os campos obrigatórios.");
  }

  await addTransaction({ type, source, category, amount_cents, description, occurred_at });
  revalidatePath("/financeiro");
}

export async function deleteTransactionAction(id: string) {
  await deleteTransaction(id);
  revalidatePath("/financeiro");
}
