import Link from "next/link";
import { getContentPieces, STATUS_LABELS, STATUS_COLORS, ContentStatus } from "@/lib/content";
import { AGENTS_REGISTRY } from "@/lib/agents-registry";

const TABS: { value: ContentStatus | "all"; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "pending_approval", label: "Aguardando" },
  { value: "approved", label: "Aprovados" },
  { value: "rejected", label: "Rejeitados" },
];

const FORMAT_EMOJI: Record<string, string> = {
  reels: "🎬",
  carousel: "🖼️",
  static_post: "📷",
  story: "⭕",
  short: "▶️",
  longform: "🎞️",
  tweet: "🐦",
  thread: "🧵",
  video_script: "☕",
  email: "📧",
};

export default async function MarketingPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const params = await searchParams;
  const activeTab = (params.status ?? "pending_approval") as ContentStatus | "all";

  const pieces = await getContentPieces(activeTab);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-stone-900">Marketing</h1>
        <Link
          href="/marketing/agents"
          className="rounded-md bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-700"
        >
          Ver Agentes →
        </Link>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 border-b border-stone-200">
        {TABS.map((tab) => (
          <Link
            key={tab.value}
            href={`/marketing?status=${tab.value}`}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.value
                ? "border-b-2 border-stone-900 text-stone-900"
                : "text-stone-500 hover:text-stone-700"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {pieces.length === 0 ? (
        <div className="rounded-lg border border-dashed border-stone-300 bg-white p-12 text-center">
          <p className="text-sm text-stone-500">
            Nenhuma peça encontrada.{" "}
            {activeTab === "pending_approval"
              ? "Execute um agente para gerar conteúdo."
              : "Altere o filtro acima."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {pieces.map((piece) => {
            const agent = AGENTS_REGISTRY.find((a) => a.key === piece.agent_key);
            return (
              <Link
                key={piece.id}
                href={`/marketing/${piece.id}`}
                className="flex flex-col rounded-lg border border-stone-200 bg-white p-4 hover:border-stone-400 hover:shadow-sm"
              >
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span className="text-xs font-medium text-stone-500">
                    {agent?.emoji ?? ""} {agent?.label ?? piece.agent_key}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[piece.status]}`}
                  >
                    {STATUS_LABELS[piece.status]}
                  </span>
                </div>

                <p className="mb-1 line-clamp-2 text-sm font-medium text-stone-900">
                  {FORMAT_EMOJI[piece.format] ?? "📄"}{" "}
                  {piece.title ?? `${piece.format} — ${piece.platform}`}
                </p>

                <p className="mb-3 line-clamp-3 text-xs text-stone-500">{piece.body}</p>

                <div className="mt-auto flex items-center justify-between text-xs text-stone-400">
                  <span>{piece.generated_date}</span>
                  <span className="capitalize">{piece.format}</span>
                </div>

                {piece.quality_rating && (
                  <div className="mt-1 text-xs text-yellow-500">
                    {"★".repeat(piece.quality_rating)}{"☆".repeat(5 - piece.quality_rating)}
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
