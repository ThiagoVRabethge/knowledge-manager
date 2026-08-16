const CACHE_NAME = "knowledge-v1";

const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/share",
  "/manifest.json",
  "/icon-192.svg",
  "/icon-512.svg",
];

const IS_DEV = self.location.hostname === "localhost" || self.location.hostname === "127.0.0.1";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (IS_DEV) {
    const isViteAsset = url.pathname.startsWith("/src/") ||
      url.pathname.startsWith("/@") ||
      url.pathname.endsWith(".jsx") ||
      url.pathname.endsWith(".tsx") ||
      url.pathname.endsWith(".css") ||
      url.pathname.endsWith(".js");
    
    if (isViteAsset || request.mode === "navigate") {
      return;
    }
  }

  if (request.method !== "GET") {
    return;
  }

  const API_PREFIXES = [
    "/auth", "/notes", "/folders", "/collections",
    "/sync", "/export", "/ai", "/share"
  ];

  const isApi = API_PREFIXES.some((prefix) => url.pathname.startsWith(prefix));

  if (isApi) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  const SPA_ROUTES = ["/", "/share"];
  const isSpaRoute = SPA_ROUTES.some((route) => url.pathname === route);

  if (isSpaRoute) {
    event.respondWith(
      caches.match("/index.html").then((cached) => {
        return cached || fetch(request);
      })
    );
    return;
  }

  if (IS_DEV) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(() => caches.match(request))
    );
  } else {
    event.respondWith(
      caches.match(request).then((cached) => {
        return (
          cached ||
          fetch(request).then((response) => {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
            return response;
          })
        );
      })
    );
  }
});
