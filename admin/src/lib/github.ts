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
