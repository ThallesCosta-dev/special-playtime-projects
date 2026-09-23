/* Service worker: deixa o app utilizável sem internet depois da primeira visita.
 *
 * - Páginas (navegação): rede primeiro; se falhar, usa a cópia em cache.
 * - /assets, /fonts, /icons: cache primeiro; os nomes têm hash e nunca mudam.
 *
 * Ao mudar a estratégia, incremente VERSAO para descartar o cache antigo.
 */
const VERSAO = "v1";
const CACHE = `brincar-aprender-${VERSAO}`;
const PAGINAS = [
  "/",
  "/jogos/cores",
  "/jogos/formas",
  "/jogos/contar",
  "/jogos/memoria",
  "/jogos/letras",
  "/manifest.webmanifest",
];
const PREFIXOS_ESTATICOS = ["/assets/", "/fonts/", "/icons/"];

self.addEventListener("install", (evento) => {
  evento.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(PAGINAS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (evento) => {
  evento.waitUntil(
    caches
      .keys()
      .then((chaves) => Promise.all(chaves.filter((c) => c !== CACHE).map((c) => caches.delete(c))))
      .then(() => self.clients.claim()),
  );
});

async function guardar(requisicao, resposta) {
  if (!resposta || !resposta.ok) return;
  const cache = await caches.open(CACHE);
  await cache.put(requisicao, resposta.clone());
}

async function redePrimeiro(requisicao) {
  try {
    const resposta = await fetch(requisicao);
    await guardar(requisicao, resposta);
    return resposta;
  } catch {
    return (await caches.match(requisicao)) ?? (await caches.match("/")) ?? Response.error();
  }
}

async function cachePrimeiro(requisicao) {
  const emCache = await caches.match(requisicao);
  if (emCache) return emCache;
  const resposta = await fetch(requisicao);
  await guardar(requisicao, resposta);
  return resposta;
}

self.addEventListener("fetch", (evento) => {
  const requisicao = evento.request;
  if (requisicao.method !== "GET") return;
  const url = new URL(requisicao.url);
  if (url.origin !== self.location.origin) return;

  if (requisicao.mode === "navigate") {
    evento.respondWith(redePrimeiro(requisicao));
    return;
  }
  if (PREFIXOS_ESTATICOS.some((p) => url.pathname.startsWith(p))) {
    evento.respondWith(cachePrimeiro(requisicao));
  }
});
