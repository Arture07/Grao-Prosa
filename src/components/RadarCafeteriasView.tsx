import React, { useState } from 'react';
import { 
  MapPin, 
  Wifi, 
  Zap, 
  Star, 
  Search, 
  Compass, 
  List, 
  Map as MapIcon, 
  Navigation, 
  Smartphone, 
  Filter, 
  AlertTriangle, 
  CheckCircle2, 
  Coffee,
  RefreshCw,
  Globe
} from 'lucide-react';
import { useUserLocation } from '../hooks/useUserLocation';
import { useCafeterias } from '../hooks/useCafeterias';
import { RadarMapaInteractive } from './RadarMapaInteractive';
import { CafeteriaCardModal } from './CafeteriaCardModal';
import { ReactNativeMapCodeViewer } from './ReactNativeMapCodeViewer';
import { Cafeteria } from '../types/cafeteria';

interface RadarCafeteriasViewProps {
  onRegistrarDegustacao?: (cafeteria: Cafeteria) => void;
}

export const RadarCafeteriasView: React.FC<RadarCafeteriasViewProps> = ({
  onRegistrarDegustacao
}) => {
  // Hook 1: Localização do Usuário (GPS / Permissões / Fallbacks)
  const {
    latitude: userLat,
    longitude: userLng,
    precisaoMetros,
    statusPermissao,
    carregando: carregandoGps,
    erroMensagem,
    solicitarPermissao,
    simularPermissaoNegada,
    simularLocalizacaoCuritiba,
    simularLocalizacaoSaoPaulo
  } = useUserLocation();

  // Hook 2: Gerenciamento e requisição à API do Google Places Nearby Search
  const {
    cafeterias,
    totalOriginal,
    isLoadingApi,
    errorApi,
    recarregar,
    selectedCafeteria,
    selecionarCafeteria,
    filtroWifi,
    setFiltroWifi,
    filtroTomadas,
    setFiltroTomadas,
    filtroNotaMin,
    setFiltroNotaMin,
    termoBusca,
    setTermoBusca
  } = useCafeterias(userLat, userLng);

  // Estados de UI da tela
  const [modoVisualizacao, setModoVisualizacao] = useState<'mapa' | 'lista'>('mapa');
  const [mostrarCodigoNative, setMostrarCodigoNative] = useState<boolean>(false);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner & Header */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#1A1A1A]/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#3B2314]/10 text-[#3B2314] text-xs font-bold uppercase tracking-wider">
              <Compass className="w-3.5 h-3.5 text-[#5A4033]" />
              Fase 3 • Google Places API Nearby Search
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-blue-800 bg-blue-50 px-2.5 py-0.5 rounded-full font-medium border border-blue-200">
              <Globe className="w-3 h-3 text-blue-600" />
              Raio: 2000m
            </span>
            {userLat !== null && userLng !== null && (
              <span className="inline-flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full font-medium border border-emerald-200">
                <CheckCircle2 className="w-3 h-3" />
                GPS Ativo ({userLat.toFixed(4)}, {userLng.toFixed(4)})
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1A1A1A] font-serif tracking-tight">
            Radar de Cafeterias (Google Places)
          </h1>
          <p className="text-sm text-[#1A1A1A]/70 mt-1 max-w-xl">
            Busca em tempo real de cafeterias próximas via Google Places API (keyword: coffee, raio 2000m).
          </p>
        </div>

        {/* Action Controls & Code Toggle */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={recarregar}
            disabled={isLoadingApi}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#F4EFE6] hover:bg-[#EAE2D5] text-[#3B2314] rounded-xl font-bold text-xs transition-colors cursor-pointer border border-[#1A1A1A]/10 disabled:opacity-50"
            title="Recarregar busca Google Places"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingApi ? 'animate-spin text-[#3B2314]' : ''}`} />
            {isLoadingApi ? 'Buscando...' : 'Atualizar'}
          </button>

          <button
            onClick={() => setMostrarCodigoNative(!mostrarCodigoNative)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-semibold text-xs transition-colors cursor-pointer border ${
              mostrarCodigoNative
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white text-[#1A1A1A] border-[#1A1A1A]/20 hover:bg-[#1A1A1A]/5'
            }`}
          >
            <Smartphone className="w-4 h-4 text-emerald-500" />
            {mostrarCodigoNative ? 'Ocultar Código RN' : 'Ver Código React Native'}
          </button>

          {/* View Switcher Toggle */}
          <div className="flex items-center bg-[#F4EFE6] p-1 rounded-xl border border-[#1A1A1A]/10">
            <button
              onClick={() => setModoVisualizacao('mapa')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                modoVisualizacao === 'mapa'
                  ? 'bg-white text-[#1A1A1A] shadow-xs'
                  : 'text-[#1A1A1A]/60 hover:text-[#1A1A1A]'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5 text-[#5A4033]" />
              Mapa
            </button>
            <button
              onClick={() => setModoVisualizacao('lista')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                modoVisualizacao === 'lista'
                  ? 'bg-white text-[#1A1A1A] shadow-xs'
                  : 'text-[#1A1A1A]/60 hover:text-[#1A1A1A]'
              }`}
            >
              <List className="w-3.5 h-3.5 text-[#5A4033]" />
              Lista ({cafeterias.length})
            </button>
          </div>
        </div>
      </div>

      {/* Code Viewer Panel if Toggled */}
      {mostrarCodigoNative && (
        <div className="animate-slide-down">
          <ReactNativeMapCodeViewer />
        </div>
      )}

      {/* Location Permission Status & Fallback Controls */}
      <div className="bg-[#FAF7F2] p-4 rounded-xl border border-[#1A1A1A]/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl ${
            statusPermissao === 'granted' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
          }`}>
            <Navigation className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-[#1A1A1A] flex items-center gap-2">
              {statusPermissao === 'granted' 
                ? `Localização Atual: (${userLat?.toFixed(4)}, ${userLng?.toFixed(4)})`
                : statusPermissao === 'denied'
                ? 'GPS Indisponível (Usando fallback de Curitiba -25.4284, -49.2733)'
                : 'Permissão de GPS pendente'}
            </div>
            <p className="text-[#1A1A1A]/70 text-[11px] mt-0.5">
              {erroMensagem || (statusPermissao === 'granted' ? `Sinal de GPS conectado (~${precisaoMetros || 10}m precisão).` : 'Usando coordenadas de fallback para busca no Google Places.')}
            </p>
          </div>
        </div>

        {/* GPS & Fallback Control Buttons */}
        <div className="flex flex-wrap items-center gap-2 self-stretch sm:self-auto">
          <button
            onClick={solicitarPermissao}
            disabled={carregandoGps}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-[#3B2314] hover:bg-[#2A180C] text-white rounded-lg font-bold text-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            <Compass className={`w-3.5 h-3.5 ${carregandoGps ? 'animate-spin' : ''}`} />
            {carregandoGps ? 'Obtendo...' : 'Obter GPS Real'}
          </button>
          <button
            onClick={simularLocalizacaoCuritiba}
            className="px-2.5 py-1.5 bg-white border border-[#1A1A1A]/20 hover:bg-[#1A1A1A]/5 text-[#1A1A1A] rounded-lg font-medium text-xs transition-colors cursor-pointer"
            title="Fallback Requisito 2: Centralizar em Curitiba (-25.4284, -49.2733)"
          >
            Curitiba (Fallback)
          </button>
          <button
            onClick={simularLocalizacaoSaoPaulo}
            className="px-2.5 py-1.5 bg-white border border-[#1A1A1A]/20 hover:bg-[#1A1A1A]/5 text-[#1A1A1A] rounded-lg font-medium text-xs transition-colors cursor-pointer"
            title="Coordenadas de São Paulo"
          >
            São Paulo
          </button>
          <button
            onClick={simularPermissaoNegada}
            className="px-2.5 py-1.5 bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-800 rounded-lg font-medium text-xs transition-colors cursor-pointer"
            title="Simular recusa de permissão"
          >
            Simular Recusa
          </button>
        </div>
      </div>

      {/* Requisito 3: Error Banner with friendly message */}
      {errorApi && (
        <div className="bg-amber-50 p-3.5 rounded-xl border border-amber-200 text-amber-900 text-xs flex items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Nota sobre a Google Places API:</strong> {errorApi} (Mapeando cafeterias regionais dinamicamente no raio de 2000m).
            </span>
          </div>
          <button
            onClick={recarregar}
            className="px-2.5 py-1 bg-amber-200 hover:bg-amber-300 rounded-lg font-bold text-[11px] shrink-0 cursor-pointer"
          >
            Tentar Novamente
          </button>
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl shadow-xs border border-[#1A1A1A]/10 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#1A1A1A]/40 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={termoBusca}
            onChange={(e) => setTermoBusca(e.target.value)}
            placeholder="Buscar por nome, bairro ou método (ex: V60, Lucca, Batel)..."
            className="w-full pl-9 pr-4 py-2 bg-[#F9F6F0] border border-[#1A1A1A]/10 rounded-xl text-xs text-[#1A1A1A] placeholder-[#1A1A1A]/40 focus:outline-none focus:ring-2 focus:ring-[#3B2314]"
          />
        </div>

        {/* Filter Badges */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setFiltroWifi(!filtroWifi)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              filtroWifi 
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs' 
                : 'bg-white text-[#1A1A1A]/80 border-[#1A1A1A]/15 hover:bg-[#F9F6F0]'
            }`}
          >
            <Wifi className="w-3.5 h-3.5" />
            Wi-Fi Grátis
          </button>

          <button
            onClick={() => setFiltroTomadas(!filtroTomadas)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              filtroTomadas 
                ? 'bg-amber-600 text-white border-amber-600 shadow-xs' 
                : 'bg-white text-[#1A1A1A]/80 border-[#1A1A1A]/15 hover:bg-[#F9F6F0]'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            Tomadas
          </button>

          <select
            value={filtroNotaMin}
            onChange={(e) => setFiltroNotaMin(Number(e.target.value))}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white border border-[#1A1A1A]/15 text-[#1A1A1A] cursor-pointer focus:outline-none"
          >
            <option value={0}>Todas as notas</option>
            <option value={4.5}>Nota ≥ 4.5 ★</option>
            <option value={4.8}>Nota ≥ 4.8 ★</option>
          </select>
        </div>
      </div>

      {/* Main Content Area (Map or List View) */}
      {modoVisualizacao === 'mapa' ? (
        <div className="relative">
          {/* Requisito 3: Loading Indicator overlay when fetching Google Places API */}
          {isLoadingApi && (
            <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px] z-30 flex flex-col items-center justify-center rounded-2xl gap-2 transition-all">
              <div className="p-3 bg-[#3B2314] text-white rounded-full shadow-lg animate-spin">
                <RefreshCw className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-[#3B2314] bg-white px-3 py-1 rounded-full shadow-sm border border-[#1A1A1A]/10">
                Consultando Google Places API (fetchNearbyCafes)...
              </span>
            </div>
          )}

          {/* Interactive Leaflet Map */}
          <RadarMapaInteractive
            userLat={userLat}
            userLng={userLng}
            cafeterias={cafeterias}
            selectedCafeteria={selectedCafeteria}
            onSelectCafeteria={selecionarCafeteria}
            statusPermissao={statusPermissao}
            onSolicitarPermissao={solicitarPermissao}
          />

          {/* Prompt card on top of map to select markers */}
          <div className="mt-3 p-3 bg-white rounded-xl border border-[#1A1A1A]/10 text-xs text-[#1A1A1A]/70 flex items-center justify-between">
            <span>
              💡 <strong>Dica:</strong> Marcadores do Google Places no raio de 15km com <strong>Marker Clustering</strong>. Dê zoom para desfazer os clusters ou clique no card para traçar rota.
            </span>
            <span className="font-bold text-[#3B2314]">{cafeterias.length} locais encontrados</span>
          </div>
        </div>
      ) : (
        /* List View Mode */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {cafeterias.map((cafeteria) => (
            <div
              key={cafeteria.id}
              onClick={() => selecionarCafeteria(cafeteria)}
              className="bg-white p-5 rounded-2xl border border-[#1A1A1A]/10 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-[#1A1A1A] font-serif group-hover:text-[#3B2314] transition-colors">
                        {cafeteria.nome}
                      </h3>
                      {cafeteria.origemGooglePlaces && (
                        <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-bold">
                          Google Places
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#1A1A1A]/60 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-[#5A4033]" />
                      {cafeteria.endereco} ({cafeteria.bairro})
                    </p>
                  </div>

                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold shrink-0">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    {cafeteria.nota.toFixed(1)}
                  </span>
                </div>

                <p className="text-xs text-[#1A1A1A]/75 line-clamp-2 mb-3">
                  {cafeteria.descricao}
                </p>

                {/* Specialties chips */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {cafeteria.especialidades.map((esp, i) => (
                    <span key={i} className="text-[11px] bg-[#F4EFE6] text-[#3B2314] px-2 py-0.5 rounded-md font-medium">
                      {esp}
                    </span>
                  ))}
                </div>
              </div>

              {/* Footer info & tags */}
              <div className="pt-3 border-t border-[#1A1A1A]/10 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold ${
                    cafeteria.temWifi ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                  }`}>
                    <Wifi className="w-3 h-3" />
                    {cafeteria.temWifi ? 'Wi-Fi' : 'Sem Wi-Fi'}
                  </span>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold ${
                    cafeteria.temTomadas ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-500'
                  }`}>
                    <Zap className="w-3 h-3" />
                    {cafeteria.temTomadas ? 'Tomadas' : 'Sem Tomadas'}
                  </span>
                </div>

                {cafeteria.distanciaKm !== undefined && (
                  <span className="text-xs font-bold text-[#5A4033] flex items-center gap-1">
                    <Navigation className="w-3 h-3" />
                    {cafeteria.distanciaKm} km
                  </span>
                )}
              </div>
            </div>
          ))}

          {cafeterias.length === 0 && (
            <div className="col-span-full bg-white p-8 rounded-2xl border border-[#1A1A1A]/10 text-center">
              <Coffee className="w-10 h-10 text-[#1A1A1A]/30 mx-auto mb-2" />
              <h3 className="text-base font-bold text-[#1A1A1A]">Nenhuma cafeteria encontrada</h3>
              <p className="text-xs text-[#1A1A1A]/60 mt-1">
                Tente ajustar os filtros de busca, Wi-Fi ou nota mínima.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Bottom Sheet Card Modal when a cafeteria marker is selected */}
      <CafeteriaCardModal
        cafeteria={selectedCafeteria}
        onClose={() => selecionarCafeteria(null)}
        onRegistrarDegustacao={onRegistrarDegustacao}
      />
    </div>
  );
};
