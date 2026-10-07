#!/usr/bin/env python3
# === tools/validate.py ===
# 構文検証・重複チェック・G3(data-a/case)・G4(カンマ)・G9(render分岐)
# 追加: JS構文チェック(node --check) / デプロイ成果物の検証(manifest.json・sw.js・アイコン)
#
# 使い方: python3 tools/validate.py dist/index.html
# CI（環境変数 CI が設定されている GitHub Actions 等）では、node や manifest.json / sw.js が無い場合も失敗として扱う。

import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

STRICT = bool(os.environ.get('CI'))

def node_check(code, label, errors, warnings):
    """JSコードを node --check で構文検査する（minify後に壊れたJSを検出する）"""
    node = shutil.which('node')
    if not node:
        (errors if STRICT else warnings).append(f"node が見つからないため {label} の構文チェックを実行できません")
        return
    with tempfile.NamedTemporaryFile('w', suffix='.js', delete=False, encoding='utf-8') as f:
        f.write(code)
        tmp = f.name
    try:
        r = subprocess.run([node, '--check', tmp], capture_output=True, text=True)
    finally:
        os.unlink(tmp)
    if r.returncode != 0:
        # minify後は1行が巨大なため、ソース行の抜粋は出さずエラー種別だけ表示する
        msg = next((l.strip() for l in r.stderr.splitlines() if re.match(r'^\w*Error: ', l)), r.stderr.strip()[:120])
        errors.append(f"構文エラー({label}): {msg}")

def check_site(site, errors, warnings):
    """dist 直下の manifest.json / sw.js / アイコンを検証する"""
    # --- manifest.json ---
    mf = site / 'manifest.json'
    if not mf.exists():
        (errors if STRICT else warnings).append("manifest.json が見つかりません")
    else:
        m = None
        try:
            m = json.loads(mf.read_text(encoding='utf-8'))
        except Exception as e:
            errors.append(f"manifest.json が不正なJSON: {e}")
        if isinstance(m, dict):
            for key in ('name', 'short_name', 'start_url', 'display', 'icons'):
                if key not in m:
                    errors.append(f"manifest.json に {key} がありません")
            for key in ('start_url', 'scope'):
                v = str(m.get(key, ''))
                if v.startswith('..'):
                    errors.append(f'manifest.json の {key}="{v}" が親ディレクトリを指しています（dist直下に置くなら "./"）')
            for ic in m.get('icons', []):
                src = ic.get('src', '')
                if not (site / src).exists():
                    errors.append(f"manifest.json のアイコンがありません: {src}")

    # --- sw.js ---
    sw = site / 'sw.js'
    if not sw.exists():
        (errors if STRICT else warnings).append("sw.js が見つかりません")
    else:
        code = sw.read_text(encoding='utf-8')
        if '__VERSION__' in code:
            errors.append("sw.js に置換前の __VERSION__ が残っています（build.py でバージョンが埋め込まれていない）")
        if not re.search(r"CACHE_NAME\s*=\s*'[^']+'", code):
            errors.append("sw.js に CACHE_NAME の定義がありません")
        m2 = re.search(r"urlsToCache\s*=\s*\[([^\]]*)\]", code)
        if m2:
            for u in re.findall(r"'([^']+)'", m2.group(1)):
                if u not in ('./', '/') and not (site / u).exists():
                    errors.append(f"sw.js のキャッシュ対象がありません: {u}")
        node_check(code, 'sw.js', errors, warnings)

def validate(html_path):
    path = Path(html_path)
    html = path.read_text(encoding='utf-8')
    errors = []
    warnings = []

    js_start = html.find('<script>') + len('<script>')
    js_end = html.find('</script>', js_start)
    js = html[js_start:js_end]

    # 1. 関数重複チェック（同名の function 宣言が2回以上定義されていないか）
    #    ※ 旧: (\w+)\(\)\{ は minify後の書式「name() {」に一致せず、実質無効だった
    funcs = re.findall(r'\bfunction\s+(\w+)\s*\(', js)
    dupes = sorted({f for f in funcs if funcs.count(f) > 1})
    if dupes:
        errors.append(f"G1: 関数重複: {set(dupes)}")

    # 2. JSブレースバランス
    if js.count('{') != js.count('}'):
        errors.append(f"G4: JSブレース不一致 {{:{js.count('{')}, }}:{js.count('}')}")

    # 3. divタグ開閉
    if html.count('<div') != html.count('</div>'):
        errors.append(f"divタグ不一致 <div:{html.count('<div')}, </div>:{html.count('</div>')}")

    # 4. data-a / switch case 一致（G3）— minify後のスペース対応
    data_a = set(re.findall(r'data-a="([^"]+)"', html))
    # case 'xxx': または case\s+'xxx': にマッチ
    cases = set(re.findall(r"case\s*'([^']+)'", html))
    if data_a != cases:
        only_data = data_a - cases
        only_case = cases - data_a
        if only_data:
            errors.append(f"G3: data-aのみ（caseなし）: {only_data}")
        if only_case:
            errors.append(f"G3: caseのみ（data-aなし）: {only_case}")

    # 5. バッククォート対応
    if js.count('`') % 2 != 0:
        errors.append(f"バッククォート奇数: {js.count('`')}")

    # 6. render() view分岐（G9）
    render_views = set(v[1] for v in re.findall(r"St\.(view|role) === '([^']+)'", html))
    expected = {'role', 'login', 'app', 'apps', 'absence', 'mgrCoverList', 'area'}
    missing = expected - render_views
    if missing:
        errors.append(f"G9: render()に分岐がないview: {missing}")

    # 7. 関数定義欠落（G12）— 呼び出しパターンも考慮
    required = ['getMgrCoverRanking', 'getCoverAlert', 'getSOSStores', 'getWeeklyStats']
    for fn in required:
        # 定義: fn(...) { または 呼び出し: .fn( または fn(
        pattern = re.compile(r'[\.\s]' + re.escape(fn) + r'\s*\(')
        if not pattern.search(js):
            errors.append(f"G12: 関数欠落: {fn}()")

    # 8. JS構文チェック（node --check）— minify後の JS が実際にパースできるか
    node_check(js, 'index.html内のJS', errors, warnings)

    # 9. デプロイ成果物（manifest.json / sw.js / アイコン）
    check_site(path.parent, errors, warnings)

    for w in warnings:
        print(f"⚠️  {w}")
    if errors:
        print("❌ VALIDATION FAILED")
        for e in errors:
            print(f"  - {e}")
        sys.exit(1)
    else:
        print("✅ VALIDATION PASSED")
        sys.exit(0)

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python validate.py <dist/index.html>")
        sys.exit(1)
    validate(sys.argv[1])
