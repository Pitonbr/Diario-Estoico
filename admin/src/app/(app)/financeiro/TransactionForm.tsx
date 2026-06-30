"use client";

import { useState, useTransition } from "react";
import { addTransactionAction } from "./actions";
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from "@/lib/transactions-config";

export function TransactionForm() {
  const [type, setType] = useState<"income" | "expense">("expense");
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const categories = type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        await addTransactionAction(formData);
        setOpen(false);
        (e.target as HTMLFormElement).reset();
        setType("expense");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao salvar");
      }
    });
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-md bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-700"
      >
        + Lançar transação
      </button>
    );
  }

  return (
    <div className="rounded-lg border border-stone-200 bg-white p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-semibold text-stone-900">Nova transação</h2>
        <button onClick={() => setOpen(false)} className="text-sm text-stone-400 hover:text-stone-700">
          Cancelar
        </button>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Tipo */}
        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs font-medium text-stone-600">Tipo</label>
          <div className="flex gap-2">
            {(["income", "expense"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={`flex-1 rounded-md border py-2 text-sm font-medium transition-colors ${
                  type === t
                    ? t === "income"
                      ? "border-green-400 bg-green-50 text-green-700"
                      : "border-red-300 bg-red-50 text-red-700"
                    : "border-stone-200 text-stone-500 hover:bg-stone-50"
                }`}
              >
                {t === "income" ? "↑ Receita" : "↓ Despesa"}
              </button>
            ))}
          </div>
          <input type="hidden" name="type" value={type} />
        </div>

        {/* Origem */}
        <div>
          <label className="mb-1 block text-xs font-medium text-stone-600">Origem / Descrição curta *</label>
          <input
            name="source"
            required
            placeholder={type === "income" ? "ex: Assinatura mensal" : "ex: Anthropic API"}
            className="w-full rounded-md border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
          />
        </div>

        {/* Categoria */}
        <div>
          <label className="mb-1 block text-xs font-medium text-stone-600">Categoria *</label>
          <select
            name="category"
            required
            className="w-full rounded-md border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
          >
            {categories.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>

        {/* Valor */}
        <div>
          <label className="mb-1 block text-xs font-medium text-stone-600">Valor (R$) *</label>
          <input
            name="amount"
            required
            type="text"
            placeholder="0,00"
            className="w-full rounded-md border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
          />
        </div>

        {/* Data */}
        <div>
          <label className="mb-1 block text-xs font-medium text-stone-600">Data *</label>
          <input
            name="occurred_at"
            required
            type="date"
            defaultValue={new Date().toISOString().slice(0, 10)}
            className="w-full rounded-md border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
          />
        </div>

        {/* Observação */}
        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs font-medium text-stone-600">Observação (opcional)</label>
          <input
            name="description"
            placeholder="Detalhe adicional..."
            className="w-full rounded-md border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
          />
        </div>

        {error && (
          <p className="sm:col-span-2 text-sm text-red-600">{error}</p>
        )}

        <div className="sm:col-span-2 flex justify-end">
          <button
            type="submit"
            disabled={isPending}
            className="rounded-md bg-stone-900 px-6 py-2 text-sm font-medium text-white hover:bg-stone-700 disabled:opacity-50"
          >
            {isPending ? "Salvando..." : "Salvar lançamento"}
          </button>
        </div>
      </form>
    </div>
  );
}
