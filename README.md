# HelpSync — ユニット型ヘルプ調整

モバイルファーストのレスポンシブWebアプリ。GitHub Pagesでホスティング。

## デモ

- トップページ（概要・提案書・デモへの導線）: https://gattenlab.github.io/HelpSync/
- アプリ本体: https://gattenlab.github.io/HelpSync/demo/

## ファイル構成

```
HelpSync/
├── .github/workflows/deploy.yml  # GitHub Actions: build → validate → 組み立て(LP+demo/) → 公開
├── index.html                    # トップLP（概要・提案書・デモアプリへの導線。src/index.html とは別物）
├── hero.png                      # LP用メインビジュアル
├── proposal.pdf                  # 提案書PDF
├── src/                          # デモアプリの開発ソース（単一真実源）
│   ├── index.html                # デモアプリのスケルトン
│   ├── css/                      # スタイルシート（4ファイル）
│   ├── js/                       # JavaScript
│   │   ├── config.js             # デモデータ設定
│   │   ├── data.js               # 店舗・スタッフ・テンプレート
│   │   ├── icons.js              # SVGアイコン（HelpSyncロゴ I.logo を含む）
│   │   ├── state.js              # 状態管理 + localStorage
│   │   ├── utils.js              # ユーティリティ + 7日間集計
│   │   ├── notify.js             # Notification API + Service Worker連携
│   │   ├── app.js                # 初期化・レンダリング・イベント
│   │   └── views/                # 画面定義（9ファイル）
│   └── assets/
│       ├── manifest.json         # PWAマニフェスト（start_url/scope は "./" — どの階層に置かれても動く）
│       ├── sw.js                 # Service Worker（ビルド時に __VERSION__ を置換して dist/sw.js へ）
│       ├── logo.svg              # ロゴ（js/icons.js の I.logo と同一・参照用）
│       ├── icon-192.png
│       └── icon-512.png
├── tools/
│   ├── build.py                  # src/ → dist/ 結合ビルド + minify
│   └── validate.py               # 構文(node --check)・div・data-a/case・関数重複・manifest/sw検証
└── README.md
```

公開時、CI は `dist/`（デモアプリのビルド成果物）と、ルートの `index.html` / `hero.png` / `proposal.pdf`（LP）を
1つの `_site/` に組み立てます（`dist/` の中身は `_site/demo/` に配置）。`dist/` `_site/` はどちらも
CI が生成する成果物なのでコミット不要です（`.gitignore` に追加済み）。公開直後の構成:

```
（公開サイト）
├── index.html      ← LP（ルート）
├── hero.png
├── proposal.pdf
└── demo/            ← dist/ の中身がそのままここに入る
    ├── index.html   ← デモアプリ本体
    ├── manifest.json
    ├── sw.js
    ├── icon-192.png
    └── icon-512.png
```

## ローカルビルド

```bash
python3 tools/build.py
python3 tools/validate.py dist/index.html
```

## デプロイ

`main` ブランチへ push すると GitHub Actions が次を実行し、通った場合のみ公開します（途中で失敗すると公開されません）。

1. `python3 tools/build.py` — `src/` を結合・minify して `dist/` へ
2. `python3 tools/validate.py dist/index.html` — 構文・data-a/case・manifest/sw などを検証
3. ルートの `index.html` / `hero.png` / `proposal.pdf`（LP）と `dist/`（→ `demo/`）を `_site/` に組み立て
4. 組み立てたファイルが揃っているか確認してから、`_site/` を GitHub Pages に公開

- 初回のみ: リポジトリの Settings → Pages → Build and deployment → Source を **GitHub Actions** に設定
- `dist/` `_site/` はどちらもコミット不要です（`.gitignore` に追加済み）
- LP（ルートの `index.html`）の「デモアプリ起動」「概要スライド」ボタンは `./demo/index.html` `./proposal.pdf` という相対パスなので、LP と demo/ は必ず同じ階層に置く必要があります
- デモアプリ側（`src/`）はマニフェストや Service Worker のパスをすべて相対（`./`）にしてあるため、`/demo/` 配下に置かれても無改修で動きます
- Service Worker はビルドごとにキャッシュ名（`helpsync-<ビルド時刻>`）が変わります。画面(HTML)はネットワーク優先のため、デプロイ後の最初のアクセスから新しいUIが表示され、オフライン時のみ保存済みの画面を使います
- `tools/build.py` の minify は行内の `//` 以降を削除します。文字列中に `//` を書かないでください（`http://` `https://` は保護されます）

## 役割

- **店長**: 欠勤登録・ヘルプ募集・応募者承認・カバー対応
- **ユニット統括**: 3ユニット監視・店長代行募集
- **スタッフ**: シフト確認・ヘルプ応募・欠勤報告
- **エリアマネージャー**: SOSダッシュボード・負荷可視化（閲覧専用）

## PWA機能

- ホーム画面追加（standalone表示）
- Service Workerによるオフライン対応（画面はネットワーク優先・静的ファイルはキャッシュ優先）
- Notification APIによるエスカレーション通知

## データ

- 3ユニット / 15店舗 / 15スタッフ
- localStorage永続化（ブラウザ内保存）

## セキュリティ

`main` へのPR作成時・プッシュ時に CodeQL（静的解析）と Gitleaks（秘密情報スキャン）が自動実行されます
（`.github/workflows/security-scan.yml`）。CSPの設計や、意図的に実装していない対策とその理由は
[SECURITY.md](SECURITY.md) を参照してください。ブランチ保護ルールの適用は `scripts/setup-github-security.sh`
を参照（要手動実行）。

## ライセンス

プロトタイプ — 内部使用のみ
