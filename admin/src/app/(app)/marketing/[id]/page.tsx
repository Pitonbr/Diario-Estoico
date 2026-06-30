import { notFound } from "next/navigation";
import Link from "next/link";
import { getContentPieceById, STATUS_LABELS, STATUS_COLORS } from "@/lib/content";
import { AGENTS_REGISTRY } from "@/lib/agents-registry";
import { approveAction, rejectAction } from "./actions";

export default async function ContentPiecePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const piece = await getContentPieceById(id);
  if (!piece) notFound();

  const agent = AGENTS_REGISTRY.find((a) => a.key === piece.agent_key);
  const isPending = piece.status === "pending_approval";

  return (
    <div className="mx-auto max-w-3xl">
      {/* Back */}
      <Link href="/marketing" className="mb-6 inline-flex items-center gap-1 text-sm text-stone-500 hover:text-stone-900">
        ← Voltar ao feed
      </Link>

      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <div className="mb-1 flex items-center gap-2 text-sm text-stone-500">
            <span>{agent?.emoji} {agent?.label ?? piece.agent_key}</span>
            <span>·</span>
            <span className="capitalize">{piece.platform} / {piece.format}</span>
            <span>·</span>
            <span>{piece.generated_date}</span>
          </div>
          <h1 className="text-xl font-semibold text-stone-900">
            {piece.title ?? `${piece.format} — ${piece.platform}`}
          </h1>
        </div>
        <span className={`shrink-0 rounded-full px-3 py-1 text-sm font-medium ${STATUS_COLORS[piece.status]}`}>
          {STATUS_LABELS[piece.status]}
        </span>
      </div>

      {/* Body */}
      <div className="mb-6 rounded-lg border border-stone-200 bg-white p-6">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-stone-400">Conteúdo</h2>
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-stone-800">{piece.body}</p>
      </div>

      {/* Slides */}
      {piece.slides && piece.slides.length > 0 && (
        <div className="mb-6 rounded-lg border border-stone-200 bg-white p-6">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-stone-400">Slides</h2>
          <ol className="flex flex-col gap-2">
            {piece.slides.map((slide, i) => (
              <li key={i} className="flex gap-3 text-sm text-stone-700">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-stone-100 text-xs font-medium text-stone-500">
                  {i + 1}
                </span>
                {slide}
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Metadata */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {piece.cta && (
          <div className="rounded-lg border border-stone-200 bg-white p-4">
            <p className="mb-1 text-xs font-semibold text-stone-400">CTA</p>
            <p className="text-sm text-stone-700">{piece.cta}</p>
          </div>
        )}
        {piece.visual_notes && (
          <div className="rounded-lg border border-stone-200 bg-white p-4">
            <p className="mb-1 text-xs font-semibold text-stone-400">Notas visuais</p>
            <p className="text-sm text-stone-700">{piece.visual_notes}</p>
          </div>
        )}
        {piece.duration && (
          <div className="rounded-lg border border-stone-200 bg-white p-4">
            <p className="mb-1 text-xs font-semibold text-stone-400">Duração</p>
            <p className="text-sm text-stone-700">{piece.duration}</p>
          </div>
        )}
        {piece.scheduled_time && (
          <div className="rounded-lg border border-stone-200 bg-white p-4">
            <p className="mb-1 text-xs font-semibold text-stone-400">Horário sugerido</p>
            <p className="text-sm text-stone-700">{piece.scheduled_time}</p>
          </div>
        )}
        {piece.hashtags?.length > 0 && (
          <div className="col-span-2 rounded-lg border border-stone-200 bg-white p-4">
            <p className="mb-1 text-xs font-semibold text-stone-400">Hashtags</p>
            <p className="text-sm text-stone-600">{piece.hashtags.join(" ")}</p>
          </div>
        )}
      </div>

      {/* Actions */}
      {isPending && (
        <div className="rounded-lg border border-stone-200 bg-white p-6">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-stone-400">
            Revisão
          </h2>

          {/* Approve with rating */}
          <div className="mb-4">
            <p className="mb-2 text-sm font-medium text-stone-700">Aprovar com avaliação de qualidade:</p>
            <div className="flex flex-wrap gap-2">
              {[5, 4, 3, 2, 1].map((rating) => (
                <form key={rating} action={async () => { "use server"; await approveAction(id, rating); }}>
                  <button
                    type="submit"
                    className="rounded-md border border-stone-200 bg-white px-4 py-2 text-sm hover:bg-green-50 hover:border-green-300 hover:text-green-700"
                  >
                    {"★".repeat(rating)} Aprovar ({rating})
                  </button>
                </form>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <form action={async () => { "use server"; await approveAction(id); }}>
              <button
                type="submit"
                className="rounded-md bg-green-600 px-6 py-2 text-sm font-medium text-white hover:bg-green-700"
              >
                ✓ Aprovar
              </button>
            </form>
            <form action={async () => { "use server"; await rejectAction(id); }}>
              <button
                type="submit"
                className="rounded-md border border-red-200 px-6 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
              >
                ✕ Rejeitar
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Reviewed info */}
      {!isPending && piece.reviewed_at && (
        <div className="rounded-lg border border-stone-200 bg-white p-4 text-sm text-stone-500">
          Revisado em {new Date(piece.reviewed_at).toLocaleString("pt-BR")}
          {piece.quality_rating && (
            <span className="ml-2 text-yellow-500">
              {"★".repeat(piece.quality_rating)}{"☆".repeat(5 - piece.quality_rating)}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
