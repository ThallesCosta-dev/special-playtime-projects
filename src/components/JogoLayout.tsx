import { Link } from "@tanstack/react-router";
import { ArrowLeft, RotateCcw, Star } from "lucide-react";
import type { ReactNode } from "react";
import type { Mensagem } from "@/hooks/useRodadas";

type Props = {
  titulo: string;
  instrucao: string;
  estrelas: number;
  total: number;
  onReiniciar: () => void;
  /** Mensagem de acerto ou erro exibida abaixo do conteúdo. */
  mensagem?: Mensagem | null;
  /** Mostra a dica de que a voz só toca após o primeiro toque (acesso direto à página). */
  vozBloqueada?: boolean;
  /** Onde tocar para ouvir a instrução quando a voz está bloqueada. */
  dicaVoz?: string;
  children: ReactNode;
};

export function JogoLayout({
  titulo,
  instrucao,
  estrelas,
  total,
  onReiniciar,
  mensagem,
  vozBloqueada,
  dicaVoz = "Toque na figura grande para ouvir a instrução 🔊",
  children,
}: Props) {
  return (
    <main className="min-h-screen px-4 py-6 sm:px-8">
      <div className="mx-auto max-w-4xl">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <Link
            to="/"
            aria-label="Voltar para a lista de jogos"
            className="inline-flex items-center gap-2 rounded-2xl border-4 border-foreground/10 bg-card px-4 py-3 text-lg font-bold text-foreground shadow-[0_6px_0_0_color-mix(in_oklab,var(--foreground)_12%,transparent)] transition-transform hover:-translate-y-0.5"
          >
            <ArrowLeft className="size-6" /> Voltar
          </Link>

          <div
            role="img"
            aria-label={`${estrelas} de ${total} estrelas`}
            className="flex items-center gap-1 rounded-2xl bg-sol px-4 py-3 text-sol-foreground"
          >
            {Array.from({ length: total }).map((_, i) => (
              <Star
                key={i}
                aria-hidden="true"
                className={i < estrelas ? "size-7 fill-current anim-brilho" : "size-7 opacity-30"}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={onReiniciar}
            className="inline-flex items-center gap-2 rounded-2xl border-4 border-foreground/10 bg-card px-4 py-3 text-lg font-bold text-foreground shadow-[0_6px_0_0_color-mix(in_oklab,var(--foreground)_12%,transparent)] transition-transform hover:-translate-y-0.5"
          >
            <RotateCcw className="size-6" /> Recomeçar
          </button>
        </header>

        <h1 className="mt-6 text-center text-4xl font-extrabold text-foreground sm:text-5xl">
          {titulo}
        </h1>
        <p className="mt-2 text-center text-xl font-semibold text-muted-foreground sm:text-2xl">
          {instrucao}
        </p>
        {vozBloqueada && (
          <p role="status" className="mt-2 text-center text-base font-bold text-primary">
            {dicaVoz}
          </p>
        )}

        <div className="mt-8">{children}</div>

        <div className="mt-8 flex min-h-16 items-start justify-center px-2">
          {mensagem && <Balao texto={mensagem.texto} tipo={mensagem.tipo} />}
        </div>
      </div>
    </main>
  );
}

export function Balao({ texto, tipo }: Mensagem) {
  return (
    <p
      role="status"
      className={
        "max-w-full rounded-full px-6 py-3 text-center text-xl font-extrabold sm:text-2xl " +
        (tipo === "acerto"
          ? "bg-folha text-folha-foreground anim-brilho"
          : "bg-secondary text-secondary-foreground anim-tremer")
      }
    >
      {texto}
    </p>
  );
}

export function TelaFinal({
  onReiniciar,
  texto = "Muito bem!",
}: {
  onReiniciar: () => void;
  texto?: string;
}) {
  return (
    <div className="card-brinquedo mx-auto max-w-md p-10 text-center">
      <p className="text-7xl anim-pulinho" aria-hidden="true">
        🎉
      </p>
      <p className="mt-4 text-3xl font-extrabold text-foreground">{texto}</p>
      <button
        type="button"
        onClick={onReiniciar}
        className="mt-6 rounded-2xl bg-primary px-8 py-4 text-2xl font-extrabold text-primary-foreground shadow-[0_8px_0_0_color-mix(in_oklab,var(--foreground)_18%,transparent)] transition-transform hover:-translate-y-0.5"
      >
        Jogar de novo
      </button>
    </div>
  );
}

/** Repete a instrução em jogos que não têm uma figura grande para tocar. */
export function BotaoOuvir({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mx-auto flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-xl font-extrabold text-primary-foreground shadow-[0_6px_0_0_color-mix(in_oklab,var(--foreground)_18%,transparent)] transition-transform hover:-translate-y-0.5 active:translate-y-0.5"
    >
      <span aria-hidden="true">🔊</span> Ouvir de novo
    </button>
  );
}
