## 変更内容

<!-- 何を、なぜ変更したか -->

## 動作確認

- [ ] `python3 tools/build.py && python3 tools/validate.py dist/index.html` が成功する
- [ ] 変更した画面をブラウザで確認した

## セキュリティチェックリスト

- [ ] APIキー・トークン・パスワード等の秘密情報を含んでいない（`git diff` で確認済み。CIの Secret Scan でも自動チェックされます）
- [ ] 外部ドメイン（フォント・スクリプト・画像等）への新しい参照を追加していない。追加した場合は CSP（`tools/csp.py` / `src/index.html` ・ ルート `index.html` の CSP meta タグ）の更新が必要です
- [ ] ユーザー入力（フォーム等）を新たに画面へ表示する場合、`U.esc()` でエスケープしている（`src/js/utils.js`）
- [ ] インラインの `<script>` を追加・変更した場合、`tools/build.py` が生成する CSP のハッシュは自動更新されるため手動対応は不要（ハッシュはビルド時に自動計算されます）
- [ ] `.github/workflows/security-scan.yml`（CodeQL / Gitleaks）が通過している

## 影響範囲

- [ ] 既存の画面・機能を壊していない（`tools/validate.py` のチェック項目を参照）
- [ ] `dist/` `_site/` をコミットに含めていない（`.gitignore` 対象・CIが生成します）
