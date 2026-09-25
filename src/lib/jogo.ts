/** Utilidades compartilhadas pelos jogos educativos. */

type OpcoesFala = {
  /** Interrompe o que estiver sendo falado (padrão). Com `false`, entra na fila. */
  interromper?: boolean;
};

/**
 * Navegadores modernos só permitem síntese de voz depois de alguma interação
 * do usuário na página. Sem isso, a fala é silenciosamente ignorada.
 */
export function podeFalar(): boolean {
  if (typeof navigator === "undefined") return false;
  const ativacao = (navigator as Navigator & { userActivation?: { hasBeenActive: boolean } })
    .userActivation;
  return ativacao ? ativacao.hasBeenActive : true;
}

function vozPortugues(): SpeechSynthesisVoice | null {
  const vozes = window.speechSynthesis.getVoices();
  return (
    vozes.find((v) => /^pt[-_]br/i.test(v.lang)) ?? vozes.find((v) => /^pt/i.test(v.lang)) ?? null
  );
}

/**
 * Fala o texto em português. A promessa resolve quando a fala termina, é
 * interrompida ou falha, para que o jogo possa esperar a frase acabar antes de
 * seguir. Como alguns navegadores às vezes não disparam `end`, há um limite de
 * tempo proporcional ao texto.
 */
export function falar(texto: string, { interromper = true }: OpcoesFala = {}): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      resolve();
      return;
    }
    const limite = setTimeout(resolve, 1500 + texto.length * 150);
    const concluir = () => {
      clearTimeout(limite);
      resolve();
    };
    try {
      if (interromper) window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(texto);
      u.lang = "pt-BR";
      u.rate = 0.85;
      u.pitch = 1.1;
      const voz = vozPortugues();
      if (voz) u.voice = voz;
      u.onend = concluir;
      u.onerror = concluir;
      window.speechSynthesis.speak(u);
    } catch {
      /* voz indisponível */
      concluir();
    }
  });
}

/**
 * Chama `seguir` só depois que a fala terminou e passou o tempo mínimo da
 * comemoração. Devolve uma função que cancela a espera.
 */
export function aposFalaETempo(fala: Promise<void>, minimo: number, seguir: () => void) {
  let cancelado = false;
  const tempo = new Promise<void>((r) => setTimeout(r, minimo));
  void Promise.all([fala, tempo]).then(() => {
    if (!cancelado) seguir();
  });
  return () => {
    cancelado = true;
  };
}

let ctx: AudioContext | null = null;
function tom(freq: number, inicio: number, dur: number, volume = 0.16) {
  if (typeof window === "undefined") return;
  const AC =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return;
  ctx ??= new AC();
  // Safari e Chrome criam o contexto suspenso quando ele nasce fora de um gesto.
  if (ctx.state === "suspended") void ctx.resume();
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
    const tmp = copia[i] as T;
    copia[i] = copia[j] as T;
    copia[j] = tmp;
  }
  return copia;
}

/**
 * Monta as alternativas de uma rodada: o alvo mais `quantidade - 1` distratores.
 * Com `aleatorio = false` a ordem é determinística, o que permite renderizar as
 * opções já no servidor sem divergir do HTML na hidratação.
 */
export function montarOpcoes<T>(
  alvo: T,
  distratores: readonly T[],
  aleatorio: boolean,
  quantidade = 3,
): T[] {
  const outras = (aleatorio ? embaralhar(distratores) : [...distratores]).slice(0, quantidade - 1);
  const todas = [alvo, ...outras];
  return aleatorio ? embaralhar(todas) : todas;
}

export const elogios = ["Muito bem!", "Isso mesmo!", "Você conseguiu!", "Parabéns!", "Que legal!"];

export function elogioAleatorio() {
  return elogios[Math.floor(Math.random() * elogios.length)] ?? "Muito bem!";
}
