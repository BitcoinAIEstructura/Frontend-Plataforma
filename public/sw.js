// Service worker de Nexabit. Solo hace una cosa: si al abrir una página no hay
// internet, muestra "Sin conexión". NUNCA guarda /api ni las páginas de la app
// (tendrían datos de la cuenta y se quedarían viejos).
const CACHE = "nexabit-v1";
const OFFLINE = "/sin-conexion.html";

self.addEventListener("install", (evento) => {
  evento.waitUntil(caches.open(CACHE).then((c) => c.addAll([OFFLINE, "/iconos/nexabit-192.png"])));
  self.skipWaiting();
});

self.addEventListener("activate", (evento) => {
  evento.waitUntil(
    caches.keys().then((claves) => Promise.all(claves.filter((k) => k !== CACHE).map((k) => caches.delete(k)))),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (evento) => {
  if (evento.request.mode !== "navigate") return; // todo lo demás va directo a la red
  evento.respondWith(fetch(evento.request).catch(() => caches.match(OFFLINE)));
});
