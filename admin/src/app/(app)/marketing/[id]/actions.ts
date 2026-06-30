"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { updateContentPieceStatus } from "@/lib/content";

export async function approveAction(id: string, rating?: number) {
  await updateContentPieceStatus(id, "approved", rating);
  revalidatePath("/marketing");
  revalidatePath(`/marketing/${id}`);
}

export async function rejectAction(id: string) {
  await updateContentPieceStatus(id, "rejected");
  revalidatePath("/marketing");
  redirect("/marketing");
}
