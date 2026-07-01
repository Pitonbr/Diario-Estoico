import Link from "next/link";
import { checkIntegrations } from "@/lib/integrations";

export const dynamic = "force-dynamic";

const STATUS_CONFIG = {
  ok:      { label: "OK",        color: "bg-green-100 text-green-700",  dot: "bg-green-500" },
  error:   { label: "Erro",      color: "bg-red-100 text-red-700",      dot: "bg-red-500" },
  paused:  { label: "Pausado",   color: "bg-yellow-100 text-yellow-700", dot: "bg-yellow-400" },
  unknown: { label: "Desconhecido", color: "bg-stone-100 text-stone-500", dot: "bg-stone-400" },
} as const;

export default async function IntegracoesPage() {
  const integrations = await checkIntegrations();

  const okCount = integrations.filter((i) => i.status === "ok").length;
  const errorCount = integrations.filter((i) => i.status === "error").length;

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <Link href="/admin" className="text-sm text-stone-500 hover:text-stone-900">← Admin</Link>
        <h1 className="text-2xl font-semibold text-stone-900">Integrações</h1>
      </div>

      {/* Summary */}
      <div className="mb-6 flex gap-4">
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3">
          <p className="text-xs text-green-600">Conectadas</p>
          <p className="text-xl font-semibold text-green-700">{okCount}</p>
        </div>
        {errorCount > 0 && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
            <p className="text-xs text-red-600">Com erro</p>
            <p className="text-xl font-semibold text-red-700">{errorCount}</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {integrations.map((integration) => {
          const cfg = STATUS_CONFIG[integration.status];
          return (
            <div key={integration.key} className="rounded-lg border border-stone-200 bg-white p-5">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{integration.emoji}</span>
                  <span className="font-medium text-stone-900">{integration.label}</span>
                </div>
                <span className={`flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${cfg.color}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
                  {cfg.label}
                </span>
              </div>

              <p className="mb-3 text-xs text-stone-500">{integration.message}</p>

              <div className="flex gap-2">
                {integration.dashboardUrl && (
                  <a
                    href={integration.dashboardUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded border border-stone-200 px-3 py-1 text-xs text-stone-600 hover:bg-stone-50"
                  >
                    Painel →
                  </a>
                )}
                {integration.docsUrl && (
                  <a
                    href={integration.docsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded border border-stone-200 px-3 py-1 text-xs text-stone-600 hover:bg-stone-50"
                  >
                    Acessar →
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-6 text-xs text-stone-400">
        Status verificados ao vivo a cada carregamento da página.
      </p>
    </div>
  );
}
