import { createClient } from "@/lib/supabase/server";
import { GiftInviteForm } from "./gift-invite-form";

async function getInvites() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("gift_invites")
    .select(
      "id, display_name, email, phone, products, duration_days, status, email_sent_at, activated_at, created_at"
    )
    .order("created_at", { ascending: false })
    .limit(100);
  return data ?? [];
}

const STATUS_LABELS: Record<string, string> = {
  pending: "Aguardando",
  activated: "Ativado",
  expired: "Expirado",
};

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  activated: "bg-green-100 text-green-700",
  expired: "bg-stone-100 text-stone-500",
};

const PRODUCT_LABELS: Record<string, string> = {
  newsletter: "Newsletter",
  chat: "Chat Estoico",
};

export default async function ConvitesPage() {
  const invites = await getInvites();

  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold text-stone-900">
        Convidar Usuário
      </h1>
      <p className="mb-8 text-sm text-stone-500">
        Crie um convite presente e envie por email. O usuário recebe um link
        personalizado com acesso gratuito por 7 ou 30 dias.
      </p>

      <div className="mb-10 rounded-lg border border-stone-200 bg-white p-6">
        <h2 className="mb-4 text-base font-semibold text-stone-900">
          Novo convite
        </h2>
        <GiftInviteForm />
      </div>

      <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-stone-400">
        Convites enviados
      </h2>

      {invites.length === 0 ? (
        <div className="rounded-lg border border-dashed border-stone-300 bg-white p-8 text-center">
          <p className="text-sm text-stone-500">Nenhum convite enviado ainda.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-stone-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-stone-50 text-left text-xs uppercase tracking-wide text-stone-400">
              <tr>
                <th className="px-4 py-3">Nome</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Produtos</th>
                <th className="px-4 py-3">Dias</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Enviado em</th>
                <th className="px-4 py-3">Ativado em</th>
              </tr>
            </thead>
            <tbody>
              {invites.map((inv) => (
                <tr key={inv.id} className="border-t border-stone-100">
                  <td className="px-4 py-3 font-medium text-stone-800">
                    {inv.display_name}
                    {inv.phone && (
                      <span className="block text-xs text-stone-400">
                        {inv.phone}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-stone-600">{inv.email}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {(inv.products as string[]).map((p) => (
                        <span
                          key={p}
                          className="rounded-full bg-stone-100 px-2 py-0.5 text-xs text-stone-600"
                        >
                          {PRODUCT_LABELS[p] ?? p}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-stone-600">
                    {inv.duration_days}d
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[inv.status] ?? ""}`}
                    >
                      {STATUS_LABELS[inv.status] ?? inv.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-stone-400">
                    {inv.email_sent_at
                      ? new Date(inv.email_sent_at).toLocaleDateString("pt-BR")
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-xs text-stone-400">
                    {inv.activated_at
                      ? new Date(inv.activated_at).toLocaleDateString("pt-BR")
                      : "—"}
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
