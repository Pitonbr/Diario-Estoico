"use client";

import { useState, useTransition } from "react";
import { resendNewsletterAction } from "../actions";

export function ResendButton({ editionNumber }: { editionNumber: number }) {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{ error?: string; success?: boolean; sent?: number } | null>(null);
  const [confirming, setConfirming] = useState(false);

  function handleClick() {
    if (!confirming) {
      setConfirming(true);
      return;
    }
    setConfirming(false);
    startTransition(async () => {
      const res = await resendNewsletterAction(editionNumber);
      setResult(res);
    });
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleClick}
        disabled={isPending}
        className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
          confirming
            ? "bg-red-600 text-white hover:bg-red-700"
            : "bg-stone-900 text-white hover:bg-stone-700"
        } disabled:opacity-50`}
      >
        {isPending
          ? "Enviando..."
          : confirming
          ? "Confirmar reenvio a todos os assinantes?"
          : "Reenviar a todos"}
      </button>
      {confirming && !isPending && (
        <button
          onClick={() => setConfirming(false)}
          className="text-sm text-stone-400 hover:text-stone-700"
        >
          Cancelar
        </button>
      )}
      {result?.success && (
        <span className="text-sm text-green-600">
          Enviado para {result.sent} assinante{result.sent !== 1 ? "s" : ""}!
        </span>
      )}
      {result?.error && (
        <span className="text-sm text-red-600">{result.error}</span>
      )}
    </div>
  );
}
