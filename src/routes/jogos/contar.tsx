import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { JogoLayout, Balao, TelaFinal } from "@/components/JogoLayout";
import { elogioAleatorio, embaralhar, falar, somAcerto, somErro, somFesta } from "@/lib/jogo";

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
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: JogoContar,
});

const OBJETOS = ["🍏", "🐤", "⭐", "🐞", "🎈"];
const TOTAL = 5;

function opcoesPara(n: number) {
  const outras = embaralhar([1, 2, 3, 4, 5].filter((x) => x !== n)).slice(0, 2);
  return embaralhar([n, ...outras]);
}

function JogoContar() {
  const [rodadas, setRodadas] = useState(() => [1, 2, 3, 4, 5]);
  const [indice, setIndice] = useState(0);
  const [opcoes, setOpcoes] = useState<number[]>([]);
  const [msg, setMsg] = useState<{ texto: string; tipo: "acerto" | "erro" } | null>(null);
  const [bloqueado, setBloqueado] = useState(false);
  const [marcados, setMarcados] = useState<number[]>([]);

  const quantidade = rodadas[indice];
  const objeto = OBJETOS[indice % OBJETOS.length];
  const fim = indice >= TOTAL;

  useEffect(() => {
    if (!quantidade) return;
    setOpcoes(opcoesPara(quantidade));
    setMarcados([]);
    falar("Quantos você vê? Toque em cada um para contar.");
  }, [quantidade]);

  // Embaralha somente no cliente, evitando divergência com o HTML do servidor.
  useEffect(() => {
    setRodadas(embaralhar([1, 2, 3, 4, 5]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (fim) {
      somFesta();
      falar("Você contou tudo. Parabéns!");
    }
  }, [fim]);

  const reiniciar = useCallback(() => {
    setRodadas(embaralhar([1, 2, 3, 4, 5]));
    setIndice(0);
    setMsg(null);
    setMarcados([]);
    setBloqueado(false);
  }, []);

  function contar(i: number) {
    if (marcados.includes(i)) return;
    const novos = [...marcados, i];
    setMarcados(novos);
    falar(String(novos.length));
  }

  function escolher(n: number) {
    if (bloqueado || !quantidade) return;
    if (n === quantidade) {
      setBloqueado(true);
      somAcerto();
      const e = elogioAleatorio();
      setMsg({ texto: `${e} São ${n}!`, tipo: "acerto" });
      falar(`${e} São ${n}.`);
      setTimeout(() => {
        setMsg(null);
        setBloqueado(false);
        setIndice((i) => i + 1);
      }, 1600);
    } else {
      somErro();
      setMsg({ texto: "Conte de novo, com calma", tipo: "erro" });
      falar("Conte de novo, com calma");
      setTimeout(() => setMsg(null), 1300);
    }
  }

  return (
    <JogoLayout
      titulo="Vamos Contar"
      instrucao={fim ? "Contagem completa!" : "Toque em cada figura e diga quantas são"}
      estrelas={indice}
      total={TOTAL}
      onReiniciar={reiniciar}
    >
      {fim ? (
        <TelaFinal onReiniciar={reiniciar} texto="Você contou tudo!" />
      ) : (
        <div className="space-y-8">
          <div className="card-brinquedo flex flex-wrap items-center justify-center gap-4 p-6">
            {Array.from({ length: quantidade ?? 0 }).map((_, i) => (
              <button
                key={i}
                onClick={() => contar(i)}
                aria-label={`Contar figura ${i + 1}`}
                className={
                  "text-6xl transition-transform sm:text-7xl " +
                  (marcados.includes(i) ? "scale-110 opacity-60" : "anim-pulinho")
                }
                style={{ animationDelay: `${i * 0.15}s` }}
              >
                {objeto}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-4 sm:gap-6">
            {opcoes.map((n) => (
              <button
                key={n}
                onClick={() => escolher(n)}
                aria-label={`Número ${n}`}
                className="h-32 rounded-3xl border-4 border-foreground/10 bg-accent text-6xl font-extrabold text-accent-foreground shadow-[0_10px_0_0_color-mix(in_oklab,var(--foreground)_14%,transparent)] transition-transform hover:-translate-y-1 active:translate-y-1 sm:h-40"
              >
                {n}
              </button>
            ))}
          </div>

          <div className="h-14">{msg && <Balao texto={msg.texto} tipo={msg.tipo} />}</div>
        </div>
      )}
    </JogoLayout>
  );
}
