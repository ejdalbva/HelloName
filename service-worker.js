// ============================================================
//  service-worker.js  —  runs on its own background thread
//  No DOM, no page access. Browser starts/stops it on demand.
// ============================================================

// A version-stamped cache name. Bump the version (v1 -> v2)
// whenever you change cached files, so old caches get cleaned.
const CACHE_NAME = "hello-name-v4";

// The files that make up the "app shell" — everything needed
// to load and run offline. Paths are relative to this file's folder.
// NOTE: adjust the HTML filename if yours isn't index.html.
const FILES_TO_CACHE = [
  "./",                 // the folder root (serves your HTML)
  "./index.html",       // <-- rename if your file is called something else
  "./styles.css",
  "./app.js",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png"
];

// ---- INSTALL: fires once when this SW version is registered ----
// "Stock the pantry": open the cache and pre-load every file.
self.addEventListener("install", (event) => {
  console.log("[SW] install");
  // waitUntil = "don't call me installed until this promise finishes"
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      await cache.addAll(FILES_TO_CACHE);   // fetch + store all files
      await self.skipWaiting();             // activate immediately, don't wait
    })()
  );
});

// ---- ACTIVATE: fires when this SW takes control ----
// Housekeeping: delete any caches that aren't the current one.
self.addEventListener("activate", (event) => {
  console.log("[SW] activate");
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log("[SW] deleting old cache:", key);
            return caches.delete(key);
          }
        })
      );
      await self.clients.claim();           // control open pages right away
    })()
  );
});

// ---- FETCH: fires on EVERY network request the page makes ----
// Strategy = "cache-first": if we have it, return it; else go to network.
self.addEventListener("fetch", (event) => {
  event.respondWith(
    (async () => {
      const cached = await caches.match(event.request);
      if (cached) {
        return cached;                      // instant, works offline
      }
      return fetch(event.request);          // not cached: hit the network
    })()
  );
});