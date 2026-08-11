import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Scale, Droplet, Sparkles, RefreshCw, Info, ArrowRightLeft } from 'lucide-react';

interface RatioCalculatorProps {
  onApplyRatioToTimer?: (coffeeGrams: number, waterMl: number) => void;
}

export const RatioCalculator: React.FC<RatioCalculatorProps> = ({ onApplyRatioToTimer }) => {
  const { t } = useTranslation();
  const [modoCalculo, setModoCalculo] = useState<'cafeParaAgua' | 'aguaParaCafe'>('cafeParaAgua');
  const [gramasCafeInput, setGramasCafeInput] = useState<number>(18);
  const [volumeAguaInput, setVolumeAguaInput] = useState<number>(270);
  const [ratioNumerico, setRatioNumerico] = useState<number>(15);

  // Perfis de Ratio Pré-definidos
  const PRESETS_RATIO = [
    { ratio: 10, rotulo: '1:10', estiloKey: 'tools.presets.concentrated.style', descKey: 'tools.presets.concentrated.desc' },
    { ratio: 12, rotulo: '1:12', estiloKey: 'tools.presets.fullBodied.style', descKey: 'tools.presets.fullBodied.desc' },
    { ratio: 15, rotulo: '1:15', estiloKey: 'tools.presets.golden.style', descKey: 'tools.presets.golden.desc' },
    { ratio: 16, rotulo: '1:16', estiloKey: 'tools.presets.smoothFloral.style', descKey: 'tools.presets.smoothFloral.desc' },
    { ratio: 18, rotulo: '1:18', estiloKey: 'tools.presets.delicate.style', descKey: 'tools.presets.delicate.desc' },
  ];

  // Cálculos Automáticos
  const aguaCalculadaMl = Math.round(gramasCafeInput * ratioNumerico);
  const cafeCalculadoG = Number((volumeAguaInput / ratioNumerico).toFixed(1));

  const cafeFinal = modoCalculo === 'cafeParaAgua' ? gramasCafeInput : cafeCalculadoG;
  const aguaFinal = modoCalculo === 'cafeParaAgua' ? aguaCalculadaMl : volumeAguaInput;

  const handleToggleModo = () => {
    if (modoCalculo === 'cafeParaAgua') {
      setVolumeAguaInput(aguaCalculadaMl);
      setModoCalculo('aguaParaCafe');
    } else {
      setGramasCafeInput(cafeCalculadoG);
      setModoCalculo('cafeParaAgua');
    }
  };

  return (
    <div className="stamped-border bg-white/70 p-6 sm:p-8 space-y-6">
      {/* Header do Componente */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#1A1A1A]/10 pb-4 gap-3">
        <div>
          <span className="font-sans text-[10px] uppercase tracking-widest text-[#5A4033] font-semibold block">
            {t('tools.ratioCalculator')}
          </span>
          <h3 className="font-serif text-2xl sm:text-3xl font-semibold text-[#1A1A1A]">
            {t('tools.goldenRatio')}
          </h3>
          <p className="font-sans text-xs text-[#1A1A1A]/60 mt-0.5">
            {t('tools.ratioSubtitle')}
          </p>
        </div>

        {/* Botão para alternar modo */}
        <button
          onClick={handleToggleModo}
          className="stamped-border bg-[#F5F2ED] hover:bg-black/5 text-[#1A1A1A] px-3.5 py-2 font-sans text-xs uppercase tracking-wider font-medium flex items-center gap-2 transition-all cursor-pointer self-start sm:self-auto"
        >
          <ArrowRightLeft className="w-3.5 h-3.5 text-[#5A4033]" />
          {modoCalculo === 'cafeParaAgua' ? t('tools.modeCoffeeToWater') : t('tools.modeWaterToCoffee')}
        </button>
      </div>

      {/* Ratios Pré-definidos (Chips) */}
      <div className="space-y-2">
        <label className="block font-sans text-xs font-bold uppercase tracking-wider text-[#1A1A1A]">
          {t('tools.selectRecommendedRatio')}
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {PRESETS_RATIO.map((item) => {
            const isSelected = ratioNumerico === item.ratio;
            return (
              <button
                key={item.ratio}
                onClick={() => setRatioNumerico(item.ratio)}
                className={`stamped-border p-3 text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#1A1A1A] text-[#F5F2ED]'
                    : 'bg-white/50 text-[#1A1A1A] hover:bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-serif font-bold text-lg leading-none">{item.rotulo}</span>
                  {isSelected && <Sparkles className="w-3.5 h-3.5 text-amber-300" />}
                </div>
                <p className={`font-sans text-[10px] uppercase tracking-wider mt-1 font-semibold ${isSelected ? 'text-amber-200' : 'text-[#5A4033]'}`}>
                  {t(item.estiloKey)}
                </p>
                <p className={`font-sans text-[10px] mt-0.5 opacity-70 line-clamp-1 ${isSelected ? 'text-[#F5F2ED]/80' : 'text-[#1A1A1A]/60'}`}>
                  {t(item.descKey)}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Inputs Interativos */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-[#F5F2ED]/60 stamped-border p-5 items-center">
        {/* Campo 1: Café (g) */}
        <div className="space-y-1">
          <label className="font-sans text-xs font-bold uppercase tracking-wider text-[#1A1A1A] flex items-center gap-1.5">
            <Scale className="w-4 h-4 text-[#5A4033]" /> {t('tools.powderAmount')}
          </label>
          {modoCalculo === 'cafeParaAgua' ? (
            <input
              type="number"
              min="1"
              max="500"
              value={gramasCafeInput}
              onChange={(e) => setGramasCafeInput(Math.max(1, Number(e.target.value)))}
              className="w-full bg-white stamped-border px-3.5 py-2.5 font-serif text-2xl font-bold text-[#1A1A1A] focus:outline-none"
            />
          ) : (
            <div className="w-full bg-black/5 stamped-border px-3.5 py-2.5 font-serif text-2xl font-bold text-[#5A4033]">
              {cafeCalculadoG} g
            </div>
          )}
        </div>

        {/* Campo 2: Ratio Personalizado */}
        <div className="space-y-1">
          <label className="font-sans text-xs font-bold uppercase tracking-wider text-[#1A1A1A] flex items-center gap-1.5">
            <RefreshCw className="w-4 h-4 text-[#5A4033]" /> {t('tools.ratio')}
          </label>
          <div className="flex items-center gap-2">
            <span className="font-serif text-2xl font-bold text-[#1A1A1A]">1 :</span>
            <input
              type="number"
              min="1"
              max="30"
              step="0.5"
              value={ratioNumerico}
              onChange={(e) => setRatioNumerico(Math.max(1, Number(e.target.value)))}
              className="w-full bg-white stamped-border px-3.5 py-2.5 font-serif text-2xl font-bold text-[#1A1A1A] focus:outline-none"
            />
          </div>
        </div>

        {/* Campo 3: Água (ml) */}
        <div className="space-y-1">
          <label className="font-sans text-xs font-bold uppercase tracking-wider text-[#1A1A1A] flex items-center gap-1.5">
            <Droplet className="w-4 h-4 text-[#5A4033]" /> {t('tools.waterMl')}
          </label>
          {modoCalculo === 'aguaParaCafe' ? (
            <input
              type="number"
              min="10"
              max="2000"
              value={volumeAguaInput}
              onChange={(e) => setVolumeAguaInput(Math.max(10, Number(e.target.value)))}
              className="w-full bg-white stamped-border px-3.5 py-2.5 font-serif text-2xl font-bold text-[#1A1A1A] focus:outline-none"
            />
          ) : (
            <div className="w-full bg-black/5 stamped-border px-3.5 py-2.5 font-serif text-2xl font-bold text-[#5A4033]">
              {aguaCalculadaMl} ml
            </div>
          )}
        </div>
      </div>

      {/* Destaque do Resultado & Ação */}
      <div className="stamped-border bg-[#1A1A1A] text-[#F5F2ED] p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 border border-[#F5F2ED]/30 text-amber-300">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <p className="font-sans text-[10px] uppercase tracking-widest text-[#F5F2ED]/60 font-semibold">
              {t('tools.recipeResult')}
            </p>
            <p className="font-serif text-2xl font-semibold leading-tight text-[#F5F2ED]">
              <strong className="text-amber-300">{cafeFinal}g</strong> {t('tools.ofCoffeeFor')} <strong className="text-amber-300">{aguaFinal}ml</strong> {t('tools.ofWater')}
            </p>
            <p className="font-sans text-xs text-[#F5F2ED]/70 mt-0.5">
              {t('tools.calculatedRatioSummary', { ratio: ratioNumerico, yieldMl: Math.round(aguaFinal * 0.88) })}
            </p>
          </div>
        </div>

        {onApplyRatioToTimer && (
          <button
            onClick={() => onApplyRatioToTimer(cafeFinal, aguaFinal)}
            className="w-full sm:w-auto bg-[#F5F2ED] hover:bg-white text-[#1A1A1A] px-5 py-3 font-sans text-xs uppercase tracking-widest font-bold transition-all cursor-pointer shrink-0"
          >
            {t('tools.applyToTimer')}
          </button>
        )}
      </div>

      {/* Dica Técnica em caixa de estilo editorial */}
      <div className="stamped-border bg-[#F5F2ED]/40 p-4 flex items-start gap-3 text-xs text-[#1A1A1A]/80 font-sans">
        <Info className="w-4 h-4 text-[#5A4033] shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>{t('tools.baristaTipTitle')}</strong> {t('tools.baristaTipBody')}
        </p>
      </div>
    </div>
  );
};
