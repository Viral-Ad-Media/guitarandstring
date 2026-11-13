import sanitizeHtml from "sanitize-html";

/**
 * Hosts that must never appear in stored content. The old WordPress site was
 * compromised with a cloaking script that pulled spam from a workers.dev host.
 */
const BLOCKED_HOST_PATTERNS = [/\.workers\.dev$/i, /business-dmtv/i];

function isAllowedUrl(url: string | undefined): boolean {
  if (!url) return false;
  if (url.startsWith("/") && !url.startsWith("//")) return true; // same-site
  if (url.startsWith("#") || url.startsWith("mailto:")) return true;
  try {
    const u = new URL(url);
    if (u.protocol !== "https:" && u.protocol !== "http:") return false;
    return !BLOCKED_HOST_PATTERNS.some((re) => re.test(u.hostname));
  } catch {
    return false;
  }
}

/** Sanitize article HTML before it is stored or rendered. */
export function sanitizePostHtml(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: [
      "h2", "h3", "h4", "p", "br", "hr", "strong", "em", "b", "i", "u", "s",
      "blockquote", "code", "pre", "ul", "ol", "li", "a", "img", "figure",
      "figcaption", "table", "thead", "tbody", "tr", "th", "td",
    ],
    allowedAttributes: {
      a: ["href", "title", "rel", "target"],
      img: ["src", "alt", "title", "width", "height", "loading"],
      th: ["align"],
      td: ["align"],
    },
    allowedSchemes: ["https", "http", "mailto"],
    allowProtocolRelative: false,
    exclusiveFilter: (frame) =>
      (frame.tag === "img" && !isAllowedUrl(frame.attribs.src)) ||
      (frame.tag === "a" && !!frame.attribs.href && !isAllowedUrl(frame.attribs.href)),
    transformTags: {
      img: (tagName, attribs) => ({
        tagName,
        attribs: { ...attribs, loading: "lazy" },
      }),
      a: (tagName, attribs) => {
        const external = /^https?:\/\//i.test(attribs.href ?? "");
        return {
          tagName,
          attribs: external
            ? { ...attribs, rel: "nofollow noopener noreferrer", target: "_blank" }
            : attribs,
        };
      },
    },
  });
}

/** Strip all HTML, for excerpts and meta descriptions. */
export function toPlainText(html: string): string {
  return sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} }).trim();
}

export function isSafeImagePath(src: string | null | undefined): src is string {
  return !!src && isAllowedUrl(src);
}
