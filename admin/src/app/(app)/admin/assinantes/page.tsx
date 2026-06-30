import { getSubscribers } from "@/lib/subscribers";
import {
  approveSubscriberAction,
  rejectSubscriberAction,
  toggleActiveAction,
  deleteSubscriberAction,
} from "../actions";
import Link from "next/link";
import { MessageForm } from "./MessageForm";

const FILTER_TABS = [
  { value: "all", label: "Todos" },
  { value: "approved", label: "Ativos" },
  { value: "pending", label: "Aguardando" },
  { value: "rejected", label: "Rejeitados" },
] as const;

export default async function AssinantesPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const params = await searchParams;
  const filter = (params.filter ?? "all") as "all" | "approved" | "pending" | "rejected";

  const subscribers = await getSubscribers({ approval: filter });

  const pendingCount = (await getSubscribers({ approval: "pending" })).length;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin" className="text-sm text-stone-500 hover:text-stone-900">← Admin</Link>
          <h1 className="text-2xl font-semibold text-stone-900">Assinantes</h1>
        </div>
        <MessageForm subscribers={subscribers.filter(s => s.active && s.approval_status === "approved")} />
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 border-b border-stone-200">
        {FILTER_TABS.map((tab) => (
          <Link
            key={tab.value}
            href={`/admin/assinantes?filter=${tab.value}`}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              filter === tab.value
                ? "border-b-2 border-stone-900 text-stone-900"
                : "text-stone-500 hover:text-stone-700"
            }`}
          >
            {tab.label}
            {tab.value === "pending" && pendingCount > 0 && (
              <span className="ml-1.5 rounded-full bg-yellow-100 px-1.5 py-0.5 text-xs text-yellow-700">
                {pendingCount}
              </span>
            )}
          </Link>
        ))}
      </div>

      {subscribers.length === 0 ? (
        <div className="rounded-lg border border-dashed border-stone-300 bg-white p-10 text-center">
          <p className="text-sm text-stone-500">Nenhum assinante neste filtro.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-stone-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-stone-50 text-left text-xs uppercase tracking-wide text-stone-400">
              <tr>
                <th className="px-4 py-3">Contato</th>
                <th className="px-4 py-3">Canal</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Risco</th>
                <th className="px-4 py-3">Desde</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {subscribers.map((sub) => (
                <tr key={sub.id} className="border-t border-stone-100 hover:bg-stone-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-stone-800">{sub.email ?? sub.phone}</p>
                    {sub.name && <p className="text-xs text-stone-400">{sub.name}</p>}
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded bg-stone-100 px-2 py-0.5 text-xs capitalize text-stone-600">
                      {sub.channel}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      sub.approval_status === "approved" && sub.active
                        ? "bg-green-100 text-green-700"
                        : sub.approval_status === "pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-600"
                    }`}>
                      {sub.approval_status === "approved" && sub.active
                        ? "Ativo"
                        : sub.approval_status === "approved" && !sub.active
                        ? "Pausado"
                        : sub.approval_status === "pending"
                        ? "Aguardando"
                        : "Rejeitado"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {sub.signup_risk_score > 0 ? (
                      <span className={`text-xs font-medium ${sub.signup_risk_score >= 60 ? "text-red-500" : "text-stone-400"}`}>
                        {sub.signup_risk_score}/100
                        {sub.risk_notes && sub.risk_notes !== "OK" && (
                          <span className="ml-1 text-stone-300" title={sub.risk_notes}>ⓘ</span>
                        )}
                      </span>
                    ) : (
                      <span className="text-xs text-stone-300">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-stone-400">
                    {new Date(sub.created_at).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      {sub.approval_status === "pending" && (
                        <>
                          <form action={async () => { "use server"; await approveSubscriberAction(sub.id); }}>
                            <button type="submit" className="text-xs font-medium text-green-600 hover:underline">Aprovar</button>
                          </form>
                          <form action={async () => { "use server"; await rejectSubscriberAction(sub.id); }}>
                            <button type="submit" className="text-xs font-medium text-red-500 hover:underline">Rejeitar</button>
                          </form>
                        </>
                      )}
                      {sub.approval_status === "approved" && (
                        <form action={async () => { "use server"; await toggleActiveAction(sub.id, sub.active); }}>
                          <button type="submit" className="text-xs text-stone-500 hover:underline">
                            {sub.active ? "Pausar" : "Reativar"}
                          </button>
                        </form>
                      )}
                      <form action={async () => { "use server"; await deleteSubscriberAction(sub.id); }}>
                        <button type="submit" className="text-xs text-stone-300 hover:text-red-500" title="Excluir">
                          ✕
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
