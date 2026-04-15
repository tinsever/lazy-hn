import { timeAgo } from "../utils/time.ts";
import { sanitizeHtml, sanitizeTitle } from "../utils/sanitize.ts";
import { isExternalUrl } from "../utils/url.ts";
import { getInstantNavScript } from "./client-scripts.ts";
import type { StoryCard, CommentNode } from "../hn/normalize.ts";
import type { StoryPage } from "../hn/items.ts";

export function renderItemPage(data: StoryPage, _storyId?: number): string {
  const { story, comments, totalComments } = data;
  const title = sanitizeTitle(story.title);
  const domain = story.domain ? ` <span class="story-domain">(${story.domain})</span>` : "";
  const scoreText = story.score > 0 ? `${story.score} points` : "";
  const commentCountText = totalComments > 0 ? `${totalComments} comments` : "0 comments";
  const storyTextHtml = story.text ? `<div class="item-text">${sanitizeHtml(story.text)}</div>` : "";

  const titleHtml = isExternalUrl(story.url)
    ? `<span class="item-title"><a href="${story.url}" rel="noopener noreferrer">${title}</a>${domain}</span>`
    : `<span class="item-title">${title}</span>`;

  const commentsHtml = comments
    .map((c) => renderComment(c))
    .join("\n");
  const hnCommentUrl = `https://news.ycombinator.com/item?id=${story.id}`;

  const moreCommentsLink =
    data.commentIds.length > comments.length
      ? `<p class="more-comments"><a href="/item/${story.id}?all=1">Show all ${totalComments} comments</a></p>`
      : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} | Hacker News</title>
  <style>${getItemStyles()}</style>
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
    <div class="item-page">
      <div class="item-header">
        ${titleHtml}
        <div class="item-meta">
          ${scoreText} &bull; <a href="/user/${story.by}">${story.by}</a> &bull; ${timeAgo(story.time)} &bull; ${commentCountText}
        </div>
        ${storyTextHtml}
        <div class="item-actions">
          <a class="comment-button" href="${hnCommentUrl}">Write a comment on HN</a>
        </div>
      </div>
      <div class="comment-tree">
        ${commentsHtml}
      </div>
      ${moreCommentsLink}
    </div>
  </main>
  <footer class="footer">
    <p>lazy-hn &mdash; fast HN frontend &bull; <a href="https://news.ycombinator.com">original</a></p>
  </footer>
  <script>${getItemScript()}${getInstantNavScript()}</script>
</body>
</html>`;
}

function renderComment(c: CommentNode): string {
  if (c.deleted) {
    return `<div class="comment deleted">
  <div class="comment_head">[deleted] ${timeAgo(c.time)}</div>
</div>`;
  }

  if (c.dead) {
    return `<div class="comment dead">
  <div class="comment_head">[dead] ${timeAgo(c.time)}</div>
</div>`;
  }

  const expandBtn =
    c.childCount > 0
      ? `<button class="comment-replies-toggle" onclick="loadReplies(${c.id},this)">${c.childCount} replies</button>`
      : "";

  return `<div class="comment" id="comment-${c.id}">
  <div class="comment_head"><a href="/user/${c.by}">${c.by}</a> ${timeAgo(c.time)}</div>
  <div class="comment_text">${sanitizeHtml(c.text)}</div>
  ${expandBtn}
  <div class="replies-container" id="replies-${c.id}"></div>
</div>`;
}

function getItemStyles(): string {
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
.main { max-width: var(--max-width); margin: 0 auto; padding: 1rem 0; }
.item-page { max-width: 85vw; margin: 0 auto; }
.item-header { margin-bottom: 1rem; }
.item-title { font-size: 1.6rem; margin-bottom: 0.3rem; }
.item-meta { font-size: 1.2rem; color: var(--muted); }
.item-meta a { color: var(--muted); }
.item-text {
  margin-top: 0.8rem;
  margin-bottom: 0.8rem;
  font-size: 1.3rem;
  line-height: 1.55;
  white-space: normal;
}
.item-text p { margin-bottom: 0.8rem; }
.item-text a { text-decoration: underline; }
.item-actions { margin-top: 0.8rem; }
.comment-button {
  display: inline-block;
  padding: 0.5rem 0.9rem;
  border: 1px solid var(--accent);
  background: var(--accent);
  color: #000;
  font-size: 1.2rem;
  font-weight: bold;
}
.comment-button:visited { color: #000; }
.comment-button:hover { text-decoration: none; filter: brightness(0.95); }
.comment-tree { margin-left: 0; }
.comment { margin-bottom: 0.5rem; padding: 0.3rem 0; }
.comment_head { font-size: 1.1rem; color: var(--muted); margin-bottom: 0.2rem; }
.comment_head a { color: var(--muted); }
.comment_text { font-size: 1.3rem; line-height: 1.5; margin-bottom: 0.3rem; }
.comment_text p { margin-bottom: 0.5rem; }
.comment-replies-toggle { font-size: 1.1rem; color: var(--accent); cursor: pointer; background: none; border: none; font-family: var(--font-sans); padding: 0; }
.comment-replies-toggle:hover { text-decoration: underline; }
.replies-container:empty { display: none; }
.replies-container .comment { margin-left: 2rem; }
.footer { text-align: center; padding: 1rem; font-size: 1.1rem; color: var(--muted); border-top: 1px solid var(--border); margin-top: 2rem; }
.deleted { color: var(--muted); font-style: italic; }
.dead { color: var(--muted); font-style: italic; }
.more-comments { font-size: 1.2rem; padding: 0.5rem 0; }
.job-title a { color: var(--accent); }
  `.trim();
}

function getItemScript(): string {
  return `
window.loadReplies=function(parentId,btn){
  var container=document.getElementById('replies-'+parentId);
  if(!container||container.dataset.loaded)return;
  container.dataset.loaded='1';
  btn.textContent='loading...';
  fetch('/fragment/replies/'+parentId)
    .then(function(r){return r.text();})
    .then(function(html){
      container.innerHTML=html;
      btn.style.display='none';
    })
    .catch(function(){
      btn.textContent='retry';
      container.dataset.loaded='';
    });
};`;
}
