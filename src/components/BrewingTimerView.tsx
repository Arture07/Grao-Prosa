import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
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
  BookOpen,
  Sliders,
  Scale
} from 'lucide-react';

interface BrewingTimerViewProps {
  onRegistrarDegustacao?: (dados: { metodo: string; doseG: number; aguaMl: number }) => void;
}

export const BrewingTimerView: React.FC<BrewingTimerViewProps> = ({ onRegistrarDegustacao }) => {
  const { t } = useTranslation();
  const [mostrarCalculadora, setMostrarCalculadora] = useState<boolean>(false);

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
            {t('tools.title')}
          </h2>
          <p className="font-sans text-[10px] uppercase tracking-[0.2em] opacity-60 mt-0.5">
            {t('tools.subtitle')}
          </p>
        </div>

        <div className="flex items-center self-start sm:self-auto">
          <button
            onClick={() => setMostrarCalculadora(!mostrarCalculadora)}
            className="stamped-border bg-white/80 hover:bg-white text-[#1A1A1A] px-4 py-2 font-sans text-xs uppercase tracking-wider font-semibold flex items-center gap-2 transition-all cursor-pointer"
          >
            <Sliders className="w-3.5 h-3.5 text-[#5A4033]" />
            {mostrarCalculadora ? t('common.close') : t('tools.ratioCalculator')}
          </button>
        </div>
      </div>

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
              {t('tools.recipes')}
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
                      <span className="font-serif font-bold text-sm">{t(r.nome)}</span>
                      <span className={`font-mono text-[10px] px-2 py-0.5 ${isSelected ? 'bg-[#F5F2ED] text-[#1A1A1A]' : 'bg-[#1A1A1A]/10 text-[#1A1A1A]'}`}>
                        {r.metodo}
                      </span>
                    </div>
                    <p className={`font-sans text-[11px] mt-1 line-clamp-2 ${isSelected ? 'text-[#F5F2ED]/80' : 'text-[#1A1A1A]/70'}`}>
                      {t(r.descricao)}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Ajuste de Dose em Gramas */}
            <div className="pt-3 border-t border-[#1A1A1A]/10 space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-sans text-xs font-bold uppercase tracking-wider text-[#1A1A1A] flex items-center gap-1.5">
                  <Scale className="w-4 h-4 text-[#5A4033]" /> {t('tools.powderAmount')}
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
                <span>{t('tools.calculatedTotalWater')}</span>
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
                  {timer.receita.metodo} • {t(timer.receita.nome)}
                </span>
                <span className="font-sans text-xs text-[#F5F2ED]/70">
                  {t('tools.doseWaterRatio', { dose: timer.doseCafe, water: timer.volumeTotalAguaMl })}
                </span>
              </div>

              {/* Indicadores de Feedback */}
              <div className="flex items-center gap-2 font-sans text-[10px] uppercase tracking-wider text-[#F5F2ED]/60 bg-white/5 border border-[#F5F2ED]/10 px-2.5 py-1">
                <span className="flex items-center gap-1 text-emerald-400">
                  <Volume2 className="w-3 h-3" /> {t('tools.soundVibrationOn')}
                </span>
              </div>
            </div>

            {/* TIMER DISPLAY PRINCIPAL (MM:SS) */}
            <div className="flex flex-col items-center justify-center py-4 space-y-2">
              <div className="font-serif text-6xl sm:text-8xl font-bold tracking-tight text-[#F5F2ED] tabular-nums drop-shadow-sm">
                {timer.tempoDecorridoFormatado}
              </div>
              <div className="font-sans text-xs text-[#F5F2ED]/60 uppercase tracking-widest">
                {t('tools.estimatedTotalTime')} {timer.tempoTotalFormatado}
              </div>
            </div>

            {/* FASE ATUAL EM DESTAQUE */}
            <div className="stamped-border bg-[#F5F2ED]/10 p-5 space-y-3 relative">
              <div className="flex items-center justify-between">
                <span className="font-sans text-[10px] uppercase tracking-widest text-amber-300 font-bold">
                  {t('tools.step')} {timer.etapaAtualIndex + 1} {t('tools.of')} {timer.etapasEscaladas.length}: {t(timer.etapaAtual?.nome || '')}
                </span>
                <span className="font-serif text-sm font-bold text-amber-300">
                  {timer.etapaAtual?.duracaoSegundos}s
                </span>
              </div>

              {/* Meta de Água da Fase */}
              <div className="flex items-baseline gap-2">
                <Droplet className="w-5 h-5 text-amber-300 shrink-0" />
                <span className="font-serif text-2xl font-bold text-[#F5F2ED]">
                  {t('tools.pourUntil')} <strong className="text-amber-300">{timer.volumeAtualAlvoMl} ml</strong>
                </span>
              </div>

              {/* Instrução */}
              <p className="font-sans text-xs text-[#F5F2ED]/90 leading-relaxed italic">
                "{t(timer.etapaAtual?.instrucao || '')}"
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
                  <Pause className="w-5 h-5 fill-current" /> {t('tools.pause')}
                </button>
              ) : (
                <button
                  onClick={timer.start}
                  className="px-8 py-3.5 bg-[#F5F2ED] hover:bg-white text-[#1A1A1A] font-sans text-xs uppercase tracking-widest font-bold flex items-center gap-2 transition-all cursor-pointer shadow-md"
                >
                  <Play className="w-5 h-5 fill-current" />
                  {timer.status === 'paused' ? 'Continuar' : timer.status === 'completed' ? 'Reiniciar' : t('tools.start')}
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
                  <BookOpen className="w-4 h-4" /> {t('tools.registerExtractionInJournal')}
                </button>
              </div>
            )}
          </div>

          {/* LISTA COMPLETA DAS ETAPAS DA RECEITA */}
          <div className="stamped-border bg-white/70 p-6 space-y-4">
            <h3 className="font-serif text-xl font-semibold text-[#1A1A1A] border-b border-[#1A1A1A]/10 pb-2 flex items-center justify-between">
              <span>{t('tools.stagesTitle')}</span>
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
                          {t(etapa.nome)}
                        </span>
                        <div className="flex items-center gap-2 font-sans text-xs">
                          <span className={isCurrent ? 'text-amber-300 font-bold' : 'font-semibold'}>
                            {etapa.volumeAguaAlvoMl} ml {t('tools.accumulated')}
                          </span>
                          <span className="opacity-60">• {etapa.duracaoSegundos}s</span>
                        </div>
                      </div>
                      <p className={`font-sans text-xs ${isCurrent ? 'text-[#F5F2ED]/90' : 'text-[#1A1A1A]/70'}`}>
                        {t(etapa.instrucao)}
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
