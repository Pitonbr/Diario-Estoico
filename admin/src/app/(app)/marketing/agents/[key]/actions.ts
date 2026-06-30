"use server";

import { revalidatePath } from "next/cache";
import { updateFileContent } from "@/lib/github";

export async function savePromptAction(
  filePath: string,
  sha: string,
  newContent: string,
  agentKey: string
) {
  await updateFileContent(
    filePath,
    newContent,
    `feat(prompts): atualizar prompt ${agentKey} via painel admin`,
    sha
  );
  revalidatePath(`/marketing/agents/${agentKey}`);
}
