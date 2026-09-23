import { createFileRoute, Link } from "@tanstack/react-router";
import { falar } from "@/lib/jogo";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Brincar e Aprender | Jogos para crianças com síndrome de Down" },
      {
        name: "description",
        content:
          "Cinco jogos educativos gratuitos criados com apoio pedagógico e neuropediátrico: cores, formas, contagem, memória e letras.",
      },
      {
        property: "og:title",
        content: "Brincar e Aprender | Jogos para crianças com síndrome de Down",
      },
      {
        property: "og:description",
        content: "Cinco jogos educativos acessíveis: cores, formas, contagem, memória e letras.",
      },
    ],
  }),
  component: Inicio,
});

const JOGOS = [
  {
    para: "/jogos/cores",
    emoji: "🎨",
    titulo: "Jogo das Cores",
    descricao: "Reconhecer e nomear cinco cores básicas.",
    objetivo: "Percepção visual",
    fundo: "bg-morango",
    texto: "text-morango-foreground",
  },
  {
    para: "/jogos/formas",
    emoji: "🔷",
    titulo: "Encaixe das Formas",
    descricao: "Parear formas geométricas com o contorno certo.",
    objetivo: "Discriminação visual",
    fundo: "bg-ceu",
    texto: "text-ceu-foreground",
  },
  {
    para: "/jogos/contar",
    emoji: "🔢",
    titulo: "Vamos Contar",
    descricao: "Contar de 1 a 5 tocando em cada figura.",
    objetivo: "Noção de número",
    fundo: "bg-folha",
    texto: "text-folha-foreground",
  },
  {
    para: "/jogos/memoria",
    emoji: "🐶",
    titulo: "Memória dos Animais",
    descricao: "Encontrar quatro pares de animais iguais.",
    objetivo: "Memória de trabalho",
    fundo: "bg-sol",
    texto: "text-sol-foreground",
  },
  {
    para: "/jogos/letras",
    emoji: "🔤",
    titulo: "Jogo das Letras",
    descricao: "Ouvir o nome da letra e achar a figura que começa com ela.",
    objetivo: "Reconhecer letras",
    fundo: "bg-uva",
    texto: "text-uva-foreground",
  },
] as const;

function Inicio() {
  return (
    <main className="min-h-screen px-4 py-10 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <header className="text-center">
          <p className="mx-auto w-fit rounded-full bg-card px-5 py-2 text-base font-bold text-muted-foreground shadow-[0_4px_0_0_color-mix(in_oklab,var(--foreground)_10%,transparent)]">
            Jogos criados com pedagogia, neuropediatria e design acessível
          </p>
          <h1 className="mt-6 text-5xl font-extrabold text-foreground sm:text-7xl">
            Brincar e Aprender
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-xl font-semibold text-muted-foreground sm:text-2xl">
            Cinco jogos curtos, com voz em português, alvos grandes e nenhum tempo limite, pensados
            para crianças com síndrome de Down.
          </p>
          <button
            type="button"
            onClick={() =>
              falar(
                "Olá! Escolha um jogo para começar a brincar. Cores, formas, contar, memória ou letras.",
              )
            }
            className="mt-6 inline-flex items-center gap-3 rounded-full bg-primary px-8 py-4 text-xl font-extrabold text-primary-foreground shadow-[0_8px_0_0_color-mix(in_oklab,var(--foreground)_18%,transparent)] transition-transform hover:-translate-y-1 active:translate-y-1"
          >
            🔊 Ouvir as instruções
          </button>
        </header>

        <section aria-label="Lista de jogos" className="mt-12 grid gap-6 sm:grid-cols-2">
          {JOGOS.map((j, i) => {
            const ultimoSozinho = i === JOGOS.length - 1 && JOGOS.length % 2 === 1;
            return (
              <Link
                key={j.para}
                to={j.para}
                className={`card-brinquedo flex items-center gap-5 p-6 transition-transform hover:-translate-y-1 active:translate-y-1 ${ultimoSozinho ? "sm:col-span-2" : ""}`}
              >
                <span
                  aria-hidden="true"
                  className={`flex size-20 shrink-0 items-center justify-center rounded-3xl text-5xl ${j.fundo} ${j.texto}`}
                >
                  {j.emoji}
                </span>
                <span className="min-w-0">
                  <span className="fonte-display block text-2xl font-extrabold text-foreground">
                    {j.titulo}
                  </span>
                  <span className="mt-1 block text-lg font-semibold text-muted-foreground">
                    {j.descricao}
                  </span>
                  <span className="mt-2 inline-block rounded-full bg-secondary px-3 py-1 text-sm font-bold text-secondary-foreground">
                    {j.objetivo}
                  </span>
                </span>
              </Link>
            );
          })}
        </section>

        <section className="card-brinquedo mt-12 p-8">
          <h2 className="text-3xl font-extrabold text-foreground">Como usar com a criança</h2>
          <ul className="mt-4 space-y-3 text-lg font-semibold text-muted-foreground">
            <li>• Sessões curtas: cada jogo termina em poucas rodadas, evitando fadiga.</li>
            <li>• Sem tempo limite nem punição: o erro só convida a tentar de novo.</li>
            <li>• Instruções faladas e visuais juntas, reforçando a via auditiva e a visual.</li>
            <li>• Botões grandes e espaçados, adequados à motricidade fina em desenvolvimento.</li>
            <li>• Acompanhe ao lado, nomeando em voz alta o que a criança acertou.</li>
          </ul>
        </section>

        <footer className="mt-10 pb-6 text-center text-base font-semibold text-muted-foreground">
          Recurso de apoio pedagógico. Não substitui acompanhamento terapêutico.
        </footer>
      </div>
    </main>
  );
}
