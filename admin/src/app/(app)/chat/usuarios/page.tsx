import Link from "next/link";
import { getChatUsers } from "@/lib/chat";

function StatusBadge({ blockedAt }: { blockedAt: string | null }) {
  if (blockedAt) {
    return <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">Bloqueado</span>;
  }
  return <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">Ativo</span>;
}

function PlanBadge({ plan }: { plan: string }) {
  const colors: Record<string, string> = {
    free: "bg-stone-100 text-stone-600",
    pro: "bg-blue-100 text-blue-700",
    premium: "bg-purple-100 text-purple-700",
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${colors[plan] ?? "bg-stone-100 text-stone-600"}`}>
      {plan}
    </span>
  );
}

export default async function UsuariosPage() {
  const users = await getChatUsers(100);

  const active = users.filter(u => !u.blocked_at).length;
  const blocked = users.filter(u => u.blocked_at).length;

  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <Link href="/chat" className="text-sm text-stone-400 hover:text-stone-700">
          ← Chat Estoico
        </Link>
        <h1 className="text-2xl font-semibold text-stone-900">Usuários</h1>
      </div>

      <div className="mb-6 flex gap-4">
        <div className="rounded-lg border border-stone-200 bg-white px-5 py-4">
          <p className="text-xs uppercase tracking-wide text-stone-400">Total</p>
          <p className="text-2xl font-semibold text-stone-900">{users.length}</p>
        </div>
        <div className="rounded-lg border border-green-200 bg-green-50 px-5 py-4">
          <p className="text-xs uppercase tracking-wide text-stone-400">Ativos</p>
          <p className="text-2xl font-semibold text-green-700">{active}</p>
        </div>
        {blocked > 0 && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-5 py-4">
            <p className="text-xs uppercase tracking-wide text-stone-400">Bloqueados</p>
            <p className="text-2xl font-semibold text-red-600">{blocked}</p>
          </div>
        )}
      </div>

      {users.length === 0 ? (
        <div className="rounded-lg border border-dashed border-stone-300 bg-white p-12 text-center">
          <p className="text-stone-500">Nenhum usuário cadastrado ainda.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-stone-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-stone-50 text-left text-xs uppercase tracking-wide text-stone-400">
              <tr>
                <th className="px-4 py-3 font-medium">Usuário</th>
                <th className="px-4 py-3 font-medium">Plano</th>
                <th className="px-4 py-3 font-medium">Msgs/mês</th>
                <th className="px-4 py-3 font-medium">Cadastrado em</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-t border-stone-100 hover:bg-stone-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-stone-800">{u.display_name || "—"}</p>
                    <p className="text-xs text-stone-400">{u.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <PlanBadge plan={u.plan} />
                  </td>
                  <td className="px-4 py-3 text-stone-700">
                    {u.monthly_message_count ?? 0}
                  </td>
                  <td className="px-4 py-3 text-stone-500">
                    {new Date(u.created_at).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge blockedAt={u.blocked_at} />
                    {u.blocked_at && u.block_reason && (
                      <p className="mt-0.5 text-xs text-red-400" title={u.block_reason}>
                        {u.block_reason.slice(0, 30)}{u.block_reason.length > 30 ? "…" : ""}
                      </p>
                    )}
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
