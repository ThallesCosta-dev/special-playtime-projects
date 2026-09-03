/** Utilidades compartilhadas pelos jogos educativos. */

export function falar(texto: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(texto);
    u.lang = "pt-BR";
    u.rate = 0.85;
    u.pitch = 1.1;
    window.speechSynthesis.speak(u);
  } catch {
    /* voz indisponível */
  }
}

let ctx: AudioContext | null = null;
function tom(freq: number, inicio: number, dur: number, volume = 0.16) {
  if (typeof window === "undefined") return;
  const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return;
  ctx ??= new AC();
  const t0 = ctx.currentTime + inicio;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = "sine";
  osc.frequency.value = freq;
  g.gain.setValueAtTime(0, t0);
  g.gain.linearRampToValueAtTime(volume, t0 + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g).connect(ctx.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.05);
}

export function somAcerto() {
  tom(523.25, 0, 0.22);
  tom(659.25, 0.12, 0.22);
  tom(783.99, 0.24, 0.35);
}

export function somErro() {
  tom(300, 0, 0.22, 0.1);
  tom(220, 0.14, 0.3, 0.1);
}

export function somFesta() {
  [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tom(f, i * 0.12, 0.4));
}

export function embaralhar<T>(itens: readonly T[]): T[] {
  const copia = [...itens];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

export const elogios = [
  "Muito bem!",
  "Isso mesmo!",
  "Você conseguiu!",
  "Parabéns!",
  "Que legal!",
];

export function elogioAleatorio() {
  return elogios[Math.floor(Math.random() * elogios.length)];
}
