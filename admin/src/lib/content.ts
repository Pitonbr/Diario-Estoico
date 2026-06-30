import { createClient } from "@/lib/supabase/server";

export type ContentStatus = "pending_approval" | "approved" | "rejected" | "draft";

export interface ContentPiece {
  id: string;
  agent_key: string;
  platform: string;
  format: string;
  generated_date: string;
  title: string | null;
  body: string;
  hashtags: string[];
  cta: string | null;
  visual_notes: string | null;
  audio_notes: string | null;
  duration: string | null;
  slides: string[] | null;
  scheduled_time: string | null;
  metadata: Record<string, unknown>;
  teaching_key: string | null;
  status: ContentStatus;
  quality_rating: number | null;
  reviewed_at: string | null;
  created_at: string;
}

export async function getContentPieces(
  status?: ContentStatus | "all",
  agentKey?: string,
  limit = 50
): Promise<ContentPiece[]> {
  const db = await createClient();

  let query = db
    .from("content_pieces")
    .select("*")
    .order("generated_date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);

  if (status && status !== "all") query = query.eq("status", status);
  if (agentKey) query = query.eq("agent_key", agentKey);

  const { data, error } = await query;
  if (error) throw new Error(`Erro ao buscar content_pieces: ${error.message}`);
  return (data ?? []) as ContentPiece[];
}

export async function getContentPieceById(id: string): Promise<ContentPiece | null> {
  const db = await createClient();
  const { data, error } = await db.from("content_pieces").select("*").eq("id", id).single();
  if (error) return null;
  return data as ContentPiece;
}

export async function updateContentPieceStatus(
  id: string,
  status: "approved" | "rejected",
  qualityRating?: number
): Promise<void> {
  const db = await createClient();
  const update: Record<string, unknown> = {
    status,
    reviewed_at: new Date().toISOString(),
  };
  if (qualityRating !== undefined) update.quality_rating = qualityRating;

  const { error } = await db.from("content_pieces").update(update).eq("id", id);
  if (error) throw new Error(`Erro ao atualizar status: ${error.message}`);
}

export const STATUS_LABELS: Record<ContentStatus, string> = {
  pending_approval: "Aguardando",
  approved: "Aprovado",
  rejected: "Rejeitado",
  draft: "Rascunho",
};

export const STATUS_COLORS: Record<ContentStatus, string> = {
  pending_approval: "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  draft: "bg-stone-100 text-stone-600",
};
