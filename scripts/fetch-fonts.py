#!/usr/bin/env python3
"""萌神小天博客 · 字体子集化与自托管脚本
从 Google Fonts 抓取 latin 子集 woff2 保存到 public/fonts/，并生成 @font-face 片段。
用法: python3 scripts/fetch-fonts.py
说明: 独立于 npm build 链，需要网络；执行一次后产物提交进仓库即可。
"""
import json
import os
import re
import subprocess
import sys
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FONT_DIR = os.path.join(ROOT, "public", "fonts")
FAMILIES = {
    "JetBrains Mono": [400, 500, 600, 700],
    "Press Start 2P": [400],
    "VT323": [400],
}

UA = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/126.0 Safari/537.36"
)

CSS_URL = (
    "https://fonts.googleapis.com/css2?"
    "family=JetBrains+Mono:wght@400;500;600;700"
    "&family=Press+Start+2P&family=VT323&display=swap"
)


def fetch(url: str) -> str:
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=15) as resp:
        return resp.read().decode("utf-8")


def slug(name: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")


def main() -> int:
    try:
        css = fetch(CSS_URL)
    except Exception as exc:  # noqa: BLE001
        print(f"[fonts] 网络获取失败，跳过字体本地化: {exc}")
        return 0

    os.makedirs(FONT_DIR, exist_ok=True)
    faces = []
    blocks = re.findall(r"@font-face\s*\{([^}]*)\}", css)
    if not blocks:
        print("[fonts] 未解析到 @font-face，跳过")
        return 1

    for block in blocks:
        fam = re.search(r"font-family:\s*['\"]([^'\"]+)['\"]", block)
        weight = re.search(r"font-weight:\s*(\d+)", block)
        style = re.search(r"font-style:\s*(\w+)", block)
        url = re.search(r"url\((https://[^)]+\.woff2)\)", block)
        urange = re.search(r"unicode-range:\s*([^;]+)", block)
        if not (fam and weight and url):
            continue
        if fam.group(1) not in FAMILIES or int(weight.group(1)) not in FAMILIES[fam.group(1)]:
            continue
        # 只保留 latin 核心子集，按首选顺序筛选
        ur = urange.group(1) if urange else ""
        is_latin = ur.startswith("U+0000-00FF")
        faces.append(
            {
                "family": fam.group(1),
                "weight": int(weight.group(1)),
                "style": style.group(1) if style else "normal",
                "url": url.group(1),
                "latin": is_latin,
            }
        )

    # latin 优先；若某 family+weight 没有 latin 则退回第一个可用子集
    seen = set()
    chosen = []
    for f in sorted(faces, key=lambda x: (not x["latin"])):
        key = (f["family"], f["weight"], f["style"])
        if key in seen:
            continue
        seen.add(key)
        chosen.append(f)

    css_parts = []
    for f in chosen:
        name = f"{slug(f['family'])}-{f['weight']}"
        dst = os.path.join(FONT_DIR, name + ".woff2")
        try:
            data = urllib.request.urlopen(
                urllib.request.Request(f["url"], headers={"User-Agent": UA}), timeout=20
            ).read()
        except Exception as exc:  # noqa: BLE001
            print(f"[fonts] 下载失败 {f['family']} {f['weight']}: {exc}")
            continue
        with open(dst, "wb") as fh:
            fh.write(data)
        css_parts.append(
            "@font-face { font-family: '%s'; font-style: %s; font-weight: %d; "
            "font-display: swap; src: url('/fonts/%s.woff2') format('woff2'); }"
            % (f["family"], f["style"], f["weight"], name)
        )
        print(f"[fonts] OK {name}.woff2 ({len(data)} bytes) latin={f['latin']}")

    css_text = (
        "/* 自托管字体（子集化，由 scripts/fetch-fonts.py 生成，勿手改） */\n"
        + "\n".join(css_parts)
        + "\n"
    )
    marker = os.path.join(FONT_DIR, "fonts-local.css")
    with open(marker, "w", encoding="utf-8") as fh:
        fh.write(css_text)
    print(f"[fonts] 已生成 {marker}，请将其中 @font-face 追加到 src/styles/blog.css 并移除 index.html 外部字体链接")
    return 0


if __name__ == "__main__":
    sys.exit(main())
