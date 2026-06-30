import { getFinancialSummary, formatBRL, CATEGORY_LABELS } from "@/lib/transactions";
import { TransactionForm } from "./TransactionForm";
import { deleteTransactionAction } from "./actions";

export default async function FinanceiroPage() {
  const summary = await getFinancialSummary(3);
  const { totalIncomeCents, totalExpenseCents, balanceCents, transactions } = summary;

  const isPositive = balanceCents >= 0;

  const expenseByCategory: Record<string, number> = {};
  for (const tx of transactions.filter((t) => t.type === "expense")) {
    expenseByCategory[tx.category] = (expenseByCategory[tx.category] ?? 0) + tx.amount_cents;
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-stone-900">Financeiro</h1>
          <p className="mt-1 text-sm text-stone-500">Últimos 3 meses</p>
        </div>
        <TransactionForm />
      </div>

      {/* KPI cards */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-stone-200 bg-white p-5">
          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-stone-400">Total Receitas</p>
          <p className="text-2xl font-semibold text-green-600">{formatBRL(totalIncomeCents)}</p>
        </div>
        <div className="rounded-lg border border-stone-200 bg-white p-5">
          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-stone-400">Total Despesas</p>
          <p className="text-2xl font-semibold text-red-500">{formatBRL(totalExpenseCents)}</p>
        </div>
        <div className={`rounded-lg border p-5 ${isPositive ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}>
          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-stone-400">Saldo Líquido</p>
          <p className={`text-2xl font-semibold ${isPositive ? "text-green-700" : "text-red-600"}`}>
            {isPositive ? "+" : ""}{formatBRL(Math.abs(balanceCents))}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Transações — 2/3 */}
        <div className="lg:col-span-2">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-stone-500">
            Lançamentos
          </h2>

          {transactions.length === 0 ? (
            <div className="rounded-lg border border-dashed border-stone-300 bg-white p-10 text-center">
              <p className="text-sm text-stone-500">
                Nenhum lançamento ainda. Clique em{" "}
                <strong>&ldquo;Lançar transação&rdquo;</strong> para começar.
              </p>
              <p className="mt-2 text-xs text-stone-400">
                Dica: registre seus custos de sistema (Anthropic, Supabase, Vercel, Resend)
                mensalmente para ter o custo operacional real do negócio.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg border border-stone-200 bg-white">
              <table className="w-full text-sm">
                <thead className="bg-stone-50 text-left text-xs uppercase tracking-wide text-stone-400">
                  <tr>
                    <th className="px-4 py-3 font-medium">Data</th>
                    <th className="px-4 py-3 font-medium">Origem</th>
                    <th className="px-4 py-3 font-medium">Categoria</th>
                    <th className="px-4 py-3 font-medium text-right">Valor</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="border-t border-stone-100 hover:bg-stone-50">
                      <td className="px-4 py-3 text-stone-500">
                        {new Date(tx.occurred_at + "T12:00:00").toLocaleDateString("pt-BR")}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-stone-800">{tx.source}</p>
                        {tx.description && (
                          <p className="text-xs text-stone-400">{tx.description}</p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-stone-100 px-2 py-0.5 text-xs text-stone-600">
                          {CATEGORY_LABELS[tx.category]}
                        </span>
                      </td>
                      <td className={`px-4 py-3 text-right font-semibold ${tx.type === "income" ? "text-green-600" : "text-red-500"}`}>
                        {tx.type === "income" ? "+" : "-"}{formatBRL(tx.amount_cents)}
                      </td>
                      <td className="px-4 py-3">
                        <form action={async () => { "use server"; await deleteTransactionAction(tx.id); }}>
                          <button
                            type="submit"
                            className="text-xs text-stone-300 hover:text-red-500"
                            title="Excluir"
                          >
                            ✕
                          </button>
                        </form>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Breakdown de despesas — 1/3 */}
        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-stone-500">
            Despesas por Categoria
          </h2>

          {Object.keys(expenseByCategory).length === 0 ? (
            <div className="rounded-lg border border-dashed border-stone-200 bg-white p-6 text-center">
              <p className="text-xs text-stone-400">Nenhuma despesa registrada ainda.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {Object.entries(expenseByCategory)
                .sort(([, a], [, b]) => b - a)
                .map(([cat, cents]) => {
                  const pct = totalExpenseCents > 0 ? (cents / totalExpenseCents) * 100 : 0;
                  return (
                    <div key={cat} className="rounded-lg border border-stone-200 bg-white p-4">
                      <div className="mb-2 flex items-center justify-between text-sm">
                        <span className="text-stone-700">
                          {CATEGORY_LABELS[cat as keyof typeof CATEGORY_LABELS]}
                        </span>
                        <span className="font-semibold text-stone-900">{formatBRL(cents)}</span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-stone-100">
                        <div
                          className="h-full rounded-full bg-red-400"
                          style={{ width: `${pct.toFixed(1)}%` }}
                        />
                      </div>
                      <p className="mt-1 text-right text-xs text-stone-400">{pct.toFixed(0)}%</p>
                    </div>
                  );
                })}
            </div>
          )}

          <div className="mt-6 rounded-lg border border-dashed border-stone-200 bg-stone-50 p-4">
            <p className="mb-2 text-xs font-semibold text-stone-500">Integrações futuras</p>
            <ul className="flex flex-col gap-1 text-xs text-stone-400">
              <li>• Meta / Google Ads — gasto automático via API</li>
              <li>• Checkout de assinatura — receita automática</li>
              <li>• Relatório mensal gerado por IA</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
