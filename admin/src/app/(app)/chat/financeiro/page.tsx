import Link from "next/link";
import {
  getChatFinancials,
  getChatFinancialSummary,
  getApiCostEstimate,
} from "@/lib/chat";
import { FinanceChatForm } from "@/components/FinanceChatForm";
import { deleteChatFinancialAction } from "../actions";

function formatBRL(cents: number) {
  return `R$ ${(cents / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

const CATEGORY_LABELS: Record<string, string> = {
  api_cost: "API Anthropic",
  infrastructure: "Infraestrutura",
  subscription: "Assinatura",
  marketing: "Marketing",
  other: "Outro",
};

export default async function ChatFinanceiroPage() {
  const [transactions, summary, apiCost] = await Promise.all([
    getChatFinancials(),
    getChatFinancialSummary(),
    getApiCostEstimate(),
  ]);

  const isPositive = summary.profit >= 0;

  const expenseByCategory: Record<string, number> = {};
  for (const tx of transactions.filter(t => t.type === "expense")) {
    expenseByCategory[tx.category] = (expenseByCategory[tx.category] ?? 0) + tx.amount_cents;
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/chat" className="text-sm text-stone-400 hover:text-stone-700">
            ← Chat Estoico
          </Link>
          <h1 className="text-2xl font-semibold text-stone-900">Financeiro — Chat Estoico</h1>
        </div>
        <FinanceChatForm />
      </div>

      {/* KPIs */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="rounded-lg border border-stone-200 bg-white p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-stone-400">Total Receitas</p>
          <p className="mt-1.5 text-2xl font-semibold text-green-600">{formatBRL(summary.revenue)}</p>
        </div>
        <div className="rounded-lg border border-stone-200 bg-white p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-stone-400">Total Despesas</p>
          <p className="mt-1.5 text-2xl font-semibold text-red-500">{formatBRL(summary.expenses)}</p>
        </div>
        <div className={`rounded-lg border p-5 ${isPositive ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}>
          <p className="text-xs font-medium uppercase tracking-wide text-stone-400">Saldo Líquido</p>
          <p className={`mt-1.5 text-2xl font-semibold ${isPositive ? "text-green-700" : "text-red-600"}`}>
            {isPositive ? "+" : ""}{formatBRL(Math.abs(summary.profit))}
          </p>
        </div>
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-stone-400">Custo API (est. mês)</p>
          <p className="mt-1.5 text-2xl font-semibold text-amber-700">
            {formatBRL(apiCost.estimatedCostCents)}
          </p>
          <p className="mt-0.5 text-xs text-amber-600">{apiCost.messageCount.toLocaleString("pt-BR")} msgs × $0.0008</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Lançamentos */}
        <div className="lg:col-span-2">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-stone-500">Lançamentos</h2>
          {transactions.length === 0 ? (
            <div className="rounded-lg border border-dashed border-stone-300 bg-white p-10 text-center">
              <p className="text-sm text-stone-500">
                Nenhum lançamento ainda. Use <strong>&ldquo;Lançar transação&rdquo;</strong> para registrar receitas e despesas.
              </p>
              <p className="mt-2 text-xs text-stone-400">
                Dica: registre mensalmente o custo da API Anthropic, Vercel e Supabase.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg border border-stone-200 bg-white">
              <table className="w-full text-sm">
                <thead className="bg-stone-50 text-left text-xs uppercase tracking-wide text-stone-400">
                  <tr>
                    <th className="px-4 py-3 font-medium">Data</th>
                    <th className="px-4 py-3 font-medium">Descrição</th>
                    <th className="px-4 py-3 font-medium">Categoria</th>
                    <th className="px-4 py-3 font-medium text-right">Valor</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {transactions.map(tx => (
                    <tr key={tx.id} className="border-t border-stone-100 hover:bg-stone-50">
                      <td className="px-4 py-3 text-stone-500">
                        {new Date(tx.occurred_at + "T12:00:00").toLocaleDateString("pt-BR")}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-stone-800">{tx.description ?? "—"}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-stone-100 px-2 py-0.5 text-xs text-stone-600">
                          {CATEGORY_LABELS[tx.category] ?? tx.category}
                        </span>
                      </td>
                      <td className={`px-4 py-3 text-right font-semibold ${tx.type === "revenue" ? "text-green-600" : "text-red-500"}`}>
                        {tx.type === "revenue" ? "+" : "-"}{formatBRL(tx.amount_cents)}
                      </td>
                      <td className="px-4 py-3">
                        <form
                          action={async () => {
                            "use server";
                            await deleteChatFinancialAction(tx.id);
                          }}
                        >
                          <button type="submit" className="text-xs text-stone-300 hover:text-red-500" title="Excluir">
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

        {/* Breakdown despesas */}
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
                  const pct = summary.expenses > 0 ? (cents / summary.expenses) * 100 : 0;
                  return (
                    <div key={cat} className="rounded-lg border border-stone-200 bg-white p-4">
                      <div className="mb-2 flex items-center justify-between text-sm">
                        <span className="text-stone-700">{CATEGORY_LABELS[cat] ?? cat}</span>
                        <span className="font-semibold text-stone-900">{formatBRL(cents)}</span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-stone-100">
                        <div className="h-full rounded-full bg-red-400" style={{ width: `${pct.toFixed(1)}%` }} />
                      </div>
                      <p className="mt-1 text-right text-xs text-stone-400">{pct.toFixed(0)}%</p>
                    </div>
                  );
                })}
            </div>
          )}

          <div className="mt-4 rounded-lg border border-dashed border-stone-200 bg-stone-50 p-4">
            <p className="mb-2 text-xs font-semibold text-stone-500">Estimativa automática de API</p>
            <p className="text-xs text-stone-400">
              Custo estimado com base no volume de mensagens deste mês usando Claude Haiku ($0.0008/msg). Para o custo real, consulte o dashboard da Anthropic e lance manualmente.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
