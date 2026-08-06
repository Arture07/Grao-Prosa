import React, { useState } from 'react';
import { useBrewTimer } from '../hooks/useBrewTimer';
import { RECEITAS_PREDEFINIDAS } from '../data/presetRecipes';
import { RatioCalculator } from './RatioCalculator';
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  SkipBack,
  Coffee,
  Droplet,
  CheckCircle2,
  Volume2,
  Smartphone,
  ChevronRight,
  BookOpen,
  Info,
  Sliders,
  Scale
} from 'lucide-react';

interface BrewingTimerViewProps {
  onRegistrarDegustacao?: (dados: { metodo: string; doseG: number; aguaMl: number }) => void;
}

export const BrewingTimerView: React.FC<BrewingTimerViewProps> = ({ onRegistrarDegustacao }) => {
  const [mostrarCalculadora, setMostrarCalculadora] = useState<boolean>(false);
  const [mostrarGuiaNativo, setMostrarGuiaNativo] = useState<boolean>(false);

  // Hook Customizado Engine do Cronômetro
  const timer = useBrewTimer(RECEITAS_PREDEFINIDAS[0]);

  // Aplica novos valores de café/água vindos da calculadora de proporção
  const handleApplyRatio = (coffeeGrams: number) => {
    timer.setDoseCafe(coffeeGrams);
    setMostrarCalculadora(false);
  };

  return (
    <div className="space-y-8 pb-12 text-[#1A1A1A]">
      {/* Top Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between border-b border-[#1A1A1A]/10 pb-4 gap-2">
        <div>
          <h2 className="font-serif text-3xl font-semibold tracking-tight text-[#1A1A1A]">
            04. Cronômetro de Extração & Proporção
          </h2>
          <p className="font-sans text-[10px] uppercase tracking-[0.2em] opacity-60 mt-0.5">
            Guias de Vertido, Fases e Calculadora Barista
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setMostrarCalculadora(!mostrarCalculadora)}
            className="stamped-border bg-white/80 hover:bg-white text-[#1A1A1A] px-3.5 py-2 font-sans text-xs uppercase tracking-wider font-medium flex items-center gap-2 transition-all cursor-pointer"
          >
            <Sliders className="w-3.5 h-3.5 text-[#5A4033]" />
            {mostrarCalculadora ? 'Ocultar Calculadora' : 'Calculadora Ratio'}
          </button>

          <button
            onClick={() => setMostrarGuiaNativo(!mostrarGuiaNativo)}
            className="stamped-border bg-white/80 hover:bg-white text-[#1A1A1A] px-3.5 py-2 font-sans text-xs uppercase tracking-wider font-medium flex items-center gap-2 transition-all cursor-pointer"
          >
            <Smartphone className="w-3.5 h-3.5 text-[#5A4033]" />
            Cuidados Nativos
          </button>
        </div>
      </div>

      {/* Painel do Guia Nativo e Cuidados de Background (Fase 2 Dev Note) */}
      {mostrarGuiaNativo && (
        <div className="stamped-border bg-[#1A1A1A] text-[#F5F2ED] p-6 space-y-4 font-sans text-xs">
          <div className="flex items-center gap-2 border-b border-[#F5F2ED]/20 pb-3">
            <Smartphone className="w-5 h-5 text-amber-300" />
            <h3 className="font-serif text-xl text-[#F5F2ED]">
              Arquitetura React Native: Cronômetro & Tela Acesas
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-[11px] leading-relaxed">
            <div className="border border-[#F5F2ED]/20 p-3 space-y-1 bg-black/30">
              <span className="text-amber-300 font-bold block font-sans uppercase tracking-wider text-[10px]">
                1. Date.now() vs setInterval
              </span>
              <p className="text-[#F5F2ED]/80 font-sans">
                O hook calcula a diferença temporal `Date.now() - startTime`. Mesmo que o SO suspenda a thread, o tempo acumulado continuará exato ao reativar.
              </p>
            </div>

            <div className="border border-[#F5F2ED]/20 p-3 space-y-1 bg-black/30">
              <span className="text-amber-300 font-bold block font-sans uppercase tracking-wider text-[10px]">
                2. Tela LIGADA (Keep Awake)
              </span>
              <p className="text-[#F5F2ED]/80 font-sans">
                Em Expo React Native, importe <code className="text-emerald-300">expo-keep-awake</code> (`useKeepAwake()`) na tela para evitar que o celular apague a tela durante o despejo.
              </p>
            </div>

            <div className="border border-[#F5F2ED]/20 p-3 space-y-1 bg-black/30">
              <span className="text-amber-300 font-bold block font-sans uppercase tracking-wider text-[10px]">
                3. Haptic & Feedback Sensorial
              </span>
              <p className="text-[#F5F2ED]/80 font-sans">
                Em React Native, <code className="text-emerald-300">Vibration.vibrate([200, 100, 200])</code> aciona o taptic engine nativo do iOS/Android na virada de fase.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Calculadora de Proporção expansível */}
      {mostrarCalculadora && (
        <RatioCalculator onApplyRatioToTimer={handleApplyRatio} />
      )}

      {/* Seletor de Receitas e Ajuste de Dose */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Coluna 1: Escolha de Receita e Dose */}
        <div className="space-y-4 lg:col-span-1">
          <div className="stamped-border bg-white/70 p-5 space-y-4">
            <h3 className="font-serif text-xl font-semibold text-[#1A1A1A] border-b border-[#1A1A1A]/10 pb-2">
              Selecione o Método
            </h3>

            <div className="space-y-2">
              {RECEITAS_PREDEFINIDAS.map((r) => {
                const isSelected = timer.receita.id === r.id;
                return (
                  <button
                    key={r.id}
                    onClick={() => timer.selecionarReceita(r)}
                    className={`w-full text-left p-3.5 stamped-border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#1A1A1A] text-[#F5F2ED]'
                        : 'bg-white/40 text-[#1A1A1A] hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-serif font-bold text-sm">{r.nome}</span>
                      <span className={`font-mono text-[10px] px-2 py-0.5 ${isSelected ? 'bg-[#F5F2ED] text-[#1A1A1A]' : 'bg-[#1A1A1A]/10 text-[#1A1A1A]'}`}>
                        {r.metodo}
                      </span>
                    </div>
                    <p className={`font-sans text-[11px] mt-1 line-clamp-2 ${isSelected ? 'text-[#F5F2ED]/80' : 'text-[#1A1A1A]/70'}`}>
                      {r.descricao}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Ajuste de Dose em Gramas */}
            <div className="pt-3 border-t border-[#1A1A1A]/10 space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-sans text-xs font-bold uppercase tracking-wider text-[#1A1A1A] flex items-center gap-1.5">
                  <Scale className="w-4 h-4 text-[#5A4033]" /> Dose de Pó (g)
                </label>
                <span className="font-serif font-bold text-base text-[#1A1A1A]">
                  {timer.doseCafe}g
                </span>
              </div>

              {/* Botões rápidos de gramas */}
              <div className="grid grid-cols-5 gap-1.5">
                {[15, 18, 20, 24, 30].map((g) => (
                  <button
                    key={g}
                    onClick={() => timer.setDoseCafe(g)}
                    className={`py-1.5 text-xs font-serif font-bold stamped-border cursor-pointer transition-all ${
                      timer.doseCafe === g
                        ? 'bg-[#1A1A1A] text-[#F5F2ED]'
                        : 'bg-white/60 hover:bg-white text-[#1A1A1A]'
                    }`}
                  >
                    {g}g
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between text-[11px] font-sans text-[#1A1A1A]/60 pt-1">
                <span>Água total calculada:</span>
                <strong className="font-serif font-bold text-sm text-[#1A1A1A]">{timer.volumeTotalAguaMl} ml</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Coluna 2 & 3: Cronômetro Principal & Visualizador de Fases */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Main Display Box */}
          <div className="stamped-border bg-[#1A1A1A] text-[#F5F2ED] p-6 sm:p-8 space-y-6 relative overflow-hidden">
            
            {/* Background Decorative Graphic */}
            <div className="absolute right-[-20px] bottom-[-20px] opacity-5 pointer-events-none">
              <Coffee className="w-64 h-64 text-[#F5F2ED]" />
            </div>

            {/* Barra de Progresso do Tempo Total */}
            <div className="w-full bg-[#F5F2ED]/10 h-2 border border-[#F5F2ED]/20 relative overflow-hidden">
              <div
                className="bg-amber-400 h-full transition-all duration-100 ease-linear"
                style={{ width: `${timer.progressoTotalPercentual}%` }}
              />
            </div>

            {/* Header da Tela do Timer */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-[#F5F2ED]/10 pb-4">
              <div>
                <span className="font-sans text-[10px] uppercase tracking-widest text-amber-300 font-bold block">
                  {timer.receita.metodo} • {timer.receita.nome}
                </span>
                <span className="font-sans text-xs text-[#F5F2ED]/70">
                  Dose: {timer.doseCafe}g pó • Água: {timer.volumeTotalAguaMl}ml
                </span>
              </div>

              {/* Indicadores de Feedback */}
              <div className="flex items-center gap-2 font-sans text-[10px] uppercase tracking-wider text-[#F5F2ED]/60 bg-white/5 border border-[#F5F2ED]/10 px-2.5 py-1">
                <span className="flex items-center gap-1 text-emerald-400">
                  <Volume2 className="w-3 h-3" /> Som & Vibração ON
                </span>
              </div>
            </div>

            {/* TIMER DISPLAY PRINCIPAL (MM:SS) */}
            <div className="flex flex-col items-center justify-center py-4 space-y-2">
              <div className="font-serif text-6xl sm:text-8xl font-bold tracking-tight text-[#F5F2ED] tabular-nums drop-shadow-sm">
                {timer.tempoDecorridoFormatado}
              </div>
              <div className="font-sans text-xs text-[#F5F2ED]/60 uppercase tracking-widest">
                Tempo Total Est.: {timer.tempoTotalFormatado}
              </div>
            </div>

            {/* FASE ATUAL EM DESTAQUE */}
            <div className="stamped-border bg-[#F5F2ED]/10 p-5 space-y-3 relative">
              <div className="flex items-center justify-between">
                <span className="font-sans text-[10px] uppercase tracking-widest text-amber-300 font-bold">
                  Etapa {timer.etapaAtualIndex + 1} de {timer.etapasEscaladas.length}: {timer.etapaAtual?.nome}
                </span>
                <span className="font-serif text-sm font-bold text-amber-300">
                  {timer.etapaAtual?.duracaoSegundos}s
                </span>
              </div>

              {/* Meta de Água da Fase */}
              <div className="flex items-baseline gap-2">
                <Droplet className="w-5 h-5 text-amber-300 shrink-0" />
                <span className="font-serif text-2xl font-bold text-[#F5F2ED]">
                  Despejar até: <strong className="text-amber-300">{timer.volumeAtualAlvoMl} ml</strong>
                </span>
              </div>

              {/* Instrução em Português */}
              <p className="font-sans text-xs text-[#F5F2ED]/90 leading-relaxed italic">
                "{timer.etapaAtual?.instrucao}"
              </p>

              {/* Progresso Específico da Fase Actual */}
              <div className="space-y-1 pt-1">
                <div className="w-full bg-[#F5F2ED]/10 h-1.5 border border-[#F5F2ED]/20">
                  <div
                    className="bg-amber-300 h-full transition-all duration-100 ease-linear"
                    style={{ width: `${timer.progressoEtapaPercent}%` }}
                  />
                </div>
              </div>
            </div>

            {/* BOTÕES DE CONTROLE PRINCIPAIS */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              
              {/* Botão Voltar Etapa */}
              <button
                onClick={timer.previousStage}
                title="Etapa Anterior"
                className="p-3 stamped-border bg-white/10 hover:bg-white/20 text-[#F5F2ED] transition-all cursor-pointer"
              >
                <SkipBack className="w-5 h-5" />
              </button>

              {/* Play / Pause Principal */}
              {timer.status === 'running' ? (
                <button
                  onClick={timer.pause}
                  className="px-8 py-3.5 bg-amber-400 hover:bg-amber-300 text-[#1A1A1A] font-sans text-xs uppercase tracking-widest font-bold flex items-center gap-2 transition-all cursor-pointer shadow-md"
                >
                  <Pause className="w-5 h-5 fill-current" /> Pausar
                </button>
              ) : (
                <button
                  onClick={timer.start}
                  className="px-8 py-3.5 bg-[#F5F2ED] hover:bg-white text-[#1A1A1A] font-sans text-xs uppercase tracking-widest font-bold flex items-center gap-2 transition-all cursor-pointer shadow-md"
                >
                  <Play className="w-5 h-5 fill-current" />
                  {timer.status === 'paused' ? 'Continuar' : timer.status === 'completed' ? 'Reiniciar' : 'Iniciar Extração'}
                </button>
              )}

              {/* Botão Avançar Etapa (Skip) */}
              <button
                onClick={timer.skipToNextStage}
                title="Próxima Etapa"
                className="p-3 stamped-border bg-white/10 hover:bg-white/20 text-[#F5F2ED] transition-all cursor-pointer"
              >
                <SkipForward className="w-5 h-5" />
              </button>

              {/* Botão Reset */}
              <button
                onClick={timer.reset}
                title="Resetar Cronômetro"
                className="p-3 stamped-border bg-white/10 hover:bg-white/20 text-[#F5F2ED] transition-all cursor-pointer"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
            </div>

            {/* Ação de Registro pós extração */}
            {onRegistrarDegustacao && (
              <div className="pt-4 border-t border-[#F5F2ED]/10 flex justify-center">
                <button
                  onClick={() => onRegistrarDegustacao({
                    metodo: timer.receita.metodo,
                    doseG: timer.doseCafe,
                    aguaMl: timer.volumeTotalAguaMl
                  })}
                  className="bg-amber-400/90 hover:bg-amber-300 text-[#1A1A1A] px-4 py-2.5 font-sans text-xs uppercase tracking-widest font-bold transition-all flex items-center gap-2 cursor-pointer"
                >
                  <BookOpen className="w-4 h-4" /> Registrar esta Extração no Diário
                </button>
              </div>
            )}
          </div>

          {/* LISTA COMPLETA DAS ETAPAS DA RECEITA */}
          <div className="stamped-border bg-white/70 p-6 space-y-4">
            <h3 className="font-serif text-xl font-semibold text-[#1A1A1A] border-b border-[#1A1A1A]/10 pb-2 flex items-center justify-between">
              <span>Etapas do Preparo ({timer.etapasEscaladas.length} Fases)</span>
              <span className="font-sans text-xs font-normal opacity-60">
                Total: {timer.tempoTotalFormatado}
              </span>
            </h3>

            <div className="space-y-2">
              {timer.etapasEscaladas.map((etapa, idx) => {
                const isCurrent = idx === timer.etapaAtualIndex && timer.status !== 'idle';
                const isPast = idx < timer.etapaAtualIndex || timer.status === 'completed';

                return (
                  <div
                    key={etapa.id}
                    className={`stamped-border p-3.5 transition-all flex items-start gap-3 ${
                      isCurrent
                        ? 'bg-[#1A1A1A] text-[#F5F2ED]'
                        : isPast
                        ? 'bg-[#F5F2ED]/80 text-[#1A1A1A]/60'
                        : 'bg-white/50 text-[#1A1A1A]'
                    }`}
                  >
                    <div className="pt-0.5">
                      {isPast ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : isCurrent ? (
                        <span className="w-2 h-2 rounded-full bg-amber-300 block animate-ping shrink-0 mt-1" />
                      ) : (
                        <span className="font-mono text-xs font-bold opacity-40">#{idx + 1}</span>
                      )}
                    </div>

                    <div className="flex-1 space-y-0.5">
                      <div className="flex items-center justify-between">
                        <span className="font-serif font-bold text-sm">
                          {etapa.nome}
                        </span>
                        <div className="flex items-center gap-2 font-sans text-xs">
                          <span className={isCurrent ? 'text-amber-300 font-bold' : 'font-semibold'}>
                            {etapa.volumeAguaAlvoMl} ml acumulados
                          </span>
                          <span className="opacity-60">• {etapa.duracaoSegundos}s</span>
                        </div>
                      </div>
                      <p className={`font-sans text-xs ${isCurrent ? 'text-[#F5F2ED]/90' : 'text-[#1A1A1A]/70'}`}>
                        {etapa.instrucao}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
