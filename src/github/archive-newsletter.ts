import { NewsletterContent } from "../agent/content-generator";

const GITHUB_API = "https://api.github.com";
const REPO = process.env.GITHUB_REPO ?? "Pitonbr/Diario-Estoico";
const TOKEN = process.env.GITHUB_TOKEN ?? "";

interface NewsletterRecord {
  editionNumber: number;
  sendDate: string;
  philosopher: string;
  sourceWork: string;
  domain: string;
  content: NewsletterContent;
}

function buildMarkdown(rec: NewsletterRecord): string {
  const { editionNumber, sendDate, philosopher, sourceWork, domain, content } = rec;

  const frontmatter = [
    "---",
    `edition: ${editionNumber}`,
    `date: ${sendDate}`,
    `philosopher: "${philosopher}"`,
    `work: "${sourceWork}"`,
    `domain: ${domain}`,
    `subject: "${content.subjectLine}"`,
    "---",
  ].join("\n");

  const sections = [
    frontmatter,
    "",
    `# ${content.subjectLine}`,
    `*${content.dateFormatted} — Edição #${editionNumber}*`,
    "",
    "---",
    "",
    "## A Citação",
    "",
    `> ${content.quote.text}`,
    `> — ${content.quote.author}, ${content.quote.source}`,
    "",
    `## ${content.contextTitle}`,
    "",
    content.contextBody,
    "",
    `## ${content.applicationTitle}`,
    "",
    content.applicationBody,
    "",
  ];

  if (content.ctaQuestions?.length > 0) {
    sections.push("## Reflexões do Dia", "");
    content.ctaQuestions.forEach((q) => sections.push(`- ${q}`));
    sections.push("");
  }

  if (content.eventConnection) {
    sections.push("## Conexão com o Dia", "", content.eventConnection, "");
  }

  sections.push("---", "", `*Referência: ${content.bibliographicRef}*`);

  return sections.join("\n");
}

async function createGitHubFile(filePath: string, content: string, message: string): Promise<void> {
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
      body: JSON.stringify({ message, content: encodedContent }),
    }
  );

  // 422 = file already exists; idempotent
  if (!res.ok && res.status !== 422) {
    throw new Error(`GitHub error ${res.status}: ${await res.text()}`);
  }
}

export async function archiveNewsletter(rec: NewsletterRecord): Promise<void> {
  if (!TOKEN) {
    console.warn("   ⚠️  GITHUB_TOKEN não configurado — newsletter não arquivada no GitHub.");
    return;
  }

  const paddedEdition = String(rec.editionNumber).padStart(4, "0");
  const filename = `${rec.sendDate}-edicao-${paddedEdition}.md`;
  const filePath = `newsletters/${filename}`;
  const markdown = buildMarkdown(rec);

  await createGitHubFile(
    filePath,
    markdown,
    `newsletter: adicionar edição #${rec.editionNumber} de ${rec.sendDate}`
  );

  console.log(`   ✓ Newsletter arquivada em newsletters/${filename}`);
}
