import { marked } from "marked";
import { sanitizePostHtml } from "./sanitize";

export function markdownToSafeHtml(md: string): string {
  const html = marked.parse(md, { gfm: true, async: false }) as string;
  return sanitizePostHtml(html);
}
