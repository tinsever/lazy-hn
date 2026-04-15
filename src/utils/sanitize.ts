const ESCAPE_MAP: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#x27;",
};

const ESCAPE_RE = /[&<>"']/;

export function escapeHtml(str: string): string {
  if (!ESCAPE_RE.test(str)) return str;
  return str.replace(/[&<>"']/g, (ch) => ESCAPE_MAP[ch] ?? ch);
}

export function sanitizeText(text: string): string {
  return escapeHtml(text);
}

export function sanitizeTitle(title: string): string {
  return escapeHtml(title);
}

const ALLOWED_TAGS = new Set([
  "p",
  "a",
  "span",
  "i",
  "b",
  "em",
  "strong",
  "code",
  "pre",
  "br",
  "ul",
  "ol",
  "li",
  "div",
]);

export function sanitizeHtml(html: string): string {
  return html.replace(/<\/?([a-zA-Z]+)[^>]*>/g, (match, tag) => {
    const lower = tag.toLowerCase();
    if (ALLOWED_TAGS.has(lower)) return match;
    return "";
  });
}