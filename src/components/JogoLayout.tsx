import { Link } from "@tanstack/react-router";
import { ArrowLeft, RotateCcw, Star } from "lucide-react";
import type { ReactNode } from "react";

type Props = {
  titulo: string;
  instrucao: string;
  estrelas: number;
  total: number;
  onReiniciar: () => void;
  children: ReactNode;
};

export function JogoLayout({ titulo, instrucao, estrelas, total, onReiniciar, children }: Props) {
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
            className="flex items-center gap-1 rounded-2xl bg-sol px-4 py-3 text-sol-foreground"
            aria-label={`${estrelas} de ${total} estrelas`}
          >
            {Array.from({ length: total }).map((_, i) => (
              <Star
                key={i}
                className={
                  i < estrelas
                    ? "size-7 fill-current anim-brilho"
                    : "size-7 opacity-30"
                }
              />
            ))}
          </div>

          <button
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

        <div className="mt-8">{children}</div>
      </div>
    </main>
  );
}

export function Balao({ texto, tipo }: { texto: string; tipo: "acerto" | "erro" }) {
  return (
    <p
      role="status"
      className={
        "mx-auto w-fit rounded-full px-6 py-3 text-2xl font-extrabold " +
        (tipo === "acerto"
          ? "bg-folha text-folha-foreground anim-brilho"
          : "bg-secondary text-secondary-foreground anim-tremer")
      }
    >
      {texto}
    </p>
  );
}

export function TelaFinal({ onReiniciar, texto = "Muito bem!" }: { onReiniciar: () => void; texto?: string }) {
  return (
    <div className="card-brinquedo mx-auto max-w-md p-10 text-center">
      <p className="text-7xl anim-pulinho">🎉</p>
      <p className="mt-4 text-3xl font-extrabold text-foreground">{texto}</p>
      <button
        onClick={onReiniciar}
        className="mt-6 rounded-2xl bg-primary px-8 py-4 text-2xl font-extrabold text-primary-foreground shadow-[0_8px_0_0_color-mix(in_oklab,var(--foreground)_18%,transparent)] transition-transform hover:-translate-y-0.5"
      >
        Jogar de novo
      </button>
    </div>
  );
}
