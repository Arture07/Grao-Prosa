import React, { useState } from 'react';
import { Coffee, PlusCircle, BookOpen, Sparkles, Timer, MapPin, LogOut, User as UserIcon, Smartphone } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { ProfileModal } from './ProfileModal';

interface HeaderProps {
  activeTab: 'despensa' | 'nova-degustacao' | 'diario' | 'cronometro' | 'radar';
  setActiveTab: (tab: 'despensa' | 'nova-degustacao' | 'diario' | 'cronometro' | 'radar') => void;
  onOpenNovoGrao: () => void;
}

export const GraoEProsaLogoIcon: React.FC<{ className?: string }> = ({ className = "w-10 h-10" }) => (
  <svg viewBox="0 0 110 90" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Grão de Café - Cinza Carvão Escuro (#1A1A1A) */}
    <g transform="rotate(-18 40 45)">
      {/* Contorno do Grão */}
      <path 
        d="M18 45 C16 18, 42 8, 56 20 C70 32, 73 64, 56 76 C38 88, 20 76, 18 45 Z" 
        stroke="#1A1A1A" 
        strokeWidth="5.5" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        fill="none" 
      />
      {/* S do Centro do Grão */}
      <path 
        d="M24 25 C42 32, 32 60, 50 69" 
        stroke="#1A1A1A" 
        strokeWidth="4.5" 
        strokeLinecap="round" 
        fill="none" 
      />
    </g>

    {/* Balão de Fala (Prosa) - Vermelho Profundo / Vinho (#8B1E2D) */}
    <g transform="translate(42, 22)">
      {/* Contorno do Balão com Rabicho */}
      <path 
        d="M8 18 C8 7, 22 2, 38 2 C54 2, 64 11, 64 22 C64 33, 52 41, 38 41 C34 41, 31 40, 27 39 L16 46 L18 35 C12 31, 8 25, 8 18 Z" 
        stroke="#8B1E2D" 
        strokeWidth="4.5" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        fill="none" 
      />
      {/* 3 Pontos da Prosa */}
      <circle cx="26" cy="20" r="2.8" fill="#8B1E2D" />
      <circle cx="36" cy="20" r="2.8" fill="#8B1E2D" />
      <circle cx="46" cy="20" r="2.8" fill="#8B1E2D" />
    </g>
  </svg>
);

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenNovoGrao
}) => {
  const { user, logout } = useAuth();
  const { isInstallable, installApp } = usePWAInstall();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  return (
    <header className="bg-[#F5F2ED] text-[#1A1A1A] border-b border-[#1A1A1A] pt-4 sm:pt-6 pb-2 sticky top-0 z-30 shadow-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        {/* Top Header Section */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1A1A1A]/15 pb-4">
          <div className="cursor-pointer" onClick={() => setActiveTab('despensa')}>
            <div className="flex items-center gap-3">
              <GraoEProsaLogoIcon className="w-10 h-10 sm:w-12 sm:h-12 shrink-0" />
              <div>
                <h1 className="font-serif text-2xl sm:text-4xl italic leading-none font-bold text-[#1A1A1A] tracking-tight">
                  Grão & Prosa
                </h1>
                <p className="font-sans text-[9px] uppercase tracking-widest text-[#5A4033] mt-1 font-semibold opacity-80">
                  Café Especial & Diário Sensorial
                </p>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons & User Profile */}
          <div className="flex items-center gap-2 flex-wrap">
            {isInstallable && (
              <button
                onClick={installApp}
                title="Adicionar na tela de início"
                className="px-2.5 py-1.5 bg-[#5A4033] hover:bg-[#3D2B22] text-[#FAF7F2] font-sans text-xs uppercase tracking-wider font-semibold transition-all flex items-center gap-1.5 cursor-pointer rounded-none shadow-xs"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Adicionar na tela de início</span>
                <span className="sm:hidden">Instalar</span>
              </button>
            )}

            {user && (
              <button
                onClick={() => setIsProfileModalOpen(true)}
                title="Opções da Conta"
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-full border bg-black/5 hover:bg-black/10 text-[#1A1A1A] border-[#1A1A1A]/10 transition-all cursor-pointer"
              >
                <UserIcon className="w-3.5 h-3.5 text-[#7B1E27]" />
                <span className="truncate max-w-[130px] font-medium text-[11px]">
                  {user.displayName || user.email?.split('@')[0] || 'Minha Conta'}
                </span>
              </button>
            )}

            <button
              onClick={onOpenNovoGrao}
              className="px-3 py-1.5 bg-[#1A1A1A] hover:bg-[#333] text-[#F5F2ED] font-sans text-xs uppercase tracking-widest font-medium rounded-none transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Novo Grão</span>
            </button>

            {user && (
              <button
                onClick={logout}
                title="Sair da Conta"
                className="px-2.5 py-1.5 bg-transparent hover:bg-red-50 text-[#7B1E27] font-sans text-xs uppercase tracking-wider border border-[#7B1E27]/30 hover:border-[#7B1E27] transition-all flex items-center gap-1 cursor-pointer rounded-md"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sair</span>
              </button>
            )}
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
        </nav>

        {/* Modal de perfil/conta do usuário */}
        <ProfileModal 
          isOpen={isProfileModalOpen} 
          onClose={() => setIsProfileModalOpen(false)} 
        />
      </div>
    </header>
  );
};
