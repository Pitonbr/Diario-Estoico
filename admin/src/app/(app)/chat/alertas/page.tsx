import Link from "next/link";
import { getChatAlerts, getChatAlertCounts } from "@/lib/chat";
import { AlertActions } from "@/components/AlertActions";

const STATUS_TABS = [
  { key: "pending", label: "Pendentes" },
  { key: "approved", label: "Aprovados" },
  { key: "user_blocked", label: "Usuário bloqueado" },
  { key: "conversation_ended", label: "Conversa encerrada" },
];

export default async function AlertasPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const status = searchParams.status || "pending";
  const [alerts, counts] = await Promise.all([
    getChatAlerts(status, 50),
    getChatAlertCounts(),
  ]);

  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <Link href="/chat" className="text-sm text-stone-400 hover:text-stone-700">
          ← Chat Estoico
        </Link>
        <h1 className="text-2xl font-semibold text-stone-900">Alertas de Segurança</h1>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 rounded-lg border border-stone-200 bg-white p-1 text-sm">
        {STATUS_TABS.map(tab => {
          const count = counts[tab.key as keyof typeof counts] ?? 0;
          const isActive = status === tab.key;
          return (
            <Link
              key={tab.key}
              href={`/chat/alertas?status=${tab.key}`}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded px-3 py-2 font-medium transition ${
                isActive ? "bg-stone-900 text-white" : "text-stone-500 hover:bg-stone-100"
              }`}
            >
              {tab.label}
              {count > 0 && (
                <span className={`rounded-full px-1.5 py-0.5 text-xs ${
                  isActive ? "bg-white/20 text-white" : "bg-stone-100 text-stone-600"
                }`}>
                  {count}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {alerts.length === 0 ? (
        <div className="rounded-lg border border-dashed border-stone-300 bg-white p-12 text-center">
          <p className="text-stone-500">Nenhum alerta com status &ldquo;{status}&rdquo;.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {alerts.map(a => (
            <AlertActions key={a.id} alert={a as Parameters<typeof AlertActions>[0]["alert"]} />
          ))}
        </div>
      )}
    </div>
  );
}
