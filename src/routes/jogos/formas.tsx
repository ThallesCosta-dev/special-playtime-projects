import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { JogoLayout, Balao, TelaFinal } from "@/components/JogoLayout";
import { elogioAleatorio, embaralhar, falar, somAcerto, somErro, somFesta } from "@/lib/jogo";

export const Route = createFileRoute("/jogos/formas")({
  head: () => ({
    meta: [
      { title: "Encaixe das Formas | Brincar e Aprender" },
      {
        name: "description",
        content:
          "Jogo de pareamento de formas geométricas com contornos grandes, voz em português e reforço positivo.",
      },
      { property: "og:title", content: "Encaixe das Formas | Brincar e Aprender" },
      {
        property: "og:description",
        content: "Pareamento de formas geométricas com apoio visual e sonoro.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: JogoFormas,
});

type Forma = { nome: string; cor: string; path: string };

const FORMAS: Forma[] = [
  { nome: "círculo", cor: "var(--morango)", path: "M50 8a42 42 0 1 0 .1 0Z" },
  { nome: "quadrado", cor: "var(--ceu)", path: "M12 12h76v76H12Z" },
  { nome: "triângulo", cor: "var(--folha)", path: "M50 10 92 88H8Z" },
  { nome: "estrela", cor: "var(--sol)", path: "M50 6 62 38h34L68 58l10 34-28-20-28 20 10-34L4 38h34Z" },
  { nome: "coração", cor: "var(--uva)", path: "M50 88C20 68 8 52 8 36a22 22 0 0 1 42-9 22 22 0 0 1 42 9c0 16-12 32-42 52Z" },
];

const TOTAL = 5;

function FormaSvg({ forma, preenchida }: { forma: Forma; preenchida: boolean }) {
  return (
    <svg viewBox="0 0 100 100" className="size-24 sm:size-28" aria-hidden="true">
      <path
        d={forma.path}
        fill={preenchida ? forma.cor : "transparent"}
        stroke="color-mix(in oklab, var(--foreground) 45%, transparent)"
        strokeWidth={preenchida ? 3 : 6}
        strokeDasharray={preenchida ? undefined : "10 8"}
        strokeLinejoin="round"
      />
    </svg>
  );
}

function JogoFormas() {
  const [rodadas, setRodadas] = useState(() => [...FORMAS]);
  const [indice, setIndice] = useState(0);
  const [opcoes, setOpcoes] = useState<Forma[]>([]);
  const [msg, setMsg] = useState<{ texto: string; tipo: "acerto" | "erro" } | null>(null);
  const [bloqueado, setBloqueado] = useState(false);

  const alvo = rodadas[indice];
  const fim = indice >= TOTAL;

  useEffect(() => {
    if (!alvo) return;
    const outras = embaralhar(FORMAS.filter((f) => f.nome !== alvo.nome)).slice(0, 2);
    setOpcoes(embaralhar([alvo, ...outras]));
    falar(`Encontre o ${alvo.nome}`);
  }, [alvo]);

  // Embaralha somente no cliente, evitando divergência com o HTML do servidor.
  useEffect(() => {
    setRodadas(embaralhar(FORMAS));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (fim) {
      somFesta();
      falar("Você encaixou todas as formas. Parabéns!");
    }
  }, [fim]);

  const reiniciar = useCallback(() => {
    setRodadas(embaralhar(FORMAS));
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
      setMsg({ texto: "Quase! Olhe o contorno", tipo: "erro" });
      falar("Quase. Olhe o contorno");
      setTimeout(() => setMsg(null), 1200);
    }
  }

  return (
    <JogoLayout
      titulo="Encaixe das Formas"
      instrucao={fim ? "Todas as formas encaixadas!" : `Qual peça cabe no ${alvo?.nome}?`}
      estrelas={indice}
      total={TOTAL}
      onReiniciar={reiniciar}
    >
      {fim ? (
        <TelaFinal onReiniciar={reiniciar} texto="Você encaixou tudo!" />
      ) : (
        <div className="space-y-8">
          <button
            onClick={() => falar(`Encontre o ${alvo?.nome}`)}
            aria-label={`Ouvir novamente: ${alvo?.nome}`}
            className="card-brinquedo mx-auto flex size-44 items-center justify-center anim-pulinho"
          >
            {alvo && <FormaSvg forma={alvo} preenchida={false} />}
          </button>

          <div className="grid grid-cols-3 gap-4 sm:gap-6">
            {opcoes.map((f) => (
              <button
                key={f.nome}
                onClick={() => escolher(f.nome)}
                aria-label={f.nome}
                className="flex h-36 items-center justify-center rounded-3xl border-4 border-foreground/10 bg-card shadow-[0_10px_0_0_color-mix(in_oklab,var(--foreground)_14%,transparent)] transition-transform hover:-translate-y-1 active:translate-y-1 sm:h-44"
              >
                <FormaSvg forma={f} preenchida />
              </button>
            ))}
          </div>

          <div className="h-14">{msg && <Balao texto={msg.texto} tipo={msg.tipo} />}</div>
        </div>
      )}
    </JogoLayout>
  );
}
