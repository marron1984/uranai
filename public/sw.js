// URANAI Service Worker
// 方針: 更新の取りこぼしを防ぐため、ページ遷移 (navigate) は network-first、
// 静的アセット (_next/static, アイコン等) のみ cache-first。
// バージョンを上げると古いキャッシュは activate 時に破棄される。
const VERSION = "uranai-v1";
const STATIC_CACHE = `${VERSION}-static`;

self.addEventListener("install", (event) => {
  // 即時有効化 (古い SW を待たない)
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k)));
      await self.clients.claim();
    })()
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // 外部 (天気 API 等) は素通し

  const isStatic =
    url.pathname.startsWith("/_next/static/") ||
    /\.(?:png|svg|webmanifest|ico|woff2?)$/.test(url.pathname);

  if (isStatic) {
    // cache-first
    event.respondWith(
      caches.open(STATIC_CACHE).then(async (cache) => {
        const hit = await cache.match(req);
        if (hit) return hit;
        const res = await fetch(req);
        if (res.ok) cache.put(req, res.clone());
        return res;
      })
    );
    return;
  }

  // ページ遷移など: network-first、オフライン時はキャッシュにフォールバック
  if (req.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          const res = await fetch(req);
          const cache = await caches.open(STATIC_CACHE);
          cache.put(req, res.clone());
          return res;
        } catch {
          const cache = await caches.open(STATIC_CACHE);
          const hit = await cache.match(req);
          return hit || (await cache.match("/")) || Response.error();
        }
      })()
    );
  }
});
