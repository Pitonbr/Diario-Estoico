import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ResendButton } from "./resend-button";

interface FullContent {
  subjectLine: string;
  preheader?: string;
  editionLabel?: string;
  dayLabel?: string;
  dateFormatted?: string;
  quote?: { text: string; author: string; source: string };
  contextTitle?: string;
  contextBody?: string;
  applicationTitle?: string;
  applicationBody?: string;
  ctaQuestions?: string[];
  eventConnection?: string;
  bibliographicRef?: string;
}

async function getEdition(editionNumber: number) {
  const supabase = await createClient();

  const [{ data: row }, { count: totalSent }, { count: totalFailed }] =
    await Promise.all([
      supabase
        .from("sent_newsletters")
        .select(
          "id, edition_number, send_date, subject_line, philosopher, source_work, topic_tags, full_content, delivery_status"
        )
        .eq("edition_number", editionNumber)
        .limit(1)
        .single(),
      supabase
        .from("sent_newsletters")
        .select("id", { count: "exact", head: true })
        .eq("edition_number", editionNumber)
        .eq("delivery_status", "sent"),
      supabase
        .from("sent_newsletters")
        .select("id", { count: "exact", head: true })
        .eq("edition_number", editionNumber)
        .eq("delivery_status", "failed"),
    ]);

  return row ? { ...row, totalSent: totalSent ?? 0, totalFailed: totalFailed ?? 0 } : null;
}

export default async function EditionPage({
  params,
}: {
  params: Promise<{ edition: string }>;
}) {
  const { edition } = await params;
  const editionNumber = Number(edition);
  if (isNaN(editionNumber)) notFound();

  const data = await getEdition(editionNumber);
  if (!data) notFound();

  const c = (data.full_content ?? {}) as FullContent;
  const sendDate = data.send_date
    ? new Date(data.send_date + "T12:00:00Z").toLocaleDateString("pt-BR", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "—";

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <Link
          href="/diario-estoico/newsletter"
          className="text-xs text-stone-400 hover:text-stone-700"
        >
          ← Newsletter
        </Link>
        <div className="mt-3 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-mono text-stone-400">
              Edição #{editionNumber}
            </p>
            <h1 className="mt-1 text-xl font-semibold leading-tight text-stone-900">
              {data.subject_line}
            </h1>
            <p className="mt-1 text-sm text-stone-500">
              {data.philosopher} · {sendDate}
            </p>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-2">
            <div className="flex items-center gap-2 text-xs text-stone-500">
              <span className="rounded-full bg-green-50 px-2 py-0.5 text-green-600">
                {data.totalSent} enviados
              </span>
              {data.totalFailed > 0 && (
                <span className="rounded-full bg-red-50 px-2 py-0.5 text-red-600">
                  {data.totalFailed} falhas
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Ações */}
      <div className="mb-6 flex gap-2">
        <ResendButton editionNumber={editionNumber} />
      </div>

      {/* Conteúdo */}
      <div className="overflow-hidden rounded-lg border border-stone-200 bg-white">
        {/* Header */}
        <div className="border-b border-stone-100 bg-stone-900 px-6 py-5 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-amber-600">
            Diário Estoico
          </p>
          <p className="mt-1 text-xs text-stone-500">
            {c.editionLabel} · {c.dayLabel}
          </p>
          <p className="mt-0.5 text-xs text-stone-600">{c.dateFormatted}</p>
        </div>

        <div className="px-6 py-6 text-stone-700">
          {/* Quote */}
          {c.quote && (
            <blockquote className="mb-6 border-l-4 border-amber-500 pl-4">
              <p className="italic leading-relaxed text-stone-600">
                &ldquo;{c.quote.text}&rdquo;
              </p>
              <footer className="mt-2 text-xs text-stone-400">
                — {c.quote.author} · {c.quote.source}
              </footer>
            </blockquote>
          )}

          {/* Context */}
          {c.contextTitle && (
            <section className="mb-6">
              <h2 className="mb-2 text-xs font-bold uppercase tracking-widest text-amber-600">
                {c.contextTitle}
              </h2>
              {(c.contextBody ?? "").split("\n\n").map((p, i) => (
                <p key={i} className="mb-3 text-sm leading-relaxed text-stone-700">
                  {p}
                </p>
              ))}
            </section>
          )}

          {/* Event connection */}
          {c.eventConnection && (
            <p className="mb-6 rounded-md bg-stone-50 px-4 py-3 text-sm italic text-stone-500">
              {c.eventConnection}
            </p>
          )}

          {/* Application */}
          {c.applicationTitle && (
            <section className="mb-6">
              <h2 className="mb-2 text-xs font-bold uppercase tracking-widest text-amber-600">
                {c.applicationTitle}
              </h2>
              <p className="text-sm leading-relaxed text-stone-700">
                {c.applicationBody}
              </p>
            </section>
          )}

          {/* CTA Questions */}
          {(c.ctaQuestions ?? []).length > 0 && (
            <section className="mb-4 rounded-md border border-stone-100 bg-stone-50 p-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-stone-400">
                Reflexão
              </p>
              <ul className="space-y-2">
                {(c.ctaQuestions ?? []).map((q, i) => (
                  <li key={i} className="text-sm text-stone-600">
                    {q}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Bibliographic ref */}
          {c.bibliographicRef && (
            <p className="mt-4 text-xs italic text-stone-400">
              {c.bibliographicRef}
            </p>
          )}
        </div>
      </div>

      {/* Tags */}
      {data.topic_tags && (data.topic_tags as string[]).length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1">
          {(data.topic_tags as string[]).map((t, i) => (
            <span
              key={i}
              className="rounded-full bg-stone-100 px-2 py-0.5 text-xs text-stone-500"
            >
              {t.slice(0, 40)}{t.length > 40 ? "…" : ""}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
