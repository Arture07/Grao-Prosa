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
  Share2
} from 'lucide-react';
import { Cafeteria } from '../types/cafeteria';

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

  /**
   * REQUISITO 2: Correção Absoluta do Deep Linking de Rotas
   * Utiliza EXCLUSIVAMENTE a Latitude e Longitude do marcador selecionado. NENHUM endereço string no destino.
   */
  const handleOpenRoute = () => {
    if (!cafeteria) return;

    const lat = cafeteria.latitude;
    const lng = cafeteria.longitude;

    const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent || '' : '';
    const isAndroid = /android/i.test(userAgent);
    const isIOS = /iPad|iPhone|iPod/.test(userAgent);

    let url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`; // Universal Fallback

    if (isAndroid) {
      url = `google.navigation:q=${lat},${lng}`;
    } else if (isIOS) {
      url = `maps://app?daddr=${lat},${lng}`;
    }

    // Tenta abrir deep link ou fallback universal no navegador
    window.open(url, '_blank');
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

          {/* Header & Title */}
          <div className="p-5 pb-3 border-b border-[#1A1A1A]/10 flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#3B2314] text-white">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  {cafeteria.nota.toFixed(1)} / 5.0
                </span>

                {cafeteria.distanciaKm !== undefined && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#1A1A1A]/5 text-[#1A1A1A]">
                    <Navigation className="w-3 h-3 text-[#5A4033]" />
                    {cafeteria.distanciaKm < 1 
                      ? `${Math.round(cafeteria.distanciaKm * 1000)}m de você`
                      : `${cafeteria.distanciaKm} km de você`
                    }
                  </span>
                )}
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#1A1A1A] font-serif tracking-tight">
                {cafeteria.nome}
              </h2>
              <p className="text-xs sm:text-sm text-[#1A1A1A]/70 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-[#5A4033] shrink-0" />
                {cafeteria.endereco}
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

          {/* Scrollable Content */}
          <div className="p-5 space-y-5 overflow-y-auto">
            {/* Attributes Grid (Wi-Fi e Tomadas para Produtividade) */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A]/50 mb-2">
                Infraestrutura & Produtividade
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {/* Wi-Fi Status */}
                <div className={`p-3 rounded-xl border flex items-center gap-3 transition-colors ${
                  cafeteria.temWifi 
                    ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900' 
                    : 'bg-rose-50/60 border-rose-200 text-rose-900'
                }`}>
                  <div className={`p-2 rounded-lg ${
                    cafeteria.temWifi ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                  }`}>
                    <Wifi className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wide">Wi-Fi Grátis</div>
                    <div className="text-xs flex items-center gap-1 font-medium mt-0.5">
                      {cafeteria.temWifi ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          Disponível para clientes
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3.5 h-3.5 text-rose-500" />
                          Sem rede Wi-Fi
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Tomadas Status */}
                <div className={`p-3 rounded-xl border flex items-center gap-3 transition-colors ${
                  cafeteria.temTomadas 
                    ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900' 
                    : 'bg-amber-50/60 border-amber-200 text-amber-900'
                }`}>
                  <div className={`p-2 rounded-lg ${
                    cafeteria.temTomadas ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wide">Tomadas para Notebook</div>
                    <div className="text-xs flex items-center gap-1 font-medium mt-0.5">
                      {cafeteria.temTomadas ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          Várias tomadas nas mesas
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3.5 h-3.5 text-amber-600" />
                          Tomadas limitadas
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
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
              Traçar Rota no GPS
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
                Registrar Degustação Aqui
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
