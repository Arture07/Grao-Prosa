import React from 'react';
import { Coffee, PlusCircle, BookOpen, Layers, RefreshCw, Sparkles, Timer, MapPin } from 'lucide-react';

interface HeaderProps {
  activeTab: 'despensa' | 'nova-degustacao' | 'diario' | 'cronometro' | 'radar' | 'arquitetura';
  setActiveTab: (tab: 'despensa' | 'nova-degustacao' | 'diario' | 'cronometro' | 'radar' | 'arquitetura') => void;
  onOpenNovoGrao: () => void;
  onResetDatabase: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenNovoGrao,
  onResetDatabase
}) => {
  return (
    <header className="bg-[#F5F2ED] text-[#1A1A1A] border-b border-[#1A1A1A] pt-6 pb-2 sticky top-0 z-30 shadow-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        {/* Top Header Section */}
        <div className="flex items-end justify-between border-b border-[#1A1A1A]/15 pb-4">
          <div className="cursor-pointer" onClick={() => setActiveTab('despensa')}>
            <p className="font-sans text-[10px] tracking-[0.3em] uppercase opacity-60 mb-1">
              Coffee Architect / v1.0.4 • React Native
            </p>
            <h1 className="font-serif text-3xl sm:text-5xl italic leading-none font-semibold text-[#1A1A1A]">
              Curadoria de Grãos
            </h1>
          </div>

          <div className="flex flex-col items-end gap-2">
            <div className="hidden sm:block text-right">
              <p className="font-sans text-[10px] font-bold tracking-wider uppercase opacity-60">PERSISTÊNCIA LOCAL</p>
              <p className="font-serif text-base italic text-[#5A4033]">SQLite / AsyncStorage Active</p>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenNovoGrao}
                className="px-3 py-1.5 bg-[#1A1A1A] hover:bg-[#333] text-[#F5F2ED] font-sans text-xs uppercase tracking-widest font-medium rounded-none transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                Novo Grão
              </button>
              
              <button
                onClick={onResetDatabase}
                title="Resetar Dados para Valores de Semente (Seed)"
                className="px-2.5 py-1.5 bg-transparent hover:bg-black/5 text-[#1A1A1A] font-sans text-xs uppercase tracking-wider stamped-border transition-all flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Editorial Navigation Tabs */}
        <nav className="flex space-x-1 overflow-x-auto pb-1 scrollbar-none font-sans text-xs uppercase tracking-wider">
          <button
            onClick={() => setActiveTab('despensa')}
            className={`flex items-center gap-1.5 px-3.5 py-2 transition-all whitespace-nowrap cursor-pointer border-b-2 ${
              activeTab === 'despensa'
                ? 'border-[#1A1A1A] font-bold text-[#1A1A1A]'
                : 'border-transparent text-[#1A1A1A]/60 hover:text-[#1A1A1A]'
            }`}
          >
            <Coffee className="w-3.5 h-3.5" />
            01. Minha Despensa
          </button>

          <button
            onClick={() => setActiveTab('nova-degustacao')}
            className={`flex items-center gap-1.5 px-3.5 py-2 transition-all whitespace-nowrap cursor-pointer border-b-2 ${
              activeTab === 'nova-degustacao'
                ? 'border-[#1A1A1A] font-bold text-[#1A1A1A]'
                : 'border-transparent text-[#1A1A1A]/60 hover:text-[#1A1A1A]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#5A4033]" />
            02. Nova Degustação
          </button>

          <button
            onClick={() => setActiveTab('diario')}
            className={`flex items-center gap-1.5 px-3.5 py-2 transition-all whitespace-nowrap cursor-pointer border-b-2 ${
              activeTab === 'diario'
                ? 'border-[#1A1A1A] font-bold text-[#1A1A1A]'
                : 'border-transparent text-[#1A1A1A]/60 hover:text-[#1A1A1A]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            03. Diário Sensorial
          </button>

          <button
            onClick={() => setActiveTab('cronometro')}
            className={`flex items-center gap-1.5 px-3.5 py-2 transition-all whitespace-nowrap cursor-pointer border-b-2 ${
              activeTab === 'cronometro'
                ? 'border-[#1A1A1A] font-bold text-[#1A1A1A]'
                : 'border-transparent text-[#1A1A1A]/60 hover:text-[#1A1A1A]'
            }`}
          >
            <Timer className="w-3.5 h-3.5 text-[#5A4033]" />
            04. Cronômetro & Ratio
          </button>

          <button
            onClick={() => setActiveTab('radar')}
            className={`flex items-center gap-1.5 px-3.5 py-2 transition-all whitespace-nowrap cursor-pointer border-b-2 ${
              activeTab === 'radar'
                ? 'border-[#1A1A1A] font-bold text-[#1A1A1A]'
                : 'border-transparent text-[#1A1A1A]/60 hover:text-[#1A1A1A]'
            }`}
          >
            <MapPin className="w-3.5 h-3.5 text-emerald-700" />
            05. Radar GPS
          </button>

          <button
            onClick={() => setActiveTab('arquitetura')}
            className={`flex items-center gap-1.5 px-3.5 py-2 transition-all whitespace-nowrap ml-auto cursor-pointer border-b-2 ${
              activeTab === 'arquitetura'
                ? 'border-[#5A4033] font-bold text-[#5A4033]'
                : 'border-transparent text-[#1A1A1A]/60 hover:text-[#1A1A1A]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Arquitetura RN
          </button>
        </nav>
      </div>
    </header>
  );
};
