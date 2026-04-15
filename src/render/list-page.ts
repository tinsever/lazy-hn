import { timeAgo } from "../utils/time.ts";
import { formatNumber } from "../utils/time.ts";
import { sanitizeTitle } from "../utils/sanitize.ts";
import { isExternalUrl } from "../utils/url.ts";
import { getInstantNavScript } from "./client-scripts.ts";
import type { StoryCard } from "../hn/normalize.ts";

export function renderListPage(
  stories: StoryCard[],
  type: string,
  page: number,
  total: number,
): string {
  const perPage = 30;
  const startRank = (page - 1) * perPage;

  const listItems = stories
    .map((story, i) => renderStoryItem(story, startRank + i + 1))
    .join("\n");

  const paginationHtml = renderPagination(type, page, total, perPage);
  const typeLabel = listTypeLabel(type);
  const title = typeLabel === "top" ? "Hacker News" : `${typeLabel} | Hacker News`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>${getInlineStyles()}</style>
</head>
<body>
  <header class="header">
    <a href="/" class="logo">HN</a>
    <nav>
      <a href="/">top</a>
      <a href="/newest">new</a>
      <a href="/best">best</a>
      <a href="/ask">ask</a>
      <a href="/show">show</a>
      <a href="/jobs">jobs</a>
    </nav>
  </header>
  <main class="main">
    <ol class="story-list">
      ${listItems}
    </ol>
    ${paginationHtml}
  </main>
  <footer class="footer">
    <p>lazy-hn &mdash; fast HN frontend &bull; <a href="https://news.ycombinator.com">original</a></p>
  </footer>
  <script>${getInstantNavScript()}</script>
</body>
</html>`;
}

function listTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    top: "top",
    newest: "newest",
    best: "best",
    ask: "ask",
    show: "show",
    jobs: "jobs",
  };
  return labels[type] ?? type;
}

function renderStoryItem(story: StoryCard, rank: number): string {
  const title = sanitizeTitle(story.title);
  const isJob = story.type === "job";
  const domain = story.domain ? ` <span class="story-domain">(${story.domain})</span>` : "";
  const commentText = story.descendants > 0 ? `${story.descendants}&nbsp;comments` : "discuss";
  const scoreText = story.score > 0 ? `${story.score} points` : "";

  const titleLink = isJob
    ? `<span class="job-title"><a href="/item/${story.id}">${title}</a></span>`
    : isExternalUrl(story.url)
      ? `<a href="${story.url}" rel="noopener noreferrer">${title}</a>${domain}`
      : `<a href="/item/${story.id}">${title}</a>`;

  const metaParts: string[] = [];
  if (scoreText && !isJob) metaParts.push(scoreText);
  metaParts.push(`<a href="/user/${story.by}">${story.by}</a>`);
  metaParts.push(timeAgo(story.time));

  return `<li class="story-item">
  <span class="story-rank">${rank}.</span>
  <div class="story-info">
    <div class="story-title">${titleLink}</div>
    <div class="story-meta">${metaParts.join(" &bull; ")} &bull; <a href="/item/${story.id}" class="story-comments-link">${commentText}</a></div>
  </div>
</li>`;
}

function renderPagination(
  type: string,
  page: number,
  total: number,
  perPage: number,
): string {
  const maxPage = Math.ceil(total / perPage);
  const links: string[] = [];

  if (page > 1) {
    const prevPath = page === 2 && type === "top" ? "/" : getListPath(type, page - 1);
    links.push(`<a href="${prevPath}">&lt; prev</a>`);
  }

  if (page < maxPage) {
    links.push(`<a href="${getListPath(type, page + 1)}">next &gt;</a>`);
  }

  if (links.length === 0) return "";
  return `<div class="pagination">${links.join(" ")}</div>`;
}

function getListPath(type: string, page: number): string {
  if (type === "top") {
    return page === 1 ? "/" : `/news?p=${page}`;
  }
  return `/${type}?p=${page}`;
}

function getInlineStyles(): string {
  return `
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
:root {
  --bg: #f6f6ef; --fg: #000; --muted: #828282; --accent: #ff6600;
  --link: #000; --link-visited: #828282; --card-bg: #fff; --border: #e0e0e0;
  --comment-bg: #fafafa; --font-sans: Verdana, Geneva, sans-serif;
  --font-mono: "Courier New", monospace; --max-width: 85vw;
}
html { font-size: 10px; -webkit-text-size-adjust: 100%; }
body { background: var(--bg); color: var(--fg); font-family: var(--font-sans); font-size: 1.4rem; line-height: 1.6; min-height: 100vh; }
a { color: var(--link); text-decoration: none; }
a:visited { color: var(--link-visited); }
a:hover { text-decoration: underline; }
.header { background: var(--accent); padding: 0.4rem 1rem; display: flex; align-items: center; gap: 1rem; }
.header a { color: #000; font-weight: bold; }
.header .logo { font-size: 1.5rem; font-weight: bold; border: 1px solid #000; padding: 0 0.3rem; margin-right: 0.5rem; }
.header nav { display: flex; gap: 0.6rem; font-size: 1.2rem; }
.header nav a { color: #000; }
.main { max-width: var(--max-width); margin: 0 auto; padding: 1rem 0; }
.story-list { list-style: none; }
.story-item { display: flex; align-items: baseline; padding: 0.3rem 0; gap: 0.5rem; }
.story-rank { color: var(--muted); min-width: 3rem; text-align: right; font-size: 1.3rem; }
.story-info { flex: 1; }
.story-title a { font-size: 1.4rem; }
.story-domain { color: var(--muted); font-size: 1.1rem; margin-left: 0.3rem; }
.story-meta { font-size: 1.1rem; color: var(--muted); }
.story-meta a { color: var(--muted); }
.story-meta a:hover { text-decoration: underline; }
.story-comments-link { color: var(--muted); font-size: 1.1rem; }
.pagination { padding: 1rem 0; font-size: 1.3rem; }
.pagination a { margin-right: 1rem; }
.item-page { max-width: 85vw; margin: 0 auto; }
.item-header { margin-bottom: 1rem; }
.item-title { font-size: 1.6rem; margin-bottom: 0.3rem; }
.item-meta { font-size: 1.2rem; color: var(--muted); }
.item-meta a { color: var(--muted); }
.comment-tree { margin-left: 2rem; }
.comment { margin-bottom: 0.5rem; padding: 0.3rem 0; }
.comment_head { font-size: 1.1rem; color: var(--muted); margin-bottom: 0.2rem; }
.comment_head a { color: var(--muted); }
.comment_text { font-size: 1.3rem; line-height: 1.5; margin-bottom: 0.3rem; }
.comment_text p { margin-bottom: 0.5rem; }
.comment-replies-toggle { font-size: 1.1rem; color: var(--accent); cursor: pointer; background: none; border: none; font-family: var(--font-sans); padding: 0; }
.comment-replies-toggle:hover { text-decoration: underline; }
.replies-container:empty { display: none; }
.user-page { max-width: 85vw; margin: 0 auto; }
.user-header h1 { font-size: 1.6rem; }
.user-detail { font-size: 1.3rem; color: var(--muted); margin: 0.3rem 0; }
.user-about { margin: 0.5rem 0; padding: 0.5rem; background: var(--comment-bg); border: 1px solid var(--border); }
.footer { text-align: center; padding: 1rem; font-size: 1.1rem; color: var(--muted); border-top: 1px solid var(--border); margin-top: 2rem; }
.deleted { color: var(--muted); font-style: italic; }
.dead { color: var(--muted); font-style: italic; }
.job-title a { color: var(--accent); }
  `.trim();
}

