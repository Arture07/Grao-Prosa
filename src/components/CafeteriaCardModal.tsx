import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Wifi, 
  Zap, 
  Star, 
  MapPin, 
  Clock, 
  Coffee, 
  X, 
  Navigation, 
  CheckCircle2, 
  Loader2,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  User,
  Car
} from 'lucide-react';
import { Cafeteria } from '../types/cafeteria';
import { handleOpenRoute as openRouteAction, UserLocation } from '../hooks/useCafeterias';

interface CafeteriaCardModalProps {
  cafeteria: Cafeteria | null;
  userLocation?: UserLocation | { lat: number; lng: number } | null;
  onClose: () => void;
  onRegistrarDegustacao?: (cafeteria: Cafeteria) => void;
}

export const CafeteriaCardModal: React.FC<CafeteriaCardModalProps> = ({
  cafeteria,
  userLocation,
  onClose,
  onRegistrarDegustacao
}) => {
  const [showSchedule, setShowSchedule] = useState(false);

  if (!cafeteria) return null;

  const handleOpenRoute = () => {
    openRouteAction(cafeteria, userLocation);
  };

  const hasRouteData = !!cafeteria.distanciaRotaTexto;
  const isConsultarNoLocal = cafeteria.horarioFuncionamento?.toLowerCase().includes('consulte no local') || cafeteria.horarioFuncionamento?.toLowerCase().includes('consultar no local');

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-xs transition-opacity">
        {/* Backdrop overlay listener */}
        <div className="absolute inset-0" onClick={onClose} />

        {/* Bottom Sheet Card container */}
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 280 }}
          drag="y"
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={{ top: 0.02, bottom: 0.8 }}
          onDragEnd={(_, info) => {
            // Se o usuário arrastou para baixo mais de 100px ou deu um swipe rápido (velocidade > 200)
            if (info.offset.y > 100 || info.velocity.y > 200) {
              onClose();
            }
          }}
          className="relative z-10 w-full max-w-xl bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl border border-[#1A1A1A]/10 overflow-hidden max-h-[90vh] flex flex-col touch-pan-y"
        >
          {/* Top Grab Bar com área expandida de toque (Hit Slop) e suporte a arrastar */}
          <div 
            className="w-full flex items-center justify-center pt-3.5 pb-2.5 px-6 cursor-grab active:cursor-grabbing select-none touch-none hover:bg-[#1A1A1A]/5 transition-colors group" 
            onClick={onClose}
            title="Arraste para baixo ou clique para fechar"
          >
            <div className="w-12 h-1.5 bg-[#1A1A1A]/20 group-hover:bg-[#1A1A1A]/40 rounded-full transition-colors" />
          </div>

          {/* Photo Header (If Enriched) */}
          {cafeteria.fotoUrl && (
            <div className="relative h-44 w-full bg-slate-100 overflow-hidden shrink-0">
              <img 
                src={cafeteria.fotoUrl} 
                alt={cafeteria.nome}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-3 left-4 right-4 text-white">
                <h3 className="text-lg font-bold font-serif leading-snug">{cafeteria.nome}</h3>
              </div>
            </div>
          )}

          {/* Header & Title */}
          <div className="p-5 pb-3 border-b border-[#1A1A1A]/10 flex items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                {/* Nota do Google */}
                {cafeteria.nota !== null && cafeteria.nota !== undefined && cafeteria.nota > 0 && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#3B2314] text-white">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    {cafeteria.nota.toFixed(1)}
                  </span>
                )}

                {cafeteria.nota !== null && cafeteria.nota !== undefined && cafeteria.nota > 0 && cafeteria.totalAvaliacoes !== undefined && cafeteria.totalAvaliacoes > 0 && (
                  <span className="text-xs font-medium text-[#1A1A1A]/60">
                    ({cafeteria.totalAvaliacoes} avaliações)
                  </span>
                )}

                {/* Selo de Horário: Aberto agora / Fechado agora */}
                {cafeteria.openNow !== undefined && (
                  <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                    cafeteria.openNow 
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300' 
                      : 'bg-rose-50 text-rose-800 border-rose-200'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${cafeteria.openNow ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                    {cafeteria.openNow ? 'Aberto agora' : 'Fechado agora'}
                  </span>
                )}

                {/* Distância Real de Rota (Distance Matrix) ou Haversine */}
                {hasRouteData ? (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200">
                    <Car className="w-3.5 h-3.5 text-amber-800" />
                    {cafeteria.distanciaRotaTexto} {cafeteria.duracaoRotaTexto ? `• ${cafeteria.duracaoRotaTexto}` : ''}
                  </span>
                ) : (
                  cafeteria.distanciaKm !== undefined && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#1A1A1A]/5 text-[#1A1A1A]">
                      <Navigation className="w-3 h-3 text-[#5A4033]" />
                      {cafeteria.distanciaKm < 1 
                        ? `${Math.round(cafeteria.distanciaKm * 1000)}m de você`
                        : `${cafeteria.distanciaKm} km`
                      }
                    </span>
                  )
                )}
              </div>

              {!cafeteria.fotoUrl && (
                <h2 className="text-xl sm:text-2xl font-bold text-[#1A1A1A] font-serif tracking-tight">
                  {cafeteria.nome}
                </h2>
              )}

              <p className="text-xs sm:text-sm text-[#1A1A1A]/70 flex items-center gap-1 mt-1">
                <MapPin className="w-3.5 h-3.5 text-[#5A4033] shrink-0" />
                {cafeteria.endereco && cafeteria.endereco !== 'Endereço não especificado no mapa'
                  ? cafeteria.endereco 
                  : (cafeteria.bairro || 'Localização no Mapa')}
              </p>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-[#1A1A1A]/40 hover:text-[#1A1A1A] hover:bg-[#1A1A1A]/5 rounded-full transition-colors cursor-pointer shrink-0"
              title="Fechar Detalhes"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Loading Indicator for On-Demand Hydration */}
          {cafeteria.isLoadingDetails && (
            <div className="p-4 bg-amber-50/80 border-b border-amber-200/60 flex items-center gap-3 text-amber-900 text-xs font-medium">
              <Loader2 className="w-4 h-4 animate-spin text-amber-700 shrink-0" />
              <span>Buscando fotos, rota e avaliações...</span>
            </div>
          )}

          {/* Scrollable Content */}
          <div className="p-5 space-y-5 overflow-y-auto">
            {/* 4. Ajuste de Cores das Tags (UI) - Verde Equilibrado (Emerald) */}
            {(cafeteria.temWifi || cafeteria.temTomadas) ? (
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A]/50 mb-2">
                  Infraestrutura Disponível
                </h3>

                <div className="flex flex-wrap gap-3">
                  {cafeteria.temWifi && (
                    <div className="p-3 rounded-xl border bg-emerald-50 border-emerald-200 text-emerald-800 flex items-center gap-3 flex-1 min-w-[160px]">
                      <div className="p-2 rounded-lg bg-emerald-100/80 text-emerald-700 shrink-0">
                        <Wifi className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold uppercase tracking-wide text-emerald-950">Wi-Fi Grátis</div>
                        <div className="text-xs flex items-center gap-1 font-medium text-emerald-700 mt-0.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          Rede Disponível
                        </div>
                      </div>
                    </div>
                  )}

                  {cafeteria.temTomadas && (
                    <div className="p-3 rounded-xl border bg-emerald-50 border-emerald-200 text-emerald-800 flex items-center gap-3 flex-1 min-w-[160px]">
                      <div className="p-2 rounded-lg bg-emerald-100/80 text-emerald-700 shrink-0">
                        <Zap className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold uppercase tracking-wide text-emerald-950">Tomadas</div>
                        <div className="text-xs flex items-center gap-1 font-medium text-emerald-700 mt-0.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          Acesso a Energia
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : null}

            {/* 2. Horário de Funcionamento (Com Accordion e substituição do fallback) */}
            <div className="bg-[#F9F6F0] border border-[#1A1A1A]/10 rounded-xl p-3.5 space-y-2">
              <div className="flex items-center justify-between text-xs text-[#1A1A1A]/80">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#5A4033] shrink-0" />
                  <span>
                    <strong>Horário:</strong>{' '}
                    {isConsultarNoLocal 
                      ? (cafeteria.openNow ? 'Aberto hoje (Consulte horários no local)' : 'Consulte horários no local')
                      : cafeteria.horarioFuncionamento}
                  </span>
                </div>

                {cafeteria.horariosSemana && cafeteria.horariosSemana.length > 0 && (
                  <button
                    onClick={() => setShowSchedule(!showSchedule)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#3B2314] hover:underline cursor-pointer px-2 py-1 rounded hover:bg-[#1A1A1A]/5 transition-colors"
                  >
                    <span>{showSchedule ? 'Ocultar' : 'Ver semana'}</span>
                    {showSchedule ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                )}
              </div>

              {/* Accordion Menu dos Horários da Semana */}
              {showSchedule && cafeteria.horariosSemana && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="pt-2 border-t border-[#1A1A1A]/10 space-y-1 text-xs text-[#1A1A1A]/70"
                >
                  <p className="font-semibold text-[#1A1A1A]/90 mb-1">Horário Semanal Completo:</p>
                  {cafeteria.horariosSemana.map((diaStr, idx) => (
                    <div key={idx} className="flex justify-between py-0.5 border-b border-[#1A1A1A]/5 last:border-0">
                      <span>{diaStr}</span>
                    </div>
                  ))}
                </motion.div>
              )}
            </div>

            {/* Descrição */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A]/50 mb-1.5">
                Sobre a Cafeteria
              </h3>
              <p className="text-sm text-[#1A1A1A]/80 leading-relaxed bg-[#F9F6F0] p-3.5 rounded-xl border border-[#1A1A1A]/5">
                {cafeteria.descricao}
              </p>
            </div>

            {/* Especialidades do Cardápio */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A]/50 mb-2">
                Destaques & Especialidades
              </h3>
              <div className="flex flex-wrap gap-2">
                {cafeteria.especialidades.map((esp, i) => (
                  <span 
                    key={i} 
                    className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-[#3B2314]/5 text-[#3B2314] border border-[#3B2314]/10"
                  >
                    <Coffee className="w-3.5 h-3.5 text-[#5A4033]" />
                    {esp}
                  </span>
                ))}
              </div>
            </div>

            {/* 1. Avaliações Reais (Google Reviews) - "Últimas Avaliações" */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A]/50 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-[#5A4033]" />
                  Últimas Avaliações
                </h3>
                {cafeteria.totalAvaliacoes !== undefined && (
                  <span className="text-xs font-medium text-[#1A1A1A]/60">
                    {cafeteria.totalAvaliacoes} avaliações no Google
                  </span>
                )}
              </div>

              {cafeteria.reviews && cafeteria.reviews.length > 0 ? (
                <div className="space-y-3">
                  {cafeteria.reviews.slice(0, 5).map((rev, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-white border border-[#1A1A1A]/10 shadow-xs space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          {rev.profile_photo_url ? (
                            <img 
                              src={rev.profile_photo_url} 
                              alt={rev.author_name} 
                              className="w-6 h-6 rounded-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-[#3B2314]/10 flex items-center justify-center text-[#3B2314] text-xs font-bold">
                              <User className="w-3.5 h-3.5" />
                            </div>
                          )}
                          <span className="text-xs font-bold text-[#1A1A1A]">{rev.author_name}</span>
                        </div>

                        <div className="flex items-center gap-1">
                          <div className="flex items-center gap-0.5 text-amber-500">
                            {Array.from({ length: 5 }).map((_, sIdx) => (
                              <Star 
                                key={sIdx} 
                                className={`w-3 h-3 ${sIdx < Math.round(rev.rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} 
                              />
                            ))}
                          </div>
                          {rev.relative_time_description && (
                            <span className="text-[10px] text-[#1A1A1A]/40 ml-1">
                              {rev.relative_time_description}
                            </span>
                          )}
                        </div>
                      </div>

                      <p className="text-xs text-[#1A1A1A]/80 leading-relaxed line-clamp-3">
                        "{rev.text}"
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#1A1A1A]/50 italic bg-[#F9F6F0] p-3 rounded-xl border border-[#1A1A1A]/5">
                  Nenhuma avaliação detalhada disponível no momento.
                </p>
              )}
            </div>
          </div>

          {/* Footer Action Buttons */}
          <div className="p-4 bg-[#F9F6F0] border-t border-[#1A1A1A]/10 flex flex-col sm:flex-row gap-2.5">
            <button
              onClick={handleOpenRoute}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#3B2314] hover:bg-[#2A180C] text-white font-medium text-sm transition-colors cursor-pointer shadow-xs"
            >
              <Navigation className="w-4 h-4" />
              Traçar Rota no GPS ({cafeteria.nome})
            </button>

            {onRegistrarDegustacao && (
              <button
                onClick={() => {
                  onClose();
                  onRegistrarDegustacao(cafeteria);
                }}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-[#3B2314]/30 hover:bg-[#3B2314]/5 text-[#3B2314] font-semibold text-sm transition-colors cursor-pointer"
              >
                <Coffee className="w-4 h-4" />
                Registrar Degustação
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
