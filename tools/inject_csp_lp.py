#!/usr/bin/env python3
# === tools/inject_csp_lp.py ===
# LP（ルートの index.html）は build.py の結合対象ではない（単独の静的ファイルのため）。
# デモアプリと同じ理由（インラインscriptの正確な内容からハッシュを取る）で、
# デプロイ時の組み立て先ファイルに対してだけ CSP を注入する。
# コミットされている index.html 自体は /* INJECT_CSP */ プレースホルダのまま保つ
# （実際のハッシュはビルドのたびに変わりうるため、リポジトリには埋め込まない）。
#
# 使い方: python3 tools/inject_csp_lp.py <対象のindex.htmlパス>  （通常は _site/index.html）

import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from csp import build_csp, script_hash


def inject(path: Path):
    html = path.read_text(encoding='utf-8')
    if '/* INJECT_CSP */' not in html:
        raise SystemExit(f"ERROR: {path} に /* INJECT_CSP */ プレースホルダが見つかりません")
    blocks = [m.group(1) for m in re.finditer(r'<script>(.*?)</script>', html, re.DOTALL)]
    if not blocks:
        raise SystemExit(f"ERROR: {path} に <script> ブロックが見つかりません")
    hashes = [script_hash(b) for b in blocks]
    html = html.replace('/* INJECT_CSP */', build_csp(hashes))
    path.write_text(html, encoding='utf-8')
    print(f"CSP injected into {path} ({len(blocks)} script block(s))")


if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python3 tools/inject_csp_lp.py <path/to/index.html>")
        sys.exit(1)
    inject(Path(sys.argv[1]))
