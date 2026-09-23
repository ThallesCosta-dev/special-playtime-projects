import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { JogoLayout, TelaFinal } from "@/components/JogoLayout";
import { useRodadas } from "@/hooks/useRodadas";
import { elogioAleatorio, falar, montarOpcoes } from "@/lib/jogo";

export const Route = createFileRoute("/jogos/contar")({
  head: () => ({
    meta: [
      { title: "Vamos Contar | Brincar e Aprender" },
      {
        name: "description",
        content:
          "Jogo de contagem de 1 a 5 com objetos grandes, contagem falada em voz alta e três opções de resposta.",
      },
      { property: "og:title", content: "Vamos Contar | Brincar e Aprender" },
      {
        property: "og:description",
        content: "Contagem de 1 a 5 com apoio de voz e objetos grandes e coloridos.",
      },
    ],
  }),
  component: JogoContar,
});

const OBJETOS = ["🍏", "🐤", "⭐", "🐞", "🎈"];
const NUMEROS: readonly number[] = [1, 2, 3, 4, 5];

/** Figuras da rodada. Remontado a cada rodada (via `key`), zerando a contagem. */
function Figuras({ quantidade, objeto }: { quantidade: number; objeto: string }) {
  const [marcados, setMarcados] = useState<number[]>([]);

  function contar(i: number) {
    if (marcados.includes(i)) return;
    const novos = [...marcados, i];
    setMarcados(novos);
    // A primeira figura interrompe a instrução; as seguintes entram na fila,
    // para que toques rápidos não engulam números ("um, dois, três").
    falar(String(novos.length), { interromper: novos.length === 1 });
  }

  return (
    <div className="card-brinquedo flex flex-wrap items-center justify-center gap-4 p-6">
      {Array.from({ length: quantidade }).map((_, i) => {
        const marcado = marcados.includes(i);
        return (
          <button
            key={i}
            type="button"
            onClick={() => contar(i)}
            aria-label={marcado ? `Figura ${i + 1}, já contada` : `Contar figura ${i + 1}`}
            aria-pressed={marcado}
            className={
              "text-6xl transition-transform sm:text-7xl " +
              (marcado ? "scale-110 opacity-60" : "anim-pulinho")
            }
            style={marcado ? undefined : { animationDelay: `${i * 0.15}s` }}
          >
            {objeto}
          </button>
        );
      })}
    </div>
  );
}

function JogoContar() {
  const jogo = useRodadas<number, number>({
    itens: NUMEROS,
    total: NUMEROS.length,
    gerarOpcoes: (n, aleatorio) =>
      montarOpcoes(
        n,
        NUMEROS.filter((x) => x !== n),
        aleatorio,
      ),
    instrucaoFalada: () => "Quantos você vê? Toque em cada um para contar.",
    fraseFinal: "Você contou tudo. Parabéns!",
  });
  const { alvo: quantidade } = jogo;
  const objeto = OBJETOS[jogo.indice % OBJETOS.length] ?? OBJETOS[0]!;

  function escolher(n: number) {
    if (jogo.bloqueado || quantidade === undefined) return;
    if (n === quantidade) {
      const e = elogioAleatorio();
      const escrito = n === 1 ? "É 1!" : `São ${n}!`;
      const falado = n === 1 ? "É um." : `São ${n}.`;
      jogo.acertar(`${e} ${escrito}`, `${e} ${falado}`, 1600);
    } else {
      jogo.errar("Conte de novo, com calma", "Conte de novo, com calma", 1300);
    }
  }

  return (
    <JogoLayout
      titulo="Vamos Contar"
      instrucao={
        quantidade === undefined ? "Contagem completa!" : "Toque em cada figura e diga quantas são"
      }
      estrelas={jogo.estrelas}
      total={NUMEROS.length}
      onReiniciar={jogo.reiniciar}
      mensagem={jogo.msg}
      vozBloqueada={jogo.avisoVoz}
    >
      {quantidade === undefined ? (
        <TelaFinal onReiniciar={jogo.reiniciar} texto="Você contou tudo!" />
      ) : (
        <div className="space-y-8">
          <Figuras key={`${jogo.partida}-${jogo.indice}`} quantidade={quantidade} objeto={objeto} />

          <div className="grid grid-cols-3 gap-4 sm:gap-6">
            {jogo.opcoes.map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => escolher(n)}
                aria-label={`Número ${n}`}
                className="h-32 rounded-3xl border-4 border-foreground/10 bg-accent text-6xl font-extrabold text-accent-foreground shadow-[0_10px_0_0_color-mix(in_oklab,var(--foreground)_14%,transparent)] transition-transform hover:-translate-y-1 active:translate-y-1 sm:h-40"
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      )}
    </JogoLayout>
  );
}
