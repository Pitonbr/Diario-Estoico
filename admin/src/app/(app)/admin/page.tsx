import Link from "next/link";
import { getSubscribers } from "@/lib/subscribers";
import { checkIntegrations } from "@/lib/integrations";

export default async function AdminPage() {
  const [pendingSubs, integrations] = await Promise.all([
    getSubscribers({ approval: "pending" }),
    checkIntegrations(),
  ]);

  const errorCount = integrations.filter((i) => i.status === "error").length;

  const cards = [
    {
      href: "/admin/assinantes",
      emoji: "👥",
      label: "Assinantes",
      description: "Gerencie assinantes, mensagens e fila de aprovação de segurança",
      badge: pendingSubs.length > 0 ? `${pendingSubs.length} aguardando` : null,
      badgeColor: "bg-yellow-100 text-yellow-700",
    },
    {
      href: "/admin/integracoes",
      emoji: "🔌",
      label: "Integrações",
      description: "Status ao vivo de todos os serviços conectados ao sistema",
      badge: errorCount > 0 ? `${errorCount} com erro` : "Tudo OK",
      badgeColor: errorCount > 0 ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700",
    },
    {
      href: "/admin/logs",
      emoji: "📋",
      label: "Logs",
      description: "Histórico de execuções da newsletter e dos agentes de conteúdo",
      badge: null,
      badgeColor: "",
    },
  ];

  return (
    <div>
      <h1 className="mb-2 text-2xl font-semibold text-stone-900">Admin</h1>
      <p className="mb-8 text-sm text-stone-500">Configurações gerais, assinantes e saúde do sistema</p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="flex flex-col rounded-lg border border-stone-200 bg-white p-6 hover:border-stone-400 hover:shadow-sm"
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="text-2xl">{card.emoji}</span>
              {card.badge && (
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${card.badgeColor}`}>
                  {card.badge}
                </span>
              )}
            </div>
            <h2 className="mb-1 font-semibold text-stone-900">{card.label}</h2>
            <p className="text-xs text-stone-500">{card.description}</p>
          </Link>
        ))}
      </div>

      {/* Fila de segurança resumo */}
      {pendingSubs.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-stone-500">
            Fila de Segurança — Aguardando Aprovação
          </h2>
          <div className="overflow-hidden rounded-lg border border-yellow-200 bg-yellow-50">
            <table className="w-full text-sm">
              <thead className="bg-yellow-100 text-left text-xs uppercase tracking-wide text-yellow-600">
                <tr>
                  <th className="px-4 py-3">Contato</th>
                  <th className="px-4 py-3">Risco</th>
                  <th className="px-4 py-3">Motivo</th>
                  <th className="px-4 py-3">Data</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {pendingSubs.map((sub) => (
                  <tr key={sub.id} className="border-t border-yellow-100">
                    <td className="px-4 py-3 font-medium text-stone-800">
                      {sub.email ?? sub.phone}
                      {sub.name && <span className="block text-xs text-stone-400">{sub.name}</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${sub.signup_risk_score >= 80 ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}>
                        {sub.signup_risk_score}/100
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-stone-500">{sub.risk_notes}</td>
                    <td className="px-4 py-3 text-xs text-stone-400">
                      {new Date(sub.created_at).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="px-4 py-3">
                      <Link href="/admin/assinantes?filter=pending" className="text-xs text-stone-500 underline hover:text-stone-900">
                        Revisar →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
