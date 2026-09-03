import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { JogoLayout, Balao } from "@/components/JogoLayout";
import { elogioAleatorio, embaralhar, falar, somAcerto, somErro, somFesta } from "@/lib/jogo";

export const Route = createFileRoute("/jogos/cores")({
  head: () => ({
    meta: [
      { title: "Jogo das Cores | Brincar e Aprender" },
      {
        name: "description",
        content:
          "Jogo de reconhecimento de cores com apoio de voz, ilustrações grandes e feedback imediato para crianças com síndrome de Down.",
      },
      { property: "og:title", content: "Jogo das Cores | Brincar e Aprender" },
      {
        property: "og:description",
        content: "Reconhecimento de cores com voz, alvos grandes e reforço positivo.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: JogoCores,
});

const CORES = [
  { nome: "vermelho", classe: "bg-morango", emoji: "🍎" },
  { nome: "azul", classe: "bg-ceu", emoji: "🐳" },
  { nome: "verde", classe: "bg-folha", emoji: "🐢" },
  { nome: "amarelo", classe: "bg-sol", emoji: "🌻" },
  { nome: "roxo", classe: "bg-uva", emoji: "🍇" },
];

const TOTAL = 5;

function JogoCores() {
  const [rodadas, setRodadas] = useState(() => embaralhar(CORES));
  const [indice, setIndice] = useState(0);
  const [opcoes, setOpcoes] = useState<typeof CORES>([]);
  const [msg, setMsg] = useState<{ texto: string; tipo: "acerto" | "erro" } | null>(null);
  const [bloqueado, setBloqueado] = useState(false);

  const alvo = rodadas[indice];
  const fim = indice >= TOTAL;

  useEffect(() => {
    if (!alvo) return;
    const outras = embaralhar(CORES.filter((c) => c.nome !== alvo.nome)).slice(0, 2);
    setOpcoes(embaralhar([alvo, ...outras]));
    falar(`Onde está a cor ${alvo.nome}?`);
  }, [alvo]);

  useEffect(() => {
    if (fim) {
      somFesta();
      falar("Você terminou o jogo das cores. Parabéns!");
    }
  }, [fim]);

  const reiniciar = useCallback(() => {
    setRodadas(embaralhar(CORES));
    setIndice(0);
    setMsg(null);
    setBloqueado(false);
  }, []);

  function escolher(nome: string) {
    if (bloqueado || !alvo) return;
    if (nome === alvo.nome) {
      setBloqueado(true);
      somAcerto();
      const e = elogioAleatorio();
      setMsg({ texto: e, tipo: "acerto" });
      falar(e);
      setTimeout(() => {
        setMsg(null);
        setBloqueado(false);
        setIndice((i) => i + 1);
      }, 1400);
    } else {
      somErro();
      setMsg({ texto: "Tente outra vez", tipo: "erro" });
      falar("Tente outra vez");
      setTimeout(() => setMsg(null), 1200);
    }
  }

  return (
    <JogoLayout
      titulo="Jogo das Cores"
      instrucao={fim ? "Você completou todas as cores!" : `Toque na cor ${alvo?.nome}`}
      estrelas={indice}
      total={TOTAL}
      onReiniciar={reiniciar}
    >
      {fim ? (
        <Final onReiniciar={reiniciar} />
      ) : (
        <div className="space-y-8">
          <button
            onClick={() => falar(`Onde está a cor ${alvo?.nome}?`)}
            className="mx-auto flex size-40 items-center justify-center rounded-full card-brinquedo text-7xl anim-pulinho"
            aria-label={`Ouvir novamente: cor ${alvo?.nome}`}
          >
            {alvo?.emoji}
          </button>

          <div className="grid grid-cols-3 gap-4 sm:gap-6">
            {opcoes.map((c) => (
              <button
                key={c.nome}
                onClick={() => escolher(c.nome)}
                aria-label={`Cor ${c.nome}`}
                className={`${c.classe} h-32 rounded-3xl border-4 border-foreground/10 text-2xl font-extrabold text-foreground/80 shadow-[0_10px_0_0_color-mix(in_oklab,var(--foreground)_14%,transparent)] transition-transform hover:-translate-y-1 active:translate-y-1 sm:h-40 sm:text-3xl`}
              >
                {c.nome}
              </button>
            ))}
          </div>

          <div className="h-14">{msg && <Balao texto={msg.texto} tipo={msg.tipo} />}</div>
        </div>
      )}
    </JogoLayout>
  );
}

function Final({ onReiniciar }: { onReiniciar: () => void }) {
  return (
    <div className="card-brinquedo mx-auto max-w-md p-10 text-center">
      <p className="text-7xl anim-pulinho">🎉</p>
      <p className="mt-4 text-3xl font-extrabold text-foreground">Muito bem!</p>
      <button
        onClick={onReiniciar}
        className="mt-6 rounded-2xl bg-primary px-8 py-4 text-2xl font-extrabold text-primary-foreground shadow-[0_8px_0_0_color-mix(in_oklab,var(--foreground)_18%,transparent)]"
      >
        Jogar de novo
      </button>
    </div>
  );
}
