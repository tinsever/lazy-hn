import { timeAgo } from "../utils/time.ts";
import { sanitizeHtml } from "../utils/sanitize.ts";
import type { CommentNode } from "../hn/normalize.ts";

export function renderCommentFragment(comment: CommentNode): string {
  if (comment.deleted) {
    return `<div class="comment deleted"><div class="comment_head">[deleted] ${timeAgo(comment.time)}</div></div>`;
  }
  if (comment.dead) {
    return `<div class="comment dead"><div class="comment_head">[dead] ${timeAgo(comment.time)}</div></div>`;
  }

  const expandBtn =
    comment.childCount > 0
      ? `<button class="comment-replies-toggle" onclick="loadReplies(${comment.id},this)">${comment.childCount} replies</button>`
      : "";

  return `<div class="comment" id="comment-${comment.id}">
  <div class="comment_head"><a href="/user/${comment.by}">${comment.by}</a> ${timeAgo(comment.time)}</div>
  <div class="comment_text">${sanitizeHtml(comment.text)}</div>
  ${expandBtn}
  <div class="replies-container" id="replies-${comment.id}"></div>
</div>`;
}

export function renderRepliesFragment(comments: CommentNode[]): string {
  return comments.map((c) => renderCommentFragment(c)).join("\n");
}