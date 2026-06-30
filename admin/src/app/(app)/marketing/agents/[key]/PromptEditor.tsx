"use client";

import { useState, useTransition } from "react";
import { savePromptAction } from "./actions";

interface Props {
  agentKey: string;
  filePath: string;
  initialContent: string;
  sha: string;
}

export function PromptEditor({ agentKey, filePath, initialContent, sha }: Props) {
  const [content, setContent] = useState(initialContent);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSave() {
    setSaved(false);
    setError(null);
    startTransition(async () => {
      try {
        await savePromptAction(filePath, sha, content, agentKey);
        setSaved(true);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Erro ao salvar");
      }
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-stone-500 font-mono">{filePath}</p>
        <button
          onClick={handleSave}
          disabled={isPending}
          className="rounded-md bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-700 disabled:opacity-50"
        >
          {isPending ? "Salvando..." : "Salvar e Commitar no GitHub"}
        </button>
      </div>

      <textarea
        value={content}
        onChange={(e) => { setContent(e.target.value); setSaved(false); }}
        rows={24}
        className="w-full rounded-lg border border-stone-200 p-4 font-mono text-xs leading-relaxed text-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-400"
        spellCheck={false}
      />

      {saved && (
        <p className="text-sm font-medium text-green-600">
          ✓ Salvo e commitado no GitHub com sucesso.
        </p>
      )}
      {error && (
        <p className="text-sm font-medium text-red-600">✕ {error}</p>
      )}
    </div>
  );
}
