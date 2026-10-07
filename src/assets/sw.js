// === src/assets/sw.js ===
// Service Worker。tools/build.py が __VERSION__ をビルド時刻に置換して dist/sw.js を出力する。
//
// 更新方針
//  - 画面(HTML)はネットワーク優先: デプロイ直後の最初のアクセスから新しいUIが届く。
//    ネットワークに繋がらない（オフライン）ときだけ、保存済みの画面を返す。
//  - アイコンなどの静的ファイルはキャッシュ優先。
//  - キャッシュ名にバージョンが入るため、デプロイのたびに旧キャッシュは破棄される。

const CACHE_PREFIX = 'helpsync-';
const CACHE_NAME = 'helpsync-__VERSION__';
const urlsToCache = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png', './icon-192-maskable.png', './icon-512-maskable.png', './btn-apply.png', './btn-request.png', './favicon.ico'];

self.addEventListener('install', e => {
  // cache: 'reload' … ブラウザのHTTPキャッシュ（GitHub Pagesは最大10分）を経由せず、常に最新を取得して保存する
  e.waitUntil(caches.open(CACHE_NAME).then(c =>
    c.addAll(urlsToCache.map(u => new Request(u, { cache: 'reload' })))
  ));
  self.skipWaiting();
});

// リダイレクト経由の Response は、画面遷移(navigate)への応答として返せないため、中身だけ取り出して作り直す
function cleanResponse(res) {
  if (!res.redirected) return res;
  return res.blob().then(body => new Response(body, {
    headers: res.headers, status: res.status, statusText: res.statusText
  }));
}

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;

  // 画面(HTML): ネットワーク優先 → 失敗(オフライン)時のみ保存済みの画面
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req.url, { cache: 'no-cache' })
        .then(cleanResponse)
        .then(res => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(CACHE_NAME).then(c => c.put('./index.html', copy));
          }
          return res;
        })
        .catch(() => caches.open(CACHE_NAME).then(c => c.match('./index.html')))
    );
    return;
  }

  // 静的ファイル: キャッシュ優先（自分のキャッシュだけを見る）
  e.respondWith(
    caches.open(CACHE_NAME).then(c => c.match(req)).then(r => r || fetch(req))
  );
});

self.addEventListener('activate', e => {
  // 同じオリジン(github.io)には他プロジェクトのキャッシュもあり得るため、自分のプレフィックスのものだけ削除する
  e.waitUntil(caches.keys().then(names => Promise.all(
    names.filter(n => n.startsWith(CACHE_PREFIX) && n !== CACHE_NAME).map(n => caches.delete(n))
  )));
  self.clients.claim();
});

// 通知クリックでアプリをフォアグラウンドに
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(clients.matchAll({ type: 'window' }).then(cs => {
    if (cs.length > 0) return cs[0].focus();
    return clients.openWindow('./');
  }));
});
