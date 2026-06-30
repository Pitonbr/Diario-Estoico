"use client";

import { useState, useTransition } from "react";
import { sendMessageAction } from "../actions";
import type { Subscriber } from "@/lib/subscribers";

interface Props {
  subscribers: Subscriber[];
}

export function MessageForm({ subscribers }: Props) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"all" | "individual">("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  const emailSubs = subscribers.filter((s) => s.channel === "email");

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const data = new FormData(form);

    const ids = mode === "all" ? emailSubs.map((s) => s.id) : [...selectedIds];
    ids.forEach((id) => data.append("recipient_ids", id));
    data.set("channel", "email");

    startTransition(async () => {
      try {
        await sendMessageAction(data);
        setSuccess(true);
        setOpen(false);
        form.reset();
        setSelectedIds(new Set());
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao enviar");
      }
    });
  }

  if (!open) {
    return (
      <div className="flex items-center gap-2">
        {success && <span className="text-sm text-green-600">✓ Mensagem enviada</span>}
        <button
          onClick={() => { setOpen(true); setSuccess(false); }}
          className="rounded-md bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-700"
        >
          Enviar mensagem
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold text-stone-900">Enviar mensagem</h2>
          <button onClick={() => setOpen(false)} className="text-stone-400 hover:text-stone-700">✕</button>
        </div>

        {/* Destinatários */}
        <div className="mb-4">
          <div className="mb-2 flex gap-2">
            <button
              type="button"
              onClick={() => setMode("all")}
              className={`rounded px-3 py-1.5 text-sm ${mode === "all" ? "bg-stone-900 text-white" : "border border-stone-200 text-stone-600"}`}
            >
              Todos ({emailSubs.length})
            </button>
            <button
              type="button"
              onClick={() => setMode("individual")}
              className={`rounded px-3 py-1.5 text-sm ${mode === "individual" ? "bg-stone-900 text-white" : "border border-stone-200 text-stone-600"}`}
            >
              Selecionar
            </button>
          </div>

          {mode === "individual" && (
            <div className="max-h-40 overflow-y-auto rounded-lg border border-stone-200 p-2">
              {emailSubs.length === 0 ? (
                <p className="text-xs text-stone-400 p-2">Nenhum assinante de email ativo.</p>
              ) : emailSubs.map((s) => (
                <label key={s.id} className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 hover:bg-stone-50">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(s.id)}
                    onChange={() => toggleSelect(s.id)}
                    className="rounded"
                  />
                  <span className="text-sm text-stone-700">{s.email}</span>
                  {s.name && <span className="text-xs text-stone-400">{s.name}</span>}
                </label>
              ))}
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-stone-600">Assunto *</label>
            <input
              name="subject"
              required
              placeholder="Assunto do email"
              className="w-full rounded-md border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-stone-600">Mensagem *</label>
            <textarea
              name="body"
              required
              rows={5}
              placeholder="Texto do email..."
              className="w-full rounded-md border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setOpen(false)} className="px-4 py-2 text-sm text-stone-500 hover:text-stone-700">
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending || (mode === "individual" && selectedIds.size === 0)}
              className="rounded-md bg-stone-900 px-6 py-2 text-sm font-medium text-white hover:bg-stone-700 disabled:opacity-50"
            >
              {isPending ? "Enviando..." : `Enviar${mode === "individual" ? ` (${selectedIds.size})` : ""}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
