const CACHE_NAME = "knowledge-v1";
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/share",
  "/manifest.json",
  "/icon-192.svg",
  "/icon-512.svg",
];

// Instalação: cacheia assets estáticos
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Ativação: limpa caches antigos
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

// Fetch
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Nunca interceptar requisições não-GET (POSTs, PUTs, etc.)
  if (request.method !== "GET") {
    return;
  }

  // ========== SHARE TARGET ==========
  // O navegador abre /share?title=...&url=...
  // O cache só tem /share (sem query params)
  // Servimos do cache ignorando os query params
  if (url.pathname === "/share") {
    event.respondWith(
      caches.match("/share").then((cached) => {
        return cached || fetch(request);
      })
    );
    return;
  }

  // ========== API ==========
  // Network-first para todas as rotas da API
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

  // ========== ASSETS ESTÁTICOS ==========
  // Cache-first para JS, CSS, SVG, etc.
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
});