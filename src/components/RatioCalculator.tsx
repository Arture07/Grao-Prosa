import React, { useState } from 'react';
import { Scale, Droplet, Sparkles, RefreshCw, Info, ArrowRightLeft } from 'lucide-react';

interface RatioCalculatorProps {
  onApplyRatioToTimer?: (coffeeGrams: number, waterMl: number) => void;
}

export const RatioCalculator: React.FC<RatioCalculatorProps> = ({ onApplyRatioToTimer }) => {
  const [modoCalculo, setModoCalculo] = useState<'cafeParaAgua' | 'aguaParaCafe'>('cafeParaAgua');
  const [gramasCafeInput, setGramasCafeInput] = useState<number>(18);
  const [volumeAguaInput, setVolumeAguaInput] = useState<number>(270);
  const [ratioNumerico, setRatioNumerico] = useState<number>(15);

  // Perfis de Ratio Pré-definidos
  const PRESETS_RATIO = [
    { ratio: 10, rotulo: '1:10', estilo: 'Concentrado', desc: 'Sabor denso e marcante' },
    { ratio: 12, rotulo: '1:12', estilo: 'Encorpado', desc: 'Prensa Francesa ou Moka' },
    { ratio: 15, rotulo: '1:15', estilo: 'Proporção Áurea', desc: 'Padrão clássico V60 & Aeropress' },
    { ratio: 16, rotulo: '1:16', estilo: 'Suave & Floral', desc: 'Destaca acidez e aroma em coados' },
    { ratio: 18, rotulo: '1:18', estilo: 'Delicado', desc: 'Infusões de corpo leve' },
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
            Calculadora de Proporções (Brew Ratio)
          </span>
          <h3 className="font-serif text-2xl sm:text-3xl font-semibold text-[#1A1A1A]">
            Proporção Áurea do Café
          </h3>
          <p className="font-sans text-xs text-[#1A1A1A]/60 mt-0.5">
            Ajuste fino da relação entre pó de café (g) e volume de água (ml).
          </p>
        </div>

        {/* Botão para alternar modo */}
        <button
          onClick={handleToggleModo}
          className="stamped-border bg-[#F5F2ED] hover:bg-black/5 text-[#1A1A1A] px-3.5 py-2 font-sans text-xs uppercase tracking-wider font-medium flex items-center gap-2 transition-all cursor-pointer self-start sm:self-auto"
        >
          <ArrowRightLeft className="w-3.5 h-3.5 text-[#5A4033]" />
          {modoCalculo === 'cafeParaAgua' ? 'Modo: Café → Água' : 'Modo: Água → Café'}
        </button>
      </div>

      {/* Ratios Pré-definidos (Chips) */}
      <div className="space-y-2">
        <label className="block font-sans text-xs font-bold uppercase tracking-wider text-[#1A1A1A]">
          Selecione a Proporção Recomendada (Ratio 1:X)
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
                  {item.estilo}
                </p>
                <p className={`font-sans text-[10px] mt-0.5 opacity-70 line-clamp-1 ${isSelected ? 'text-[#F5F2ED]/80' : 'text-[#1A1A1A]/60'}`}>
                  {item.desc}
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
            <Scale className="w-4 h-4 text-[#5A4033]" /> Pó de Café (Gramas)
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
            <RefreshCw className="w-4 h-4 text-[#5A4033]" /> Ratio 1 :
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
            <Droplet className="w-4 h-4 text-[#5A4033]" /> Água Total (ml)
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
              Resultado da Receita
            </p>
            <p className="font-serif text-2xl font-semibold leading-tight text-[#F5F2ED]">
              <strong className="text-amber-300">{cafeFinal}g</strong> de café para <strong className="text-amber-300">{aguaFinal}ml</strong> de água
            </p>
            <p className="font-sans text-xs text-[#F5F2ED]/70 mt-0.5">
              Proporção calculada: 1:{ratioNumerico} • Rendimento estimado: ~{Math.round(aguaFinal * 0.88)}ml na xícara.
            </p>
          </div>
        </div>

        {onApplyRatioToTimer && (
          <button
            onClick={() => onApplyRatioToTimer(cafeFinal, aguaFinal)}
            className="w-full sm:w-auto bg-[#F5F2ED] hover:bg-white text-[#1A1A1A] px-5 py-3 font-sans text-xs uppercase tracking-widest font-bold transition-all cursor-pointer shrink-0"
          >
            Aplicar no Cronômetro
          </button>
        )}
      </div>

      {/* Dica Técnica em caixa de estilo editorial */}
      <div className="stamped-border bg-[#F5F2ED]/40 p-4 flex items-start gap-3 text-xs text-[#1A1A1A]/80 font-sans">
        <Info className="w-4 h-4 text-[#5A4033] shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Dica do Barista:</strong> Proporções menores (1:12 - 1:14) resultam em bebidas com corpo mais pesado e acentuada doçura de caramelo. Proporções maiores (1:16 - 1:18) favorecem notas delicadas, acidez málica e florais.
        </p>
      </div>
    </div>
  );
};
