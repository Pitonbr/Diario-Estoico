import type { ContentPiece } from "@/lib/content";

const GITHUB_API = "https://api.github.com";
const REPO = process.env.GITHUB_REPO ?? "Pitonbr/Diario-Estoico";
const TOKEN = process.env.GITHUB_TOKEN ?? "";

interface GitHubFileResponse {
  content: string;
  sha: string;
  name: string;
  path: string;
}

export async function getFileContent(filePath: string): Promise<{ content: string; sha: string }> {
  const res = await fetch(`${GITHUB_API}/repos/${REPO}/contents/${encodeURIComponent(filePath)}`, {
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`GitHub API error ${res.status}: ${await res.text()}`);
  }

  const data = (await res.json()) as GitHubFileResponse;
  const content = Buffer.from(data.content, "base64").toString("utf-8");
  return { content, sha: data.sha };
}

export async function updateFileContent(
  filePath: string,
  newContent: string,
  commitMessage: string,
  sha: string
): Promise<void> {
  const encodedContent = Buffer.from(newContent, "utf-8").toString("base64");

  const res = await fetch(`${GITHUB_API}/repos/${REPO}/contents/${encodeURIComponent(filePath)}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: commitMessage,
      content: encodedContent,
      sha,
    }),
  });

  if (!res.ok) {
    throw new Error(`GitHub API error ${res.status}: ${await res.text()}`);
  }
}

// Creates a new file (no sha needed — fails if file already exists)
export async function createFile(
  filePath: string,
  content: string,
  commitMessage: string
): Promise<void> {
  const encodedContent = Buffer.from(content, "utf-8").toString("base64");

  const res = await fetch(
    `${GITHUB_API}/repos/${REPO}/contents/${filePath.split("/").map(encodeURIComponent).join("/")}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: commitMessage, content: encodedContent }),
    }
  );

  // 422 = file already exists; treat as success (idempotent)
  if (!res.ok && res.status !== 422) {
    throw new Error(`GitHub API error ${res.status}: ${await res.text()}`);
  }
}

// ─── Content Archive ────────────────────────────────────────────────────────

function slugify(text: string, maxLen = 60): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, maxLen);
}

export async function archiveContentPiece(
  piece: ContentPiece,
  status: "approved" | "rejected"
): Promise<void> {
  const date = piece.generated_date;
  const slug = slugify(piece.title ?? `${piece.format}-${piece.platform}`);
  const filename = `${piece.agent_key}-${piece.format}-${slug}.json`;
  const filePath = `content-archive/${status}/${date}/${filename}`;

  const fileContent = JSON.stringify(
    {
      id: piece.id,
      agent: piece.agent_key,
      platform: piece.platform,
      format: piece.format,
      date: piece.generated_date,
      title: piece.title,
      body: piece.body,
      hashtags: piece.hashtags,
      cta: piece.cta,
      visualNotes: piece.visual_notes,
      audioNotes: piece.audio_notes,
      duration: piece.duration,
      slides: piece.slides,
      scheduledTime: piece.scheduled_time,
      metadata: piece.metadata,
      teachingKey: piece.teaching_key,
      qualityRating: piece.quality_rating,
      status,
      archivedAt: new Date().toISOString(),
    },
    null,
    2
  );

  await createFile(
    filePath,
    fileContent,
    `archive(${status}): ${piece.agent_key} ${piece.format} ${date}`
  );
}
