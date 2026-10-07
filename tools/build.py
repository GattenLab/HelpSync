#!/usr/bin/env python3
# === tools/build.py ===
# src/ → dist/ 結合ビルド + minify + バージョン付与
#   - index.html            : CSS/JS を結合して埋め込み（単一ファイル）
#   - sw.js                 : src/assets/sw.js の __VERSION__ をビルド時刻に置換して出力
#                             （キャッシュ名にバージョンが入るため、デプロイごとに旧キャッシュが破棄される）
#   - manifest.json / アイコン : src/assets からコピー

import os
import re
import sys
import json
from pathlib import Path
from datetime import datetime

sys.path.insert(0, str(Path(__file__).parent))
from csp import build_csp, script_hash

SRC = Path(__file__).parent.parent / 'src'
DIST = Path(__file__).parent.parent / 'dist'
DIST.mkdir(exist_ok=True)

VERSION = datetime.now().strftime('%Y%m%d-%H%M%S')

def minify_css(css):
    # 簡易minify: コメント削除、空白圧縮
    css = re.sub(r'/\*.*?\*/', '', css, flags=re.DOTALL)
    css = re.sub(r'\s+', ' ', css)
    css = re.sub(r';?\s*}', '}', css)
    css = re.sub(r'{\s+', '{', css)
    css = re.sub(r';\s+', ';', css)
    return css.strip()

# 行コメント（// 以降）の除去パターン。
# http:// と https:// の「//」は文字列中のURLなので残す（例: createElementNS('http://www.w3.org/2000/svg', ...)）。
# ※ 旧実装は行内の最初の「//」以降を無条件に削除していたため、URL文字列を含む行が途中で切れて JS が構文エラーになった。
# ※ それ以外の文字列中の // （'a//b' など）は従来どおり除去される。文字列の中に // を書かないこと。
_LINE_COMMENT = re.compile(r'(?<!http:)(?<!https:)//.*$')

def minify_js(js):
    # 簡易minify: 行コメント削除、連続空白圧縮
    lines = []
    for line in js.split('\n'):
        line = _LINE_COMMENT.sub('', line)
        lines.append(line)
    js = '\n'.join(lines)
    js = re.sub(r'/\*.*?\*/', '', js, flags=re.DOTALL)
    js = re.sub(r'\s+', ' ', js)
    return js.strip()

def build():
    # 1. HTMLスケルトン読み込み
    html = (SRC / 'index.html').read_text(encoding='utf-8')

    # 2. CSS結合
    css_files = ['base.css', 'components.css', 'layout.css', 'responsive.css']
    css_parts = []
    for cf in css_files:
        path = SRC / 'css' / cf
        if path.exists():
            css_parts.append(path.read_text(encoding='utf-8'))
        else:
            print(f"WARNING: {path} not found")
    css_combined = minify_css('\n'.join(css_parts))
    html = html.replace('/* INJECT_CSS */', css_combined)

    # 3. JS結合（依存順序固定）
    js_files = [
        'config.js', 'data.js', 'icons.js', 'state.js', 'utils.js', 'notify.js',
        'core.js',  # V = {} を views の前に配置（TDZ防止）
        'views/role.js', 'views/login.js', 'views/manager.js', 'views/si.js',
        'views/staff.js', 'views/absence.js', 'views/apps.js', 'views/area.js',
        'views/cover.js', 'app.js'
    ]
    js_parts = []
    for jf in js_files:
        path = SRC / 'js' / jf
        if path.exists():
            js_parts.append(path.read_text(encoding='utf-8'))
        else:
            print(f"WARNING: {path} not found")
    js_combined = minify_js('\n'.join(js_parts))
    html = html.replace('/* INJECT_JS */', js_combined)

    # 3.5 CSP（Content-Security-Policy）注入
    #     ハッシュは「注入する文字列(js_combined)」からではなく、実際に <script>〜</script> に
    #     入っている中身（テンプレート側の改行や、SW登録用など他の <script> ブロックも含む）から計算する。
    #     js_combined 単体をハッシュ化すると、テンプレートが持つ前後の改行の分だけズレて
    #     CSP違反（=そのスクリプトがブロックされ、画面が真っ白になる）を起こすため。
    script_hashes = [script_hash(m.group(1)) for m in re.finditer(r'<script>(.*?)</script>', html, re.DOTALL)]
    html = html.replace('/* INJECT_CSP */', build_csp(script_hashes))

    # 4. 出力
    out_path = DIST / 'index.html'
    out_path.write_text(html, encoding='utf-8')

    # 5. manifest.json コピー
    manifest_src = SRC / 'assets' / 'manifest.json'
    if manifest_src.exists():
        (DIST / 'manifest.json').write_text(manifest_src.read_text(encoding='utf-8'), encoding='utf-8')

    # 6. 画像アセットのコピー（アイコン・ボタン画像・favicon）
    for asset in ['icon-192.png', 'icon-512.png', 'icon-192-maskable.png', 'icon-512-maskable.png', 'btn-apply.png', 'btn-request.png', 'favicon.ico']:
        asset_src = SRC / 'assets' / asset
        if asset_src.exists():
            (DIST / asset).write_bytes(asset_src.read_bytes())
        else:
            print(f"WARNING: {asset_src} not found")

    # 7. sw.js 生成: src/assets/sw.js の __VERSION__ をビルド時刻に置換して毎回出力する
    #    （旧実装は dist/sw.js が無い場合だけ固定キャッシュ名 helpsync-v1 の既定SWを生成しており、
    #      VERSION が使われず、デプロイしても端末のキャッシュが更新されなかった）
    sw_src = SRC / 'assets' / 'sw.js'
    if not sw_src.exists():
        raise SystemExit(f"ERROR: {sw_src} が見つかりません（Service Worker のソース）")
    sw_code = sw_src.read_text(encoding='utf-8').replace('__VERSION__', VERSION)
    (DIST / 'sw.js').write_text(sw_code, encoding='utf-8')

    size_kb = len(html) / 1024
    print(f"Built: {out_path} ({size_kb:.1f} KB)")
    print(f"Version: {VERSION}")
    print(f"Service Worker cache: helpsync-{VERSION}")

if __name__ == '__main__':
    build()
