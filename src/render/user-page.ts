import { timeAgo } from "../utils/time.ts";
import { sanitizeHtml } from "../utils/sanitize.ts";
import { getInstantNavScript } from "./client-scripts.ts";
import type { UserProfile } from "../hn/normalize.ts";

export function renderUserPage(user: UserProfile): string {
  const aboutHtml = user.about ? `<div class="user-about">${sanitizeHtml(user.about)}</div>` : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Profile: ${user.id} | Hacker News</title>
  <style>${getUserStyles()}</style>
</head>
<body>
  <header class="header">
    <div class="header-inner">
      <div class="header-left">
        <a href="/" class="logo">HN</a>
        <nav>
          <a href="/">top</a>
          <a href="/newest">new</a>
          <a href="/best">best</a>
          <a href="/ask">ask</a>
          <a href="/show">show</a>
          <a href="/jobs">jobs</a>
        </nav>
      </div>
      <a class="header-github" href="https://github.com/tinsever/lazy-hn" rel="noopener noreferrer">GitHub</a>
    </div>
  </header>
  <main class="main">
    <div class="user-page">
      <div class="user-header">
        <h1>${user.id}</h1>
      </div>
      <div class="user-detail">created: ${timeAgo(user.created)}</div>
      <div class="user-detail">karma: ${user.karma}</div>
      ${aboutHtml}
      <div class="user-submissions">
        <h2>Submissions</h2>
        <p>${user.submitted.length} items submitted</p>
      </div>
    </div>
  </main>
  <footer class="footer">
    <p>lazy-hn &mdash; fast HN frontend &bull; <a href="https://news.ycombinator.com">original</a></p>
  </footer>
  <script>${getInstantNavScript()}</script>
</body>
</html>`;
}

function getUserStyles(): string {
  return `
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
:root {
  --bg: #f6f6ef; --fg: #000; --muted: #828282; --accent: #ff6600;
  --link: #000; --link-visited: #828282; --card-bg: #fff; --border: #e0e0e0;
  --comment-bg: #fafafa; --font-sans: Verdana, Geneva, sans-serif;
}
html { font-size: 10px; }
body { background: var(--bg); color: var(--fg); font-family: var(--font-sans); font-size: 1.4rem; line-height: 1.6; }
a { color: var(--link); text-decoration: none; }
a:visited { color: var(--link-visited); }
a:hover { text-decoration: underline; }
.header { background: var(--accent); }
.header-inner {
  max-width: var(--max-width);
  margin: 0 auto;
  padding: 0.4rem 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}
.header-left { display: flex; align-items: center; gap: 1rem; min-width: 0; }
.header a { color: #000; font-weight: bold; }
.header .logo { font-size: 1.5rem; font-weight: bold; border: 1px solid #000; padding: 0 0.3rem; margin-right: 0.5rem; }
.header nav { display: flex; gap: 0.6rem; font-size: 1.2rem; }
.header nav a { color: #000; }
.header-github { font-size: 1.2rem; white-space: nowrap; }
.main { max-width: 85vw; margin: 0 auto; padding: 1rem 0; }
.user-page { max-width: 85vw; margin: 0 auto; }
.user-header h1 { font-size: 1.6rem; }
.user-detail { font-size: 1.3rem; color: var(--muted); margin: 0.3rem 0; }
.user-about { margin: 0.5rem 0; padding: 0.5rem; background: var(--comment-bg); border: 1px solid var(--border); }
.user-submissions { margin-top: 1rem; }
.user-submissions h2 { font-size: 1.4rem; }
.footer { text-align: center; padding: 1rem; font-size: 1.1rem; color: var(--muted); border-top: 1px solid var(--border); margin-top: 2rem; }
  `.trim();
}
