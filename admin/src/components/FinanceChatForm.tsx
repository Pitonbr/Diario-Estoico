"use client";

import { useState } from "react";
import { addChatFinancialAction } from "@/app/(app)/chat/actions";

const CATEGORIES = [
  { value: "api_cost", label: "Custo de API (Anthropic)" },
  { value: "infrastructure", label: "Infraestrutura (Vercel/Supabase)" },
  { value: "subscription", label: "Receita de Assinatura" },
  { value: "marketing", label: "Marketing" },
  { value: "other", label: "Outro" },
];

export function FinanceChatForm() {
  const [open, setOpen] = useState(false);

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
    <form
      action={async (fd: FormData) => {
        await addChatFinancialAction(fd);
        setOpen(false);
      }}
      className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm"
    >
      <p className="mb-3 text-sm font-semibold text-stone-800">Nova transação — Chat Estoico</p>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-xs text-stone-500">Tipo</label>
          <select name="type" required className="w-full rounded border border-stone-300 px-2 py-1.5 text-sm text-stone-800">
            <option value="revenue">Receita</option>
            <option value="expense">Despesa</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs text-stone-500">Categoria</label>
          <select name="category" required className="w-full rounded border border-stone-300 px-2 py-1.5 text-sm text-stone-800">
            {CATEGORIES.map(c => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs text-stone-500">Valor (R$)</label>
          <input
            name="amount"
            type="number"
            step="0.01"
            min="0"
            required
            placeholder="0,00"
            className="w-full rounded border border-stone-300 px-2 py-1.5 text-sm text-stone-800"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-stone-500">Data</label>
          <input
            name="occurred_at"
            type="date"
            required
            defaultValue={new Date().toISOString().split("T")[0]}
            className="w-full rounded border border-stone-300 px-2 py-1.5 text-sm text-stone-800"
          />
        </div>
        <div className="col-span-2">
          <label className="mb-1 block text-xs text-stone-500">Descrição (opcional)</label>
          <input
            name="description"
            type="text"
            placeholder="ex: Custo Anthropic API — Julho 2026"
            className="w-full rounded border border-stone-300 px-2 py-1.5 text-sm text-stone-800"
          />
        </div>
      </div>
      <div className="mt-3 flex justify-end gap-2">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded px-3 py-1.5 text-sm text-stone-500 hover:bg-stone-100"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="rounded bg-stone-900 px-4 py-1.5 text-sm font-medium text-white hover:bg-stone-700"
        >
          Salvar
        </button>
      </div>
    </form>
  );
}
