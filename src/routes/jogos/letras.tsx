import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { JogoLayout, Balao, TelaFinal } from "@/components/JogoLayout";
import { elogioAleatorio, embaralhar, falar, somAcerto, somErro, somFesta } from "@/lib/jogo";

export const Route = createFileRoute("/jogos/letras")({
  head: () => ({
    meta: [
      { title: "Som das Letras | Brincar e Aprender" },
      {
        name: "description",
        content:
          "Jogo de consciência fonológica: ouça a letra e escolha a figura cuja palavra começa com esse som.",
      },
      { property: "og:title", content: "Som das Letras | Brincar e Aprender" },
      {
        property: "og:description",
        content: "Ouça a letra e escolha a figura que começa com esse som.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: JogoLetras,
});

const PALAVRAS = [
  { letra: "B", emoji: "🍌", palavra: "banana" },
  { letra: "C", emoji: "🐶", palavra: "cachorro" },
  { letra: "F", emoji: "🌺", palavra: "flor" },
  { letra: "S", emoji: "☀️", palavra: "sol" },
  { letra: "P", emoji: "🦶", palavra: "pé" },
  { letra: "M", emoji: "🖐️", palavra: "mão" },
];

const TOTAL = 5;

function JogoLetras() {
  const [rodadas, setRodadas] = useState(() => embaralhar(PALAVRAS));
  const [indice, setIndice] = useState(0);
  const [opcoes, setOpcoes] = useState<typeof PALAVRAS>([]);
  const [msg, setMsg] = useState<{ texto: string; tipo: "acerto" | "erro" } | null>(null);
  const [bloqueado, setBloqueado] = useState(false);

  const alvo = rodadas[indice];
  const fim = indice >= TOTAL;

  useEffect(() => {
    if (!alvo) return;
    const outras = embaralhar(PALAVRAS.filter((p) => p.letra !== alvo.letra)).slice(0, 2);
    setOpcoes(embaralhar([alvo, ...outras]));
    falar(`Qual figura começa com a letra ${alvo.letra}?`);
  }, [alvo]);

  useEffect(() => {
    if (fim) {
      somFesta();
      falar("Você acertou as letras. Parabéns!");
    }
  }, [fim]);

  const reiniciar = useCallback(() => {
    setRodadas(embaralhar(PALAVRAS));
    setIndice(0);
    setMsg(null);
    setBloqueado(false);
  }, []);

  function escolher(letra: string, palavra: string) {
    if (bloqueado || !alvo) return;
    if (letra === alvo.letra) {
      setBloqueado(true);
      somAcerto();
      const e = elogioAleatorio();
      setMsg({ texto: `${e} ${palavra}!`, tipo: "acerto" });
      falar(`${e} ${palavra}.`);
      setTimeout(() => {
        setMsg(null);
        setBloqueado(false);
        setIndice((i) => i + 1);
      }, 1600);
    } else {
      somErro();
      setMsg({ texto: `${palavra} começa com outra letra`, tipo: "erro" });
      falar(`${palavra} começa com outra letra`);
      setTimeout(() => setMsg(null), 1400);
    }
  }

  return (
    <JogoLayout
      titulo="Som das Letras"
      instrucao={fim ? "Você reconheceu todas as letras!" : "Escolha a figura que começa com a letra"}
      estrelas={indice}
      total={TOTAL}
      onReiniciar={reiniciar}
    >
      {fim ? (
        <TelaFinal onReiniciar={reiniciar} texto="Você reconheceu as letras!" />
      ) : (
        <div className="space-y-8">
          <button
            onClick={() => falar(`Qual figura começa com a letra ${alvo?.letra}?`)}
            aria-label={`Ouvir novamente a letra ${alvo?.letra}`}
            className="card-brinquedo mx-auto flex size-40 items-center justify-center text-8xl font-extrabold text-primary anim-pulinho"
          >
            {alvo?.letra}
          </button>

          <div className="grid grid-cols-3 gap-4 sm:gap-6">
            {opcoes.map((p) => (
              <button
                key={p.palavra}
                onClick={() => escolher(p.letra, p.palavra)}
                aria-label={p.palavra}
                className="flex h-36 flex-col items-center justify-center gap-2 rounded-3xl border-4 border-foreground/10 bg-card shadow-[0_10px_0_0_color-mix(in_oklab,var(--foreground)_14%,transparent)] transition-transform hover:-translate-y-1 active:translate-y-1 sm:h-44"
              >
                <span className="text-6xl">{p.emoji}</span>
                <span className="text-lg font-bold text-foreground">{p.palavra}</span>
              </button>
            ))}
          </div>

          <div className="h-14">{msg && <Balao texto={msg.texto} tipo={msg.tipo} />}</div>
        </div>
      )}
    </JogoLayout>
  );
}
