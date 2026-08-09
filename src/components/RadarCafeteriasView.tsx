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
  AlertTriangle, 
  Coffee,
  RefreshCw
} from 'lucide-react';
import { useUserLocation } from '../hooks/useUserLocation';
import { useCafeterias } from '../hooks/useCafeterias';
import { RadarMapaInteractive } from './RadarMapaInteractive';
import { CafeteriaCardModal } from './CafeteriaCardModal';
import { Cafeteria } from '../types/cafeteria';

interface RadarCafeteriasViewProps {
  onRegistrarDegustacao?: (cafeteria: Cafeteria) => void;
}

export const RadarCafeteriasView: React.FC<RadarCafeteriasViewProps> = ({
  onRegistrarDegustacao
}) => {
  // Hook 1: Localização do Usuário (GPS / Permissões)
  const {
    latitude: userLat,
    longitude: userLng,
    statusPermissao,
    carregando: carregandoGps,
    erroMensagem,
    solicitarPermissao
  } = useUserLocation();

  // Hook 2: Gerenciamento e requisição de Cafeterias
  const {
    cafeterias,
    isLoadingApi,
    errorApi,
    recarregar,
    selectedCafeteria,
    selecionarCafeteria,
    filtroWifi,
    setFiltroWifi,
    filtroTomadas,
    setFiltroTomadas,
    filtroProdutividade,
    setFiltroProdutividade,
    filtroNotaMin,
    setFiltroNotaMin,
    termoBusca,
    setTermoBusca
  } = useCafeterias(userLat, userLng);

  // Estados de UI da tela
  const [modoVisualizacao, setModoVisualizacao] = useState<'mapa' | 'lista'>('mapa');

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header Limpo */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#1A1A1A]/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1A1A1A] font-serif tracking-tight">
            Radar de Cafeterias
          </h1>
        </div>

        {/* Controles de Ação e Alternância de Visão */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={recarregar}
            disabled={isLoadingApi}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#F4EFE6] hover:bg-[#EAE2D5] text-[#3B2314] rounded-xl font-bold text-xs transition-colors cursor-pointer border border-[#1A1A1A]/10 disabled:opacity-50"
            title="Recarregar busca de cafeterias"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingApi ? 'animate-spin text-[#3B2314]' : ''}`} />
            {isLoadingApi ? 'Buscando...' : 'Atualizar'}
          </button>

          {/* Alternador de Modo (Mapa / Lista) */}
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

      {/* Painel de GPS (Invisível se a localização já foi obtida) */}
      {statusPermissao !== 'granted' && (
        <div className="bg-[#FAF7F2] p-4 rounded-xl border border-[#1A1A1A]/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-100 text-amber-800">
              <Navigation className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-[#1A1A1A] text-sm">
                Precisamos da sua localização para encontrar os melhores cafés
              </div>
              <p className="text-[#1A1A1A]/70 text-[11px] mt-0.5">
                {erroMensagem || 'Ative a localização do seu dispositivo para ver as cafeterias mais próximas no mapa.'}
              </p>
            </div>
          </div>

          <button
            onClick={solicitarPermissao}
            disabled={carregandoGps}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-[#3B2314] hover:bg-[#2A180C] text-white rounded-xl font-bold text-xs transition-colors cursor-pointer disabled:opacity-50 shrink-0"
          >
            <Compass className={`w-4 h-4 ${carregandoGps ? 'animate-spin' : ''}`} />
            {carregandoGps ? 'Obtendo...' : 'Ativar Localização'}
          </button>
        </div>
      )}

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
            onClick={() => setFiltroProdutividade(!filtroProdutividade)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
              filtroProdutividade 
                ? 'bg-[#7B1E27] text-white border-[#7B1E27] shadow-xs ring-2 ring-[#7B1E27]/30' 
                : 'bg-[#7B1E27]/5 text-[#7B1E27] border-[#7B1E27]/20 hover:bg-[#7B1E27]/10'
            }`}
          >
            <Zap className="w-3.5 h-3.5 fill-[#7B1E27]" />
            Focar / Trabalhar
          </button>

          <button
            onClick={() => setFiltroWifi(!filtroWifi)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              filtroWifi 
                ? 'bg-[#3B2314] text-white border-[#3B2314] shadow-xs' 
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
                ? 'bg-[#3B2314] text-white border-[#3B2314] shadow-xs' 
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
          {/* Bloqueio Rígido: Se a localização do usuário for null, exibe tela de carregamento/solicitação de GPS */}
          {userLat === null || userLng === null ? (
            carregandoGps || statusPermissao === 'requesting' ? (
              <div className="w-full h-[450px] sm:h-[550px] bg-[#FAF7F2] rounded-2xl border border-[#1A1A1A]/10 flex flex-col items-center justify-center p-6 text-center shadow-inner animate-fade-in">
                <div className="p-4 bg-[#3B2314] text-amber-300 rounded-full shadow-lg mb-4 animate-pulse">
                  <Compass className="w-8 h-8 animate-spin" />
                </div>
                <h3 className="text-lg font-bold text-[#1A1A1A] font-serif">
                  Obtendo sua localização real pelo satélite...
                </h3>
                <p className="text-xs text-[#1A1A1A]/70 max-w-md mt-2 leading-relaxed">
                  Conectando ao sinal de GPS do seu dispositivo para localizar as cafeterias mais próximas e calcular distâncias e rotas reais.
                </p>
              </div>
            ) : (
              <div className="w-full h-[450px] sm:h-[550px] bg-[#FAF7F2] rounded-2xl border border-[#1A1A1A]/10 flex flex-col items-center justify-center p-6 text-center shadow-inner animate-fade-in">
                <div className="p-4 bg-amber-100 text-amber-800 rounded-full mb-4 shadow-sm">
                  <Navigation className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-[#1A1A1A] font-serif">
                  Permissão de GPS Necessária
                </h3>
                <p className="text-xs text-[#1A1A1A]/70 max-w-md mt-2 leading-relaxed">
                  {erroMensagem || 'Por favor, autorize o acesso à sua localização no seu navegador ou celular para visualizar o mapa e calcular as rotas exatas.'}
                </p>
                <button
                  onClick={solicitarPermissao}
                  disabled={carregandoGps}
                  className="mt-5 inline-flex items-center gap-2 px-6 py-3 bg-[#3B2314] hover:bg-[#2A180C] text-white rounded-xl font-bold text-xs transition-all cursor-pointer shadow-md active:scale-95 disabled:opacity-50"
                >
                  <Compass className={`w-4 h-4 ${carregandoGps ? 'animate-spin' : ''}`} />
                  {carregandoGps ? 'Obtendo Sinal...' : 'Ativar Localização / Permissão de GPS'}
                </button>
              </div>
            )
          ) : (
            <>
              {/* Loading Indicator overlay para requisições do Places/OSM */}
              {isLoadingApi && (
                <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px] z-30 flex flex-col items-center justify-center rounded-2xl gap-2 transition-all">
                  <div className="p-3 bg-[#3B2314] text-white rounded-full shadow-lg animate-spin">
                    <RefreshCw className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold text-[#3B2314] bg-white px-3 py-1 rounded-full shadow-sm border border-[#1A1A1A]/10">
                    Buscando cafeterias mais próximas...
                  </span>
                </div>
              )}

              {/* Interactive Leaflet Map - Renderizado APENAS quando userLat e userLng forem válidos */}
              <RadarMapaInteractive
                userLat={userLat}
                userLng={userLng}
                cafeterias={cafeterias}
                selectedCafeteria={selectedCafeteria}
                onSelectCafeteria={selecionarCafeteria}
                statusPermissao={statusPermissao}
                onSolicitarPermissao={solicitarPermissao}
                filtroProdutividade={filtroProdutividade}
                onToggleProdutividade={() => setFiltroProdutividade(!filtroProdutividade)}
              />

              {/* Prompt card on top of map to select markers */}
              <div className="mt-3 p-3 bg-white rounded-xl border border-[#1A1A1A]/10 text-xs text-[#1A1A1A]/70 flex items-center justify-between">
                <span>
                  💡 <strong>Dica:</strong> Clique em um marcador para abrir detalhes e traçar rota no seu GPS.
                </span>
                <span className="font-bold text-[#3B2314]">{cafeterias.length} locais encontrados</span>
              </div>
            </>
          )}
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
                    <h3 className="text-lg font-bold text-[#1A1A1A] font-serif group-hover:text-[#3B2314] transition-colors">
                      {cafeteria.nome}
                    </h3>
                    <p className="text-xs text-[#1A1A1A]/60 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-[#5A4033]" />
                      {cafeteria.endereco && cafeteria.endereco !== 'Endereço não especificado no mapa'
                        ? cafeteria.endereco 
                        : (cafeteria.bairro || 'Localização no mapa')}
                    </p>
                  </div>

                  {/* Smart Omission: Só renderiza nota se for válida */}
                  {cafeteria.nota !== null && cafeteria.nota !== undefined && cafeteria.nota > 0 && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold shrink-0">
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      {cafeteria.nota.toFixed(1)}
                    </span>
                  )}
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

              {/* Footer info & tags (Apenas tags positivas, sem blocos cinzas de 'Sem Wi-Fi/Tomada') */}
              <div className="pt-3 border-t border-[#1A1A1A]/10 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  {cafeteria.temWifi && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-[#7B1E27]/10 text-[#7B1E27]">
                      <Wifi className="w-3 h-3" />
                      Wi-Fi
                    </span>
                  )}
                  {cafeteria.temTomadas && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-[#3B2314]/10 text-[#3B2314]">
                      <Zap className="w-3 h-3" />
                      Tomadas
                    </span>
                  )}
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
        userLocation={userLat !== null && userLng !== null ? { lat: userLat, lng: userLng } : null}
        onClose={() => selecionarCafeteria(null)}
        onRegistrarDegustacao={onRegistrarDegustacao}
      />
    </div>
  );
};
