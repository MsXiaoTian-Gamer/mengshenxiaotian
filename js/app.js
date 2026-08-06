// 萌神小天博客公共 JS
// 依赖: articles.js (先加载)

var MONTHS_CN = ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'];
var MONTHS_EN = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function formatDateCN(dateStr) {
  var parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  var y = parseInt(parts[0]), m = parseInt(parts[1]), d = parseInt(parts[2]);
  return y + '年' + m + '月' + d + '日';
}

function getDateBadge(dateStr) {
  var parts = dateStr.split('-');
  if (parts.length !== 3) return { month: '', day: '' };
  var m = parseInt(parts[1]), d = parseInt(parts[2]);
  return { month: MONTHS_EN[m - 1], day: d };
}

function estimateReadingTime(content) {
  var text = content.replace(/[#*`\-_>\[\]()!|~]/g, ' ').replace(/\s+/g, ' ').trim();
  var chineseChars = (text.match(/[\u4e00-\u9fff]/g) || []).length;
  var englishWords = text.replace(/[\u4e00-\u9fff]/g, '').split(/\s+/).filter(Boolean).length;
  var minutes = Math.max(1, Math.ceil((chineseChars / 300) + (englishWords / 200)));
  return minutes;
}

function countWords(content) {
  var text = content.replace(/[#*`\-_>\[\]()!|~]/g, ' ').replace(/\s+/g, ' ').trim();
  var chineseChars = (text.match(/[\u4e00-\u9fff]/g) || []).length;
  var englishWords = text.replace(/[\u4e00-\u9fff]/g, '').split(/\s+/).filter(Boolean).length;
  return chineseChars + englishWords;
}

// ====== Custom marked renderer for code blocks ======
marked.setOptions({ breaks: true, gfm: true });

var origCodeRenderer = marked.Renderer.prototype.code;
marked.Renderer.prototype.code = function(obj) {
  var code = typeof obj === 'string' ? obj : obj.text;
  var lang = typeof obj === 'string' ? '' : (obj.lang || '');
  var html = origCodeRenderer.call(this, obj);
  var copyBtn = '<button class="copy-btn" onclick="copyCode(this)" data-code="'
    + code.replace(/"/g, '&quot;').replace(/'/g, '&#39;')
    + '" aria-label="复制代码">复制</button>';
  return '<div class="code-block-wrapper">' + copyBtn + html + '</div>';
};

// ====== Custom marked renderer for lazy images ======
var origImageRenderer = marked.Renderer.prototype.image;
marked.Renderer.prototype.image = function(href, title, text) {
  var img = '<img src="' + href + '" alt="' + (text || '') + '"';
  if (title) img += ' title="' + title + '"';
  img += ' loading="lazy" class="lazy-img" />';
  return img;
};

// ====== Global State ======
var activeTag = 'all';
var currentArticle = null;
var searchQuery = '';

var allTags = [];
// ====== Tag Color System ======
var TAG_COLORS = {
  'GameDev':   { color: 'var(--c-blue)',   bg: 'var(--c-blue-bg)'   },
  '独立游戏':  { color: 'var(--c-green)',  bg: 'var(--c-green-bg)'  },
  'Unity':     { color: 'var(--c-purple)', bg: 'var(--c-purple-bg)' },
  '更新':      { color: 'var(--c-orange)', bg: 'var(--c-orange-bg)' },
  '面试':      { color: 'var(--c-red)',    bg: 'var(--c-red-bg)'    },
  '腾讯':      { color: 'var(--c-teal)',   bg: 'var(--c-teal-bg)'   },
  'TapTap':    { color: 'var(--c-cyan)',   bg: 'var(--c-cyan-bg)'   },
  '聚光灯':    { color: 'var(--c-amber)',  bg: 'var(--c-amber-bg)'  },
  '学习':      { color: 'var(--c-indigo)', bg: 'var(--c-indigo-bg)' },
};

function getTagColors(tag) {
  return TAG_COLORS[tag] || { color: 'var(--c-default)', bg: 'var(--c-default-bg)' };

}

function getPrimaryTag(article) {
  if (!article.tags || article.tags.length === 0) return null;
  for (var i = 0; i < article.tags.length; i++) {
    if (TAG_COLORS[article.tags[i]]) return article.tags[i];
  }
  return article.tags[0];
}


var seen = {};
ARTICLES.forEach(function(a) {
  a.tags.forEach(function(t) {
    if (!seen[t]) { seen[t] = true; allTags.push(t); }
  });
});


// ====== Theme ======
function getTheme() {
  return localStorage.getItem('blog_theme') || 'light';
}

function applyTheme() {
  var theme = getTheme();
  document.documentElement.setAttribute('data-theme', theme);
  var icon = document.getElementById('themeIcon');
  icon.innerHTML = theme === 'dark' ? '&#9788;' : '&#9790;';

  var hljsLight = document.getElementById('hljs-light');
  var hljsDark = document.getElementById('hljs-dark');
  if (theme === 'dark') {
    hljsLight.disabled = true;
    hljsDark.disabled = false;
  } else {
    hljsLight.disabled = false;
    hljsDark.disabled = true;
  }
}

function toggleTheme() {
  var newTheme = getTheme() === 'dark' ? 'light' : 'dark';
  localStorage.setItem('blog_theme', newTheme);
  applyTheme();
}

// ====== Admin ======

  try { return JSON.parse(localStorage.getItem('blog_deleted') || '[]'); }
  catch(e) { return []; }
}

function addDeleted(filename) {
  var list = getDeletedList();
  if (list.indexOf(filename) === -1) list.push(filename);
  localStorage.setItem('blog_deleted', JSON.stringify(list));
}

function removeDeleted(filename) {
  var list = getDeletedList().filter(function(f) { return f !== filename; });
  localStorage.setItem('blog_deleted', JSON.stringify(list));
}

function getEditedContent(filename) {
  return localStorage.getItem('blog_edited_' + filename);
}

function saveEditedContent(filename, content) {
  localStorage.setItem('blog_edited_' + filename, content);
}

function removeEditedContent(filename) {
  localStorage.removeItem('blog_edited_' + filename);
}

function getNewArticles() {
  var result = [];
  for (var i = 0; i < localStorage.length; i++) {
    var key = localStorage.key(i);
    if (key.indexOf('blog_new_') === 0) {
      try { result.push(JSON.parse(localStorage.getItem(key))); }
      catch(e) {}
    }
  }
  return result;
}

function saveNewArticleData(article) {
  var id = Date.now();
  article.id = id;
  article.path = 'blog_new_' + id;
  article.isNew = true;
  localStorage.setItem('blog_new_' + id, JSON.stringify(article));
  return article;
}

function deleteNewArticle(id) {
  localStorage.removeItem('blog_new_' + id);
}

function getAllArticles() {
  var deleted = getDeletedList();
  var baseArticles = ARTICLES.filter(function(a) { return deleted.indexOf(a.path) === -1; });
  var newArticles = getNewArticles().filter(function(a) { return deleted.indexOf(a.path) === -1; });
  var all = baseArticles.concat(newArticles).sort(function(a, b) { return b.date.localeCompare(a.date); });

  // Feature 4: Pinned articles first
  all.sort(function(a, b) {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return b.date.localeCompare(a.date);
  });

  all.forEach(function(a) {
    a.tags.forEach(function(t) {
      if (!seen[t]) { seen[t] = true; allTags.push(t); }
    });
  });

  return all;
}

function getArticleContent(article) {
  if (article.isNew) {
    return article.content || '';
  }
  var edited = getEditedContent(article.path);
  if (edited !== null) return edited;
  return stripFrontMatter(ARTICLES_CONTENT[article.path] || '');
}

function stripFrontMatter(md) {
  if (!md) return '';
  if (md.indexOf('---') === 0) {
    var end = md.indexOf('---', 3);
    if (end !== -1) {
      return md.substring(end + 3).trim();
    }
  }
  return md;
}


function getFiltered() {
  var all = getAllArticles();
  if (activeTag !== 'all') {
    all = all.filter(function(a) { return a.tags.indexOf(activeTag) >= 0; });
  }
  if (searchQuery) {
    all = all.filter(function(a) {
      var content = getArticleContent(a);
      return a.title.toLowerCase().indexOf(searchQuery) >= 0 ||
             content.toLowerCase().indexOf(searchQuery) >= 0 ||
             a.tags.some(function(t) { return t.toLowerCase().indexOf(searchQuery) >= 0; });
    });
  }
  return all;
}


function copyCode(btn) {
  var code = btn.getAttribute('data-code');
  var textarea = document.createElement('textarea');
  textarea.innerHTML = code;
  var decoded = textarea.value;
  navigator.clipboard.writeText(decoded).then(function() {
    btn.textContent = '已复制';
    btn.classList.add('copied');
    setTimeout(function() {
      btn.textContent = '复制';
      btn.classList.remove('copied');
    }, 2000);
  });
}

// ====== Back to Top ======
function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}


function shareCopyLink(event) {
  var btn = event.target.closest('.share-btn');
  navigator.clipboard.writeText(window.location.href).then(function() {
    btn.textContent = '\u2714 已复制';
    btn.classList.add('copied');
    setTimeout(function() {
      btn.innerHTML = '&#128279; 复制链接';
      btn.classList.remove('copied');
    }, 2000);
  }).catch(function() {
    btn.textContent = '复制失败';
    setTimeout(function() {
      btn.innerHTML = '&#128279; 复制链接';
    }, 2000);
  });
}


function toggleLike(path) {
  var likeKey = 'blog_likes_' + path;
  var liked = localStorage.getItem(likeKey) === '1';
  var countKey = likeKey + '_count';
  var btn = document.getElementById('likeBtn');
  var countEl = document.getElementById('likeCount');

  if (liked) {
    localStorage.removeItem(likeKey);
    var count = Math.max(0, parseInt(localStorage.getItem(countKey) || '0', 10) - 1);
    localStorage.setItem(countKey, count);
    if (btn) { btn.classList.remove('liked'); }
    if (countEl) { countEl.textContent = count; }
  } else {
    localStorage.setItem(likeKey, '1');
    var count = parseInt(localStorage.getItem(countKey) || '0', 10) + 1;
    localStorage.setItem(countKey, count);
    if (btn) { btn.classList.add('liked'); }
    if (countEl) { countEl.textContent = count; }
  }
}


function highlightContentKeywords(container, query) {
  if (!query) return;
  var walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, null, false);
  var textNodes = [];
  while (walker.nextNode()) {
    var node = walker.currentNode;
    if (node.parentNode.tagName !== 'SCRIPT' && node.parentNode.tagName !== 'STYLE' &&
        node.parentNode.tagName !== 'MARK' && node.parentNode.tagName !== 'CODE' &&
        node.parentNode.tagName !== 'PRE' && !node.parentNode.classList.contains('code-run-btn') &&
        !node.parentNode.classList.contains('copy-btn')) {
      textNodes.push(node);
    }
  }
  var escaped = escapeRegex(query);
  var regex = new RegExp('(' + escaped + ')', 'gi');
  textNodes.forEach(function(node) {
    var text = node.textContent;
    if (regex.test(text)) {
      regex.lastIndex = 0;
      var frag = document.createDocumentFragment();
      var lastIdx = 0;
      var match;
      while ((match = regex.exec(text)) !== null) {
        if (match.index > lastIdx) {
          frag.appendChild(document.createTextNode(text.substring(lastIdx, match.index)));
        }
        var mark = document.createElement('mark');
        mark.className = 'search-highlight';
        mark.textContent = match[0];
        frag.appendChild(mark);
        lastIdx = match.index + match[0].length;
      }
      if (lastIdx < text.length) {
        frag.appendChild(document.createTextNode(text.substring(lastIdx)));
      }
      node.parentNode.replaceChild(frag, node);
    }
  });
}


function runCodePreview(code, lang) {
  var modal = document.createElement('div');
  modal.className = 'code-preview-modal';

  var container = document.createElement('div');
  container.className = 'code-preview-container';

  var header = document.createElement('div');
  header.className = 'code-preview-header';
  var title = document.createElement('span');
  title.textContent = '代码预览 (' + lang.toUpperCase() + ')';
  var closeBtn = document.createElement('button');
  closeBtn.innerHTML = '&times;';
  closeBtn.onclick = function() { modal.remove(); };
  header.appendChild(title);
  header.appendChild(closeBtn);

  var iframe = document.createElement('iframe');
  iframe.className = 'code-preview-iframe';
  iframe.sandbox = 'allow-scripts allow-same-origin';

  if (lang === 'html' || lang === 'js' || lang === 'javascript') {
    var htmlContent = code;
    if (lang === 'js' || lang === 'javascript') {
      htmlContent = '<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body><script>' + code + '<\/script></body></html>';
    } else if (lang === 'html') {
      if (!/<html/i.test(code) && !/<body/i.test(code) && !/<head/i.test(code)) {
        htmlContent = '<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body>' + code + '</body></html>';
      }
    }
    iframe.srcdoc = htmlContent;
  } else if (lang === 'css') {
    var cssHtml = '<!DOCTYPE html><html><head><meta charset="UTF-8"><style>' + code + '</style></head><body><div style="padding:20px;font-family:sans-serif;">CSS 预览（请查看样式效果）</div></body></html>';
    iframe.srcdoc = cssHtml;
  }

  container.appendChild(header);
  container.appendChild(iframe);
  modal.appendChild(container);

  modal.addEventListener('click', function(e) {
    if (e.target === modal) modal.remove();
  });
  document.addEventListener('keydown', function closeEsc(e) {
    if (e.key === 'Escape') { modal.remove(); document.removeEventListener('keydown', closeEsc); }
  });

  document.body.appendChild(modal);
}

// ====== Feature 7: MD Toolbar Insert ======
function mdInsert(textareaId, prefix, suffix) {
  var ta = document.getElementById(textareaId);
  if (!ta) return;
  var start = ta.selectionStart;
  var end = ta.selectionEnd;
  var text = ta.value;
  var selected = text.substring(start, end);
  var before = text.substring(0, start);
  var after = text.substring(end);
  var replacement = prefix + selected + suffix;
  ta.value = before + replacement + after;
  ta.focus();
  var newCursorPos = before.length + prefix.length + selected.length;
  ta.setSelectionRange(newCursorPos, newCursorPos);
}

// ====== Feature 5: Site Runtime ======


function updateFloatNav(article) {
  var filtered = getAllArticles();
  var idx = -1;
  for (var i = 0; i < filtered.length; i++) {
    if (filtered[i].path === article.path) { idx = i; break; }
  }
  var prevBtn = document.getElementById('float-prev');
  var nextBtn = document.getElementById('float-next');

  if (idx > 0) {
    prevBtn.classList.remove('disabled');
    prevBtn.onclick = function() { loadArticleByFilteredIdx(idx - 1); };
  } else {
    prevBtn.classList.add('disabled');
    prevBtn.onclick = null;
  }

  if (idx >= 0 && idx < filtered.length - 1) {
    nextBtn.classList.remove('disabled');
    nextBtn.onclick = function() { loadArticleByFilteredIdx(idx + 1); };
  } else {
    nextBtn.classList.add('disabled');
    nextBtn.onclick = null;
  }
}

function loadArticleByFilteredIdx(idx) {
  var filtered = getAllArticles();
  var article = filtered[idx];
  if (!article) return;
  currentArticle = article;
  // 手机端自动关闭侧边栏
  if (window.innerWidth <= 900) {
    document.body.classList.remove('nav-open');
  }
  fadeContent(function() {
    renderArticle(article);
    renderArticleList();
    if (isAdmin()) {
      document.getElementById('articleAdminActions').style.display = 'flex';
    }
  });
}


function renderRelatedArticles(article, area) {
  var all = getAllArticles();
  var candidates = all.filter(function(a) { return a.path !== article.path; });
  if (candidates.length === 0) return;

  var scored = candidates.map(function(a) {
    var commonTags = 0;
    if (article.tags && a.tags) {
      article.tags.forEach(function(t) {
        if (a.tags.indexOf(t) >= 0) commonTags++;
      });
    }
    return { article: a, score: commonTags };
  }).filter(function(item) { return item.score > 0; })
    .sort(function(a, b) { return b.score - a.score; })
    .slice(0, 3);

  if (scored.length === 0) return;

  var section = document.createElement('div');
  section.className = 'related-section';
  var title = document.createElement('h3');
  title.textContent = '相关文章推荐';
  section.appendChild(title);

  var cards = document.createElement('div');
  cards.className = 'related-cards';
  scored.forEach(function(item) {
    var a = item.article;
    var badge = getDateBadge(a.date);
    var card = document.createElement('a');
    card.className = 'related-card';
    card.onclick = function(e) {
      e.preventDefault();
      var allArts = getAllArticles();
      for (var i = 0; i < allArts.length; i++) {
        if (allArts[i].path === a.path) {
          currentArticle = allArts[i];
          renderArticle(allArts[i]);
          renderArticleList();
          if (isAdmin()) document.getElementById('articleAdminActions').style.display = 'flex';
          history.replaceState(null, '', '#article/' + a.path.replace('.md', ''));
          window.scrollTo({ top: 0, behavior: 'smooth' });
          break;
        }
      }
    };
    var pt = getPrimaryTag(a);
    var ptc = getTagColors(pt);
    card.innerHTML =
      '<div class="related-card-title">' + a.title + '</div>' +
      '<div class="related-card-meta">' + badge.month + ' ' + badge.day + ' &middot; ' + formatDateCN(a.date) + '</div>' +
      '<div class="related-card-tags">' +
        a.tags.slice(0, 3).map(function(t) { var tc = getTagColors(t); return '<span style="color:' + tc.color + ';background:' + tc.bg + '">#' + t + '</span>'; }).join('') +
      '</div>';
    cards.appendChild(card);
  });
  section.appendChild(cards);
  area.appendChild(section);
}



function loadArticle(idx) {
  var filtered = getFiltered();
  var article = filtered[idx];
  if (!article) return;
  currentArticle = article;
  resetSearch();

  // 手机端选择文章后自动关闭侧边栏
  if (window.innerWidth <= 900) {
    document.body.classList.remove('nav-open');
  }

  fadeContent(function() {
    renderArticle(article);

function renderArticle(article) {
  var md = getArticleContent(article);
  var html = marked.parse(md);
  var area = document.getElementById('content-area');

  document.getElementById('heroSection').style.display = 'none';

  // Feature 6: Article views tracking
  var viewKey = 'blog_views_' + article.path;
  var views = parseInt(localStorage.getItem(viewKey) || '0', 10) + 1;
  localStorage.setItem(viewKey, views);

  // 动态 SEO
  document.title = article.title + ' - 萌神小天';
  var desc = stripFrontMatter(getArticleContent(article)).replace(/#{1,6}\s/g, '').replace(/\n/g, ' ').substring(0, 160).trim();
  var metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) metaDesc.setAttribute('content', desc);
  var ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) ogTitle.setAttribute('content', article.title + ' - 萌神小天');
  var ogDesc = document.querySelector('meta[property="og:description"]');
  if (ogDesc) ogDesc.setAttribute('content', desc);
  var ogUrl = document.querySelector('meta[property="og:url"]');
  if (ogUrl) ogUrl.setAttribute('content', window.location.href);
  var twTitle = document.querySelector('meta[name="twitter:title"]');
  if (twTitle) twTitle.setAttribute('content', article.title + ' - 萌神小天');
  var twDesc = document.querySelector('meta[name="twitter:description"]');
  if (twDesc) twDesc.setAttribute('content', desc);

  area.innerHTML = '';
  var headerDiv = document.createElement('div');
  headerDiv.className = 'article-header';

  var readMin = estimateReadingTime(md);
  var wordCount = countWords(md);
  headerDiv.innerHTML =
    '<h1>' + article.title + '</h1>' +
    '<div class="meta-line">' +
      '<span>' + formatDateCN(article.date) + '</span>' +
      '<span>' + wordCount + ' 字 &middot; ' + readMin + ' 分钟阅读</span>' +
      '<span class="article-views">' + views + ' 次浏览</span>' +
      article.tags.map(function(t) { var tc = getTagColors(t); return '<span class="tag-pill" style="--tag-pill-color:' + tc.color + ';--tag-pill-bg:' + tc.bg + '">#' + t + '</span>'; }).join('') +
    '</div>';
  area.appendChild(headerDiv);

  var bodyDiv = document.createElement('div');
  bodyDiv.className = 'markdown-body';
  bodyDiv.innerHTML = html;

  // Feature 3: Search keyword highlighting in article content
  if (searchQuery) {
    highlightContentKeywords(bodyDiv, searchQuery);
  }

  area.appendChild(bodyDiv);

  // ====== TOC 目录生成 ======
  var headings = bodyDiv.querySelectorAll('h2, h3');
  if (headings.length >= 2) {
    var toc = document.createElement('nav');
    toc.className = 'article-toc';
    toc.setAttribute('aria-label', '文章目录');
    var tocTitle = document.createElement('div');
    tocTitle.className = 'toc-title';
    tocTitle.textContent = '目录';
    toc.appendChild(tocTitle);
    var tocList = document.createElement('ul');
    tocList.className = 'toc-list';
    headings.forEach(function(h, idx) {
      var id = 'heading-' + idx;
      h.id = id;
      var li = document.createElement('li');
      li.className = 'toc-item toc-' + h.tagName.toLowerCase();
      var a = document.createElement('a');
      a.href = '#' + id;
      a.textContent = h.textContent;
      a.addEventListener('click', function(e) {
        e.preventDefault();
        var target = document.getElementById(this.getAttribute('href').substring(1));
        if (target) target.scrollIntoView({ behavior: 'smooth' });
      });
      li.appendChild(a);
      tocList.appendChild(li);
    });
    toc.appendChild(tocList);
    area.insertBefore(toc, bodyDiv);

    // Feature 1: TOC IntersectionObserver for scroll highlighting
    var tocLinks = tocList.querySelectorAll('.toc-item a');
    var headingEls = [];
    headings.forEach(function(h) { headingEls.push(h); });
    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        var id = entry.target.id;
        var link = tocList.querySelector('a[href="#' + id + '"]');
        if (link) {
          if (entry.isIntersecting) {
            tocLinks.forEach(function(l) { l.classList.remove('active'); });
            link.classList.add('active');
          }
        }
      });
    }, { rootMargin: '-80px 0px -70% 0px', threshold: 0 });
    headingEls.forEach(function(h) { observer.observe(h); });
  }

  // Feature 2: Related articles
  renderRelatedArticles(article, area);

  // Share buttons
  var shareDiv = document.createElement('div');
  shareDiv.className = 'share-section';
  var shareUrl = encodeURIComponent(window.location.href);
  var shareTitle = encodeURIComponent(article.title);
  shareDiv.innerHTML =
    '<span>分享：</span>' +
    '<button class="share-btn" onclick="shareCopyLink(event)" title="复制链接" aria-label="复制链接">&#128279; 复制链接</button>' +
    '<a class="share-btn" href="https://service.weibo.com/share/share.php?url=' + shareUrl + '&title=' + shareTitle + '" target="_blank" rel="noopener" aria-label="分享到微博">&#xe000; 微博</a>' +
    '<a class="share-btn" href="https://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?url=' + shareUrl + '&title=' + shareTitle + '" target="_blank" rel="noopener" aria-label="分享到QQ空间">&#xe001; QQ空间</a>';
  area.appendChild(shareDiv);

  // Feature 10: Like button
  var likeSection = document.createElement('div');
  likeSection.className = 'like-section';
  var likeKey = 'blog_likes_' + article.path;
  var liked = localStorage.getItem(likeKey) === '1';
  var likeCount = parseInt(localStorage.getItem(likeKey + '_count') || '0', 10);
  likeSection.innerHTML = '<button class="like-btn' + (liked ? ' liked' : '') + '" id="likeBtn" onclick="toggleLike(\'' + article.path.replace(/'/g, "\\'") + '\')">' +
    '<span class="like-icon">❤️</span> <span class="like-count" id="likeCount">' + likeCount + '</span> 次点赞</button>';
  area.appendChild(likeSection);

  // Giscus 评论
  // 注意：请前往 https://giscus.app/zh-CN 填写仓库信息获取真实的 data-repo-id 和 data-category-id
  var commentDiv = document.createElement('div');
  commentDiv.className = 'giscus-comments';
  commentDiv.id = 'giscus-container';
  area.appendChild(commentDiv);

  var giscusScript = document.createElement('script');
  giscusScript.src = 'https://giscus.app/client.js';
  giscusScript.setAttribute('data-repo', 'MsXiaoTian-Gamer/mengshenxiaotian');
  giscusScript.setAttribute('data-repo-id', 'R_kgDOToc_Fg');
  giscusScript.setAttribute('data-category', 'General');
  giscusScript.setAttribute('data-category-id', 'DIC_kwDOToc_Fs4DCXIO');
  giscusScript.setAttribute('data-mapping', 'pathname');
  giscusScript.setAttribute('data-strict', '0');
  giscusScript.setAttribute('data-reactions-enabled', '1');
  giscusScript.setAttribute('data-emit-metadata', '0');
  giscusScript.setAttribute('data-input-position', 'bottom');
  giscusScript.setAttribute('data-theme', 'preferred_color_scheme');
  giscusScript.setAttribute('data-lang', 'zh-CN');
  giscusScript.setAttribute('crossorigin', 'anonymous');
  giscusScript.async = true;
  commentDiv.appendChild(giscusScript);

  // ====== 代码块语言标签 + Feature 8: Code Run Button ======
  bodyDiv.querySelectorAll('pre').forEach(function(pre) {
    var code = pre.querySelector('code');
    if (code) {
      var classes = code.className.split(' ');
      var lang = '';
      for (var ci = 0; ci < classes.length; ci++) {
        if (classes[ci].startsWith('language-')) {
          lang = classes[ci].replace('language-', '');
          break;
        }
      }
      if (lang) {
        var langLabel = document.createElement('div');
        langLabel.className = 'code-lang-label';
        langLabel.textContent = lang;
        pre.insertBefore(langLabel, pre.firstChild);
      }
      // Feature 8: Add run button for web languages
      var lowerLang = (lang || '').toLowerCase();
      if (lowerLang === 'html' || lowerLang === 'css' || lowerLang === 'javascript' || lowerLang === 'js') {
        var runBtn = document.createElement('button');
        runBtn.className = 'code-run-btn';
        runBtn.textContent = '▶ 运行';
        runBtn.onclick = function() { runCodePreview(code.textContent, lowerLang); };
        pre.style.position = 'relative';
        pre.appendChild(runBtn);
      }
    }
  });

  bodyDiv.querySelectorAll('pre code').forEach(function(block) {
    hljs.highlightElement(block);
  });

  bodyDiv.querySelectorAll('.copy-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      copyCode(this);
    });
  });

  // ====== 图片 lightbox 点击放大 ======
  bodyDiv.querySelectorAll('img').forEach(function(img) {
    img.style.cursor = 'pointer';
    img.addEventListener('click', function() {
      var overlay = document.createElement('div');
      overlay.className = 'lightbox-overlay';
      var lbImg = document.createElement('img');
      lbImg.src = img.src;
      lbImg.className = 'lightbox-img';
      overlay.appendChild(lbImg);
      overlay.addEventListener('click', function() { overlay.remove(); });
      document.addEventListener('keydown', function closeEsc(e) {
        if (e.key === 'Escape') { overlay.remove(); document.removeEventListener('keydown', closeEsc); }
      });
      document.body.appendChild(overlay);
    });
  });

  updateFloatNav(article);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ====== Multi-page: renderArticleContent ======
// 接收 article 对象和 target element，渲染完整文章内容
function renderArticleContent(article, targetEl) {
  if (!article || !targetEl) return;

  var md = getArticleContent(article);
  var html = marked.parse(md);

  targetEl.innerHTML = '';

  // Meta header
  var headerDiv = document.createElement('div');
  headerDiv.className = 'article-header';

  var readMin = estimateReadingTime(md);
  var wordCount = countWords(md);
  var views = parseInt(localStorage.getItem('blog_views_' + article.path) || '0', 10) + 1;
  localStorage.setItem('blog_views_' + article.path, views);

  headerDiv.innerHTML =
    '<h1>' + article.title + '</h1>' +
    '<div class="meta-line">' +
      '<span>' + formatDateCN(article.date) + '</span>' +
      '<span>' + wordCount + ' 字 &middot; ' + readMin + ' 分钟阅读</span>' +
      '<span class="article-views">' + views + ' 次浏览</span>' +
      article.tags.map(function(t) { var tc = getTagColors(t); return '<span class="tag-pill" style="--tag-pill-color:' + tc.color + ';--tag-pill-bg:' + tc.bg + '">#' + t + '</span>'; }).join('') +
    '</div>';
  targetEl.appendChild(headerDiv);

  // Article body
  var bodyDiv = document.createElement('div');
  bodyDiv.className = 'markdown-body';
  bodyDiv.innerHTML = html;
  targetEl.appendChild(bodyDiv);

  // TOC
  var headings = bodyDiv.querySelectorAll('h2, h3');
  if (headings.length >= 2) {
    var toc = document.createElement('nav');
    toc.className = 'article-toc';
    toc.setAttribute('aria-label', '文章目录');
    var tocTitle = document.createElement('div');
    tocTitle.className = 'toc-title';
    tocTitle.textContent = '目录';
    toc.appendChild(tocTitle);
    var tocList = document.createElement('ul');
    tocList.className = 'toc-list';
    headings.forEach(function(h, idx) {
      var id = 'heading-' + idx;
      h.id = id;
      var li = document.createElement('li');
      li.className = 'toc-item toc-' + h.tagName.toLowerCase();
      var a = document.createElement('a');
      a.href = '#' + id;
      a.textContent = h.textContent;
      a.addEventListener('click', function(e) {
        e.preventDefault();
        var target = document.getElementById(this.getAttribute('href').substring(1));
        if (target) target.scrollIntoView({ behavior: 'smooth' });
      });
      li.appendChild(a);
      tocList.appendChild(li);
    });
    toc.appendChild(tocList);
    targetEl.insertBefore(toc, bodyDiv);

    // TOC scroll observer
    var tocLinks = tocList.querySelectorAll('.toc-item a');
    var headingEls = [];
    headings.forEach(function(h) { headingEls.push(h); });
    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        var id = entry.target.id;
        var link = tocList.querySelector('a[href="#' + id + '"]');
        if (link) {
          if (entry.isIntersecting) {
            tocLinks.forEach(function(l) { l.classList.remove('active'); });
            link.classList.add('active');
          }
        }
      });
    }, { rootMargin: '-80px 0px -70% 0px', threshold: 0 });
    headingEls.forEach(function(h) { observer.observe(h); });
  }

  // Related articles
  renderRelatedArticles(article, targetEl);

  // Share buttons
  var shareDiv = document.createElement('div');
  shareDiv.className = 'share-section';
  var shareUrl = encodeURIComponent(window.location.href);
  var shareTitle = encodeURIComponent(article.title);
  shareDiv.innerHTML =
    '<span>分享：</span>' +
    '<button class="share-btn" onclick="shareCopyLink(event)" title="复制链接" aria-label="复制链接">&#128279; 复制链接</button>' +
    '<a class="share-btn" href="https://service.weibo.com/share/share.php?url=' + shareUrl + '&title=' + shareTitle + '" target="_blank" rel="noopener" aria-label="分享到微博">&#xe000; 微博</a>' +
    '<a class="share-btn" href="https://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?url=' + shareUrl + '&title=' + shareTitle + '" target="_blank" rel="noopener" aria-label="分享到QQ空间">&#xe001; QQ空间</a>';
  targetEl.appendChild(shareDiv);

  // Like button
  var likeSection = document.createElement('div');
  likeSection.className = 'like-section';
  var likeKey = 'blog_likes_' + article.path;
  var liked = localStorage.getItem(likeKey) === '1';
  var likeCount = parseInt(localStorage.getItem(likeKey + '_count') || '0', 10);
  likeSection.innerHTML = '<button class="like-btn' + (liked ? ' liked' : '') + '" id="likeBtn" onclick="toggleLike(\'' + article.path.replace(/'/g, "\\'") + '\')">' +
    '<span class="like-icon">❤️</span> <span class="like-count" id="likeCount">' + likeCount + '</span> 次点赞</button>';
  targetEl.appendChild(likeSection);

  // Giscus 评论
  var commentDiv = document.createElement('div');
  commentDiv.className = 'giscus-comments';
  commentDiv.id = 'giscus-container';
  targetEl.appendChild(commentDiv);

  var giscusScript = document.createElement('script');
  giscusScript.src = 'https://giscus.app/client.js';
  giscusScript.setAttribute('data-repo', 'MsXiaoTian-Gamer/mengshenxiaotian');
  giscusScript.setAttribute('data-repo-id', 'R_kgDOToc_Fg');
  giscusScript.setAttribute('data-category', 'General');
  giscusScript.setAttribute('data-category-id', 'DIC_kwDOToc_Fs4DCXIO');
  giscusScript.setAttribute('data-mapping', 'pathname');
  giscusScript.setAttribute('data-strict', '0');
  giscusScript.setAttribute('data-reactions-enabled', '1');
  giscusScript.setAttribute('data-emit-metadata', '0');
  giscusScript.setAttribute('data-input-position', 'bottom');
  giscusScript.setAttribute('data-theme', 'preferred_color_scheme');
  giscusScript.setAttribute('data-lang', 'zh-CN');
  giscusScript.setAttribute('crossorigin', 'anonymous');
  giscusScript.async = true;
  commentDiv.appendChild(giscusScript);

  // Code blocks: language labels + run buttons
  bodyDiv.querySelectorAll('pre').forEach(function(pre) {
    var code = pre.querySelector('code');
    if (code) {
      var classes = code.className.split(' ');
      var lang = '';
      for (var ci = 0; ci < classes.length; ci++) {
        if (classes[ci].startsWith('language-')) {
          lang = classes[ci].replace('language-', '');
          break;
        }
      }
      if (lang) {
        var langLabel = document.createElement('div');
        langLabel.className = 'code-lang-label';
        langLabel.textContent = lang;
        pre.insertBefore(langLabel, pre.firstChild);
      }
      var lowerLang = (lang || '').toLowerCase();
      if (lowerLang === 'html' || lowerLang === 'css' || lowerLang === 'javascript' || lowerLang === 'js') {
        var runBtn = document.createElement('button');
        runBtn.className = 'code-run-btn';
        runBtn.textContent = '▶ 运行';
        runBtn.onclick = function() { runCodePreview(code.textContent, lowerLang); };
        pre.style.position = 'relative';
        pre.appendChild(runBtn);
      }
    }
  });

  // Code highlighting
  bodyDiv.querySelectorAll('pre code').forEach(function(block) {
    hljs.highlightElement(block);
  });

  bodyDiv.querySelectorAll('.copy-btn').forEach(function(btn) {
    btn.addEventListener('click', function() { copyCode(this); });
  });

  // Image lightbox
  bodyDiv.querySelectorAll('img').forEach(function(img) {
    img.style.cursor = 'pointer';
    img.addEventListener('click', function() {
      var overlay = document.createElement('div');
      overlay.className = 'lightbox-overlay';
      var lbImg = document.createElement('img');
      lbImg.src = img.src;
      lbImg.className = 'lightbox-img';
      overlay.appendChild(lbImg);
      overlay.addEventListener('click', function() { overlay.remove(); });
      document.addEventListener('keydown', function closeEsc(e) {
        if (e.key === 'Escape') { overlay.remove(); document.removeEventListener('keydown', closeEsc); }
      });
      document.body.appendChild(overlay);
    });
  });
}

// ====== Multi-page: renderArticleNav ======
// 返回包含返回首页链接的导航栏 HTML
function renderArticleNav(homeUrl) {
  homeUrl = homeUrl || '/';
  return '<nav class="article-nav">' +
    '<a href="' + homeUrl + '" class="nav-back-home" title="返回首页">' +
      '<span class="nav-back-arrow">&larr;</span> 返回首页' +
    '</a>' +
    '<button class="theme-toggle-btn" onclick="toggleTheme()" aria-label="切换主题">' +
      '<span id="themeIcon">&#9790;</span>' +
    '</button>' +
  '</nav>';
}

// ====== Multi-page: initTheme ======
// 初始化主题，设置 data-theme 属性并绑定切换事件
function initTheme() {
  applyTheme();
  var toggleBtn = document.querySelector('.theme-toggle-btn');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', toggleTheme);
  }
}

