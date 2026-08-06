#!/usr/bin/env python3
"""Build script: generate article pages from ARTICLES data.

Reads /js/articles.js ARTICLES array, and for each entry checks whether
/articles/{path}.html already exists.  Missing pages are generated from the
shared template.

Usage:
    python3 build.py          # generate missing article pages
    python3 build.py --all    # regenerate ALL article pages (overwrite)
"""

import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.abspath(__file__))

# ---------------------------------------------------------------------------
# 1. Parse ARTICLES from /js/articles.js
# ---------------------------------------------------------------------------
def parse_articles(js_path: str) -> list[dict]:
    """Extract the ARTICLES JSON array from articles.js."""
    with open(js_path, "r", encoding="utf-8") as f:
        text = f.read()

    # Find var ARTICLES = [...];
    m = re.search(r"var\s+ARTICLES\s*=\s*(\[[\s\S]*?\])\s*;", text)
    if not m:
        print("ERROR: Could not find ARTICLES array in", js_path)
        sys.exit(1)

    raw = m.group(1)
    # Make JavaScript-style object literals valid JSON
    raw = re.sub(r"//.*", "", raw)          # strip single-line comments
    raw = re.sub(r",\s*([}\]])", r"\1", raw)  # trailing commas
    raw = re.sub(r"(\w+)\s*:", r'"\1":', raw)  # unquoted keys -> quoted
    raw = raw.replace("'", '"')             # single quotes -> double

    try:
        articles = json.loads(raw)
    except json.JSONDecodeError as exc:
        print("ERROR: Failed to parse ARTICLES JSON:", exc)
        print("Raw snippet:", raw[:500])
        sys.exit(1)

    return articles


# ---------------------------------------------------------------------------
# 2. Article page template (matching existing structure)
# ---------------------------------------------------------------------------
ARTICLE_TEMPLATE = """<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{title} - 萌神小天</title>
  <meta name="description" content="{title} - 萌神小天的独立游戏开发博客">
  <link rel="stylesheet" href="/css/style.css">
  <link rel="preconnect" href="https://giscus.app">
  <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css">
  <link rel="canonical" href="https://msxiaotian.vercel.app/articles/{html_filename}">
  <meta property="og:title" content="{title} - 萌神小天">
  <meta property="og:description" content="{title} - 萌神小天的独立游戏开发博客">
  <meta property="og:type" content="article">
  <meta property="og:url" content="https://msxiaotian.vercel.app/articles/{html_filename}">
  <!-- Favicon -->
  <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='80'>萌</text></svg>">
  <style>
    /* Article page minimal overrides */
    body {{ background: var(--bg-primary, #faf6f1); }}
    .art-nav {{ 
      position: sticky; top:0; z-index:100; 
      background: var(--bg-primary, #faf6f1);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid var(--border, #e0d8ce);
      padding: 12px 24px; display: flex; align-items: center; gap: 16px;
    }}
    .art-nav a {{ 
      color: var(--text-primary, #4a3728); text-decoration: none; font-size: 0.95rem;
      display: flex; align-items: center; gap: 6px; font-weight: 500;
    }}
    .art-nav a:hover {{ color: var(--accent, #d4a574); }}
    .art-nav .home-link {{ font-size: 0.9rem; }}
    .art-nav .nav-divider {{ flex:1; }}
    .art-nav .nav-title {{ font-size: 0.9rem; color: var(--text-secondary, #8b7355); max-width: 50%; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }}
    .art-nav .theme-btn {{ background:none; border:none; cursor:pointer; font-size:1.1rem; color: var(--text-primary); padding:4px 8px; }}
    .art-container {{ max-width: 820px; margin: 0 auto; padding: 24px 20px 60px; }}
    .art-header {{ margin-bottom: 28px; border-bottom: 1px solid var(--border); padding-bottom: 20px; }}
    .art-header h1 {{ font-size: 1.8rem; margin: 0 0 12px; line-height: 1.35; color: var(--text-primary); }}
    .art-meta {{ display: flex; flex-wrap: wrap; gap: 12px; align-items: center; font-size: 0.85rem; color: var(--text-secondary); }}
    .art-meta .art-date {{ font-family: var(--font-mono, 'SF Mono', monospace); }}
    .art-meta .art-tags {{ display: flex; gap: 6px; flex-wrap: wrap; }}
    .art-meta .art-tag {{ background: var(--tag-bg, #f0ebe0); color: var(--tag-text, #8b7355); padding: 2px 10px; border-radius: 12px; font-size: 0.78rem; }}
    .art-meta .art-time {{ display: flex; align-items: center; gap: 4px; }}
    .art-content {{ line-height: 1.8; font-size: 1.02rem; color: var(--text-primary); }}
    .art-content img {{ max-width: 100%; border-radius: 8px; margin: 16px 0; }}
    .art-content pre {{ border-radius: 8px; overflow-x: auto; }}
    .art-content code {{ font-family: var(--font-mono, 'SF Mono', 'Fira Code', monospace); font-size: 0.88em; }}
    .art-content table {{ border-collapse: collapse; width: 100%; margin: 16px 0; }}
    .art-content th, .art-content td {{ border: 1px solid var(--border); padding: 8px 12px; text-align: left; }}
    .art-content th {{ background: var(--tag-bg, #f0ebe0); }}
    .art-content blockquote {{ border-left: 3px solid var(--accent, #d4a574); padding-left: 16px; margin: 16px 0; color: var(--text-secondary); }}
    .art-footer {{ margin-top: 40px; padding-top: 20px; border-top: 1px solid var(--border); }}
    .art-share {{ display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 24px; }}
    .art-share a {{ text-decoration: none; color: var(--text-secondary); font-size: 0.85rem; display: flex; align-items: center; gap: 4px; padding: 6px 12px; border: 1px solid var(--border); border-radius: 20px; transition: all 0.2s; }}
    .art-share a:hover {{ background: var(--accent); color: white; border-color: var(--accent); }}
    .art-nav-bottom {{ display: flex; justify-content: space-between; margin: 24px 0; gap: 12px; }}
    .art-nav-bottom a {{ text-decoration: none; color: var(--accent); font-size: 0.9rem; padding: 8px 16px; border: 1px solid var(--border); border-radius: 8px; transition: all 0.2s; }}
    .art-nav-bottom a:hover {{ background: var(--accent); color: white; }}
    .art-home-link {{ display: inline-block; margin-top: 16px; color: var(--accent); text-decoration: none; font-size: 0.9rem; }}
    /* Responsive for article pages */
    @media (max-width: 768px) {{
      .art-container {{ padding: 16px 16px 40px; }}
      .art-header h1 {{ font-size: 1.4rem; }}
      .art-nav {{ padding: 10px 16px; }}
      .art-nav .nav-title {{ display: none; }}
    }}
  </style>
</head>
<body>
<div id="progress-bar" style="position:fixed;top:0;left:0;height:3px;background:var(--accent,#d4a574);z-index:200;width:0;transition:width 0.1s;"></div>
<nav class="art-nav">
  <a href="/" class="home-link" title="回到首页">&#8592; 萌神小天</a>
  <span class="nav-divider"></span>
  <span class="nav-title">{title}</span>
  <button class="theme-btn" onclick="toggleTheme()" title="切换深色/浅色模式" aria-label="切换主题">&#9790;</button>
</nav>

<main class="art-container">
  <div id="article-content">
    <div style="text-align:center;padding:60px 0;color:var(--text-secondary);">加载中...</div>
  </div>
  
  <div class="art-footer" id="art-footer" style="display:none;">
    <div class="art-share">
      <a href="{twitter_url}" target="_blank" rel="noopener">&#120143; Twitter</a>
      <a href="javascript:copyPageUrl()" id="copyBtn">&#128203; 复制链接</a>
    </div>
    <div class="art-nav-bottom" id="art-nav-bottom"></div>
    <a href="/" class="art-home-link">&#8592; 返回首页</a>
  </div>
  
  <!-- Giscus Comments -->
  <div class="giscus" style="margin-top:32px;"></div>
</main>

<button id="back-to-top" onclick="window.scrollTo({{top:0,behavior:'smooth'}})" style="position:fixed;bottom:24px;right:24px;width:40px;height:40px;border-radius:50%;background:var(--accent,#d4a574);color:white;border:none;cursor:pointer;display:none;font-size:1.2rem;z-index:50;box-shadow:0 2px 8px rgba(0,0,0,0.15);align-items:center;justify-content:center;" aria-label="返回顶部">&#8593;</button>

<script src="/js/articles.js"></script>
<script src="/js/app.js"></script>
<script>
var CURRENT_PATH = "{md_path}";
var ARTICLE_IDX = {idx};

// Progress bar
window.addEventListener('scroll', function() {{
  var scrollTop = window.scrollY || document.documentElement.scrollTop;
  var docHeight = document.documentElement.scrollHeight - window.innerHeight;
  var progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
  document.getElementById('progress-bar').style.width = progress + '%';
  
  var btn = document.getElementById('back-to-top');
  btn.style.display = scrollTop > 400 ? 'flex' : 'none';
}});

// Render article
(function() {{
  var article = ARTICLES[ARTICLE_IDX];
  if (!article) {{
    document.getElementById('article-content').innerHTML = '<div class="art-header"><h1>文章未找到</h1></div>';
    return;
  }}
  
  // Update title
  document.title = article.title + ' - 萌神小天';
  document.querySelector('.nav-title').textContent = article.title;
  
  // Get content
  var rawContent = ARTICLES_CONTENT[article.path] || '';
  
  // Strip frontmatter if present
  if (rawContent.startsWith('---')) {{
    var endIdx = rawContent.indexOf('---', 3);
    if (endIdx !== -1) rawContent = rawContent.substring(endIdx + 3).trim();
  }}
  
  // Render markdown
  var htmlContent;
  try {{
    if (typeof marked !== 'undefined') {{
      marked.setOptions({{ breaks: true, gfm: true }});
      htmlContent = marked.parse(rawContent);
    }} else {{
      htmlContent = '<pre>' + rawContent.replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</pre>';
    }}
  }} catch(e) {{
    htmlContent = '<pre>' + rawContent.replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</pre>';
  }}
  
  // Format date
  var dateStr = '';
  if (article.date) {{
    var d = new Date(article.date);
    dateStr = d.getFullYear() + '年' + (d.getMonth()+1) + '月' + d.getDate() + '日';
  }}
  
  // Reading time
  var wordCount = rawContent.replace(/\\s/g, '').length;
  var readTime = Math.max(1, Math.ceil(wordCount / 500));
  
  // Tags
  var tagsHtml = '';
  if (article.tags && article.tags.length) {{
    tagsHtml = article.tags.map(function(t) {{ return '<span class="art-tag">' + t + '</span>'; }}).join('');
  }}
  
  var headerHtml = '<div class="art-header">' +
    '<h1>' + article.title + '</h1>' +
    '<div class="art-meta">' +
    '<span class="art-date">' + dateStr + '</span>' +
    '<span class="art-time">&#9202; ' + readTime + ' 分钟阅读</span>' +
    '<div class="art-tags">' + tagsHtml + '</div>' +
    '</div></div>';
  
  document.getElementById('article-content').innerHTML = headerHtml + '<div class="art-content">' + htmlContent + '</div>';
  
  // Highlight code
  if (typeof hljs !== 'undefined') {{
    document.querySelectorAll('.art-content pre code').forEach(function(el) {{ hljs.highlightElement(el); }});
  }}
  
  // Show footer with nav
  document.getElementById('art-footer').style.display = 'block';
  
  // Prev/next navigation
  var navHtml = '';
  if (ARTICLE_IDX > 0) {{
    var prev = ARTICLES[ARTICLE_IDX - 1];
    navHtml += '<a href="' + prev.path.replace('.md','.html') + '">&#8592; ' + prev.title + '</a>';
  }} else {{
    navHtml += '<span></span>';
  }}
  if (ARTICLE_IDX < ARTICLES.length - 1) {{
    var next = ARTICLES[ARTICLE_IDX + 1];
    navHtml += '<a href="' + next.path.replace('.md','.html') + '">' + next.title + ' &#8594;</a>';
  }}
  document.getElementById('art-nav-bottom').innerHTML = navHtml;
  
  // Giscus
  var giscusScript = document.createElement('script');
  giscusScript.src = 'https://giscus.app/client.js';
  giscusScript.setAttribute('data-repo', 'MsXiaoTian-Gamer/MsXiaoTian-Gamer.github.io');
  giscusScript.setAttribute('data-repo-id', 'R_kgDOOF2nUg');
  giscusScript.setAttribute('data-category', 'Announcements');
  giscusScript.setAttribute('data-category-id', 'DIC_kwDOOF2nUs4CoKqX');
  giscusScript.setAttribute('data-mapping', 'pathname');
  giscusScript.setAttribute('data-strict', '0');
  giscusScript.setAttribute('data-reactions-enabled', '1');
  giscusScript.setAttribute('data-emit-metadata', '0');
  giscusScript.setAttribute('data-input-position', 'bottom');
  giscusScript.setAttribute('data-theme', 'preferred_color_scheme');
  giscusScript.setAttribute('data-lang', 'zh-CN');
  giscusScript.setAttribute('crossorigin', 'anonymous');
  giscusScript.setAttribute('async', '');
  document.querySelector('.giscus').appendChild(giscusScript);
}})();

// Theme toggle
function toggleTheme() {{
  var html = document.documentElement;
  if (html.getAttribute('data-theme') === 'dark') {{
    html.removeAttribute('data-theme');
    localStorage.setItem('theme', 'light');
  }} else {{
    html.setAttribute('data-theme', 'dark');
    localStorage.setItem('theme', 'dark');
  }}
}}

// Init theme
(function() {{
  var saved = localStorage.getItem('theme');
  if (saved === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
  else if (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches) document.documentElement.setAttribute('data-theme', 'dark');
}})();

function copyPageUrl() {{
  navigator.clipboard.writeText(window.location.href).then(function() {{
    var btn = document.getElementById('copyBtn');
    btn.textContent = '已复制!';
    setTimeout(function() {{ btn.innerHTML = '&#128203; 复制链接'; }}, 2000);
  }});
}}
</script>
</body>
</html>"""


# ---------------------------------------------------------------------------
# 3. URL-encode a string for Twitter share link
# ---------------------------------------------------------------------------
def url_encode(s: str) -> str:
    from urllib.parse import quote
    return quote(s, safe="")


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
def main():
    regenerate_all = "--all" in sys.argv

    articles_js = os.path.join(ROOT, "js", "articles.js")
    articles_dir = os.path.join(ROOT, "articles")

    if not os.path.exists(articles_js):
        print("ERROR:", articles_js, "not found")
        sys.exit(1)

    os.makedirs(articles_dir, exist_ok=True)

    articles = parse_articles(articles_js)
    print(f"Found {len(articles)} articles in ARTICLES array.")

    generated = 0
    skipped = 0

    for i, art in enumerate(articles):
        md_path = art["path"]
        html_filename = md_path.replace(".md", ".html")
        html_path = os.path.join(articles_dir, html_filename)

        if os.path.exists(html_path) and not regenerate_all:
            skipped += 1
            continue

        # Build Twitter share URL
        full_url = f"https://msxiaotian.vercel.app/articles/{html_filename}"
        twitter_url = (
            f"https://twitter.com/intent/tweet"
            f"?url={url_encode(full_url)}"
            f"&text={url_encode(art['title'])}"
        )

        page = ARTICLE_TEMPLATE.format(
            title=art["title"],
            html_filename=html_filename,
            md_path=md_path,
            idx=i,
            twitter_url=twitter_url,
        )

        with open(html_path, "w", encoding="utf-8") as f:
            f.write(page)

        generated += 1
        print(f"  {'[REGEN]' if os.path.exists(html_path.replace('.html','.bak')) else '[NEW]'} {html_filename}")

    print(f"\nDone: {generated} generated, {skipped} skipped (already exist).")


if __name__ == "__main__":
    main()
