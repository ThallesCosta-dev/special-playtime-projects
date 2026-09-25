import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { BotaoOuvir, JogoLayout, TelaFinal } from "@/components/JogoLayout";
import type { Mensagem } from "@/hooks/useRodadas";
import {
  aposFalaETempo,
  elogioAleatorio,
  embaralhar,
  falar,
  podeFalar,
  somAcerto,
  somErro,
  somFesta,
} from "@/lib/jogo";

export const Route = createFileRoute("/jogos/memoria")({
  head: () => ({
    meta: [
      { title: "Memória dos Animais | Brincar e Aprender" },
      {
        name: "description",
        content:
          "Jogo da memória com apenas quatro pares de animais, cartas grandes e nomes falados em voz alta a cada acerto.",
      },
      { property: "og:title", content: "Memória dos Animais | Brincar e Aprender" },
      {
        property: "og:description",
        content: "Jogo da memória curto e acessível com quatro pares de animais.",
      },
    ],
  }),
  component: JogoMemoria,
});

const ANIMAIS = [
  { emoji: "🐶", nome: "cachorro" },
  { emoji: "🐱", nome: "gato" },
  { emoji: "🐰", nome: "coelho" },
  { emoji: "🐸", nome: "sapo" },
];

type Carta = { id: number; emoji: string; nome: string };

const INSTRUCAO = "Vire duas cartas e ache o par igual";

function baralhoBase(): Carta[] {
  return ANIMAIS.flatMap((a, i) => [
    { id: i * 2, emoji: a.emoji, nome: a.nome },
    { id: i * 2 + 1, emoji: a.emoji, nome: a.nome },
  ]);
}

function JogoMemoria() {
  const [cartas, setCartas] = useState<Carta[]>(() => baralhoBase());
  const [viradas, setViradas] = useState<number[]>([]);
  const [achadas, setAchadas] = useState<string[]>([]);
  const [msg, setMsg] = useState<Mensagem | null>(null);
  const [bloqueado, setBloqueado] = useState(false);
  /** Par acabou de ser achado e a comemoração ainda está tocando. */
  const [parNovo, setParNovo] = useState(false);
  const [avisoVoz, setAvisoVoz] = useState(false);
  /** 0 = estado vindo do servidor; incrementa a cada partida no cliente. */
  const [partida, setPartida] = useState(0);
  /** Cancela a espera pelo fim da jogada (fala + tempo mínimo). */
  const cancelarJogada = useRef<(() => void) | null>(null);

  const fim = achadas.length === ANIMAIS.length;

  const limparTimer = useCallback(() => {
    cancelarJogada.current?.();
    cancelarJogada.current = null;
  }, []);

  const reiniciar = useCallback(() => {
    limparTimer();
    setCartas(embaralhar(baralhoBase()));
    setViradas([]);
    setAchadas([]);
    setMsg(null);
    setBloqueado(false);
    setParNovo(false);
    setPartida((p) => p + 1);
  }, [limparTimer]);

  // Embaralha somente no cliente, evitando divergência com o HTML do servidor.
  useEffect(() => {
    reiniciar();
  }, [reiniciar]);

  // Cancela o timer pendente ao sair da página.
  useEffect(() => () => limparTimer(), [limparTimer]);

  // Fala a instrução no começo de cada partida.
  useEffect(() => {
    if (partida === 0) return;
    if (!podeFalar()) {
      setAvisoVoz(true);
      return;
    }
    void falar(INSTRUCAO);
  }, [partida]);

  useEffect(() => {
    if (fim) {
      somFesta();
      void falar("Você encontrou todos os pares. Parabéns!");
    }
  }, [fim]);

  function ouvirDeNovo() {
    if (bloqueado) return;
    setAvisoVoz(false);
    void falar(INSTRUCAO);
  }

  function virar(id: number) {
    if (bloqueado || viradas.includes(id)) return;
    const carta = cartas.find((c) => c.id === id);
    if (!carta || achadas.includes(carta.nome)) return;
    setAvisoVoz(false);
    void falar(carta.nome);

    const novas = [...viradas, id];
    setViradas(novas);
    if (novas.length < 2) return;

    setBloqueado(true);
    const a = cartas.find((c) => c.id === novas[0]);
    const b = cartas.find((c) => c.id === novas[1]);
    // As frases entram na fila para não cortar o nome do animal que acabou de
    // ser falado, e a jogada só termina quando elas acabam (senão o próximo
    // toque, ou a frase final, cortaria a comemoração no meio).
    if (a && b && a.nome === b.nome) {
      somAcerto();
      setParNovo(true);
      const e = elogioAleatorio();
      setMsg({ texto: `${e} Um par de ${a.nome}!`, tipo: "acerto" });
      const fala = falar(`${e} Um par de ${a.nome}.`, { interromper: false });
      cancelarJogada.current = aposFalaETempo(fala, 1400, () => {
        cancelarJogada.current = null;
        setAchadas((s) => [...s, a.nome]);
        setParNovo(false);
        setViradas([]);
        setMsg(null);
        setBloqueado(false);
      });
    } else {
      somErro();
      setMsg({ texto: "Tente outro par", tipo: "erro" });
      const fala = falar("Tente outro par", { interromper: false });
      cancelarJogada.current = aposFalaETempo(fala, 1500, () => {
        cancelarJogada.current = null;
        setViradas([]);
        setMsg(null);
        setBloqueado(false);
      });
    }
  }

  return (
    <JogoLayout
      titulo="Memória dos Animais"
      instrucao={fim ? "Todos os pares encontrados!" : INSTRUCAO}
      // A estrela acende no instante do par, como nos outros jogos.
      estrelas={achadas.length + (parNovo ? 1 : 0)}
      total={ANIMAIS.length}
      onReiniciar={reiniciar}
      mensagem={msg}
      vozBloqueada={avisoVoz}
      dicaVoz="Toque em 🔊 Ouvir de novo para ouvir a instrução"
    >
      {fim ? (
        <TelaFinal onReiniciar={reiniciar} texto="Você achou todos os pares!" />
      ) : (
        <div className="space-y-8">
          <BotaoOuvir onClick={ouvirDeNovo} />
          <div className="mx-auto grid max-w-xl grid-cols-4 gap-3 sm:gap-5">
            {cartas.map((c) => {
              const achada = achadas.includes(c.nome);
              const aberta = achada || viradas.includes(c.id);
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => virar(c.id)}
                  disabled={achada}
                  aria-label={aberta ? c.nome : "Carta virada para baixo"}
                  className={
                    "flex h-28 items-center justify-center rounded-3xl border-4 border-foreground/10 text-5xl shadow-[0_8px_0_0_color-mix(in_oklab,var(--foreground)_14%,transparent)] transition-transform hover:-translate-y-1 active:translate-y-1 disabled:translate-y-0 sm:h-36 sm:text-6xl " +
                    (aberta ? "bg-card anim-brilho" : "bg-ceu text-ceu-foreground")
                  }
                >
                  {aberta ? c.emoji : "❓"}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </JogoLayout>
  );
}
