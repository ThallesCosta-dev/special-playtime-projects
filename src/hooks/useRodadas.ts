import { useCallback, useEffect, useRef, useState } from "react";
import {
  aposFalaETempo,
  embaralhar,
  falar,
  podeFalar,
  somAcerto,
  somErro,
  somFesta,
} from "@/lib/jogo";

export type Mensagem = { texto: string; tipo: "acerto" | "erro" };

type Config<T, O> = {
  /** Itens que serão sorteados como alvo de cada rodada. */
  itens: readonly T[];
  /** Quantas rodadas o jogo tem (pode ser menor que `itens.length`). */
  total: number;
  /** Alternativas exibidas para o alvo. `aleatorio = false` só no HTML do servidor. */
  gerarOpcoes: (alvo: T, aleatorio: boolean) => O[];
  /** Frase falada no início de cada rodada. */
  instrucaoFalada: (alvo: T) => string;
  /** Frase falada ao terminar todas as rodadas. */
  fraseFinal: string;
};

type Estado<T, O> = {
  rodadas: T[];
  indice: number;
  opcoes: O[];
  /** 0 = estado determinístico vindo do servidor; incrementa a cada partida no cliente. */
  partida: number;
};

type Timer = ReturnType<typeof setTimeout>;

/**
 * Máquina de estados compartilhada pelos jogos de "escolha a alternativa certa":
 * sorteio das rodadas, alternativas, mensagens, bloqueio durante a comemoração,
 * estrelas e reinício. Todos os timers são cancelados ao reiniciar e ao desmontar.
 */
export function useRodadas<T, O>(config: Config<T, O>) {
  const cfg = useRef(config);
  useEffect(() => {
    cfg.current = config;
  });

  const [estado, setEstado] = useState<Estado<T, O>>(() => {
    const rodadas = [...config.itens];
    const alvo = rodadas[0];
    return {
      rodadas,
      indice: 0,
      opcoes: alvo === undefined ? [] : config.gerarOpcoes(alvo, false),
      partida: 0,
    };
  });
  const [msg, setMsg] = useState<Mensagem | null>(null);
  const [bloqueado, setBloqueado] = useState(false);
  const [acertou, setAcertou] = useState(false);
  const [avisoVoz, setAvisoVoz] = useState(false);

  /** Cancela a espera pelo fim da comemoração (fala + tempo mínimo). */
  const cancelarRodada = useRef<(() => void) | null>(null);
  const timerMsg = useRef<Timer | null>(null);

  const limparTimers = useCallback(() => {
    cancelarRodada.current?.();
    if (timerMsg.current) clearTimeout(timerMsg.current);
    cancelarRodada.current = null;
    timerMsg.current = null;
  }, []);

  const reiniciar = useCallback(() => {
    limparTimers();
    setEstado((e) => {
      const rodadas = embaralhar(cfg.current.itens);
      const alvo = rodadas[0];
      return {
        rodadas,
        indice: 0,
        opcoes: alvo === undefined ? [] : cfg.current.gerarOpcoes(alvo, true),
        partida: e.partida + 1,
      };
    });
    setMsg(null);
    setBloqueado(false);
    setAcertou(false);
  }, [limparTimers]);

  // Embaralha somente no cliente, evitando divergência com o HTML do servidor.
  useEffect(() => {
    reiniciar();
  }, [reiniciar]);

  // Cancela timers pendentes ao sair da página.
  useEffect(() => () => limparTimers(), [limparTimers]);

  const { rodadas, indice, opcoes, partida } = estado;
  const total = config.total;
  const fim = indice >= total;
  const alvo = fim ? undefined : rodadas[indice];

  // Fala a instrução a cada rodada nova. `partida` na dependência garante que o
  // reinício fale mesmo quando o novo alvo coincide com o anterior.
  useEffect(() => {
    if (partida === 0 || alvo === undefined) return;
    if (!podeFalar()) {
      setAvisoVoz(true);
      return;
    }
    void falar(cfg.current.instrucaoFalada(alvo));
  }, [alvo, partida]);

  useEffect(() => {
    if (partida === 0 || !fim) return;
    somFesta();
    void falar(cfg.current.fraseFinal);
  }, [fim, partida]);

  const mostrarMsg = useCallback((m: Mensagem, duracao: number) => {
    if (timerMsg.current) clearTimeout(timerMsg.current);
    setMsg(m);
    timerMsg.current = setTimeout(() => {
      timerMsg.current = null;
      setMsg(null);
    }, duracao);
  }, []);

  /**
   * Comemora o acerto e avança. A próxima rodada só começa quando a frase de
   * acerto termina (e passou pelo menos `atraso` ms), senão a instrução nova
   * cortaria a frase no meio.
   */
  const acertar = useCallback((texto: string, falado: string = texto, atraso = 1400) => {
    setAvisoVoz(false);
    setBloqueado(true);
    setAcertou(true);
    somAcerto();
    if (timerMsg.current) clearTimeout(timerMsg.current);
    timerMsg.current = null;
    setMsg({ texto, tipo: "acerto" });
    cancelarRodada.current?.();
    cancelarRodada.current = aposFalaETempo(falar(falado), atraso, () => {
      cancelarRodada.current = null;
      setMsg(null);
      setBloqueado(false);
      setAcertou(false);
      setEstado((e) => {
        const proximo = e.indice + 1;
        const proximoAlvo = proximo < cfg.current.total ? e.rodadas[proximo] : undefined;
        return {
          ...e,
          indice: proximo,
          opcoes: proximoAlvo === undefined ? [] : cfg.current.gerarOpcoes(proximoAlvo, true),
        };
      });
    });
  }, []);

  const errar = useCallback(
    (texto: string, falado: string = texto, atraso = 1200) => {
      setAvisoVoz(false);
      somErro();
      mostrarMsg({ texto, tipo: "erro" }, atraso);
      void falar(falado);
    },
    [mostrarMsg],
  );

  const ouvirDeNovo = useCallback(() => {
    // Durante a comemoração, repetir a instrução cortaria a frase de acerto.
    if (bloqueado) return;
    setAvisoVoz(false);
    if (alvo !== undefined) void falar(cfg.current.instrucaoFalada(alvo));
  }, [alvo, bloqueado]);

  // A estrela da rodada acende no instante do acerto, não só na troca de rodada.
  const estrelas = Math.min(total, indice + (acertou ? 1 : 0));

  return {
    alvo,
    indice,
    opcoes,
    msg,
    bloqueado,
    fim,
    estrelas,
    partida,
    /** Verdadeiro quando a voz foi bloqueada por falta de interação (acesso direto à página). */
    avisoVoz,
    reiniciar,
    acertar,
    errar,
    ouvirDeNovo,
  };
}
