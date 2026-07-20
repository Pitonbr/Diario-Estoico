"use client";

import { useState } from "react";
import { resolveAlertAction } from "@/app/(app)/chat/actions";

const SEVERITY_COLORS: Record<string, string> = {
  critical: "bg-red-100 text-red-700 border-red-200",
  high: "bg-orange-100 text-orange-700 border-orange-200",
  medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
};

const TYPE_LABELS: Record<string, string> = {
  homicide: "🔪 Homicídio",
  threats: "⚠️ Ameaças",
  racism: "🚫 Racismo",
  child_safety: "🚨 Segurança infantil",
  abortion: "⚕️ Aborto",
  suicidal_ideation: "💔 Ideação suicida",
  crisis_detected: "🆘 Crise detectada",
};

export function AlertActions({
  alert,
}: {
  alert: {
    id: string;
    alert_type: string;
    severity: string;
    trigger_message: string;
    status: string;
    created_at: string;
    user_id: string;
    conversation_id: string;
  };
}) {
  const [expanded, setExpanded] = useState(false);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState<string | null>(null);

  const severityClass = SEVERITY_COLORS[alert.severity] ?? "bg-stone-100 text-stone-700";

  async function act(action: string) {
    setLoading(action);
    const fd = new FormData();
    fd.set("alertId", alert.id);
    fd.set("action", action);
    fd.set("notes", notes);
    await resolveAlertAction(fd);
    setLoading(null);
  }

  const timestamp = new Date(alert.created_at).toLocaleString("pt-BR", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });

  return (
    <div className={`rounded-lg border p-4 ${severityClass}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2 text-sm font-semibold">
            <span>{TYPE_LABELS[alert.alert_type] ?? alert.alert_type}</span>
            <span className="rounded-full bg-white/60 px-2 py-0.5 text-xs">
              {alert.severity.toUpperCase()}
            </span>
            <span className="text-xs font-normal opacity-70">{timestamp}</span>
          </div>

          <p
            className="mt-2 cursor-pointer text-sm opacity-90"
            onClick={() => setExpanded(e => !e)}
          >
            {expanded
              ? alert.trigger_message
              : alert.trigger_message.slice(0, 120) + (alert.trigger_message.length > 120 ? "…" : "")}
          </p>

          <div className="mt-1 flex gap-3 text-xs opacity-70">
            <span>Usuário: {alert.user_id.slice(0, 8)}…</span>
            {alert.conversation_id && (
              <span>Conversa: {alert.conversation_id.slice(0, 8)}…</span>
            )}
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <input
          type="text"
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Notas (opcional)…"
          className="flex-1 min-w-40 rounded border border-white/40 bg-white/60 px-2 py-1 text-xs text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-stone-400"
        />
        <button
          onClick={() => act("approve")}
          disabled={!!loading}
          className="rounded bg-green-600 px-3 py-1 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-50"
        >
          {loading === "approve" ? "…" : "✓ Aprovar"}
        </button>
        <button
          onClick={() => act("end_conversation")}
          disabled={!!loading}
          className="rounded bg-amber-600 px-3 py-1 text-xs font-medium text-white hover:bg-amber-700 disabled:opacity-50"
        >
          {loading === "end_conversation" ? "…" : "⏹ Encerrar conversa"}
        </button>
        <button
          onClick={() => act("block_user")}
          disabled={!!loading}
          className="rounded bg-red-700 px-3 py-1 text-xs font-medium text-white hover:bg-red-800 disabled:opacity-50"
        >
          {loading === "block_user" ? "…" : "🔒 Bloquear usuário"}
        </button>
      </div>
    </div>
  );
}
