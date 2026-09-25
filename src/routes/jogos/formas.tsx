import { createFileRoute } from "@tanstack/react-router";
import { JogoLayout, TelaFinal } from "@/components/JogoLayout";
import { useRodadas } from "@/hooks/useRodadas";
import { elogioAleatorio, montarOpcoes } from "@/lib/jogo";

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
    ],
  }),
  component: JogoFormas,
});

type Forma = { nome: string; artigo: "o" | "a"; cor: string; path: string };

const FORMAS: readonly Forma[] = [
  { nome: "círculo", artigo: "o", cor: "var(--morango)", path: "M50 8a42 42 0 1 0 .1 0Z" },
  { nome: "quadrado", artigo: "o", cor: "var(--ceu)", path: "M12 12h76v76H12Z" },
  { nome: "triângulo", artigo: "o", cor: "var(--folha)", path: "M50 10 92 88H8Z" },
  {
    nome: "estrela",
    artigo: "a",
    cor: "var(--sol)",
    path: "M50 6 62 38h34L68 58l10 34-28-20-28 20 10-34L4 38h34Z",
  },
  {
    nome: "coração",
    artigo: "o",
    cor: "var(--uva)",
    path: "M50 88C20 68 8 52 8 36a22 22 0 0 1 42-9 22 22 0 0 1 42 9c0 16-12 32-42 52Z",
  },
];

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
  const jogo = useRodadas<Forma, Forma>({
    itens: FORMAS,
    total: FORMAS.length,
    gerarOpcoes: (alvo, aleatorio) =>
      montarOpcoes(
        alvo,
        FORMAS.filter((f) => f !== alvo),
        aleatorio,
      ),
    // A instrução não diz o nome da forma: o jogo treina discriminação visual,
    // então a criança compara o contorno com as peças. O nome vem no acerto.
    instrucaoFalada: () => "Qual peça cabe neste contorno?",
    fraseFinal: "Você encaixou todas as formas. Parabéns!",
  });
  const { alvo } = jogo;

  function escolher(forma: Forma) {
    if (jogo.bloqueado || !alvo) return;
    if (forma === alvo) {
      const e = elogioAleatorio();
      jogo.acertar(
        `${e} É ${alvo.artigo} ${alvo.nome}!`,
        `${e} É ${alvo.artigo} ${alvo.nome}.`,
        1600,
      );
    } else jogo.errar("Quase! Olhe o contorno", "Quase. Olhe o contorno");
  }

  return (
    <JogoLayout
      titulo="Encaixe das Formas"
      instrucao={alvo ? "Qual peça cabe neste contorno?" : "Todas as formas encaixadas!"}
      estrelas={jogo.estrelas}
      total={FORMAS.length}
      onReiniciar={jogo.reiniciar}
      mensagem={jogo.msg}
      vozBloqueada={jogo.avisoVoz}
    >
      {alvo ? (
        <div className="space-y-8">
          <button
            type="button"
            onClick={jogo.ouvirDeNovo}
            aria-label="Ouvir a instrução novamente"
            className="card-brinquedo mx-auto flex size-44 items-center justify-center anim-pulinho"
          >
            <FormaSvg forma={alvo} preenchida={false} />
          </button>

          <div className="grid grid-cols-3 gap-4 sm:gap-6">
            {jogo.opcoes.map((f) => (
              <button
                key={f.nome}
                type="button"
                onClick={() => escolher(f)}
                aria-label={f.nome}
                className="flex h-36 items-center justify-center rounded-3xl border-4 border-foreground/10 bg-card shadow-[0_10px_0_0_color-mix(in_oklab,var(--foreground)_14%,transparent)] transition-transform hover:-translate-y-1 active:translate-y-1 sm:h-44"
              >
                <FormaSvg forma={f} preenchida />
              </button>
            ))}
          </div>
        </div>
      ) : (
        <TelaFinal onReiniciar={jogo.reiniciar} texto="Você encaixou tudo!" />
      )}
    </JogoLayout>
  );
}
