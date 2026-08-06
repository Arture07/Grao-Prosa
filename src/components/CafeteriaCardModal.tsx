import React from 'react';
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
  XCircle,
  Loader2,
  Info,
  Sparkles
} from 'lucide-react';
import { Cafeteria } from '../types/cafeteria';
import { handleOpenRoute as openRouteAction } from '../hooks/useCafeterias';

interface CafeteriaCardModalProps {
  cafeteria: Cafeteria | null;
  onClose: () => void;
  onRegistrarDegustacao?: (cafeteria: Cafeteria) => void;
}

export const CafeteriaCardModal: React.FC<CafeteriaCardModalProps> = ({
  cafeteria,
  onClose,
  onRegistrarDegustacao
}) => {
  if (!cafeteria) return null;

  const handleOpenRoute = () => {
    openRouteAction(cafeteria);
  };

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
          className="relative z-10 w-full max-w-xl bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl border border-[#1A1A1A]/10 overflow-hidden max-h-[90vh] flex flex-col"
        >
          {/* Top Grab Bar for Mobile Sheet Feeling */}
          <div className="w-full flex justify-center pt-3 pb-1 cursor-grab" onClick={onClose}>
            <div className="w-12 h-1.5 bg-[#1A1A1A]/15 rounded-full" />
          </div>

          {/* Photo Header (If Enriched) */}
          {cafeteria.fotoUrl && (
            <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
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
              <div className="flex flex-wrap items-center gap-2 mb-1">
                {/* Omissão Inteligente: Só exibe nota se existir valor real */}
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

                {cafeteria.distanciaKm !== undefined && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#1A1A1A]/5 text-[#1A1A1A]">
                    <Navigation className="w-3 h-3 text-[#5A4033]" />
                    {cafeteria.distanciaKm < 1 
                      ? `${Math.round(cafeteria.distanciaKm * 1000)}m de você`
                      : `${cafeteria.distanciaKm} km`
                    }
                  </span>
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
              className="p-2 text-[#1A1A1A]/40 hover:text-[#1A1A1A] hover:bg-[#1A1A1A]/5 rounded-full transition-colors cursor-pointer"
              title="Fechar Detalhes"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Loading Indicator for On-Demand Hydration */}
          {cafeteria.isLoadingDetails && (
            <div className="p-4 bg-amber-50/80 border-b border-amber-200/60 flex items-center gap-3 text-amber-900 text-xs font-medium">
              <Loader2 className="w-4 h-4 animate-spin text-amber-700 shrink-0" />
              <span>Buscando fotos e avaliações...</span>
            </div>
          )}

          {/* Scrollable Content */}
          <div className="p-5 space-y-5 overflow-y-auto">
            {/* Attributes Grid (Apenas exibe tags que forem TRUE, sem blocos negativos) */}
            {(cafeteria.temWifi || cafeteria.temTomadas) ? (
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A]/50 mb-2">
                  Infraestrutura Disponível
                </h3>

                <div className="flex flex-wrap gap-3">
                  {cafeteria.temWifi && (
                    <div className="p-3 rounded-xl border bg-[#7B1E27]/5 border-[#7B1E27]/20 text-[#7B1E27] flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-[#7B1E27]/10 text-[#7B1E27]">
                        <Wifi className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold uppercase tracking-wide">Wi-Fi Grátis</div>
                        <div className="text-xs flex items-center gap-1 font-medium mt-0.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#7B1E27]" />
                          Rede Disponível
                        </div>
                      </div>
                    </div>
                  )}

                  {cafeteria.temTomadas && (
                    <div className="p-3 rounded-xl border bg-[#3B2314]/5 border-[#3B2314]/20 text-[#3B2314] flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-[#3B2314]/10 text-[#3B2314]">
                        <Zap className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold uppercase tracking-wide">Tomadas</div>
                        <div className="text-xs flex items-center gap-1 font-medium mt-0.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#3B2314]" />
                          Acesso a Energia
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : null}

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

            {/* Horário de Funcionamento */}
            <div className="flex items-center gap-2.5 text-xs text-[#1A1A1A]/70 bg-[#1A1A1A]/5 p-3 rounded-xl">
              <Clock className="w-4 h-4 text-[#5A4033] shrink-0" />
              <span><strong>Horário:</strong> {cafeteria.horarioFuncionamento}</span>
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
