import { createFileRoute } from "@tanstack/react-router";
import { JogoLayout, TelaFinal } from "@/components/JogoLayout";
import { useRodadas } from "@/hooks/useRodadas";
import { elogioAleatorio, montarOpcoes } from "@/lib/jogo";

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
    ],
  }),
  component: JogoCores,
});

type Cor = { nome: string; fundo: string; texto: string; emoji: string };

const CORES: readonly Cor[] = [
  { nome: "vermelho", fundo: "bg-morango", texto: "text-morango-foreground", emoji: "🍎" },
  { nome: "azul", fundo: "bg-ceu", texto: "text-ceu-foreground", emoji: "🐳" },
  { nome: "verde", fundo: "bg-folha", texto: "text-folha-foreground", emoji: "🐢" },
  { nome: "amarelo", fundo: "bg-sol", texto: "text-sol-foreground", emoji: "🌻" },
  { nome: "roxo", fundo: "bg-uva", texto: "text-uva-foreground", emoji: "🍇" },
];

function JogoCores() {
  const jogo = useRodadas<Cor, Cor>({
    itens: CORES,
    total: CORES.length,
    gerarOpcoes: (alvo, aleatorio) =>
      montarOpcoes(
        alvo,
        CORES.filter((c) => c !== alvo),
        aleatorio,
      ),
    instrucaoFalada: (alvo) => `Onde está o ${alvo.nome}?`,
    fraseFinal: "Você terminou o jogo das cores. Parabéns!",
  });
  const { alvo } = jogo;

  function escolher(cor: Cor) {
    if (jogo.bloqueado || !alvo) return;
    if (cor === alvo) jogo.acertar(elogioAleatorio());
    else jogo.errar("Tente outra vez");
  }

  return (
    <JogoLayout
      titulo="Jogo das Cores"
      instrucao={alvo ? `Toque no ${alvo.nome}` : "Você completou todas as cores!"}
      estrelas={jogo.estrelas}
      total={CORES.length}
      onReiniciar={jogo.reiniciar}
      mensagem={jogo.msg}
      vozBloqueada={jogo.avisoVoz}
    >
      {alvo ? (
        <div className="space-y-8">
          <button
            type="button"
            onClick={jogo.ouvirDeNovo}
            className="card-brinquedo mx-auto flex size-40 items-center justify-center rounded-full text-7xl anim-pulinho"
            aria-label={`Ouvir novamente: ${alvo.nome}`}
          >
            {alvo.emoji}
          </button>

          <div className="grid grid-cols-3 gap-4 sm:gap-6">
            {jogo.opcoes.map((c) => (
              <button
                key={c.nome}
                type="button"
                onClick={() => escolher(c)}
                aria-label={`Cor ${c.nome}`}
                className={`${c.fundo} ${c.texto} h-32 rounded-3xl border-4 border-foreground/10 text-2xl font-extrabold shadow-[0_10px_0_0_color-mix(in_oklab,var(--foreground)_14%,transparent)] transition-transform hover:-translate-y-1 active:translate-y-1 sm:h-40 sm:text-3xl`}
              >
                {c.nome}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <TelaFinal onReiniciar={jogo.reiniciar} />
      )}
    </JogoLayout>
  );
}
