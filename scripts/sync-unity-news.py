import json
import re
import subprocess
import xml.etree.ElementTree as ET
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
from email.utils import parsedate_to_datetime
from pathlib import Path
from urllib.parse import urlsplit, urlunsplit

ROOT = Path(__file__).resolve().parents[1]
PATH = ROOT / 'src/data/unityNews.json'
SOURCES = [
    ('Unity 官方博客', '官方资讯', 'https://unity.com/blog/feed', False),
    ('Unity Discussions', '社区讨论', 'https://discussions.unity.com/latest.rss', False),
    ('Reddit · Unity3D', '开发者分享', 'https://www.reddit.com/r/Unity3D/new/.rss', False),
    ('Game Developer', '行业媒体', 'https://www.gamedeveloper.com/rss.xml', True),
]
ATOM = {'a': 'http://www.w3.org/2005/Atom'}


def normalize_url(url):
    parts = urlsplit(url.strip())
    if parts.scheme != 'https' or not parts.hostname:
        raise ValueError('Article must have an HTTPS URL')
    return urlunsplit((parts.scheme, parts.netloc, parts.path, parts.query, ''))


def fetch_source(source):
    name, category, feed, needs_filter = source
    response = subprocess.run(
        ['curl', '--fail', '--location', '--retry', '2', '--max-time', '40',
         '--silent', '--show-error', '--user-agent', 'UnityDailyBlog/1.0', feed],
        check=True, capture_output=True, timeout=135,
    )
    root = ET.fromstring(response.stdout)
    entries = root.findall('.//item') or root.findall('a:entry', ATOM)
    results = []
    for entry in entries:
        title = (entry.findtext('title') or entry.findtext('a:title', namespaces=ATOM) or '').strip()
        date = entry.findtext('pubDate') or entry.findtext('a:published', namespaces=ATOM) or entry.findtext('a:updated', namespaces=ATOM)
        link = entry.findtext('link')
        if not link:
            link = next((el.get('href') for el in entry.findall('a:link', ATOM) if el.get('rel', 'alternate') == 'alternate'), None)
        text = title + ' ' + (entry.findtext('description') or '')
        if needs_filter and not re.search(r'\bunity\b', text, re.I):
            continue
        if not title or not date or not link:
            continue
        try:
            published = parsedate_to_datetime(date) if entry.findtext('pubDate') else datetime.fromisoformat(date.replace('Z', '+00:00'))
            if published.tzinfo is None:
                continue
            results.append({'title': title, 'url': normalize_url(link),
                            'publishedAt': published.astimezone(timezone.utc).isoformat(),
                            'source': name, 'category': category})
        except (ValueError, TypeError):
            continue
    if not results and not needs_filter:
        raise ValueError('Feed contains no valid articles')
    return results


def main():
    old = json.loads(PATH.read_text())
    items = {item['url']: dict(item, source=item.get('source', 'Unity 官方博客'),
                             category=item.get('category', '官方资讯')) for item in old['items']}
    statuses = []
    with ThreadPoolExecutor(max_workers=4) as executor:
        futures = [(source, executor.submit(fetch_source, source)) for source in SOURCES]
        for source, future in futures:
            try:
                entries = future.result()
                items.update({entry['url']: entry for entry in entries})
                statuses.append({'name': source[0], 'url': source[2], 'ok': True, 'count': len(entries)})
                print(f'{source[0]}: {len(entries)} articles')
            except Exception as exc:
                print(f'::warning::{source[0]} unavailable: {exc}')
                statuses.append({'name': source[0], 'url': source[2], 'ok': False, 'count': 0})
    if not any(status['ok'] for status in statuses):
        raise RuntimeError('All sources failed; preserving previous data')
    data = {'updatedAt': datetime.now(timezone.utc).isoformat(), 'sources': statuses,
            'items': sorted(items.values(), key=lambda item: item['publishedAt'], reverse=True)[:300]}
    PATH.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n')


if __name__ == '__main__':
    main()
