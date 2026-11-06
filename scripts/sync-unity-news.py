import json
import subprocess
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from email.utils import parsedate_to_datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
path = ROOT / 'src/data/unityNews.json'
response = subprocess.run(['curl', '--fail', '--location', '--max-time', '45', '--silent', '--show-error', 'https://unity.com/blog/feed'], check=True, capture_output=True)
root = ET.fromstring(response.stdout)
old = json.loads(path.read_text())
items = {item['url']: item for item in old['items']}
count = 0
for entry in root.findall('.//item'):
    title = (entry.findtext('title') or '').strip()
    url = (entry.findtext('link') or '').strip()
    date = entry.findtext('pubDate')
    if not title or not date or not url.startswith(('https://unity.com/', 'https://blog.unity.com/')):
        continue
    published = parsedate_to_datetime(date).astimezone(timezone.utc).isoformat()
    items[url] = {'title': title, 'url': url, 'publishedAt': published}
    count += 1
if not count:
    raise RuntimeError('Feed has no valid articles; preserving previous data')
data = {'updatedAt': datetime.now(timezone.utc).isoformat(), 'items': sorted(items.values(), key=lambda x: x['publishedAt'], reverse=True)[:300]}
path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n')
print(f'Synchronized {count} official articles')
