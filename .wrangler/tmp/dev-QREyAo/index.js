var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// wrangler-modules-watch:wrangler:modules-watch
var init_wrangler_modules_watch = __esm({
  "wrangler-modules-watch:wrangler:modules-watch"() {
    init_modules_watch_stub();
  }
});

// node_modules/wrangler/templates/modules-watch-stub.js
var init_modules_watch_stub = __esm({
  "node_modules/wrangler/templates/modules-watch-stub.js"() {
    init_wrangler_modules_watch();
  }
});

// src/cache/keys.ts
function itemKey(id) {
  return `item:${id}`;
}
function userKey(id) {
  return `user:${id}`;
}
var TTL;
var init_keys = __esm({
  "src/cache/keys.ts"() {
    "use strict";
    init_modules_watch_stub();
    TTL = {
      LIST: 90,
      HOT_ITEM: 600,
      COLD_ITEM: 3600,
      COMMENT: 120,
      USER: 3600,
      HTML_LIST: 90,
      HTML_STORY: 120,
      HTML_USER: 600,
      HTML_FRAGMENT: 120
    };
    __name(itemKey, "itemKey");
    __name(userKey, "userKey");
  }
});

// src/hn/client.ts
async function hnFetch(path) {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT);
    const res = await fetch(`${HN_API_BASE}${path}`, {
      signal: controller.signal,
      headers: { "User-Agent": "lazy-hn/1.0" }
    });
    clearTimeout(timer);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}
async function fetchListIds(type) {
  const data = await hnFetch(`/${type}.json`);
  return data ?? [];
}
async function fetchItem(id) {
  return hnFetch(`/item/${id}.json`);
}
async function fetchUser(id) {
  return hnFetch(`/user/${id}.json`);
}
async function fetchUpdates() {
  return hnFetch("/updates.json");
}
var HN_API_BASE, FETCH_TIMEOUT;
var init_client = __esm({
  "src/hn/client.ts"() {
    "use strict";
    init_modules_watch_stub();
    HN_API_BASE = "https://hacker-news.firebaseio.com/v0";
    FETCH_TIMEOUT = 5e3;
    __name(hnFetch, "hnFetch");
    __name(fetchListIds, "fetchListIds");
    __name(fetchItem, "fetchItem");
    __name(fetchUser, "fetchUser");
    __name(fetchUpdates, "fetchUpdates");
  }
});

// src/cache/kv-cache.ts
async function kvGet(kv, key) {
  const raw2 = await kv.get(key, "text");
  if (!raw2) return null;
  try {
    return JSON.parse(raw2);
  } catch {
    return null;
  }
}
async function kvPut(kv, key, value, ttl) {
  await kv.put(key, JSON.stringify(value), { expirationTtl: ttl });
}
function listEndpointStorageKey(endpoint) {
  return `le:${endpoint}`;
}
async function getCachedListEndpoint(kv, endpoint) {
  return kvGet(kv, listEndpointStorageKey(endpoint));
}
async function setCachedListEndpoint(kv, endpoint, ids) {
  await kvPut(kv, listEndpointStorageKey(endpoint), ids, TTL.LIST);
}
async function getCachedItem(kv, id) {
  return kvGet(kv, itemKey(id));
}
async function setCachedItem(kv, id, data, isHot = true) {
  await kvPut(kv, itemKey(id), data, isHot ? TTL.HOT_ITEM : TTL.COLD_ITEM);
}
async function getCachedUser(kv, id) {
  return kvGet(kv, userKey(id));
}
async function setCachedUser(kv, id, data) {
  await kvPut(kv, userKey(id), data, TTL.USER);
}
var init_kv_cache = __esm({
  "src/cache/kv-cache.ts"() {
    "use strict";
    init_modules_watch_stub();
    init_keys();
    __name(kvGet, "kvGet");
    __name(kvPut, "kvPut");
    __name(listEndpointStorageKey, "listEndpointStorageKey");
    __name(getCachedListEndpoint, "getCachedListEndpoint");
    __name(setCachedListEndpoint, "setCachedListEndpoint");
    __name(getCachedItem, "getCachedItem");
    __name(setCachedItem, "setCachedItem");
    __name(getCachedUser, "getCachedUser");
    __name(setCachedUser, "setCachedUser");
  }
});

// src/hn/kv-fetch.ts
var kv_fetch_exports = {};
__export(kv_fetch_exports, {
  getOrFetchItem: () => getOrFetchItem,
  getOrFetchListIds: () => getOrFetchListIds,
  getOrFetchUser: () => getOrFetchUser
});
async function getOrFetchListIds(kv, endpoint) {
  const cached = await getCachedListEndpoint(kv, endpoint);
  if (cached && cached.length > 0) return cached;
  const fresh = await fetchListIds(endpoint);
  if (fresh.length > 0) {
    await setCachedListEndpoint(kv, endpoint, fresh);
  }
  return fresh;
}
async function getOrFetchItem(kv, id) {
  const cached = await getCachedItem(kv, id);
  if (cached) return cached;
  const fresh = await fetchItem(id);
  if (fresh) {
    await setCachedItem(kv, id, fresh, true);
  }
  return fresh;
}
async function getOrFetchUser(kv, id) {
  const cached = await getCachedUser(kv, id);
  if (cached) return cached;
  const fresh = await fetchUser(id);
  if (fresh) {
    await setCachedUser(kv, id, fresh);
  }
  return fresh;
}
var init_kv_fetch = __esm({
  "src/hn/kv-fetch.ts"() {
    "use strict";
    init_modules_watch_stub();
    init_client();
    init_kv_cache();
    __name(getOrFetchListIds, "getOrFetchListIds");
    __name(getOrFetchItem, "getOrFetchItem");
    __name(getOrFetchUser, "getOrFetchUser");
  }
});

// src/utils/url.ts
function extractDomain(url) {
  if (!url) return "";
  try {
    const hostname = new URL(url).hostname;
    return hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}
function isExternalUrl(url) {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return parsed.hostname !== "news.ycombinator.com";
  } catch {
    return false;
  }
}
var init_url = __esm({
  "src/utils/url.ts"() {
    "use strict";
    init_modules_watch_stub();
    __name(extractDomain, "extractDomain");
    __name(isExternalUrl, "isExternalUrl");
  }
});

// src/hn/normalize.ts
function normalizeStory(item) {
  return {
    id: item.id,
    title: item.title ?? "",
    text: item.text ?? "",
    by: item.by ?? "",
    score: item.score ?? 0,
    time: item.time ?? 0,
    descendants: item.descendants ?? 0,
    url: item.url ?? "",
    domain: extractDomain(item.url),
    type: item.type ?? "story"
  };
}
function normalizeComment(item) {
  return {
    id: item.id,
    by: item.by ?? "[deleted]",
    time: item.time ?? 0,
    text: item.text ?? "",
    kids: item.kids ?? [],
    childCount: item.kids?.length ?? 0,
    deleted: item.deleted ?? false,
    dead: item.dead ?? false,
    parent: item.parent ?? 0
  };
}
function normalizeUser(user) {
  return {
    id: user.id,
    created: user.created ?? 0,
    karma: user.karma ?? 0,
    about: user.about ?? "",
    submitted: user.submitted ?? []
  };
}
var init_normalize = __esm({
  "src/hn/normalize.ts"() {
    "use strict";
    init_modules_watch_stub();
    init_url();
    __name(normalizeStory, "normalizeStory");
    __name(normalizeComment, "normalizeComment");
    __name(normalizeUser, "normalizeUser");
  }
});

// src/utils/concurrency.ts
var concurrency_exports = {};
__export(concurrency_exports, {
  withConcurrency: () => withConcurrency
});
async function withConcurrency(items, concurrency, fn) {
  const results = [];
  let index = 0;
  async function worker() {
    while (index < items.length) {
      const i = index++;
      if (i >= items.length) break;
      results[i] = await fn(items[i]);
    }
  }
  __name(worker, "worker");
  const workers = Array.from(
    { length: Math.min(concurrency, items.length) },
    () => worker()
  );
  await Promise.all(workers);
  return results;
}
var init_concurrency = __esm({
  "src/utils/concurrency.ts"() {
    "use strict";
    init_modules_watch_stub();
    __name(withConcurrency, "withConcurrency");
  }
});

// src/hn/lists.ts
var lists_exports = {};
__export(lists_exports, {
  fetchListIdsOnly: () => fetchListIdsOnly,
  fetchStories: () => fetchStories,
  getAllListTypes: () => getAllListTypes,
  getListEndpoint: () => getListEndpoint
});
function getListEndpoint(type) {
  return LIST_MAP[type] ?? null;
}
function getAllListTypes() {
  return Object.keys(LIST_MAP);
}
async function fetchStories(type, page = 1, perPage = 30, kv) {
  const endpoint = getListEndpoint(type);
  if (!endpoint) return { stories: [], total: 0 };
  const ids = kv ? await getOrFetchListIds(kv, endpoint) : await fetchListIds(endpoint);
  const total = ids.length;
  const start = (page - 1) * perPage;
  const pageIds = ids.slice(start, start + perPage);
  const stories = await withConcurrency(pageIds, ITEM_CONCURRENCY, async (id) => {
    const item = kv ? await getOrFetchItem(kv, id) : await fetchItem(id);
    if (!item || item.deleted || item.dead) return null;
    return normalizeStory(item);
  });
  return {
    stories: stories.filter((s) => s !== null),
    total
  };
}
async function fetchListIdsOnly(type, kv) {
  const endpoint = getListEndpoint(type);
  if (!endpoint) return [];
  if (kv) return getOrFetchListIds(kv, endpoint);
  return fetchListIds(endpoint);
}
var LIST_MAP, ITEM_CONCURRENCY;
var init_lists = __esm({
  "src/hn/lists.ts"() {
    "use strict";
    init_modules_watch_stub();
    init_client();
    init_kv_fetch();
    init_normalize();
    init_concurrency();
    LIST_MAP = {
      top: "topstories",
      newest: "newstories",
      best: "beststories",
      ask: "askstories",
      show: "showstories",
      jobs: "jobstories"
    };
    __name(getListEndpoint, "getListEndpoint");
    __name(getAllListTypes, "getAllListTypes");
    ITEM_CONCURRENCY = 32;
    __name(fetchStories, "fetchStories");
    __name(fetchListIdsOnly, "fetchListIdsOnly");
  }
});

// src/utils/time.ts
function timeAgo(unixSeconds) {
  const now = Math.floor(Date.now() / 1e3);
  const diff = now - unixSeconds;
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) {
    const mins = Math.floor(diff / 60);
    return `${mins} minute${mins !== 1 ? "s" : ""} ago`;
  }
  if (diff < 86400) {
    const hours = Math.floor(diff / 3600);
    return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
  }
  if (diff < 2592e3) {
    const days = Math.floor(diff / 86400);
    return `${days} day${days !== 1 ? "s" : ""} ago`;
  }
  if (diff < 31536e3) {
    const months = Math.floor(diff / 2592e3);
    return `${months} month${months !== 1 ? "s" : ""} ago`;
  }
  const years = Math.floor(diff / 31536e3);
  return `${years} year${years !== 1 ? "s" : ""} ago`;
}
var init_time = __esm({
  "src/utils/time.ts"() {
    "use strict";
    init_modules_watch_stub();
    __name(timeAgo, "timeAgo");
  }
});

// src/utils/sanitize.ts
function escapeHtml(str) {
  if (!ESCAPE_RE.test(str)) return str;
  return str.replace(/[&<>"']/g, (ch) => ESCAPE_MAP[ch] ?? ch);
}
function sanitizeTitle(title) {
  return escapeHtml(title);
}
function sanitizeHtml(html) {
  return html.replace(/<\/?([a-zA-Z]+)[^>]*>/g, (match2, tag) => {
    const lower = tag.toLowerCase();
    if (ALLOWED_TAGS.has(lower)) return match2;
    return "";
  });
}
var ESCAPE_MAP, ESCAPE_RE, ALLOWED_TAGS;
var init_sanitize = __esm({
  "src/utils/sanitize.ts"() {
    "use strict";
    init_modules_watch_stub();
    ESCAPE_MAP = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#x27;"
    };
    ESCAPE_RE = /[&<>"']/;
    __name(escapeHtml, "escapeHtml");
    __name(sanitizeTitle, "sanitizeTitle");
    ALLOWED_TAGS = /* @__PURE__ */ new Set([
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
      "div"
    ]);
    __name(sanitizeHtml, "sanitizeHtml");
  }
});

// src/render/client-scripts.ts
function getInstantNavScript() {
  return `
(function(){
  var PREFIX='lazy-hn:v1:';
  var LRU_KEY='lazy-hn:lru';
  var MAX_ENTRIES=14;
  var MAX_BYTES=450000;
  var saveData=typeof navigator!=='undefined'&&navigator.connection&&navigator.connection.saveData;
  var NAV_PAGES=['/','/newest','/best','/ask','/show','/jobs'];

  function skey(h){return PREFIX+h;}
  function getDisk(h){
    try{return sessionStorage.getItem(skey(h));}catch(e){return null;}
  }
  function touch(h){
    try{
      var k=JSON.parse(sessionStorage.getItem(LRU_KEY)||'[]');
      k=k.filter(function(x){return x!==h;});
      k.unshift(h);
      while(k.length>MAX_ENTRIES){sessionStorage.removeItem(skey(k.pop()||''));}
      sessionStorage.setItem(LRU_KEY,JSON.stringify(k));
    }catch(e){}
  }
  function putDisk(h,html){
    if(!html||html.length>MAX_BYTES)return;
    try{
      sessionStorage.setItem(skey(h),html);
      touch(h);
    }catch(e){
      try{
        var k=JSON.parse(sessionStorage.getItem(LRU_KEY)||'[]');
        while(k.length){
          sessionStorage.removeItem(skey(k.pop()||''));
          sessionStorage.setItem(LRU_KEY,JSON.stringify(k));
          try{sessionStorage.setItem(skey(h),html);touch(h);break;}catch(e2){}
        }
      }catch(e3){}
    }
  }

  var mem=new Map();

  function prefetch(href){
    if(!href||href.charAt(0)!=='/'||href.indexOf('/fragment/')===0)return;
    var m=mem.get(href);
    if(typeof m==='string')return;
    var disk=getDisk(href);
    if(disk){mem.set(href,disk);return;}
    if(m===null)return;
    mem.set(href,null);
    fetch(href,{headers:{'X-Requested-With':'lazy-hn'}}).then(function(r){return r.text();}).then(function(html){
      mem.set(href,html);
      putDisk(href,html);
      var l=document.createElement('link');
      l.rel='prefetch';
      l.href=href;
      document.head.appendChild(l);
    }).catch(function(){mem.delete(href);});
  }

  function preloadNavPages(){
    if(saveData)return;
    var cur=location.pathname+location.search;
    var q=[];
    for(var i=0;i<NAV_PAGES.length;i++){
      if(NAV_PAGES[i]!==cur)q.push(NAV_PAGES[i]);
    }
    function run(){
      if(!q.length)return;
      prefetch(q.shift());
      if(q.length){
        if(typeof requestIdleCallback==='function'){
          requestIdleCallback(run,{timeout:3500});
        }else{
          setTimeout(run,20);
        }
      }
    }
    if(typeof requestIdleCallback==='function'){
      requestIdleCallback(run,{timeout:1200});
    }else{
      setTimeout(run,0);
    }
  }
  preloadNavPages();

  document.addEventListener('pointerdown',function(e){
    var a=e.target.closest&&e.target.closest('a[href]');
    if(!a)return;
    prefetch(a.getAttribute('href'));
  },{passive:true,capture:true});

  document.addEventListener('mouseover',function(e){
    var a=e.target.closest&&e.target.closest('a[href]');
    if(!a)return;
    prefetch(a.getAttribute('href'));
  },{passive:true,capture:true});

  if(!saveData&&'IntersectionObserver'in window){
    var seen=new WeakSet();
    var io=new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        if(!en.isIntersecting)return;
        var el=en.target;
        if(!el||el.tagName!=='A')return;
        var h=el.getAttribute('href');
        if(h&&h.charAt(0)==='/'&&h.indexOf('/fragment/')!==0)prefetch(h);
      });
    },{rootMargin:'240px'});
    var t=null;
    function scan(){
      if(t)return;
      t=setTimeout(function(){
        t=null;
        document.querySelectorAll('a[href^="/"]').forEach(function(a){
          var ah=a.getAttribute('href')||'';
          if(ah.indexOf('/fragment/')===0)return;
          if(seen.has(a))return;
          seen.add(a);
          io.observe(a);
        });
      },50);
    }
    scan();
    if('MutationObserver'in window){
      new MutationObserver(scan).observe(document.documentElement,{childList:true,subtree:true});
    }
  }

  function applyDoc(href,html,push){
    if(push)history.pushState(null,'',href);
    document.open();
    document.write(html);
    document.close();
  }

  document.addEventListener('click',function(e){
    if(e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;
    var a=e.target.closest&&e.target.closest('a[href]');
    if(!a)return;
    var href=a.getAttribute('href');
    if(!href||href.charAt(0)!=='/'||href.indexOf('/fragment/')===0)return;
    var html=mem.get(href);
    if(html===undefined)html=getDisk(href);
    if(html===null)return;
    if(html===undefined||html==='')return;
    mem.set(href,html);
    e.preventDefault();
    e.stopImmediatePropagation();
    applyDoc(href,html,true);
  },{capture:true});

  window.addEventListener('popstate',function(){
    var href=location.pathname+location.search;
    if(href.charAt(0)!=='/'){location.reload();return;}
    var html=mem.get(href);
    if(html===undefined)html=getDisk(href);
    if(html){
      applyDoc(href,html,false);
      return;
    }
    fetch(href,{headers:{'X-Requested-With':'lazy-hn'}}).then(function(r){return r.text();}).then(function(h){
      mem.set(href,h);
      putDisk(href,h);
      applyDoc(href,h,false);
    }).catch(function(){location.reload();});
  });
})();`;
}
var init_client_scripts = __esm({
  "src/render/client-scripts.ts"() {
    "use strict";
    init_modules_watch_stub();
    __name(getInstantNavScript, "getInstantNavScript");
  }
});

// src/render/list-page.ts
var list_page_exports = {};
__export(list_page_exports, {
  renderListPage: () => renderListPage
});
function renderListPage(stories, type, page, total) {
  const perPage = 30;
  const startRank = (page - 1) * perPage;
  const listItems = stories.map((story, i) => renderStoryItem(story, startRank + i + 1)).join("\n");
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
  <script>${getInstantNavScript()}<\/script>
</body>
</html>`;
}
function listTypeLabel(type) {
  const labels = {
    top: "top",
    newest: "newest",
    best: "best",
    ask: "ask",
    show: "show",
    jobs: "jobs"
  };
  return labels[type] ?? type;
}
function renderStoryItem(story, rank) {
  const title = sanitizeTitle(story.title);
  const isJob = story.type === "job";
  const domain = story.domain ? ` <span class="story-domain">(${story.domain})</span>` : "";
  const commentText = story.descendants > 0 ? `${story.descendants}&nbsp;comments` : "discuss";
  const scoreText = story.score > 0 ? `${story.score} points` : "";
  const titleLink = isJob ? `<span class="job-title"><a href="/item/${story.id}">${title}</a></span>` : isExternalUrl(story.url) ? `<a href="${story.url}" rel="noopener noreferrer">${title}</a>${domain}` : `<a href="/item/${story.id}">${title}</a>`;
  const metaParts = [];
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
function renderPagination(type, page, total, perPage) {
  const maxPage = Math.ceil(total / perPage);
  const links = [];
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
function getListPath(type, page) {
  if (type === "top") {
    return page === 1 ? "/" : `/news?p=${page}`;
  }
  return `/${type}?p=${page}`;
}
function getInlineStyles() {
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
var init_list_page = __esm({
  "src/render/list-page.ts"() {
    "use strict";
    init_modules_watch_stub();
    init_time();
    init_time();
    init_sanitize();
    init_url();
    init_client_scripts();
    __name(renderListPage, "renderListPage");
    __name(listTypeLabel, "listTypeLabel");
    __name(renderStoryItem, "renderStoryItem");
    __name(renderPagination, "renderPagination");
    __name(getListPath, "getListPath");
    __name(getInlineStyles, "getInlineStyles");
  }
});

// src/hn/items.ts
var items_exports = {};
__export(items_exports, {
  fetchStoryPage: () => fetchStoryPage
});
async function fetchStoryPage(id, commentLimit = 20, kv) {
  let item = kv ? await getOrFetchItem(kv, id) : await fetchItem(id);
  if (!item) return null;
  if (kv && item.type === "story" && !item.text) {
    const fresh = await fetchItem(id);
    if (fresh?.text) {
      item = fresh;
      await setCachedItem(kv, id, fresh, true);
    }
  }
  const story = normalizeStory(item);
  const commentIds = item.kids ?? [];
  const totalComments = item.descendants ?? 0;
  const topIds = commentIds.slice(0, commentLimit);
  const comments = await withConcurrency(topIds, COMMENT_FETCH_CONCURRENCY, async (cid) => {
    const c = kv ? await getOrFetchItem(kv, cid) : await fetchItem(cid);
    if (!c) return null;
    return normalizeComment(c);
  });
  return {
    story,
    commentIds,
    comments: comments.filter((c) => c !== null),
    totalComments
  };
}
var COMMENT_FETCH_CONCURRENCY;
var init_items = __esm({
  "src/hn/items.ts"() {
    "use strict";
    init_modules_watch_stub();
    init_client();
    init_kv_fetch();
    init_normalize();
    init_concurrency();
    init_kv_cache();
    COMMENT_FETCH_CONCURRENCY = 16;
    __name(fetchStoryPage, "fetchStoryPage");
  }
});

// src/render/item-page.ts
var item_page_exports = {};
__export(item_page_exports, {
  renderItemPage: () => renderItemPage
});
function renderItemPage(data, _storyId) {
  const { story, comments, totalComments } = data;
  const title = sanitizeTitle(story.title);
  const domain = story.domain ? ` <span class="story-domain">(${story.domain})</span>` : "";
  const scoreText = story.score > 0 ? `${story.score} points` : "";
  const commentCountText = totalComments > 0 ? `${totalComments} comments` : "0 comments";
  const storyTextHtml = story.text ? `<div class="item-text">${sanitizeHtml(story.text)}</div>` : "";
  const titleHtml = isExternalUrl(story.url) ? `<span class="item-title"><a href="${story.url}" rel="noopener noreferrer">${title}</a>${domain}</span>` : `<span class="item-title">${title}</span>`;
  const commentsHtml = comments.map((c) => renderComment(c)).join("\n");
  const hnCommentUrl = `https://news.ycombinator.com/item?id=${story.id}`;
  const moreCommentsLink = data.commentIds.length > comments.length ? `<p class="more-comments"><a href="/item/${story.id}?all=1">Show all ${totalComments} comments</a></p>` : "";
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
  <script>${getItemScript()}${getInstantNavScript()}<\/script>
</body>
</html>`;
}
function renderComment(c) {
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
  const expandBtn = c.childCount > 0 ? `<button class="comment-replies-toggle" onclick="loadReplies(${c.id},this)">${c.childCount} replies</button>` : "";
  return `<div class="comment" id="comment-${c.id}">
  <div class="comment_head"><a href="/user/${c.by}">${c.by}</a> ${timeAgo(c.time)}</div>
  <div class="comment_text">${sanitizeHtml(c.text)}</div>
  ${expandBtn}
  <div class="replies-container" id="replies-${c.id}"></div>
</div>`;
}
function getItemStyles() {
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
function getItemScript() {
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
var init_item_page = __esm({
  "src/render/item-page.ts"() {
    "use strict";
    init_modules_watch_stub();
    init_time();
    init_sanitize();
    init_url();
    init_client_scripts();
    __name(renderItemPage, "renderItemPage");
    __name(renderComment, "renderComment");
    __name(getItemStyles, "getItemStyles");
    __name(getItemScript, "getItemScript");
  }
});

// src/hn/users.ts
var users_exports = {};
__export(users_exports, {
  fetchUserProfile: () => fetchUserProfile
});
async function fetchUserProfile(id, kv) {
  const user = kv ? await getOrFetchUser(kv, id) : await fetchUser(id);
  if (!user) return null;
  return normalizeUser(user);
}
var init_users = __esm({
  "src/hn/users.ts"() {
    "use strict";
    init_modules_watch_stub();
    init_client();
    init_kv_fetch();
    init_normalize();
    __name(fetchUserProfile, "fetchUserProfile");
  }
});

// src/render/user-page.ts
var user_page_exports = {};
__export(user_page_exports, {
  renderUserPage: () => renderUserPage
});
function renderUserPage(user) {
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
  <script>${getInstantNavScript()}<\/script>
</body>
</html>`;
}
function getUserStyles() {
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
.header { background: var(--accent); padding: 0.4rem 1rem; display: flex; align-items: center; gap: 1rem; }
.header a { color: #000; font-weight: bold; }
.header .logo { font-size: 1.5rem; font-weight: bold; border: 1px solid #000; padding: 0 0.3rem; margin-right: 0.5rem; }
.header nav { display: flex; gap: 0.6rem; font-size: 1.2rem; }
.header nav a { color: #000; }
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
var init_user_page = __esm({
  "src/render/user-page.ts"() {
    "use strict";
    init_modules_watch_stub();
    init_time();
    init_sanitize();
    init_client_scripts();
    __name(renderUserPage, "renderUserPage");
    __name(getUserStyles, "getUserStyles");
  }
});

// src/hn/comments.ts
var comments_exports = {};
__export(comments_exports, {
  fetchChildComments: () => fetchChildComments,
  fetchReplies: () => fetchReplies
});
async function fetchChildComments(parentId, limit = 20, kv) {
  const parent = kv ? await getOrFetchItem(kv, parentId) : await fetchItem(parentId);
  if (!parent || !parent.kids || parent.kids.length === 0) return [];
  const childIds = parent.kids.slice(0, limit);
  const comments = await withConcurrency(childIds, REPLY_CONCURRENCY, async (id) => {
    const item = kv ? await getOrFetchItem(kv, id) : await fetchItem(id);
    if (!item || item.dead || item.deleted) return null;
    return normalizeComment(item);
  });
  return comments.filter((c) => c !== null);
}
async function fetchReplies(commentIds, kv) {
  const comments = await withConcurrency(commentIds, REPLY_CONCURRENCY, async (id) => {
    const item = kv ? await getOrFetchItem(kv, id) : await fetchItem(id);
    if (!item || item.dead || item.deleted) return null;
    return normalizeComment(item);
  });
  return comments.filter((c) => c !== null);
}
var REPLY_CONCURRENCY;
var init_comments = __esm({
  "src/hn/comments.ts"() {
    "use strict";
    init_modules_watch_stub();
    init_client();
    init_kv_fetch();
    init_normalize();
    init_concurrency();
    REPLY_CONCURRENCY = 16;
    __name(fetchChildComments, "fetchChildComments");
    __name(fetchReplies, "fetchReplies");
  }
});

// src/render/fragments.ts
var fragments_exports = {};
__export(fragments_exports, {
  renderCommentFragment: () => renderCommentFragment,
  renderRepliesFragment: () => renderRepliesFragment
});
function renderCommentFragment(comment) {
  if (comment.deleted) {
    return `<div class="comment deleted"><div class="comment_head">[deleted] ${timeAgo(comment.time)}</div></div>`;
  }
  if (comment.dead) {
    return `<div class="comment dead"><div class="comment_head">[dead] ${timeAgo(comment.time)}</div></div>`;
  }
  const expandBtn = comment.childCount > 0 ? `<button class="comment-replies-toggle" onclick="loadReplies(${comment.id},this)">${comment.childCount} replies</button>` : "";
  return `<div class="comment" id="comment-${comment.id}">
  <div class="comment_head"><a href="/user/${comment.by}">${comment.by}</a> ${timeAgo(comment.time)}</div>
  <div class="comment_text">${sanitizeHtml(comment.text)}</div>
  ${expandBtn}
  <div class="replies-container" id="replies-${comment.id}"></div>
</div>`;
}
function renderRepliesFragment(comments) {
  return comments.map((c) => renderCommentFragment(c)).join("\n");
}
var init_fragments = __esm({
  "src/render/fragments.ts"() {
    "use strict";
    init_modules_watch_stub();
    init_time();
    init_sanitize();
    __name(renderCommentFragment, "renderCommentFragment");
    __name(renderRepliesFragment, "renderRepliesFragment");
  }
});

// src/jobs/prewarm.ts
var prewarm_exports = {};
__export(prewarm_exports, {
  prewarm: () => prewarm
});
async function prewarm(kv) {
  for (const listType of HOT_LIST_TYPES) {
    try {
      const ids = await getOrFetchListIds(kv, listType);
      const shortMap = {
        topstories: "top",
        newstories: "newest",
        beststories: "best"
      };
      const type = shortMap[listType] ?? listType;
      for (const page of WARM_PAGES) {
        try {
          await fetchStories(type, page, 30, kv);
        } catch {
        }
      }
      const topIds = ids.slice(0, HOT_STORIES_COUNT);
      for (const id of topIds) {
        try {
          await fetchStoryPage(id, 20, kv);
        } catch {
        }
      }
    } catch {
    }
  }
}
var HOT_LIST_TYPES, WARM_PAGES, HOT_STORIES_COUNT;
var init_prewarm = __esm({
  "src/jobs/prewarm.ts"() {
    "use strict";
    init_modules_watch_stub();
    init_kv_fetch();
    init_lists();
    init_items();
    HOT_LIST_TYPES = ["topstories", "newstories", "beststories"];
    WARM_PAGES = [1, 2, 3];
    HOT_STORIES_COUNT = 20;
    __name(prewarm, "prewarm");
  }
});

// src/jobs/sync-updates.ts
var sync_updates_exports = {};
__export(sync_updates_exports, {
  refreshLists: () => refreshLists,
  syncUpdates: () => syncUpdates
});
async function refreshLists(kv) {
  const { fetchListIdsOnly: fetchListIdsOnly2 } = await Promise.resolve().then(() => (init_lists(), lists_exports));
  const types = ["top", "newest", "best", "ask", "show", "jobs"];
  for (const type of types) {
    try {
      await fetchListIdsOnly2(type, kv);
    } catch {
    }
  }
}
async function syncUpdates(kv) {
  try {
    const updates = await fetchUpdates();
    if (!updates) return;
    if (updates.items && updates.items.length > 0) {
      const { getOrFetchItem: getOrFetchItem2 } = await Promise.resolve().then(() => (init_kv_fetch(), kv_fetch_exports));
      const { withConcurrency: withConcurrency2 } = await Promise.resolve().then(() => (init_concurrency(), concurrency_exports));
      await withConcurrency2(updates.items.slice(0, 50), 10, async (id) => {
        try {
          await getOrFetchItem2(kv, id);
        } catch {
        }
      });
    }
  } catch {
  }
}
var init_sync_updates = __esm({
  "src/jobs/sync-updates.ts"() {
    "use strict";
    init_modules_watch_stub();
    init_client();
    __name(refreshLists, "refreshLists");
    __name(syncUpdates, "syncUpdates");
  }
});

// .wrangler/tmp/bundle-NAaCrA/middleware-loader.entry.ts
init_modules_watch_stub();

// .wrangler/tmp/bundle-NAaCrA/middleware-insertion-facade.js
init_modules_watch_stub();

// src/index.ts
init_modules_watch_stub();

// src/app.ts
init_modules_watch_stub();

// node_modules/hono/dist/index.js
init_modules_watch_stub();

// node_modules/hono/dist/hono.js
init_modules_watch_stub();

// node_modules/hono/dist/hono-base.js
init_modules_watch_stub();

// node_modules/hono/dist/compose.js
init_modules_watch_stub();
var compose = /* @__PURE__ */ __name((middleware, onError, onNotFound) => {
  return (context, next) => {
    let index = -1;
    return dispatch(0);
    async function dispatch(i) {
      if (i <= index) {
        throw new Error("next() called multiple times");
      }
      index = i;
      let res;
      let isError = false;
      let handler;
      if (middleware[i]) {
        handler = middleware[i][0][0];
        context.req.routeIndex = i;
      } else {
        handler = i === middleware.length && next || void 0;
      }
      if (handler) {
        try {
          res = await handler(context, () => dispatch(i + 1));
        } catch (err) {
          if (err instanceof Error && onError) {
            context.error = err;
            res = await onError(err, context);
            isError = true;
          } else {
            throw err;
          }
        }
      } else {
        if (context.finalized === false && onNotFound) {
          res = await onNotFound(context);
        }
      }
      if (res && (context.finalized === false || isError)) {
        context.res = res;
      }
      return context;
    }
    __name(dispatch, "dispatch");
  };
}, "compose");

// node_modules/hono/dist/context.js
init_modules_watch_stub();

// node_modules/hono/dist/request.js
init_modules_watch_stub();

// node_modules/hono/dist/http-exception.js
init_modules_watch_stub();

// node_modules/hono/dist/request/constants.js
init_modules_watch_stub();
var GET_MATCH_RESULT = /* @__PURE__ */ Symbol();

// node_modules/hono/dist/utils/body.js
init_modules_watch_stub();
var parseBody = /* @__PURE__ */ __name(async (request, options = /* @__PURE__ */ Object.create(null)) => {
  const { all = false, dot = false } = options;
  const headers = request instanceof HonoRequest ? request.raw.headers : request.headers;
  const contentType = headers.get("Content-Type");
  if (contentType?.startsWith("multipart/form-data") || contentType?.startsWith("application/x-www-form-urlencoded")) {
    return parseFormData(request, { all, dot });
  }
  return {};
}, "parseBody");
async function parseFormData(request, options) {
  const formData = await request.formData();
  if (formData) {
    return convertFormDataToBodyData(formData, options);
  }
  return {};
}
__name(parseFormData, "parseFormData");
function convertFormDataToBodyData(formData, options) {
  const form = /* @__PURE__ */ Object.create(null);
  formData.forEach((value, key) => {
    const shouldParseAllValues = options.all || key.endsWith("[]");
    if (!shouldParseAllValues) {
      form[key] = value;
    } else {
      handleParsingAllValues(form, key, value);
    }
  });
  if (options.dot) {
    Object.entries(form).forEach(([key, value]) => {
      const shouldParseDotValues = key.includes(".");
      if (shouldParseDotValues) {
        handleParsingNestedValues(form, key, value);
        delete form[key];
      }
    });
  }
  return form;
}
__name(convertFormDataToBodyData, "convertFormDataToBodyData");
var handleParsingAllValues = /* @__PURE__ */ __name((form, key, value) => {
  if (form[key] !== void 0) {
    if (Array.isArray(form[key])) {
      ;
      form[key].push(value);
    } else {
      form[key] = [form[key], value];
    }
  } else {
    if (!key.endsWith("[]")) {
      form[key] = value;
    } else {
      form[key] = [value];
    }
  }
}, "handleParsingAllValues");
var handleParsingNestedValues = /* @__PURE__ */ __name((form, key, value) => {
  if (/(?:^|\.)__proto__\./.test(key)) {
    return;
  }
  let nestedForm = form;
  const keys = key.split(".");
  keys.forEach((key2, index) => {
    if (index === keys.length - 1) {
      nestedForm[key2] = value;
    } else {
      if (!nestedForm[key2] || typeof nestedForm[key2] !== "object" || Array.isArray(nestedForm[key2]) || nestedForm[key2] instanceof File) {
        nestedForm[key2] = /* @__PURE__ */ Object.create(null);
      }
      nestedForm = nestedForm[key2];
    }
  });
}, "handleParsingNestedValues");

// node_modules/hono/dist/utils/url.js
init_modules_watch_stub();
var splitPath = /* @__PURE__ */ __name((path) => {
  const paths = path.split("/");
  if (paths[0] === "") {
    paths.shift();
  }
  return paths;
}, "splitPath");
var splitRoutingPath = /* @__PURE__ */ __name((routePath) => {
  const { groups, path } = extractGroupsFromPath(routePath);
  const paths = splitPath(path);
  return replaceGroupMarks(paths, groups);
}, "splitRoutingPath");
var extractGroupsFromPath = /* @__PURE__ */ __name((path) => {
  const groups = [];
  path = path.replace(/\{[^}]+\}/g, (match2, index) => {
    const mark = `@${index}`;
    groups.push([mark, match2]);
    return mark;
  });
  return { groups, path };
}, "extractGroupsFromPath");
var replaceGroupMarks = /* @__PURE__ */ __name((paths, groups) => {
  for (let i = groups.length - 1; i >= 0; i--) {
    const [mark] = groups[i];
    for (let j = paths.length - 1; j >= 0; j--) {
      if (paths[j].includes(mark)) {
        paths[j] = paths[j].replace(mark, groups[i][1]);
        break;
      }
    }
  }
  return paths;
}, "replaceGroupMarks");
var patternCache = {};
var getPattern = /* @__PURE__ */ __name((label, next) => {
  if (label === "*") {
    return "*";
  }
  const match2 = label.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);
  if (match2) {
    const cacheKey = `${label}#${next}`;
    if (!patternCache[cacheKey]) {
      if (match2[2]) {
        patternCache[cacheKey] = next && next[0] !== ":" && next[0] !== "*" ? [cacheKey, match2[1], new RegExp(`^${match2[2]}(?=/${next})`)] : [label, match2[1], new RegExp(`^${match2[2]}$`)];
      } else {
        patternCache[cacheKey] = [label, match2[1], true];
      }
    }
    return patternCache[cacheKey];
  }
  return null;
}, "getPattern");
var tryDecode = /* @__PURE__ */ __name((str, decoder) => {
  try {
    return decoder(str);
  } catch {
    return str.replace(/(?:%[0-9A-Fa-f]{2})+/g, (match2) => {
      try {
        return decoder(match2);
      } catch {
        return match2;
      }
    });
  }
}, "tryDecode");
var tryDecodeURI = /* @__PURE__ */ __name((str) => tryDecode(str, decodeURI), "tryDecodeURI");
var getPath = /* @__PURE__ */ __name((request) => {
  const url = request.url;
  const start = url.indexOf("/", url.indexOf(":") + 4);
  let i = start;
  for (; i < url.length; i++) {
    const charCode = url.charCodeAt(i);
    if (charCode === 37) {
      const queryIndex = url.indexOf("?", i);
      const hashIndex = url.indexOf("#", i);
      const end = queryIndex === -1 ? hashIndex === -1 ? void 0 : hashIndex : hashIndex === -1 ? queryIndex : Math.min(queryIndex, hashIndex);
      const path = url.slice(start, end);
      return tryDecodeURI(path.includes("%25") ? path.replace(/%25/g, "%2525") : path);
    } else if (charCode === 63 || charCode === 35) {
      break;
    }
  }
  return url.slice(start, i);
}, "getPath");
var getPathNoStrict = /* @__PURE__ */ __name((request) => {
  const result = getPath(request);
  return result.length > 1 && result.at(-1) === "/" ? result.slice(0, -1) : result;
}, "getPathNoStrict");
var mergePath = /* @__PURE__ */ __name((base, sub, ...rest) => {
  if (rest.length) {
    sub = mergePath(sub, ...rest);
  }
  return `${base?.[0] === "/" ? "" : "/"}${base}${sub === "/" ? "" : `${base?.at(-1) === "/" ? "" : "/"}${sub?.[0] === "/" ? sub.slice(1) : sub}`}`;
}, "mergePath");
var checkOptionalParameter = /* @__PURE__ */ __name((path) => {
  if (path.charCodeAt(path.length - 1) !== 63 || !path.includes(":")) {
    return null;
  }
  const segments = path.split("/");
  const results = [];
  let basePath = "";
  segments.forEach((segment) => {
    if (segment !== "" && !/\:/.test(segment)) {
      basePath += "/" + segment;
    } else if (/\:/.test(segment)) {
      if (/\?/.test(segment)) {
        if (results.length === 0 && basePath === "") {
          results.push("/");
        } else {
          results.push(basePath);
        }
        const optionalSegment = segment.replace("?", "");
        basePath += "/" + optionalSegment;
        results.push(basePath);
      } else {
        basePath += "/" + segment;
      }
    }
  });
  return results.filter((v, i, a) => a.indexOf(v) === i);
}, "checkOptionalParameter");
var _decodeURI = /* @__PURE__ */ __name((value) => {
  if (!/[%+]/.test(value)) {
    return value;
  }
  if (value.indexOf("+") !== -1) {
    value = value.replace(/\+/g, " ");
  }
  return value.indexOf("%") !== -1 ? tryDecode(value, decodeURIComponent_) : value;
}, "_decodeURI");
var _getQueryParam = /* @__PURE__ */ __name((url, key, multiple) => {
  let encoded;
  if (!multiple && key && !/[%+]/.test(key)) {
    let keyIndex2 = url.indexOf("?", 8);
    if (keyIndex2 === -1) {
      return void 0;
    }
    if (!url.startsWith(key, keyIndex2 + 1)) {
      keyIndex2 = url.indexOf(`&${key}`, keyIndex2 + 1);
    }
    while (keyIndex2 !== -1) {
      const trailingKeyCode = url.charCodeAt(keyIndex2 + key.length + 1);
      if (trailingKeyCode === 61) {
        const valueIndex = keyIndex2 + key.length + 2;
        const endIndex = url.indexOf("&", valueIndex);
        return _decodeURI(url.slice(valueIndex, endIndex === -1 ? void 0 : endIndex));
      } else if (trailingKeyCode == 38 || isNaN(trailingKeyCode)) {
        return "";
      }
      keyIndex2 = url.indexOf(`&${key}`, keyIndex2 + 1);
    }
    encoded = /[%+]/.test(url);
    if (!encoded) {
      return void 0;
    }
  }
  const results = {};
  encoded ??= /[%+]/.test(url);
  let keyIndex = url.indexOf("?", 8);
  while (keyIndex !== -1) {
    const nextKeyIndex = url.indexOf("&", keyIndex + 1);
    let valueIndex = url.indexOf("=", keyIndex);
    if (valueIndex > nextKeyIndex && nextKeyIndex !== -1) {
      valueIndex = -1;
    }
    let name = url.slice(
      keyIndex + 1,
      valueIndex === -1 ? nextKeyIndex === -1 ? void 0 : nextKeyIndex : valueIndex
    );
    if (encoded) {
      name = _decodeURI(name);
    }
    keyIndex = nextKeyIndex;
    if (name === "") {
      continue;
    }
    let value;
    if (valueIndex === -1) {
      value = "";
    } else {
      value = url.slice(valueIndex + 1, nextKeyIndex === -1 ? void 0 : nextKeyIndex);
      if (encoded) {
        value = _decodeURI(value);
      }
    }
    if (multiple) {
      if (!(results[name] && Array.isArray(results[name]))) {
        results[name] = [];
      }
      ;
      results[name].push(value);
    } else {
      results[name] ??= value;
    }
  }
  return key ? results[key] : results;
}, "_getQueryParam");
var getQueryParam = _getQueryParam;
var getQueryParams = /* @__PURE__ */ __name((url, key) => {
  return _getQueryParam(url, key, true);
}, "getQueryParams");
var decodeURIComponent_ = decodeURIComponent;

// node_modules/hono/dist/request.js
var tryDecodeURIComponent = /* @__PURE__ */ __name((str) => tryDecode(str, decodeURIComponent_), "tryDecodeURIComponent");
var HonoRequest = class {
  static {
    __name(this, "HonoRequest");
  }
  /**
   * `.raw` can get the raw Request object.
   *
   * @see {@link https://hono.dev/docs/api/request#raw}
   *
   * @example
   * ```ts
   * // For Cloudflare Workers
   * app.post('/', async (c) => {
   *   const metadata = c.req.raw.cf?.hostMetadata?
   *   ...
   * })
   * ```
   */
  raw;
  #validatedData;
  // Short name of validatedData
  #matchResult;
  routeIndex = 0;
  /**
   * `.path` can get the pathname of the request.
   *
   * @see {@link https://hono.dev/docs/api/request#path}
   *
   * @example
   * ```ts
   * app.get('/about/me', (c) => {
   *   const pathname = c.req.path // `/about/me`
   * })
   * ```
   */
  path;
  bodyCache = {};
  constructor(request, path = "/", matchResult = [[]]) {
    this.raw = request;
    this.path = path;
    this.#matchResult = matchResult;
    this.#validatedData = {};
  }
  param(key) {
    return key ? this.#getDecodedParam(key) : this.#getAllDecodedParams();
  }
  #getDecodedParam(key) {
    const paramKey = this.#matchResult[0][this.routeIndex][1][key];
    const param = this.#getParamValue(paramKey);
    return param && /\%/.test(param) ? tryDecodeURIComponent(param) : param;
  }
  #getAllDecodedParams() {
    const decoded = {};
    const keys = Object.keys(this.#matchResult[0][this.routeIndex][1]);
    for (const key of keys) {
      const value = this.#getParamValue(this.#matchResult[0][this.routeIndex][1][key]);
      if (value !== void 0) {
        decoded[key] = /\%/.test(value) ? tryDecodeURIComponent(value) : value;
      }
    }
    return decoded;
  }
  #getParamValue(paramKey) {
    return this.#matchResult[1] ? this.#matchResult[1][paramKey] : paramKey;
  }
  query(key) {
    return getQueryParam(this.url, key);
  }
  queries(key) {
    return getQueryParams(this.url, key);
  }
  header(name) {
    if (name) {
      return this.raw.headers.get(name) ?? void 0;
    }
    const headerData = {};
    this.raw.headers.forEach((value, key) => {
      headerData[key] = value;
    });
    return headerData;
  }
  async parseBody(options) {
    return parseBody(this, options);
  }
  #cachedBody = /* @__PURE__ */ __name((key) => {
    const { bodyCache, raw: raw2 } = this;
    const cachedBody = bodyCache[key];
    if (cachedBody) {
      return cachedBody;
    }
    const anyCachedKey = Object.keys(bodyCache)[0];
    if (anyCachedKey) {
      return bodyCache[anyCachedKey].then((body) => {
        if (anyCachedKey === "json") {
          body = JSON.stringify(body);
        }
        return new Response(body)[key]();
      });
    }
    return bodyCache[key] = raw2[key]();
  }, "#cachedBody");
  /**
   * `.json()` can parse Request body of type `application/json`
   *
   * @see {@link https://hono.dev/docs/api/request#json}
   *
   * @example
   * ```ts
   * app.post('/entry', async (c) => {
   *   const body = await c.req.json()
   * })
   * ```
   */
  json() {
    return this.#cachedBody("text").then((text) => JSON.parse(text));
  }
  /**
   * `.text()` can parse Request body of type `text/plain`
   *
   * @see {@link https://hono.dev/docs/api/request#text}
   *
   * @example
   * ```ts
   * app.post('/entry', async (c) => {
   *   const body = await c.req.text()
   * })
   * ```
   */
  text() {
    return this.#cachedBody("text");
  }
  /**
   * `.arrayBuffer()` parse Request body as an `ArrayBuffer`
   *
   * @see {@link https://hono.dev/docs/api/request#arraybuffer}
   *
   * @example
   * ```ts
   * app.post('/entry', async (c) => {
   *   const body = await c.req.arrayBuffer()
   * })
   * ```
   */
  arrayBuffer() {
    return this.#cachedBody("arrayBuffer");
  }
  /**
   * Parses the request body as a `Blob`.
   * @example
   * ```ts
   * app.post('/entry', async (c) => {
   *   const body = await c.req.blob();
   * });
   * ```
   * @see https://hono.dev/docs/api/request#blob
   */
  blob() {
    return this.#cachedBody("blob");
  }
  /**
   * Parses the request body as `FormData`.
   * @example
   * ```ts
   * app.post('/entry', async (c) => {
   *   const body = await c.req.formData();
   * });
   * ```
   * @see https://hono.dev/docs/api/request#formdata
   */
  formData() {
    return this.#cachedBody("formData");
  }
  /**
   * Adds validated data to the request.
   *
   * @param target - The target of the validation.
   * @param data - The validated data to add.
   */
  addValidatedData(target, data) {
    this.#validatedData[target] = data;
  }
  valid(target) {
    return this.#validatedData[target];
  }
  /**
   * `.url()` can get the request url strings.
   *
   * @see {@link https://hono.dev/docs/api/request#url}
   *
   * @example
   * ```ts
   * app.get('/about/me', (c) => {
   *   const url = c.req.url // `http://localhost:8787/about/me`
   *   ...
   * })
   * ```
   */
  get url() {
    return this.raw.url;
  }
  /**
   * `.method()` can get the method name of the request.
   *
   * @see {@link https://hono.dev/docs/api/request#method}
   *
   * @example
   * ```ts
   * app.get('/about/me', (c) => {
   *   const method = c.req.method // `GET`
   * })
   * ```
   */
  get method() {
    return this.raw.method;
  }
  get [GET_MATCH_RESULT]() {
    return this.#matchResult;
  }
  /**
   * `.matchedRoutes()` can return a matched route in the handler
   *
   * @deprecated
   *
   * Use matchedRoutes helper defined in "hono/route" instead.
   *
   * @see {@link https://hono.dev/docs/api/request#matchedroutes}
   *
   * @example
   * ```ts
   * app.use('*', async function logger(c, next) {
   *   await next()
   *   c.req.matchedRoutes.forEach(({ handler, method, path }, i) => {
   *     const name = handler.name || (handler.length < 2 ? '[handler]' : '[middleware]')
   *     console.log(
   *       method,
   *       ' ',
   *       path,
   *       ' '.repeat(Math.max(10 - path.length, 0)),
   *       name,
   *       i === c.req.routeIndex ? '<- respond from here' : ''
   *     )
   *   })
   * })
   * ```
   */
  get matchedRoutes() {
    return this.#matchResult[0].map(([[, route]]) => route);
  }
  /**
   * `routePath()` can retrieve the path registered within the handler
   *
   * @deprecated
   *
   * Use routePath helper defined in "hono/route" instead.
   *
   * @see {@link https://hono.dev/docs/api/request#routepath}
   *
   * @example
   * ```ts
   * app.get('/posts/:id', (c) => {
   *   return c.json({ path: c.req.routePath })
   * })
   * ```
   */
  get routePath() {
    return this.#matchResult[0].map(([[, route]]) => route)[this.routeIndex].path;
  }
};

// node_modules/hono/dist/utils/html.js
init_modules_watch_stub();
var HtmlEscapedCallbackPhase = {
  Stringify: 1,
  BeforeStream: 2,
  Stream: 3
};
var raw = /* @__PURE__ */ __name((value, callbacks) => {
  const escapedString = new String(value);
  escapedString.isEscaped = true;
  escapedString.callbacks = callbacks;
  return escapedString;
}, "raw");
var resolveCallback = /* @__PURE__ */ __name(async (str, phase, preserveCallbacks, context, buffer) => {
  if (typeof str === "object" && !(str instanceof String)) {
    if (!(str instanceof Promise)) {
      str = str.toString();
    }
    if (str instanceof Promise) {
      str = await str;
    }
  }
  const callbacks = str.callbacks;
  if (!callbacks?.length) {
    return Promise.resolve(str);
  }
  if (buffer) {
    buffer[0] += str;
  } else {
    buffer = [str];
  }
  const resStr = Promise.all(callbacks.map((c) => c({ phase, buffer, context }))).then(
    (res) => Promise.all(
      res.filter(Boolean).map((str2) => resolveCallback(str2, phase, false, context, buffer))
    ).then(() => buffer[0])
  );
  if (preserveCallbacks) {
    return raw(await resStr, callbacks);
  } else {
    return resStr;
  }
}, "resolveCallback");

// node_modules/hono/dist/context.js
var TEXT_PLAIN = "text/plain; charset=UTF-8";
var setDefaultContentType = /* @__PURE__ */ __name((contentType, headers) => {
  return {
    "Content-Type": contentType,
    ...headers
  };
}, "setDefaultContentType");
var createResponseInstance = /* @__PURE__ */ __name((body, init) => new Response(body, init), "createResponseInstance");
var Context = class {
  static {
    __name(this, "Context");
  }
  #rawRequest;
  #req;
  /**
   * `.env` can get bindings (environment variables, secrets, KV namespaces, D1 database, R2 bucket etc.) in Cloudflare Workers.
   *
   * @see {@link https://hono.dev/docs/api/context#env}
   *
   * @example
   * ```ts
   * // Environment object for Cloudflare Workers
   * app.get('*', async c => {
   *   const counter = c.env.COUNTER
   * })
   * ```
   */
  env = {};
  #var;
  finalized = false;
  /**
   * `.error` can get the error object from the middleware if the Handler throws an error.
   *
   * @see {@link https://hono.dev/docs/api/context#error}
   *
   * @example
   * ```ts
   * app.use('*', async (c, next) => {
   *   await next()
   *   if (c.error) {
   *     // do something...
   *   }
   * })
   * ```
   */
  error;
  #status;
  #executionCtx;
  #res;
  #layout;
  #renderer;
  #notFoundHandler;
  #preparedHeaders;
  #matchResult;
  #path;
  /**
   * Creates an instance of the Context class.
   *
   * @param req - The Request object.
   * @param options - Optional configuration options for the context.
   */
  constructor(req, options) {
    this.#rawRequest = req;
    if (options) {
      this.#executionCtx = options.executionCtx;
      this.env = options.env;
      this.#notFoundHandler = options.notFoundHandler;
      this.#path = options.path;
      this.#matchResult = options.matchResult;
    }
  }
  /**
   * `.req` is the instance of {@link HonoRequest}.
   */
  get req() {
    this.#req ??= new HonoRequest(this.#rawRequest, this.#path, this.#matchResult);
    return this.#req;
  }
  /**
   * @see {@link https://hono.dev/docs/api/context#event}
   * The FetchEvent associated with the current request.
   *
   * @throws Will throw an error if the context does not have a FetchEvent.
   */
  get event() {
    if (this.#executionCtx && "respondWith" in this.#executionCtx) {
      return this.#executionCtx;
    } else {
      throw Error("This context has no FetchEvent");
    }
  }
  /**
   * @see {@link https://hono.dev/docs/api/context#executionctx}
   * The ExecutionContext associated with the current request.
   *
   * @throws Will throw an error if the context does not have an ExecutionContext.
   */
  get executionCtx() {
    if (this.#executionCtx) {
      return this.#executionCtx;
    } else {
      throw Error("This context has no ExecutionContext");
    }
  }
  /**
   * @see {@link https://hono.dev/docs/api/context#res}
   * The Response object for the current request.
   */
  get res() {
    return this.#res ||= createResponseInstance(null, {
      headers: this.#preparedHeaders ??= new Headers()
    });
  }
  /**
   * Sets the Response object for the current request.
   *
   * @param _res - The Response object to set.
   */
  set res(_res) {
    if (this.#res && _res) {
      _res = createResponseInstance(_res.body, _res);
      for (const [k, v] of this.#res.headers.entries()) {
        if (k === "content-type") {
          continue;
        }
        if (k === "set-cookie") {
          const cookies = this.#res.headers.getSetCookie();
          _res.headers.delete("set-cookie");
          for (const cookie of cookies) {
            _res.headers.append("set-cookie", cookie);
          }
        } else {
          _res.headers.set(k, v);
        }
      }
    }
    this.#res = _res;
    this.finalized = true;
  }
  /**
   * `.render()` can create a response within a layout.
   *
   * @see {@link https://hono.dev/docs/api/context#render-setrenderer}
   *
   * @example
   * ```ts
   * app.get('/', (c) => {
   *   return c.render('Hello!')
   * })
   * ```
   */
  render = /* @__PURE__ */ __name((...args) => {
    this.#renderer ??= (content) => this.html(content);
    return this.#renderer(...args);
  }, "render");
  /**
   * Sets the layout for the response.
   *
   * @param layout - The layout to set.
   * @returns The layout function.
   */
  setLayout = /* @__PURE__ */ __name((layout) => this.#layout = layout, "setLayout");
  /**
   * Gets the current layout for the response.
   *
   * @returns The current layout function.
   */
  getLayout = /* @__PURE__ */ __name(() => this.#layout, "getLayout");
  /**
   * `.setRenderer()` can set the layout in the custom middleware.
   *
   * @see {@link https://hono.dev/docs/api/context#render-setrenderer}
   *
   * @example
   * ```tsx
   * app.use('*', async (c, next) => {
   *   c.setRenderer((content) => {
   *     return c.html(
   *       <html>
   *         <body>
   *           <p>{content}</p>
   *         </body>
   *       </html>
   *     )
   *   })
   *   await next()
   * })
   * ```
   */
  setRenderer = /* @__PURE__ */ __name((renderer) => {
    this.#renderer = renderer;
  }, "setRenderer");
  /**
   * `.header()` can set headers.
   *
   * @see {@link https://hono.dev/docs/api/context#header}
   *
   * @example
   * ```ts
   * app.get('/welcome', (c) => {
   *   // Set headers
   *   c.header('X-Message', 'Hello!')
   *   c.header('Content-Type', 'text/plain')
   *
   *   return c.body('Thank you for coming')
   * })
   * ```
   */
  header = /* @__PURE__ */ __name((name, value, options) => {
    if (this.finalized) {
      this.#res = createResponseInstance(this.#res.body, this.#res);
    }
    const headers = this.#res ? this.#res.headers : this.#preparedHeaders ??= new Headers();
    if (value === void 0) {
      headers.delete(name);
    } else if (options?.append) {
      headers.append(name, value);
    } else {
      headers.set(name, value);
    }
  }, "header");
  status = /* @__PURE__ */ __name((status) => {
    this.#status = status;
  }, "status");
  /**
   * `.set()` can set the value specified by the key.
   *
   * @see {@link https://hono.dev/docs/api/context#set-get}
   *
   * @example
   * ```ts
   * app.use('*', async (c, next) => {
   *   c.set('message', 'Hono is hot!!')
   *   await next()
   * })
   * ```
   */
  set = /* @__PURE__ */ __name((key, value) => {
    this.#var ??= /* @__PURE__ */ new Map();
    this.#var.set(key, value);
  }, "set");
  /**
   * `.get()` can use the value specified by the key.
   *
   * @see {@link https://hono.dev/docs/api/context#set-get}
   *
   * @example
   * ```ts
   * app.get('/', (c) => {
   *   const message = c.get('message')
   *   return c.text(`The message is "${message}"`)
   * })
   * ```
   */
  get = /* @__PURE__ */ __name((key) => {
    return this.#var ? this.#var.get(key) : void 0;
  }, "get");
  /**
   * `.var` can access the value of a variable.
   *
   * @see {@link https://hono.dev/docs/api/context#var}
   *
   * @example
   * ```ts
   * const result = c.var.client.oneMethod()
   * ```
   */
  // c.var.propName is a read-only
  get var() {
    if (!this.#var) {
      return {};
    }
    return Object.fromEntries(this.#var);
  }
  #newResponse(data, arg, headers) {
    const responseHeaders = this.#res ? new Headers(this.#res.headers) : this.#preparedHeaders ?? new Headers();
    if (typeof arg === "object" && "headers" in arg) {
      const argHeaders = arg.headers instanceof Headers ? arg.headers : new Headers(arg.headers);
      for (const [key, value] of argHeaders) {
        if (key.toLowerCase() === "set-cookie") {
          responseHeaders.append(key, value);
        } else {
          responseHeaders.set(key, value);
        }
      }
    }
    if (headers) {
      for (const [k, v] of Object.entries(headers)) {
        if (typeof v === "string") {
          responseHeaders.set(k, v);
        } else {
          responseHeaders.delete(k);
          for (const v2 of v) {
            responseHeaders.append(k, v2);
          }
        }
      }
    }
    const status = typeof arg === "number" ? arg : arg?.status ?? this.#status;
    return createResponseInstance(data, { status, headers: responseHeaders });
  }
  newResponse = /* @__PURE__ */ __name((...args) => this.#newResponse(...args), "newResponse");
  /**
   * `.body()` can return the HTTP response.
   * You can set headers with `.header()` and set HTTP status code with `.status`.
   * This can also be set in `.text()`, `.json()` and so on.
   *
   * @see {@link https://hono.dev/docs/api/context#body}
   *
   * @example
   * ```ts
   * app.get('/welcome', (c) => {
   *   // Set headers
   *   c.header('X-Message', 'Hello!')
   *   c.header('Content-Type', 'text/plain')
   *   // Set HTTP status code
   *   c.status(201)
   *
   *   // Return the response body
   *   return c.body('Thank you for coming')
   * })
   * ```
   */
  body = /* @__PURE__ */ __name((data, arg, headers) => this.#newResponse(data, arg, headers), "body");
  /**
   * `.text()` can render text as `Content-Type:text/plain`.
   *
   * @see {@link https://hono.dev/docs/api/context#text}
   *
   * @example
   * ```ts
   * app.get('/say', (c) => {
   *   return c.text('Hello!')
   * })
   * ```
   */
  text = /* @__PURE__ */ __name((text, arg, headers) => {
    return !this.#preparedHeaders && !this.#status && !arg && !headers && !this.finalized ? new Response(text) : this.#newResponse(
      text,
      arg,
      setDefaultContentType(TEXT_PLAIN, headers)
    );
  }, "text");
  /**
   * `.json()` can render JSON as `Content-Type:application/json`.
   *
   * @see {@link https://hono.dev/docs/api/context#json}
   *
   * @example
   * ```ts
   * app.get('/api', (c) => {
   *   return c.json({ message: 'Hello!' })
   * })
   * ```
   */
  json = /* @__PURE__ */ __name((object, arg, headers) => {
    return this.#newResponse(
      JSON.stringify(object),
      arg,
      setDefaultContentType("application/json", headers)
    );
  }, "json");
  html = /* @__PURE__ */ __name((html, arg, headers) => {
    const res = /* @__PURE__ */ __name((html2) => this.#newResponse(html2, arg, setDefaultContentType("text/html; charset=UTF-8", headers)), "res");
    return typeof html === "object" ? resolveCallback(html, HtmlEscapedCallbackPhase.Stringify, false, {}).then(res) : res(html);
  }, "html");
  /**
   * `.redirect()` can Redirect, default status code is 302.
   *
   * @see {@link https://hono.dev/docs/api/context#redirect}
   *
   * @example
   * ```ts
   * app.get('/redirect', (c) => {
   *   return c.redirect('/')
   * })
   * app.get('/redirect-permanently', (c) => {
   *   return c.redirect('/', 301)
   * })
   * ```
   */
  redirect = /* @__PURE__ */ __name((location, status) => {
    const locationString = String(location);
    this.header(
      "Location",
      // Multibyes should be encoded
      // eslint-disable-next-line no-control-regex
      !/[^\x00-\xFF]/.test(locationString) ? locationString : encodeURI(locationString)
    );
    return this.newResponse(null, status ?? 302);
  }, "redirect");
  /**
   * `.notFound()` can return the Not Found Response.
   *
   * @see {@link https://hono.dev/docs/api/context#notfound}
   *
   * @example
   * ```ts
   * app.get('/notfound', (c) => {
   *   return c.notFound()
   * })
   * ```
   */
  notFound = /* @__PURE__ */ __name(() => {
    this.#notFoundHandler ??= () => createResponseInstance();
    return this.#notFoundHandler(this);
  }, "notFound");
};

// node_modules/hono/dist/router.js
init_modules_watch_stub();
var METHOD_NAME_ALL = "ALL";
var METHOD_NAME_ALL_LOWERCASE = "all";
var METHODS = ["get", "post", "put", "delete", "options", "patch"];
var MESSAGE_MATCHER_IS_ALREADY_BUILT = "Can not add a route since the matcher is already built.";
var UnsupportedPathError = class extends Error {
  static {
    __name(this, "UnsupportedPathError");
  }
};

// node_modules/hono/dist/utils/constants.js
init_modules_watch_stub();
var COMPOSED_HANDLER = "__COMPOSED_HANDLER";

// node_modules/hono/dist/hono-base.js
var notFoundHandler = /* @__PURE__ */ __name((c) => {
  return c.text("404 Not Found", 404);
}, "notFoundHandler");
var errorHandler = /* @__PURE__ */ __name((err, c) => {
  if ("getResponse" in err) {
    const res = err.getResponse();
    return c.newResponse(res.body, res);
  }
  console.error(err);
  return c.text("Internal Server Error", 500);
}, "errorHandler");
var Hono = class _Hono {
  static {
    __name(this, "_Hono");
  }
  get;
  post;
  put;
  delete;
  options;
  patch;
  all;
  on;
  use;
  /*
    This class is like an abstract class and does not have a router.
    To use it, inherit the class and implement router in the constructor.
  */
  router;
  getPath;
  // Cannot use `#` because it requires visibility at JavaScript runtime.
  _basePath = "/";
  #path = "/";
  routes = [];
  constructor(options = {}) {
    const allMethods = [...METHODS, METHOD_NAME_ALL_LOWERCASE];
    allMethods.forEach((method) => {
      this[method] = (args1, ...args) => {
        if (typeof args1 === "string") {
          this.#path = args1;
        } else {
          this.#addRoute(method, this.#path, args1);
        }
        args.forEach((handler) => {
          this.#addRoute(method, this.#path, handler);
        });
        return this;
      };
    });
    this.on = (method, path, ...handlers) => {
      for (const p of [path].flat()) {
        this.#path = p;
        for (const m of [method].flat()) {
          handlers.map((handler) => {
            this.#addRoute(m.toUpperCase(), this.#path, handler);
          });
        }
      }
      return this;
    };
    this.use = (arg1, ...handlers) => {
      if (typeof arg1 === "string") {
        this.#path = arg1;
      } else {
        this.#path = "*";
        handlers.unshift(arg1);
      }
      handlers.forEach((handler) => {
        this.#addRoute(METHOD_NAME_ALL, this.#path, handler);
      });
      return this;
    };
    const { strict, ...optionsWithoutStrict } = options;
    Object.assign(this, optionsWithoutStrict);
    this.getPath = strict ?? true ? options.getPath ?? getPath : getPathNoStrict;
  }
  #clone() {
    const clone = new _Hono({
      router: this.router,
      getPath: this.getPath
    });
    clone.errorHandler = this.errorHandler;
    clone.#notFoundHandler = this.#notFoundHandler;
    clone.routes = this.routes;
    return clone;
  }
  #notFoundHandler = notFoundHandler;
  // Cannot use `#` because it requires visibility at JavaScript runtime.
  errorHandler = errorHandler;
  /**
   * `.route()` allows grouping other Hono instance in routes.
   *
   * @see {@link https://hono.dev/docs/api/routing#grouping}
   *
   * @param {string} path - base Path
   * @param {Hono} app - other Hono instance
   * @returns {Hono} routed Hono instance
   *
   * @example
   * ```ts
   * const app = new Hono()
   * const app2 = new Hono()
   *
   * app2.get("/user", (c) => c.text("user"))
   * app.route("/api", app2) // GET /api/user
   * ```
   */
  route(path, app2) {
    const subApp = this.basePath(path);
    app2.routes.map((r) => {
      let handler;
      if (app2.errorHandler === errorHandler) {
        handler = r.handler;
      } else {
        handler = /* @__PURE__ */ __name(async (c, next) => (await compose([], app2.errorHandler)(c, () => r.handler(c, next))).res, "handler");
        handler[COMPOSED_HANDLER] = r.handler;
      }
      subApp.#addRoute(r.method, r.path, handler);
    });
    return this;
  }
  /**
   * `.basePath()` allows base paths to be specified.
   *
   * @see {@link https://hono.dev/docs/api/routing#base-path}
   *
   * @param {string} path - base Path
   * @returns {Hono} changed Hono instance
   *
   * @example
   * ```ts
   * const api = new Hono().basePath('/api')
   * ```
   */
  basePath(path) {
    const subApp = this.#clone();
    subApp._basePath = mergePath(this._basePath, path);
    return subApp;
  }
  /**
   * `.onError()` handles an error and returns a customized Response.
   *
   * @see {@link https://hono.dev/docs/api/hono#error-handling}
   *
   * @param {ErrorHandler} handler - request Handler for error
   * @returns {Hono} changed Hono instance
   *
   * @example
   * ```ts
   * app.onError((err, c) => {
   *   console.error(`${err}`)
   *   return c.text('Custom Error Message', 500)
   * })
   * ```
   */
  onError = /* @__PURE__ */ __name((handler) => {
    this.errorHandler = handler;
    return this;
  }, "onError");
  /**
   * `.notFound()` allows you to customize a Not Found Response.
   *
   * @see {@link https://hono.dev/docs/api/hono#not-found}
   *
   * @param {NotFoundHandler} handler - request handler for not-found
   * @returns {Hono} changed Hono instance
   *
   * @example
   * ```ts
   * app.notFound((c) => {
   *   return c.text('Custom 404 Message', 404)
   * })
   * ```
   */
  notFound = /* @__PURE__ */ __name((handler) => {
    this.#notFoundHandler = handler;
    return this;
  }, "notFound");
  /**
   * `.mount()` allows you to mount applications built with other frameworks into your Hono application.
   *
   * @see {@link https://hono.dev/docs/api/hono#mount}
   *
   * @param {string} path - base Path
   * @param {Function} applicationHandler - other Request Handler
   * @param {MountOptions} [options] - options of `.mount()`
   * @returns {Hono} mounted Hono instance
   *
   * @example
   * ```ts
   * import { Router as IttyRouter } from 'itty-router'
   * import { Hono } from 'hono'
   * // Create itty-router application
   * const ittyRouter = IttyRouter()
   * // GET /itty-router/hello
   * ittyRouter.get('/hello', () => new Response('Hello from itty-router'))
   *
   * const app = new Hono()
   * app.mount('/itty-router', ittyRouter.handle)
   * ```
   *
   * @example
   * ```ts
   * const app = new Hono()
   * // Send the request to another application without modification.
   * app.mount('/app', anotherApp, {
   *   replaceRequest: (req) => req,
   * })
   * ```
   */
  mount(path, applicationHandler, options) {
    let replaceRequest;
    let optionHandler;
    if (options) {
      if (typeof options === "function") {
        optionHandler = options;
      } else {
        optionHandler = options.optionHandler;
        if (options.replaceRequest === false) {
          replaceRequest = /* @__PURE__ */ __name((request) => request, "replaceRequest");
        } else {
          replaceRequest = options.replaceRequest;
        }
      }
    }
    const getOptions = optionHandler ? (c) => {
      const options2 = optionHandler(c);
      return Array.isArray(options2) ? options2 : [options2];
    } : (c) => {
      let executionContext = void 0;
      try {
        executionContext = c.executionCtx;
      } catch {
      }
      return [c.env, executionContext];
    };
    replaceRequest ||= (() => {
      const mergedPath = mergePath(this._basePath, path);
      const pathPrefixLength = mergedPath === "/" ? 0 : mergedPath.length;
      return (request) => {
        const url = new URL(request.url);
        url.pathname = url.pathname.slice(pathPrefixLength) || "/";
        return new Request(url, request);
      };
    })();
    const handler = /* @__PURE__ */ __name(async (c, next) => {
      const res = await applicationHandler(replaceRequest(c.req.raw), ...getOptions(c));
      if (res) {
        return res;
      }
      await next();
    }, "handler");
    this.#addRoute(METHOD_NAME_ALL, mergePath(path, "*"), handler);
    return this;
  }
  #addRoute(method, path, handler) {
    method = method.toUpperCase();
    path = mergePath(this._basePath, path);
    const r = { basePath: this._basePath, path, method, handler };
    this.router.add(method, path, [handler, r]);
    this.routes.push(r);
  }
  #handleError(err, c) {
    if (err instanceof Error) {
      return this.errorHandler(err, c);
    }
    throw err;
  }
  #dispatch(request, executionCtx, env, method) {
    if (method === "HEAD") {
      return (async () => new Response(null, await this.#dispatch(request, executionCtx, env, "GET")))();
    }
    const path = this.getPath(request, { env });
    const matchResult = this.router.match(method, path);
    const c = new Context(request, {
      path,
      matchResult,
      env,
      executionCtx,
      notFoundHandler: this.#notFoundHandler
    });
    if (matchResult[0].length === 1) {
      let res;
      try {
        res = matchResult[0][0][0][0](c, async () => {
          c.res = await this.#notFoundHandler(c);
        });
      } catch (err) {
        return this.#handleError(err, c);
      }
      return res instanceof Promise ? res.then(
        (resolved) => resolved || (c.finalized ? c.res : this.#notFoundHandler(c))
      ).catch((err) => this.#handleError(err, c)) : res ?? this.#notFoundHandler(c);
    }
    const composed = compose(matchResult[0], this.errorHandler, this.#notFoundHandler);
    return (async () => {
      try {
        const context = await composed(c);
        if (!context.finalized) {
          throw new Error(
            "Context is not finalized. Did you forget to return a Response object or `await next()`?"
          );
        }
        return context.res;
      } catch (err) {
        return this.#handleError(err, c);
      }
    })();
  }
  /**
   * `.fetch()` will be entry point of your app.
   *
   * @see {@link https://hono.dev/docs/api/hono#fetch}
   *
   * @param {Request} request - request Object of request
   * @param {Env} Env - env Object
   * @param {ExecutionContext} - context of execution
   * @returns {Response | Promise<Response>} response of request
   *
   */
  fetch = /* @__PURE__ */ __name((request, ...rest) => {
    return this.#dispatch(request, rest[1], rest[0], request.method);
  }, "fetch");
  /**
   * `.request()` is a useful method for testing.
   * You can pass a URL or pathname to send a GET request.
   * app will return a Response object.
   * ```ts
   * test('GET /hello is ok', async () => {
   *   const res = await app.request('/hello')
   *   expect(res.status).toBe(200)
   * })
   * ```
   * @see https://hono.dev/docs/api/hono#request
   */
  request = /* @__PURE__ */ __name((input, requestInit, Env, executionCtx) => {
    if (input instanceof Request) {
      return this.fetch(requestInit ? new Request(input, requestInit) : input, Env, executionCtx);
    }
    input = input.toString();
    return this.fetch(
      new Request(
        /^https?:\/\//.test(input) ? input : `http://localhost${mergePath("/", input)}`,
        requestInit
      ),
      Env,
      executionCtx
    );
  }, "request");
  /**
   * `.fire()` automatically adds a global fetch event listener.
   * This can be useful for environments that adhere to the Service Worker API, such as non-ES module Cloudflare Workers.
   * @deprecated
   * Use `fire` from `hono/service-worker` instead.
   * ```ts
   * import { Hono } from 'hono'
   * import { fire } from 'hono/service-worker'
   *
   * const app = new Hono()
   * // ...
   * fire(app)
   * ```
   * @see https://hono.dev/docs/api/hono#fire
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API
   * @see https://developers.cloudflare.com/workers/reference/migrate-to-module-workers/
   */
  fire = /* @__PURE__ */ __name(() => {
    addEventListener("fetch", (event) => {
      event.respondWith(this.#dispatch(event.request, event, void 0, event.request.method));
    });
  }, "fire");
};

// node_modules/hono/dist/router/reg-exp-router/index.js
init_modules_watch_stub();

// node_modules/hono/dist/router/reg-exp-router/router.js
init_modules_watch_stub();

// node_modules/hono/dist/router/reg-exp-router/matcher.js
init_modules_watch_stub();
var emptyParam = [];
function match(method, path) {
  const matchers = this.buildAllMatchers();
  const match2 = /* @__PURE__ */ __name(((method2, path2) => {
    const matcher = matchers[method2] || matchers[METHOD_NAME_ALL];
    const staticMatch = matcher[2][path2];
    if (staticMatch) {
      return staticMatch;
    }
    const match3 = path2.match(matcher[0]);
    if (!match3) {
      return [[], emptyParam];
    }
    const index = match3.indexOf("", 1);
    return [matcher[1][index], match3];
  }), "match2");
  this.match = match2;
  return match2(method, path);
}
__name(match, "match");

// node_modules/hono/dist/router/reg-exp-router/node.js
init_modules_watch_stub();
var LABEL_REG_EXP_STR = "[^/]+";
var ONLY_WILDCARD_REG_EXP_STR = ".*";
var TAIL_WILDCARD_REG_EXP_STR = "(?:|/.*)";
var PATH_ERROR = /* @__PURE__ */ Symbol();
var regExpMetaChars = new Set(".\\+*[^]$()");
function compareKey(a, b) {
  if (a.length === 1) {
    return b.length === 1 ? a < b ? -1 : 1 : -1;
  }
  if (b.length === 1) {
    return 1;
  }
  if (a === ONLY_WILDCARD_REG_EXP_STR || a === TAIL_WILDCARD_REG_EXP_STR) {
    return 1;
  } else if (b === ONLY_WILDCARD_REG_EXP_STR || b === TAIL_WILDCARD_REG_EXP_STR) {
    return -1;
  }
  if (a === LABEL_REG_EXP_STR) {
    return 1;
  } else if (b === LABEL_REG_EXP_STR) {
    return -1;
  }
  return a.length === b.length ? a < b ? -1 : 1 : b.length - a.length;
}
__name(compareKey, "compareKey");
var Node = class _Node {
  static {
    __name(this, "_Node");
  }
  #index;
  #varIndex;
  #children = /* @__PURE__ */ Object.create(null);
  insert(tokens, index, paramMap, context, pathErrorCheckOnly) {
    if (tokens.length === 0) {
      if (this.#index !== void 0) {
        throw PATH_ERROR;
      }
      if (pathErrorCheckOnly) {
        return;
      }
      this.#index = index;
      return;
    }
    const [token, ...restTokens] = tokens;
    const pattern = token === "*" ? restTokens.length === 0 ? ["", "", ONLY_WILDCARD_REG_EXP_STR] : ["", "", LABEL_REG_EXP_STR] : token === "/*" ? ["", "", TAIL_WILDCARD_REG_EXP_STR] : token.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);
    let node;
    if (pattern) {
      const name = pattern[1];
      let regexpStr = pattern[2] || LABEL_REG_EXP_STR;
      if (name && pattern[2]) {
        if (regexpStr === ".*") {
          throw PATH_ERROR;
        }
        regexpStr = regexpStr.replace(/^\((?!\?:)(?=[^)]+\)$)/, "(?:");
        if (/\((?!\?:)/.test(regexpStr)) {
          throw PATH_ERROR;
        }
      }
      node = this.#children[regexpStr];
      if (!node) {
        if (Object.keys(this.#children).some(
          (k) => k !== ONLY_WILDCARD_REG_EXP_STR && k !== TAIL_WILDCARD_REG_EXP_STR
        )) {
          throw PATH_ERROR;
        }
        if (pathErrorCheckOnly) {
          return;
        }
        node = this.#children[regexpStr] = new _Node();
        if (name !== "") {
          node.#varIndex = context.varIndex++;
        }
      }
      if (!pathErrorCheckOnly && name !== "") {
        paramMap.push([name, node.#varIndex]);
      }
    } else {
      node = this.#children[token];
      if (!node) {
        if (Object.keys(this.#children).some(
          (k) => k.length > 1 && k !== ONLY_WILDCARD_REG_EXP_STR && k !== TAIL_WILDCARD_REG_EXP_STR
        )) {
          throw PATH_ERROR;
        }
        if (pathErrorCheckOnly) {
          return;
        }
        node = this.#children[token] = new _Node();
      }
    }
    node.insert(restTokens, index, paramMap, context, pathErrorCheckOnly);
  }
  buildRegExpStr() {
    const childKeys = Object.keys(this.#children).sort(compareKey);
    const strList = childKeys.map((k) => {
      const c = this.#children[k];
      return (typeof c.#varIndex === "number" ? `(${k})@${c.#varIndex}` : regExpMetaChars.has(k) ? `\\${k}` : k) + c.buildRegExpStr();
    });
    if (typeof this.#index === "number") {
      strList.unshift(`#${this.#index}`);
    }
    if (strList.length === 0) {
      return "";
    }
    if (strList.length === 1) {
      return strList[0];
    }
    return "(?:" + strList.join("|") + ")";
  }
};

// node_modules/hono/dist/router/reg-exp-router/trie.js
init_modules_watch_stub();
var Trie = class {
  static {
    __name(this, "Trie");
  }
  #context = { varIndex: 0 };
  #root = new Node();
  insert(path, index, pathErrorCheckOnly) {
    const paramAssoc = [];
    const groups = [];
    for (let i = 0; ; ) {
      let replaced = false;
      path = path.replace(/\{[^}]+\}/g, (m) => {
        const mark = `@\\${i}`;
        groups[i] = [mark, m];
        i++;
        replaced = true;
        return mark;
      });
      if (!replaced) {
        break;
      }
    }
    const tokens = path.match(/(?::[^\/]+)|(?:\/\*$)|./g) || [];
    for (let i = groups.length - 1; i >= 0; i--) {
      const [mark] = groups[i];
      for (let j = tokens.length - 1; j >= 0; j--) {
        if (tokens[j].indexOf(mark) !== -1) {
          tokens[j] = tokens[j].replace(mark, groups[i][1]);
          break;
        }
      }
    }
    this.#root.insert(tokens, index, paramAssoc, this.#context, pathErrorCheckOnly);
    return paramAssoc;
  }
  buildRegExp() {
    let regexp = this.#root.buildRegExpStr();
    if (regexp === "") {
      return [/^$/, [], []];
    }
    let captureIndex = 0;
    const indexReplacementMap = [];
    const paramReplacementMap = [];
    regexp = regexp.replace(/#(\d+)|@(\d+)|\.\*\$/g, (_, handlerIndex, paramIndex) => {
      if (handlerIndex !== void 0) {
        indexReplacementMap[++captureIndex] = Number(handlerIndex);
        return "$()";
      }
      if (paramIndex !== void 0) {
        paramReplacementMap[Number(paramIndex)] = ++captureIndex;
        return "";
      }
      return "";
    });
    return [new RegExp(`^${regexp}`), indexReplacementMap, paramReplacementMap];
  }
};

// node_modules/hono/dist/router/reg-exp-router/router.js
var nullMatcher = [/^$/, [], /* @__PURE__ */ Object.create(null)];
var wildcardRegExpCache = /* @__PURE__ */ Object.create(null);
function buildWildcardRegExp(path) {
  return wildcardRegExpCache[path] ??= new RegExp(
    path === "*" ? "" : `^${path.replace(
      /\/\*$|([.\\+*[^\]$()])/g,
      (_, metaChar) => metaChar ? `\\${metaChar}` : "(?:|/.*)"
    )}$`
  );
}
__name(buildWildcardRegExp, "buildWildcardRegExp");
function clearWildcardRegExpCache() {
  wildcardRegExpCache = /* @__PURE__ */ Object.create(null);
}
__name(clearWildcardRegExpCache, "clearWildcardRegExpCache");
function buildMatcherFromPreprocessedRoutes(routes) {
  const trie = new Trie();
  const handlerData = [];
  if (routes.length === 0) {
    return nullMatcher;
  }
  const routesWithStaticPathFlag = routes.map(
    (route) => [!/\*|\/:/.test(route[0]), ...route]
  ).sort(
    ([isStaticA, pathA], [isStaticB, pathB]) => isStaticA ? 1 : isStaticB ? -1 : pathA.length - pathB.length
  );
  const staticMap = /* @__PURE__ */ Object.create(null);
  for (let i = 0, j = -1, len = routesWithStaticPathFlag.length; i < len; i++) {
    const [pathErrorCheckOnly, path, handlers] = routesWithStaticPathFlag[i];
    if (pathErrorCheckOnly) {
      staticMap[path] = [handlers.map(([h]) => [h, /* @__PURE__ */ Object.create(null)]), emptyParam];
    } else {
      j++;
    }
    let paramAssoc;
    try {
      paramAssoc = trie.insert(path, j, pathErrorCheckOnly);
    } catch (e) {
      throw e === PATH_ERROR ? new UnsupportedPathError(path) : e;
    }
    if (pathErrorCheckOnly) {
      continue;
    }
    handlerData[j] = handlers.map(([h, paramCount]) => {
      const paramIndexMap = /* @__PURE__ */ Object.create(null);
      paramCount -= 1;
      for (; paramCount >= 0; paramCount--) {
        const [key, value] = paramAssoc[paramCount];
        paramIndexMap[key] = value;
      }
      return [h, paramIndexMap];
    });
  }
  const [regexp, indexReplacementMap, paramReplacementMap] = trie.buildRegExp();
  for (let i = 0, len = handlerData.length; i < len; i++) {
    for (let j = 0, len2 = handlerData[i].length; j < len2; j++) {
      const map = handlerData[i][j]?.[1];
      if (!map) {
        continue;
      }
      const keys = Object.keys(map);
      for (let k = 0, len3 = keys.length; k < len3; k++) {
        map[keys[k]] = paramReplacementMap[map[keys[k]]];
      }
    }
  }
  const handlerMap = [];
  for (const i in indexReplacementMap) {
    handlerMap[i] = handlerData[indexReplacementMap[i]];
  }
  return [regexp, handlerMap, staticMap];
}
__name(buildMatcherFromPreprocessedRoutes, "buildMatcherFromPreprocessedRoutes");
function findMiddleware(middleware, path) {
  if (!middleware) {
    return void 0;
  }
  for (const k of Object.keys(middleware).sort((a, b) => b.length - a.length)) {
    if (buildWildcardRegExp(k).test(path)) {
      return [...middleware[k]];
    }
  }
  return void 0;
}
__name(findMiddleware, "findMiddleware");
var RegExpRouter = class {
  static {
    __name(this, "RegExpRouter");
  }
  name = "RegExpRouter";
  #middleware;
  #routes;
  constructor() {
    this.#middleware = { [METHOD_NAME_ALL]: /* @__PURE__ */ Object.create(null) };
    this.#routes = { [METHOD_NAME_ALL]: /* @__PURE__ */ Object.create(null) };
  }
  add(method, path, handler) {
    const middleware = this.#middleware;
    const routes = this.#routes;
    if (!middleware || !routes) {
      throw new Error(MESSAGE_MATCHER_IS_ALREADY_BUILT);
    }
    if (!middleware[method]) {
      ;
      [middleware, routes].forEach((handlerMap) => {
        handlerMap[method] = /* @__PURE__ */ Object.create(null);
        Object.keys(handlerMap[METHOD_NAME_ALL]).forEach((p) => {
          handlerMap[method][p] = [...handlerMap[METHOD_NAME_ALL][p]];
        });
      });
    }
    if (path === "/*") {
      path = "*";
    }
    const paramCount = (path.match(/\/:/g) || []).length;
    if (/\*$/.test(path)) {
      const re = buildWildcardRegExp(path);
      if (method === METHOD_NAME_ALL) {
        Object.keys(middleware).forEach((m) => {
          middleware[m][path] ||= findMiddleware(middleware[m], path) || findMiddleware(middleware[METHOD_NAME_ALL], path) || [];
        });
      } else {
        middleware[method][path] ||= findMiddleware(middleware[method], path) || findMiddleware(middleware[METHOD_NAME_ALL], path) || [];
      }
      Object.keys(middleware).forEach((m) => {
        if (method === METHOD_NAME_ALL || method === m) {
          Object.keys(middleware[m]).forEach((p) => {
            re.test(p) && middleware[m][p].push([handler, paramCount]);
          });
        }
      });
      Object.keys(routes).forEach((m) => {
        if (method === METHOD_NAME_ALL || method === m) {
          Object.keys(routes[m]).forEach(
            (p) => re.test(p) && routes[m][p].push([handler, paramCount])
          );
        }
      });
      return;
    }
    const paths = checkOptionalParameter(path) || [path];
    for (let i = 0, len = paths.length; i < len; i++) {
      const path2 = paths[i];
      Object.keys(routes).forEach((m) => {
        if (method === METHOD_NAME_ALL || method === m) {
          routes[m][path2] ||= [
            ...findMiddleware(middleware[m], path2) || findMiddleware(middleware[METHOD_NAME_ALL], path2) || []
          ];
          routes[m][path2].push([handler, paramCount - len + i + 1]);
        }
      });
    }
  }
  match = match;
  buildAllMatchers() {
    const matchers = /* @__PURE__ */ Object.create(null);
    Object.keys(this.#routes).concat(Object.keys(this.#middleware)).forEach((method) => {
      matchers[method] ||= this.#buildMatcher(method);
    });
    this.#middleware = this.#routes = void 0;
    clearWildcardRegExpCache();
    return matchers;
  }
  #buildMatcher(method) {
    const routes = [];
    let hasOwnRoute = method === METHOD_NAME_ALL;
    [this.#middleware, this.#routes].forEach((r) => {
      const ownRoute = r[method] ? Object.keys(r[method]).map((path) => [path, r[method][path]]) : [];
      if (ownRoute.length !== 0) {
        hasOwnRoute ||= true;
        routes.push(...ownRoute);
      } else if (method !== METHOD_NAME_ALL) {
        routes.push(
          ...Object.keys(r[METHOD_NAME_ALL]).map((path) => [path, r[METHOD_NAME_ALL][path]])
        );
      }
    });
    if (!hasOwnRoute) {
      return null;
    } else {
      return buildMatcherFromPreprocessedRoutes(routes);
    }
  }
};

// node_modules/hono/dist/router/reg-exp-router/prepared-router.js
init_modules_watch_stub();

// node_modules/hono/dist/router/smart-router/index.js
init_modules_watch_stub();

// node_modules/hono/dist/router/smart-router/router.js
init_modules_watch_stub();
var SmartRouter = class {
  static {
    __name(this, "SmartRouter");
  }
  name = "SmartRouter";
  #routers = [];
  #routes = [];
  constructor(init) {
    this.#routers = init.routers;
  }
  add(method, path, handler) {
    if (!this.#routes) {
      throw new Error(MESSAGE_MATCHER_IS_ALREADY_BUILT);
    }
    this.#routes.push([method, path, handler]);
  }
  match(method, path) {
    if (!this.#routes) {
      throw new Error("Fatal error");
    }
    const routers = this.#routers;
    const routes = this.#routes;
    const len = routers.length;
    let i = 0;
    let res;
    for (; i < len; i++) {
      const router = routers[i];
      try {
        for (let i2 = 0, len2 = routes.length; i2 < len2; i2++) {
          router.add(...routes[i2]);
        }
        res = router.match(method, path);
      } catch (e) {
        if (e instanceof UnsupportedPathError) {
          continue;
        }
        throw e;
      }
      this.match = router.match.bind(router);
      this.#routers = [router];
      this.#routes = void 0;
      break;
    }
    if (i === len) {
      throw new Error("Fatal error");
    }
    this.name = `SmartRouter + ${this.activeRouter.name}`;
    return res;
  }
  get activeRouter() {
    if (this.#routes || this.#routers.length !== 1) {
      throw new Error("No active router has been determined yet.");
    }
    return this.#routers[0];
  }
};

// node_modules/hono/dist/router/trie-router/index.js
init_modules_watch_stub();

// node_modules/hono/dist/router/trie-router/router.js
init_modules_watch_stub();

// node_modules/hono/dist/router/trie-router/node.js
init_modules_watch_stub();
var emptyParams = /* @__PURE__ */ Object.create(null);
var hasChildren = /* @__PURE__ */ __name((children) => {
  for (const _ in children) {
    return true;
  }
  return false;
}, "hasChildren");
var Node2 = class _Node2 {
  static {
    __name(this, "_Node");
  }
  #methods;
  #children;
  #patterns;
  #order = 0;
  #params = emptyParams;
  constructor(method, handler, children) {
    this.#children = children || /* @__PURE__ */ Object.create(null);
    this.#methods = [];
    if (method && handler) {
      const m = /* @__PURE__ */ Object.create(null);
      m[method] = { handler, possibleKeys: [], score: 0 };
      this.#methods = [m];
    }
    this.#patterns = [];
  }
  insert(method, path, handler) {
    this.#order = ++this.#order;
    let curNode = this;
    const parts = splitRoutingPath(path);
    const possibleKeys = [];
    for (let i = 0, len = parts.length; i < len; i++) {
      const p = parts[i];
      const nextP = parts[i + 1];
      const pattern = getPattern(p, nextP);
      const key = Array.isArray(pattern) ? pattern[0] : p;
      if (key in curNode.#children) {
        curNode = curNode.#children[key];
        if (pattern) {
          possibleKeys.push(pattern[1]);
        }
        continue;
      }
      curNode.#children[key] = new _Node2();
      if (pattern) {
        curNode.#patterns.push(pattern);
        possibleKeys.push(pattern[1]);
      }
      curNode = curNode.#children[key];
    }
    curNode.#methods.push({
      [method]: {
        handler,
        possibleKeys: possibleKeys.filter((v, i, a) => a.indexOf(v) === i),
        score: this.#order
      }
    });
    return curNode;
  }
  #pushHandlerSets(handlerSets, node, method, nodeParams, params) {
    for (let i = 0, len = node.#methods.length; i < len; i++) {
      const m = node.#methods[i];
      const handlerSet = m[method] || m[METHOD_NAME_ALL];
      const processedSet = {};
      if (handlerSet !== void 0) {
        handlerSet.params = /* @__PURE__ */ Object.create(null);
        handlerSets.push(handlerSet);
        if (nodeParams !== emptyParams || params && params !== emptyParams) {
          for (let i2 = 0, len2 = handlerSet.possibleKeys.length; i2 < len2; i2++) {
            const key = handlerSet.possibleKeys[i2];
            const processed = processedSet[handlerSet.score];
            handlerSet.params[key] = params?.[key] && !processed ? params[key] : nodeParams[key] ?? params?.[key];
            processedSet[handlerSet.score] = true;
          }
        }
      }
    }
  }
  search(method, path) {
    const handlerSets = [];
    this.#params = emptyParams;
    const curNode = this;
    let curNodes = [curNode];
    const parts = splitPath(path);
    const curNodesQueue = [];
    const len = parts.length;
    let partOffsets = null;
    for (let i = 0; i < len; i++) {
      const part = parts[i];
      const isLast = i === len - 1;
      const tempNodes = [];
      for (let j = 0, len2 = curNodes.length; j < len2; j++) {
        const node = curNodes[j];
        const nextNode = node.#children[part];
        if (nextNode) {
          nextNode.#params = node.#params;
          if (isLast) {
            if (nextNode.#children["*"]) {
              this.#pushHandlerSets(handlerSets, nextNode.#children["*"], method, node.#params);
            }
            this.#pushHandlerSets(handlerSets, nextNode, method, node.#params);
          } else {
            tempNodes.push(nextNode);
          }
        }
        for (let k = 0, len3 = node.#patterns.length; k < len3; k++) {
          const pattern = node.#patterns[k];
          const params = node.#params === emptyParams ? {} : { ...node.#params };
          if (pattern === "*") {
            const astNode = node.#children["*"];
            if (astNode) {
              this.#pushHandlerSets(handlerSets, astNode, method, node.#params);
              astNode.#params = params;
              tempNodes.push(astNode);
            }
            continue;
          }
          const [key, name, matcher] = pattern;
          if (!part && !(matcher instanceof RegExp)) {
            continue;
          }
          const child = node.#children[key];
          if (matcher instanceof RegExp) {
            if (partOffsets === null) {
              partOffsets = new Array(len);
              let offset = path[0] === "/" ? 1 : 0;
              for (let p = 0; p < len; p++) {
                partOffsets[p] = offset;
                offset += parts[p].length + 1;
              }
            }
            const restPathString = path.substring(partOffsets[i]);
            const m = matcher.exec(restPathString);
            if (m) {
              params[name] = m[0];
              this.#pushHandlerSets(handlerSets, child, method, node.#params, params);
              if (hasChildren(child.#children)) {
                child.#params = params;
                const componentCount = m[0].match(/\//)?.length ?? 0;
                const targetCurNodes = curNodesQueue[componentCount] ||= [];
                targetCurNodes.push(child);
              }
              continue;
            }
          }
          if (matcher === true || matcher.test(part)) {
            params[name] = part;
            if (isLast) {
              this.#pushHandlerSets(handlerSets, child, method, params, node.#params);
              if (child.#children["*"]) {
                this.#pushHandlerSets(
                  handlerSets,
                  child.#children["*"],
                  method,
                  params,
                  node.#params
                );
              }
            } else {
              child.#params = params;
              tempNodes.push(child);
            }
          }
        }
      }
      const shifted = curNodesQueue.shift();
      curNodes = shifted ? tempNodes.concat(shifted) : tempNodes;
    }
    if (handlerSets.length > 1) {
      handlerSets.sort((a, b) => {
        return a.score - b.score;
      });
    }
    return [handlerSets.map(({ handler, params }) => [handler, params])];
  }
};

// node_modules/hono/dist/router/trie-router/router.js
var TrieRouter = class {
  static {
    __name(this, "TrieRouter");
  }
  name = "TrieRouter";
  #node;
  constructor() {
    this.#node = new Node2();
  }
  add(method, path, handler) {
    const results = checkOptionalParameter(path);
    if (results) {
      for (let i = 0, len = results.length; i < len; i++) {
        this.#node.insert(method, results[i], handler);
      }
      return;
    }
    this.#node.insert(method, path, handler);
  }
  match(method, path) {
    return this.#node.search(method, path);
  }
};

// node_modules/hono/dist/hono.js
var Hono2 = class extends Hono {
  static {
    __name(this, "Hono");
  }
  /**
   * Creates an instance of the Hono class.
   *
   * @param options - Optional configuration options for the Hono instance.
   */
  constructor(options = {}) {
    super(options);
    this.router = options.router ?? new SmartRouter({
      routers: [new RegExpRouter(), new TrieRouter()]
    });
  }
};

// src/routes/home.ts
init_modules_watch_stub();
init_keys();

// src/cache/edge-html.ts
init_modules_watch_stub();

// src/cache/memory-html-cache.ts
init_modules_watch_stub();
var htmlCache = /* @__PURE__ */ new Map();
function cloneEntry(entry) {
  return new Response(entry.body, {
    status: entry.status,
    headers: new Headers(entry.headers)
  });
}
__name(cloneEntry, "cloneEntry");
function getMemoryHtml(url) {
  const entry = htmlCache.get(url);
  if (!entry) return null;
  if (entry.expiresAt <= Date.now()) {
    htmlCache.delete(url);
    return null;
  }
  return cloneEntry(entry);
}
__name(getMemoryHtml, "getMemoryHtml");
async function setMemoryHtml(url, response, ttlSeconds) {
  const body = await response.text();
  htmlCache.set(url, {
    body,
    expiresAt: Date.now() + ttlSeconds * 1e3,
    headers: [...response.headers.entries()],
    status: response.status
  });
}
__name(setMemoryHtml, "setMemoryHtml");

// src/cache/edge-html.ts
function hasEdgeCache() {
  return typeof caches !== "undefined" && typeof caches.default !== "undefined";
}
__name(hasEdgeCache, "hasEdgeCache");
function isLocalDevUrl(url) {
  try {
    const parsed = new URL(url);
    return parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1" || parsed.hostname === "::1";
  } catch {
    return false;
  }
}
__name(isLocalDevUrl, "isLocalDevUrl");
async function matchEdgeHtml(url, disableCache = false) {
  if (disableCache || isLocalDevUrl(url)) {
    return null;
  }
  if (hasEdgeCache()) {
    const hit = await caches.default.match(new Request(url, { method: "GET" }));
    return hit ?? null;
  }
  return getMemoryHtml(url);
}
__name(matchEdgeHtml, "matchEdgeHtml");
async function respondHtmlCached(c, html, edgeTtlSeconds) {
  const url = new URL(c.req.url).toString();
  const maxAge = Math.min(edgeTtlSeconds, 180);
  const response = new Response(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": `public, max-age=${maxAge}, s-maxage=${edgeTtlSeconds}`
    }
  });
  if (c.env.DISABLE_HTML_CACHE || isLocalDevUrl(url)) {
    return response;
  }
  if (hasEdgeCache()) {
    const cacheRequest = new Request(url, { method: "GET" });
    c.executionCtx.waitUntil(caches.default.put(cacheRequest, response.clone()));
  } else {
    c.executionCtx.waitUntil(setMemoryHtml(url, response.clone(), edgeTtlSeconds));
  }
  return response;
}
__name(respondHtmlCached, "respondHtmlCached");

// src/routes/home.ts
var homeRoute = new Hono2();
homeRoute.get("/", async (c) => {
  const hit = await matchEdgeHtml(new URL(c.req.url).toString(), c.env.DISABLE_HTML_CACHE ?? false);
  if (hit) return hit;
  const { fetchStories: fetchStories2 } = await Promise.resolve().then(() => (init_lists(), lists_exports));
  const { renderListPage: renderListPage2 } = await Promise.resolve().then(() => (init_list_page(), list_page_exports));
  const kv = c.env.HN_CACHE;
  let stories = [];
  let total = 0;
  try {
    const result = await fetchStories2("top", 1, 30, kv);
    stories = result.stories;
    total = result.total;
  } catch {
    return c.text("Error fetching stories", 500);
  }
  if (stories.length === 0) {
    return c.text("No stories found", 404);
  }
  const html = renderListPage2(stories, "top", 1, total);
  return respondHtmlCached(c, html, TTL.HTML_LIST);
});

// src/routes/list.ts
init_modules_watch_stub();
init_keys();
var listRoute = new Hono2();
listRoute.get("/newest", async (c) => {
  return handleList(c, "newest");
});
listRoute.get("/best", async (c) => {
  return handleList(c, "best");
});
listRoute.get("/ask", async (c) => {
  return handleList(c, "ask");
});
listRoute.get("/show", async (c) => {
  return handleList(c, "show");
});
listRoute.get("/jobs", async (c) => {
  return handleList(c, "jobs");
});
listRoute.get("/news", async (c) => {
  const page = parseInt(c.req.query("p") ?? "1", 10) || 1;
  return handleList(c, "top", page);
});
async function handleList(c, type, page = 1) {
  const hit = await matchEdgeHtml(new URL(c.req.url).toString(), c.env.DISABLE_HTML_CACHE ?? false);
  if (hit) return hit;
  const { fetchStories: fetchStories2 } = await Promise.resolve().then(() => (init_lists(), lists_exports));
  const { renderListPage: renderListPage2 } = await Promise.resolve().then(() => (init_list_page(), list_page_exports));
  const kv = c.env.HN_CACHE;
  try {
    const result = await fetchStories2(type, page, 30, kv);
    const html = renderListPage2(result.stories, type, page, result.total);
    return respondHtmlCached(c, html, TTL.HTML_LIST);
  } catch {
    return c.text("Error fetching stories", 500);
  }
}
__name(handleList, "handleList");

// src/routes/item.ts
init_modules_watch_stub();
init_keys();
var itemRoute = new Hono2();
itemRoute.get("/item/:id", async (c) => {
  const id = parseInt(c.req.param("id"), 10);
  if (!id || isNaN(id)) {
    return c.text("Invalid item ID", 400);
  }
  const hit = await matchEdgeHtml(new URL(c.req.url).toString(), c.env.DISABLE_HTML_CACHE ?? false);
  if (hit) return hit;
  const { fetchStoryPage: fetchStoryPage2 } = await Promise.resolve().then(() => (init_items(), items_exports));
  const { renderItemPage: renderItemPage2 } = await Promise.resolve().then(() => (init_item_page(), item_page_exports));
  const kv = c.env.HN_CACHE;
  try {
    const data = await fetchStoryPage2(id, 20, kv);
    if (!data) {
      return c.text("Item not found", 404);
    }
    const html = renderItemPage2(data, id);
    return respondHtmlCached(c, html, TTL.HTML_STORY);
  } catch {
    return c.text("Error fetching item", 500);
  }
});

// src/routes/user.ts
init_modules_watch_stub();
init_keys();
var userRoute = new Hono2();
userRoute.get("/user/:id", async (c) => {
  const id = c.req.param("id");
  if (!id) {
    return c.text("Invalid user ID", 400);
  }
  const hit = await matchEdgeHtml(new URL(c.req.url).toString(), c.env.DISABLE_HTML_CACHE ?? false);
  if (hit) return hit;
  const { fetchUserProfile: fetchUserProfile2 } = await Promise.resolve().then(() => (init_users(), users_exports));
  const { renderUserPage: renderUserPage2 } = await Promise.resolve().then(() => (init_user_page(), user_page_exports));
  const kv = c.env.HN_CACHE;
  try {
    const user = await fetchUserProfile2(id, kv);
    if (!user) {
      return c.text("User not found", 404);
    }
    const html = renderUserPage2(user);
    return respondHtmlCached(c, html, TTL.HTML_USER);
  } catch {
    return c.text("Error fetching user", 500);
  }
});

// src/routes/fragment.ts
init_modules_watch_stub();
init_keys();
var fragmentRoute = new Hono2();
fragmentRoute.get("/fragment/replies/:id", async (c) => {
  const id = parseInt(c.req.param("id"), 10);
  if (!id || isNaN(id)) {
    return c.text("Invalid comment ID", 400);
  }
  const hit = await matchEdgeHtml(new URL(c.req.url).toString(), c.env.DISABLE_HTML_CACHE ?? false);
  if (hit) return hit;
  const { fetchChildComments: fetchChildComments2 } = await Promise.resolve().then(() => (init_comments(), comments_exports));
  const { renderRepliesFragment: renderRepliesFragment2 } = await Promise.resolve().then(() => (init_fragments(), fragments_exports));
  const kv = c.env.HN_CACHE;
  try {
    const comments = await fetchChildComments2(id, 20, kv);
    const html = renderRepliesFragment2(comments);
    return respondHtmlCached(c, html, TTL.HTML_FRAGMENT);
  } catch {
    return c.text("Error fetching replies", 500);
  }
});
fragmentRoute.get("/fragment/comments/:id", async (c) => {
  const id = parseInt(c.req.param("id"), 10);
  if (!id || isNaN(id)) {
    return c.text("Invalid item ID", 400);
  }
  const hit = await matchEdgeHtml(new URL(c.req.url).toString(), c.env.DISABLE_HTML_CACHE ?? false);
  if (hit) return hit;
  const { fetchChildComments: fetchChildComments2 } = await Promise.resolve().then(() => (init_comments(), comments_exports));
  const { renderCommentFragment: renderCommentFragment2 } = await Promise.resolve().then(() => (init_fragments(), fragments_exports));
  const kv = c.env.HN_CACHE;
  try {
    const comments = await fetchChildComments2(id, 20, kv);
    const fragments = comments.map((comment) => renderCommentFragment2(comment));
    return respondHtmlCached(c, fragments.join("\n"), TTL.HTML_FRAGMENT);
  } catch {
    return c.text("Error fetching comments", 500);
  }
});

// src/app.ts
var app = new Hono2();
app.route("/", homeRoute);
app.route("/", listRoute);
app.route("/", itemRoute);
app.route("/", userRoute);
app.route("/", fragmentRoute);
app.get("/health", (c) => c.text("ok"));
app.get("/robots.txt", (c) => {
  return c.text("User-agent: *\nAllow: /\n");
});
var app_default = app;

// src/index.ts
var src_default = {
  fetch: app_default.fetch,
  async scheduled(_event, env, _ctx) {
    const { prewarm: prewarm2 } = await Promise.resolve().then(() => (init_prewarm(), prewarm_exports));
    const { syncUpdates: syncUpdates2 } = await Promise.resolve().then(() => (init_sync_updates(), sync_updates_exports));
    await Promise.all([prewarm2(env.HN_CACHE), syncUpdates2(env.HN_CACHE)]);
  }
};

// node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
init_modules_watch_stub();
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
init_modules_watch_stub();
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-NAaCrA/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = src_default;

// node_modules/wrangler/templates/middleware/common.ts
init_modules_watch_stub();
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-NAaCrA/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=index.js.map
