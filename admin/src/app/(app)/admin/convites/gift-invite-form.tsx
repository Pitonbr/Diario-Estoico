"use client";

import { useState, useTransition } from "react";
import { createGiftInviteAction } from "./actions";

export function GiftInviteForm() {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{ error?: string; success?: boolean } | null>(null);

  const [products, setProducts] = useState<string[]>(["chat"]);

  function toggleProduct(p: string) {
    setProducts((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    );
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setResult(null);
    const fd = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await createGiftInviteAction({
        displayName: fd.get("displayName") as string,
        email: fd.get("email") as string,
        phone: fd.get("phone") as string,
        products,
        durationDays: Number(fd.get("durationDays")),
        notes: fd.get("notes") as string,
      });
      setResult(res);
      if (res.success) {
        (e.target as HTMLFormElement).reset();
        setProducts(["chat"]);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-stone-600">
            Nome *
          </label>
          <input
            name="displayName"
            required
            placeholder="Nome do convidado"
            className="w-full rounded-md border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-stone-600">
            Email *
          </label>
          <input
            name="email"
            type="email"
            required
            placeholder="email@exemplo.com"
            className="w-full rounded-md border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-stone-600">
            Telefone (WhatsApp)
          </label>
          <input
            name="phone"
            placeholder="5511999999999"
            className="w-full rounded-md border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900"
          />
          <p className="mt-0.5 text-xs text-stone-400">
            Código do país + DDD + número (ex: 5511999999999)
          </p>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-stone-600">
            Duração *
          </label>
          <select
            name="durationDays"
            required
            defaultValue="7"
            className="w-full rounded-md border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900"
          >
            <option value="7">7 dias</option>
            <option value="30">30 dias</option>
          </select>
        </div>
      </div>

      <div>
        <label className="mb-2 block text-xs font-medium text-stone-600">
          Produtos *
        </label>
        <div className="flex flex-wrap gap-3">
          {[
            { key: "newsletter", label: "Diário Estoico (Newsletter)" },
            { key: "chat", label: "Chat Estoico (Premium)" },
          ].map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => toggleProduct(key)}
              className={`rounded-md border px-4 py-2 text-sm font-medium transition-colors ${
                products.includes(key)
                  ? "border-stone-900 bg-stone-900 text-white"
                  : "border-stone-200 bg-white text-stone-600 hover:border-stone-400"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        {products.length === 0 && (
          <p className="mt-1 text-xs text-red-500">
            Selecione ao menos um produto.
          </p>
        )}
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-stone-600">
          Observações (uso interno)
        </label>
        <textarea
          name="notes"
          rows={2}
          placeholder="Ex: parceiro, influenciador, teste..."
          className="w-full rounded-md border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900"
        />
      </div>

      {result?.error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {result.error}
        </div>
      )}

      {result?.success && (
        <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          Convite criado e email enviado com sucesso!
        </div>
      )}

      <button
        type="submit"
        disabled={isPending || products.length === 0}
        className="rounded-md bg-stone-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-stone-700 disabled:opacity-50"
      >
        {isPending ? "Enviando..." : "Criar convite e enviar email"}
      </button>
    </form>
  );
}
