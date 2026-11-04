"""Connect supplied article rows to matching images in the public article body."""
import csv
import html
import io
import json
import pathlib
import re
import sys
import urllib.parse
import urllib.request
from collections import defaultdict
from concurrent.futures import ThreadPoolExecutor
from difflib import SequenceMatcher
from html.parser import HTMLParser

ROOT = pathlib.Path(__file__).resolve().parents[1]
source = pathlib.Path(sys.argv[1]).read_text(encoding='utf-8-sig')
if source.startswith('#'):
    source = source.split('\n', 1)[1]
groups = defaultdict(list)
for row in csv.DictReader(io.StringIO(source)):
    url = row.get('원문URL', '')
    parsed = urllib.parse.urlsplit(url)
    if parsed.scheme == 'https' and parsed.hostname == 'mediahub.seoul.go.kr' and re.fullmatch(r'/archives/\d+', parsed.path):
        groups[url].append(row)

class ArticleImages(HTMLParser):
    def __init__(self):
        super().__init__()
        self.depth = 0
        self.images = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == 'div':
            if 'news_detail_cont' in attrs.get('class', '').split():
                self.depth = 1
            elif self.depth:
                self.depth += 1
        if tag == 'img' and self.depth:
            self.images.append((attrs.get('src', ''), attrs.get('alt', '')))

    def handle_endtag(self, tag):
        if tag == 'div' and self.depth:
            self.depth -= 1

def normalized(value):
    return re.sub(r'[\W_]+', '', html.unescape(value)).casefold()

def resolve(pair):
    url, rows = pair
    try:
        with urllib.request.urlopen(url, timeout=15) as response:
            body = response.read(2_000_000).decode('utf-8', errors='replace')
        parser = ArticleImages()
        parser.feed(body)
        found = {}
        for row in rows:
            title = normalized(re.sub(r'^\[이미지\s*\d+\]\s*', '', row['자료명']))
            ranked = []
            for path, alt in parser.images:
                absolute = urllib.parse.urljoin(url, path)
                parsed = urllib.parse.urlsplit(absolute)
                if parsed.scheme != 'https' or parsed.hostname != 'mediahub.seoul.go.kr' or not re.search(r'\.(jpg|jpeg|png|webp)(?:$|\?)', absolute, re.I):
                    continue
                label = normalized(alt)
                score = SequenceMatcher(None, title, label).ratio()
                if title and label and (title in label or label in title):
                    score = 1
                if score >= .82:
                    ranked.append((score, absolute, alt))
            ranked.sort(reverse=True)
            if ranked and (len(ranked) == 1 or ranked[0][0] > ranked[1][0]):
                found[row['자료ID']] = dict(url=ranked[0][1], sourceUrl=url, sourceAlt=ranked[0][2],
                    checkedAt='2026-10-26', method='article-body-image-caption-match')
        return found
    except Exception:
        return {}

destination = ROOT / 'data/photo-research/source-preview-links.json'
links = json.loads(destination.read_text()) if destination.exists() else {}
with ThreadPoolExecutor(max_workers=3) as pool:
    for index, results in enumerate(pool.map(resolve, groups.items()), 1):
        links.update(results)
        if index % 20 == 0:
            print(json.dumps(dict(articles=index, linked=len(links))), flush=True)
destination.write_text(json.dumps(links, ensure_ascii=False, indent=2) + '\n')
print(json.dumps(dict(articles=len(groups), linked=len(links))), flush=True)
