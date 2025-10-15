# sw.js (repo root)
cat > sw.js <<'EOF'
const CACHE = "openpeople-v1760553044";
const FILES = ["/","/index.html","/assets/css/style.css","/assets/js/main.js"];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)));
});
self.addEventListener("fetch", e => {
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});
EOF
