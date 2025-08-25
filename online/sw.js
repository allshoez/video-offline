const CACHE_NAME = "grid-video-cache-v1";
const urlsToCache = [
  "/",             // index.html
  "index.html",
  "script.js",
  "https://cdn.jwplayer.com/libraries/your-library-key.js" // JW Player library
];

// Install event
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// Activate event
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => 
      Promise.all(
        keys.filter(k => k !== CACHE_NAME)
            .map(k => caches.delete(k))
      )
    )
  );
});

// Fetch event
self.addEventListener("fetch", event => {
  // Cache first for app assets, fallback to network
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});