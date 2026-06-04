export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return "";

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(dateString));
}

export function formatReadTime(content: unknown): string {
  if (!Array.isArray(content)) return "1 min read";

  const text = content
    .flatMap((block: { content?: { text?: string }[] }) =>
      (block.content ?? []).map((c) => c.text ?? ""),
    )
    .join(" ");

  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / 200));

  return `${minutes} min read`;
}