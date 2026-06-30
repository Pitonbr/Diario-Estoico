"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { updateContentPieceStatus, getContentPieceById } from "@/lib/content";
import { archiveContentPiece } from "@/lib/github";

export async function approveAction(id: string, rating?: number) {
  await updateContentPieceStatus(id, "approved", rating);

  // Archive to GitHub (non-fatal)
  try {
    const piece = await getContentPieceById(id);
    if (piece) await archiveContentPiece(piece, "approved");
  } catch (e) {
    console.error("Falha ao arquivar no GitHub:", e);
  }

  revalidatePath("/marketing");
  revalidatePath(`/marketing/${id}`);
}

export async function rejectAction(id: string) {
  await updateContentPieceStatus(id, "rejected");

  // Archive to GitHub (non-fatal)
  try {
    const piece = await getContentPieceById(id);
    if (piece) await archiveContentPiece(piece, "rejected");
  } catch (e) {
    console.error("Falha ao arquivar no GitHub:", e);
  }

  revalidatePath("/marketing");
  redirect("/marketing");
}
