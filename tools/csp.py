#!/usr/bin/env python3
# === tools/csp.py ===
# Content-Security-Policy を組み立てる共通処理。build.py（デモアプリ）と、
# LP用のCSP注入ステップ（deploy.yml）の両方から使う。
#
# 設計方針:
# - インラインの <script> は SHA-256 ハッシュで許可する（'unsafe-inline' は使わない）。
#   このアプリは onclick= 等のインラインイベント属性を一切使わず、すべて data-a 属性 +
#   document.onclick によるイベント委譲で処理しているため、スクリプトはハッシュ一致の
#   <script> ブロックだけに厳格に限定できる。
# - インラインの style="..." 属性は、動的に値が変わる箇所（進捗バーの幅など）が多数あり
#   事前にハッシュ化できないため、style-src だけ 'unsafe-inline' を許容する。
#   CSSインジェクションはスクリプト実行に比べて影響範囲が小さいトレードオフとして許容している
#   （詳細は SECURITY.md 参照）。
# - meta タグの CSP は frame-ancestors を仕様上サポートしない（HTTPヘッダー専用）。
#   GitHub Pages はカスタムレスポンスヘッダーを設定できないため、クリックジャッキング対策は
#   index.html 側の JS によるフレームバスティングで別途行う（それぞれの <script> 内）。

import base64
import hashlib


def script_hash(script_text: str) -> str:
    """スクリプトの exact な文字列（<script>タグの中身そのもの）から CSP 用の sha256-<base64> を作る"""
    digest = hashlib.sha256(script_text.encode('utf-8')).digest()
    return "'sha256-" + base64.b64encode(digest).decode('ascii') + "'"


def build_csp(script_hashes) -> str:
    """script_hashes: script_hash() の戻り値（'sha256-...'）のリスト。ページ内の <script> ブロックの数だけ渡す。"""
    hashes = ' '.join(script_hashes)
    return '; '.join([
        "default-src 'self'",
        f"script-src 'self' {hashes}",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self'",
        "font-src 'self'",
        "connect-src 'self'",
        "manifest-src 'self'",
        "worker-src 'self'",
        "frame-src 'self'",
        "object-src 'none'",
        "base-uri 'none'",
        "form-action 'none'",
    ])
