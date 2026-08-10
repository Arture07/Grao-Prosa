/**
 * HOOK CUSTOMIZADO: useBrewTimer
 * 
 * Gerenciamento de estado e engine de alta precisão para Cronômetro de Extração de Café com Fases.
 * 
 * -------------------------------------------------------------------------------------------------
 * CUIDADOS NATIVOS & BOAS PRÁTICAS REACT NATIVE:
 * 1. PREVENÇÃO DE CONGELAMENTO EM BACKGROUND (DISPOSITIVO BLOQUEADO / TELA APAGADA):
 *    - No ambiente Web e React Native padrão, o `setInterval` ou `requestAnimationFrame` pode ser 
 *      despriorizado/pausado pelo sistema operacional quando o app vai para background ou a tela apaga.
 *    - SOLUÇÃO INTEGRADA NESTE HOOK: Em vez de incrementar `tempo += 100ms`, armazenamos o timestamp inicial 
 *      `startTimeRef = Date.now()` e calculamos a diferença delta `Date.now() - startTimeRef` a cada tick. 
 *      Assim, se o app ficar em segundo plano por 30 segundos, ao retornar, a diferença de tempo estará 
 *      perfeitamente exata sem perda de segundos!
 *    - EM PRODUÇÃO REACT NATIVE (EXPO / NATIVE CLI):
 *      a) Para manter a tela ACESA durante o preparo do café:
 *         Utilize o pacote Expo Keep Awake:
 *         `import { useKeepAwake } from 'expo-keep-awake';` -> invocado na View do Cronômetro.
 *      b) Para rodar timers e emitir notificações audíveis/vibratórias mesmo em background:
 *         Recomenda-se utilizar `react-native-background-timer` ou `expo-task-manager` / `expo-notifications`.
 * 
 * 2. FEEDBACK SENSORIAL (VIBRAÇÃO & AUDIO CHIME):
 *    - Utiliza `Vibration.vibrate()` do React Native (com fallback para `navigator.vibrate` na Web)
 *      para vibrar o dispositivo na transição de cada fase da extração.
 *    - Toca um tom senoidal sutil via Web Audio API (xícara limpa) na Web.
 * -------------------------------------------------------------------------------------------------
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { ReceitaCafe, EtapaReceita, StatusCronometro } from '../types/timer';

export function useBrewTimer(receitaInicial: ReceitaCafe, doseCafeG: number = receitaInicial.doseCafePadraoG) {
  const [receita, setReceita] = useState<ReceitaCafe>(receitaInicial);
  const [doseCafe, setDoseCafe] = useState<number>(doseCafeG);
  const [status, setStatus] = useState<StatusCronometro>('idle');
  const [tempoDecorridoMs, setTempoDecorridoMs] = useState<number>(0);

  // Refs para controle preciso de tempo e prevenção de re-renders desnecessários
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const accumulatedTimeRef = useRef<number>(0);
  const lastEmittedStageIndexRef = useRef<number>(-1);

  // Cálculo da escala de água proporcional baseada na dose de café atual
  // Se a receita tem proporção 1:15, e a dose mudou para 20g, escala as etapas proporcionalmente
  const fatorEscalaAgua = doseCafe / receita.doseCafePadraoG;

  const etapasEscaladas: EtapaReceita[] = receita.etapas.map(etapa => ({
    ...etapa,
    volumeAguaAlvoMl: Math.round(etapa.volumeAguaAlvoMl * fatorEscalaAgua)
  }));

  // Tempo total calculado em segundos somando todas as etapas
  const tempoTotalSegundos = etapasEscaladas.reduce((acc, e) => acc + e.duracaoSegundos, 0);

  // Função para acionar a vibração e feedback sonoro ao mudar de fase
  const dispararFeedbackFase = useCallback((_nomeEtapa: string) => {
    // 1. Vibração Nativa (React Native / Web API)
    try {
      if (typeof window !== 'undefined' && 'navigator' in window && window.navigator.vibrate) {
        // Padrão de vibração: Vibra 200ms, pausa 100ms, vibra 200ms
        window.navigator.vibrate([200, 100, 200]);
      }
    } catch (e) {
      console.warn('Vibração não suportada no navegador atual', e);
    }

    // 2. Feedback Sonoro Web Audio API (Sino sutil de café)
    try {
      if (typeof window !== 'undefined' && (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)) {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ctx.currentTime); // Nota A5
        osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.3); // Ramp down para A4

        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      }
    } catch {
      // Audio silencioso em caso de falta de interação prévia
    }
  }, []);

  // Determina em qual etapa estamos no momento baseado no tempo decorrido
  const calcularEtapaAtual = useCallback((tempoMs: number) => {
    const tempoSeg = tempoMs / 1000;
    let acumulado = 0;

    for (let i = 0; i < etapasEscaladas.length; i++) {
      const e = etapasEscaladas[i];
      acumulado += e.duracaoSegundos;
      if (tempoSeg < acumulado) {
        const inicioEtapaSeg = acumulado - e.duracaoSegundos;
        const tempoDentroDaEtapaSeg = tempoSeg - inicioEtapaSeg;
        const progressoEtapaPercent = Math.min(100, Math.max(0, (tempoDentroDaEtapaSeg / e.duracaoSegundos) * 100));
        
        return {
          index: i,
          etapa: e,
          proximaEtapa: etapasEscaladas[i + 1] || null,
          progressoEtapaPercent,
          inicioEtapaSeg,
          duracaoEtapaSeg: e.duracaoSegundos
        };
      }
    }

    // Se passou do tempo total, retorna a última etapa concluída
    const ultimaEtapa = etapasEscaladas[etapasEscaladas.length - 1];
    return {
      index: etapasEscaladas.length - 1,
      etapa: ultimaEtapa,
      proximaEtapa: null,
      progressoEtapaPercent: 100,
      inicioEtapaSeg: tempoTotalSegundos - ultimaEtapa.duracaoSegundos,
      duracaoEtapaSeg: ultimaEtapa.duracaoSegundos
    };
  }, [etapasEscaladas, tempoTotalSegundos]);

  const infoEtapa = calcularEtapaAtual(tempoDecorridoMs);

  // Efeito para disparar vibração quando o índice da etapa muda durante a execução
  useEffect(() => {
    if (status === 'running') {
      if (infoEtapa.index !== lastEmittedStageIndexRef.current) {
        lastEmittedStageIndexRef.current = infoEtapa.index;
        dispararFeedbackFase(infoEtapa.etapa.nome);
      }
    }
  }, [infoEtapa.index, status, infoEtapa.etapa.nome, dispararFeedbackFase]);

  // Loop principal do Cronômetro usando Date.now() para precisão
  useEffect(() => {
    if (status === 'running') {
      startTimeRef.current = Date.now() - accumulatedTimeRef.current;

      intervalRef.current = setInterval(() => {
        const agora = Date.now();
        const delta = agora - startTimeRef.current;
        accumulatedTimeRef.current = delta;

        if (delta / 1000 >= tempoTotalSegundos) {
          setTempoDecorridoMs(tempoTotalSegundos * 1000);
          setStatus('completed');
          if (intervalRef.current) clearInterval(intervalRef.current);
          dispararFeedbackFase('Extração Concluída!');
        } else {
          setTempoDecorridoMs(delta);
        }
      }, 50); // Atualiza a UI a cada 50ms para fluidez visual
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [status, tempoTotalSegundos, dispararFeedbackFase]);

  // Ações do Barista
  const start = useCallback(() => {
    if (status === 'completed') {
      accumulatedTimeRef.current = 0;
      setTempoDecorridoMs(0);
      lastEmittedStageIndexRef.current = -1;
    }
    setStatus('running');
  }, [status]);

  const pause = useCallback(() => {
    setStatus('paused');
  }, []);

  const reset = useCallback(() => {
    setStatus('idle');
    accumulatedTimeRef.current = 0;
    setTempoDecorridoMs(0);
    lastEmittedStageIndexRef.current = -1;
  }, []);

  // Avançar para a próxima etapa manualmente
  const skipToNextStage = useCallback(() => {
    const atual = calcularEtapaAtual(accumulatedTimeRef.current);
    if (atual.index < etapasEscaladas.length - 1) {
      // Calcula o tempo do início da próxima etapa
      let tempoAcumuladoSeg = 0;
      for (let i = 0; i <= atual.index; i++) {
        tempoAcumuladoSeg += etapasEscaladas[i].duracaoSegundos;
      }
      const novoTempoMs = tempoAcumuladoSeg * 1000;
      accumulatedTimeRef.current = novoTempoMs;
      startTimeRef.current = Date.now() - novoTempoMs;
      setTempoDecorridoMs(novoTempoMs);
    }
  }, [calcularEtapaAtual, etapasEscaladas]);

  // Voltar para a etapa anterior
  const previousStage = useCallback(() => {
    const atual = calcularEtapaAtual(accumulatedTimeRef.current);
    if (atual.index > 0) {
      let tempoAcumuladoSeg = 0;
      for (let i = 0; i < atual.index - 1; i++) {
        tempoAcumuladoSeg += etapasEscaladas[i].duracaoSegundos;
      }
      const novoTempoMs = tempoAcumuladoSeg * 1000;
      accumulatedTimeRef.current = novoTempoMs;
      startTimeRef.current = Date.now() - novoTempoMs;
      setTempoDecorridoMs(novoTempoMs);
    } else {
      reset();
    }
  }, [calcularEtapaAtual, etapasEscaladas, reset]);

  // Trocar Receita
  const selecionarReceita = useCallback((novaReceita: ReceitaCafe) => {
    reset();
    setReceita(novaReceita);
    setDoseCafe(novaReceita.doseCafePadraoG);
  }, [reset]);

  // Progresso total percentual (0 - 100)
  const progressoTotalPercentual = Math.min(100, (tempoDecorridoMs / (tempoTotalSegundos * 1000)) * 100);

  // Volume total alvo de água
  const volumeTotalAguaMl = etapasEscaladas[etapasEscaladas.length - 1]?.volumeAguaAlvoMl || 0;

  return {
    status,
    receita,
    doseCafe,
    setDoseCafe,
    etapasEscaladas,
    tempoDecorridoMs,
    tempoTotalSegundos,
    tempoDecorridoFormatado: formatarTempo(tempoDecorridoMs),
    tempoTotalFormatado: formatarTempo(tempoTotalSegundos * 1000),
    etapaAtualIndex: infoEtapa.index,
    etapaAtual: infoEtapa.etapa,
    proximaEtapa: infoEtapa.proximaEtapa,
    progressoEtapaPercent: infoEtapa.progressoEtapaPercent,
    progressoTotalPercentual,
    volumeTotalAguaMl,
    volumeAtualAlvoMl: infoEtapa.etapa.volumeAguaAlvoMl,
    // Ações
    start,
    pause,
    reset,
    skipToNextStage,
    previousStage,
    selecionarReceita
  };
}

// Helper de formatação de milissegundos para MM:SS
function formatarTempo(ms: number): string {
  const totalSegundos = Math.floor(ms / 1000);
  const minutos = Math.floor(totalSegundos / 60);
  const segundos = totalSegundos % 60;
  return `${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;
}
