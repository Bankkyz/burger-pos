const CACHE_NAME = "burger-pos-v1";
const OFFLINE_URL = "/offline.html";

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.add(OFFLINE_URL)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

// Network-first, cache-as-you-go: every successful GET response is cached so
// it's available offline afterwards. Firebase/Firestore calls are left alone —
// the SDK's own persistent local cache (see lib/firebase/config.ts) already
// handles offline reads/writes and background sync for actual app data; this
// service worker is only responsible for the app shell (HTML/JS/CSS/icons).
self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  if (request.url.includes("googleapis.com") || request.url.includes("firebaseio.com")) return;

  event.respondWith(
    fetch(request)
      .then(async (response) => {
        // Chromium refuses to let a service worker respondWith() a *redirected*
        // response for a navigation request ("A ServiceWorker passed a redirected
        // response to respondWith() for a navigate request") — e.g. "/" redirecting
        // to "/dashboard". Rebuild an equivalent, non-redirected Response so the
        // navigation completes normally instead of failing with a generic error.
        const finalResponse = response.redirected
          ? new Response(await response.blob(), {
              status: response.status,
              statusText: response.statusText,
              headers: response.headers,
            })
          : response;

        const copy = finalResponse.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        return finalResponse;
      })
      .catch(async () => {
        const cached = await caches.match(request);
        if (cached) return cached;
        if (request.mode === "navigate") return caches.match(OFFLINE_URL);
        return Response.error();
      }),
  );
});
