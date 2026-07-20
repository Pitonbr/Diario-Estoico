"use client";

import { useState, useTransition } from "react";
import { updateSocialMetricAction } from "./actions";

interface SocialRow {
  platform: string;
  followers: number;
  handle: string | null;
  profile_url: string | null;
  updated_at: string;
}

const PLATFORM_LABELS: Record<string, string> = {
  instagram: "Instagram",
  tiktok: "TikTok",
  youtube: "YouTube",
  facebook: "Facebook",
};

const PLATFORM_ICONS: Record<string, string> = {
  instagram: "📷",
  tiktok: "🎵",
  youtube: "▶️",
  facebook: "👤",
};

function PlatformRow({ row }: { row: SocialRow }) {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{ error?: string; success?: boolean } | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await updateSocialMetricAction(
        row.platform,
        Number(fd.get("followers")),
        fd.get("handle") as string,
        fd.get("profile_url") as string
      );
      setResult(res);
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 rounded-lg border border-stone-200 bg-white p-5 sm:flex-row sm:items-end"
    >
      <div className="flex items-center gap-2 sm:w-28">
        <span className="text-xl">{PLATFORM_ICONS[row.platform] ?? "🌐"}</span>
        <span className="font-medium text-stone-800">
          {PLATFORM_LABELS[row.platform] ?? row.platform}
        </span>
      </div>

      <div className="flex-1">
        <label className="mb-1 block text-xs text-stone-500">Seguidores</label>
        <input
          name="followers"
          type="number"
          min={0}
          defaultValue={row.followers}
          className="w-full rounded-md border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900"
        />
      </div>

      <div className="flex-1">
        <label className="mb-1 block text-xs text-stone-500">Handle</label>
        <input
          name="handle"
          placeholder="@handle"
          defaultValue={row.handle ?? ""}
          className="w-full rounded-md border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900"
        />
      </div>

      <div className="flex-1">
        <label className="mb-1 block text-xs text-stone-500">URL do perfil</label>
        <input
          name="profile_url"
          placeholder="https://..."
          defaultValue={row.profile_url ?? ""}
          className="w-full rounded-md border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900"
        />
      </div>

      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-700 disabled:opacity-50"
        >
          {isPending ? "..." : "Salvar"}
        </button>
        {result?.success && (
          <span className="text-xs text-green-600">Salvo!</span>
        )}
        {result?.error && (
          <span className="text-xs text-red-600">{result.error}</span>
        )}
      </div>
    </form>
  );
}

export function SocialMetricsForm({ metrics }: { metrics: SocialRow[] }) {
  return (
    <div className="space-y-3">
      {metrics.map((row) => (
        <PlatformRow key={row.platform} row={row} />
      ))}
    </div>
  );
}
