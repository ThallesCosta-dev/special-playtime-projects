import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { JogoLayout, Balao, TelaFinal } from "@/components/JogoLayout";
import { elogioAleatorio, embaralhar, falar, somAcerto, somErro, somFesta } from "@/lib/jogo";

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
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
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

function novoBaralho(): Carta[] {
  return embaralhar(
    ANIMAIS.flatMap((a, i) => [
      { id: i * 2, emoji: a.emoji, nome: a.nome },
      { id: i * 2 + 1, emoji: a.emoji, nome: a.nome },
    ]),
  );
}

function JogoMemoria() {
  const [cartas, setCartas] = useState<Carta[]>(() => novoBaralho());
  const [viradas, setViradas] = useState<number[]>([]);
  const [achadas, setAchadas] = useState<string[]>([]);
  const [msg, setMsg] = useState<{ texto: string; tipo: "acerto" | "erro" } | null>(null);
  const [bloqueado, setBloqueado] = useState(false);

  const fim = achadas.length === ANIMAIS.length;

  useEffect(() => {
    if (fim) {
      somFesta();
      falar("Você encontrou todos os pares. Parabéns!");
    }
  }, [fim]);

  const reiniciar = useCallback(() => {
    setCartas(novoBaralho());
    setViradas([]);
    setAchadas([]);
    setMsg(null);
    setBloqueado(false);
  }, []);

  function virar(id: number) {
    if (bloqueado || viradas.includes(id)) return;
    const carta = cartas.find((c) => c.id === id);
    if (!carta || achadas.includes(carta.nome)) return;
    falar(carta.nome);

    const novas = [...viradas, id];
    setViradas(novas);
    if (novas.length < 2) return;

    setBloqueado(true);
    const a = cartas.find((c) => c.id === novas[0]);
    const b = cartas.find((c) => c.id === novas[1]);
    if (a && b && a.nome === b.nome) {
      somAcerto();
      const e = elogioAleatorio();
      setMsg({ texto: `${e} Um par de ${a.nome}!`, tipo: "acerto" });
      setTimeout(() => {
        setAchadas((s) => [...s, a.nome]);
        setViradas([]);
        setMsg(null);
        setBloqueado(false);
      }, 1200);
    } else {
      somErro();
      setMsg({ texto: "Tente outro par", tipo: "erro" });
      setTimeout(() => {
        setViradas([]);
        setMsg(null);
        setBloqueado(false);
      }, 1300);
    }
  }

  return (
    <JogoLayout
      titulo="Memória dos Animais"
      instrucao={fim ? "Todos os pares encontrados!" : "Vire duas cartas e ache o par igual"}
      estrelas={achadas.length}
      total={ANIMAIS.length}
      onReiniciar={reiniciar}
    >
      {fim ? (
        <TelaFinal onReiniciar={reiniciar} texto="Você achou todos os pares!" />
      ) : (
        <div className="space-y-8">
          <div className="mx-auto grid max-w-xl grid-cols-4 gap-3 sm:gap-5">
            {cartas.map((c) => {
              const aberta = viradas.includes(c.id) || achadas.includes(c.nome);
              return (
                <button
                  key={c.id}
                  onClick={() => virar(c.id)}
                  aria-label={aberta ? c.nome : "Carta virada para baixo"}
                  className={
                    "flex h-28 items-center justify-center rounded-3xl border-4 border-foreground/10 text-5xl shadow-[0_8px_0_0_color-mix(in_oklab,var(--foreground)_14%,transparent)] transition-transform hover:-translate-y-1 active:translate-y-1 sm:h-36 sm:text-6xl " +
                    (aberta ? "bg-card anim-brilho" : "bg-ceu text-ceu-foreground")
                  }
                >
                  {aberta ? c.emoji : "❓"}
                </button>
              );
            })}
          </div>

          <div className="h-14">{msg && <Balao texto={msg.texto} tipo={msg.tipo} />}</div>
        </div>
      )}
    </JogoLayout>
  );
}
