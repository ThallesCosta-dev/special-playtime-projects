import { createFileRoute } from "@tanstack/react-router";
import { JogoLayout, TelaFinal } from "@/components/JogoLayout";
import { useRodadas } from "@/hooks/useRodadas";
import { elogioAleatorio, montarOpcoes } from "@/lib/jogo";

export const Route = createFileRoute("/jogos/letras")({
  head: () => ({
    meta: [
      { title: "Jogo das Letras | Brincar e Aprender" },
      {
        name: "description",
        content:
          "Jogo de reconhecimento de letras: ouça o nome da letra e escolha a figura cuja palavra começa com ela.",
      },
      { property: "og:title", content: "Jogo das Letras | Brincar e Aprender" },
      {
        property: "og:description",
        content: "Ouça o nome da letra e escolha a figura que começa com ela.",
      },
    ],
  }),
  component: JogoLetras,
});

type Palavra = { letra: string; emoji: string; palavra: string };

const PALAVRAS: readonly Palavra[] = [
  { letra: "B", emoji: "🍌", palavra: "banana" },
  { letra: "C", emoji: "🐶", palavra: "cachorro" },
  { letra: "F", emoji: "🌺", palavra: "flor" },
  { letra: "S", emoji: "☀️", palavra: "sol" },
  { letra: "P", emoji: "🦶", palavra: "pé" },
  { letra: "M", emoji: "🖐️", palavra: "mão" },
];

const TOTAL = 5;

function JogoLetras() {
  const jogo = useRodadas<Palavra, Palavra>({
    itens: PALAVRAS,
    total: TOTAL,
    gerarOpcoes: (alvo, aleatorio) =>
      montarOpcoes(
        alvo,
        PALAVRAS.filter((p) => p.letra !== alvo.letra),
        aleatorio,
      ),
    instrucaoFalada: (alvo) => `Qual figura começa com a letra ${alvo.letra}?`,
    fraseFinal: "Você acertou as letras. Parabéns!",
  });
  const { alvo } = jogo;

  function escolher(p: Palavra) {
    if (jogo.bloqueado || !alvo) return;
    if (p.letra === alvo.letra) {
      const e = elogioAleatorio();
      jogo.acertar(
        `${e} ${p.palavra} começa com ${p.letra}!`,
        `${e} ${p.palavra} começa com a letra ${p.letra}.`,
        1600,
      );
    } else {
      // Nomeia a letra da figura escolhida: o erro também ensina.
      jogo.errar(
        `${p.palavra} começa com ${p.letra}`,
        `${p.palavra} começa com a letra ${p.letra}. Tente outra.`,
        1400,
      );
    }
  }

  return (
    <JogoLayout
      titulo="Jogo das Letras"
      instrucao={
        alvo
          ? `Escolha a figura que começa com a letra ${alvo.letra}`
          : "Você reconheceu todas as letras!"
      }
      estrelas={jogo.estrelas}
      total={TOTAL}
      onReiniciar={jogo.reiniciar}
      mensagem={jogo.msg}
      vozBloqueada={jogo.avisoVoz}
    >
      {alvo ? (
        <div className="space-y-8">
          <button
            type="button"
            onClick={jogo.ouvirDeNovo}
            aria-label={`Ouvir novamente a letra ${alvo.letra}`}
            className="card-brinquedo mx-auto flex size-40 items-center justify-center text-8xl font-extrabold text-primary anim-pulinho"
          >
            {alvo.letra}
          </button>

          <div className="grid grid-cols-3 gap-4 sm:gap-6">
            {jogo.opcoes.map((p) => (
              <button
                key={p.palavra}
                type="button"
                onClick={() => escolher(p)}
                aria-label={p.palavra}
                className="flex h-36 items-center justify-center rounded-3xl border-4 border-foreground/10 bg-card shadow-[0_10px_0_0_color-mix(in_oklab,var(--foreground)_14%,transparent)] transition-transform hover:-translate-y-1 active:translate-y-1 sm:h-44"
              >
                {/* Sem a palavra escrita: senão bastaria comparar a forma da letra com
                    a inicial, sem associar o som da letra à figura. A palavra
                    aparece na mensagem depois da escolha. */}
                <span className="text-7xl" aria-hidden="true">
                  {p.emoji}
                </span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <TelaFinal onReiniciar={jogo.reiniciar} texto="Você reconheceu as letras!" />
      )}
    </JogoLayout>
  );
}
