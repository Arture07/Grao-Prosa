import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import Supercluster from 'supercluster';
import { Navigation, Wifi, Zap, Compass, AlertCircle, RefreshCw, Layers } from 'lucide-react';
import { Cafeteria } from '../types/cafeteria';

interface RadarMapaInteractiveProps {
  userLat: number | null;
  userLng: number | null;
  cafeterias: Cafeteria[];
  selectedCafeteria: Cafeteria | null;
  onSelectCafeteria: (cafeteria: Cafeteria) => void;
  statusPermissao: string;
  onSolicitarPermissao: () => void;
}

export const RadarMapaInteractive: React.FC<RadarMapaInteractiveProps> = ({
  userLat,
  userLng,
  cafeterias,
  selectedCafeteria,
  onSelectCafeteria,
  statusPermissao,
  onSolicitarPermissao
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [key: string]: L.Marker }>({});
  const userMarkerRef = useRef<L.Marker | null>(null);
  const userCircleRef = useRef<L.Circle | null>(null);

  const superclusterRef = useRef<Supercluster<{ cafeteria: Cafeteria }>>(
    new Supercluster({
      radius: 60,
      maxZoom: 15,
      minPoints: 2
    })
  );

  const [mapLoaded, setMapLoaded] = useState<boolean>(false);
  const [mapError, setMapError] = useState<boolean>(false);
  const [clusterCountInfo, setClusterCountInfo] = useState<{ clusters: number; total: number }>({ clusters: 0, total: 0 });

  // Garante injeção do CSS do Leaflet no head se não existir
  useEffect(() => {
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }
  }, []);

  // Recarrega o Supercluster sempre que a lista de cafeterias mudar
  useEffect(() => {
    const points: Array<Supercluster.PointFeature<{ cafeteria: Cafeteria }>> = cafeterias.map(c => ({
      type: 'Feature',
      properties: { cafeteria: c },
      geometry: {
        type: 'Point',
        coordinates: [c.longitude, c.latitude]
      }
    }));

    superclusterRef.current.load(points);
  }, [cafeterias]);

  // Função para re-renderizar marcadores e clusters na viewport
  const renderMapElements = useCallback(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const bounds = map.getBounds();
    const bbox: [number, number, number, number] = [
      bounds.getWest(),
      bounds.getSouth(),
      bounds.getEast(),
      bounds.getNorth()
    ];
    const zoom = Math.floor(map.getZoom());

    const clusters = superclusterRef.current.getClusters(bbox, zoom);

    // Contadores para feedback de interface
    let activeClustersCount = 0;
    clusters.forEach(c => {
      if (c.properties.cluster) activeClustersCount++;
    });
    setClusterCountInfo({ clusters: activeClustersCount, total: cafeterias.length });

    // Limpa marcadores anteriores
    Object.values(markersRef.current).forEach((marker: L.Marker) => marker.remove());
    markersRef.current = {};

    clusters.forEach(feature => {
      const [lng, lat] = feature.geometry.coordinates;
      const isCluster = feature.properties.cluster;

      if (isCluster) {
        const clusterId = feature.id as number;
        const pointCount = feature.properties.point_count;

        // Ícone customizado de Cluster com estética premium de café (clusterColor="#3B2314")
        const clusterHtml = `
          <div class="group relative cursor-pointer transform transition-transform hover:scale-110 active:scale-95">
            <div class="w-10 h-10 rounded-full bg-[#3B2314] text-white border-2 border-amber-400 shadow-xl flex items-center justify-center font-bold text-xs font-serif">
              <span class="mr-0.5 text-[10px]">☕</span> ${pointCount}
            </div>
            <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-amber-400 rotate-45 shadow-sm"></div>
          </div>
        `;

        const icon = L.divIcon({
          className: `cluster-marker-${clusterId}`,
          html: clusterHtml,
          iconSize: [40, 40],
          iconAnchor: [20, 20]
        });

        const marker = L.marker([lat, lng], { icon })
          .addTo(map)
          .on('click', () => {
            const expansionZoom = Math.min(
              superclusterRef.current.getClusterExpansionZoom(clusterId),
              18
            );
            map.flyTo([lat, lng], expansionZoom, { animate: true, duration: 0.8 });
          });

        markersRef.current[`cluster-${clusterId}`] = marker;
      } else {
        // Marcador individual de Cafeteria
        const cafeteria = feature.properties.cafeteria;
        const isSelected = selectedCafeteria?.id === cafeteria.id;

        const markerHtml = `
          <div class="group relative cursor-pointer transform transition-transform hover:scale-110 ${isSelected ? 'scale-125 z-50' : ''}">
            <div class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full shadow-lg border-2 ${
              isSelected 
                ? 'bg-[#3B2314] text-white border-amber-400' 
                : 'bg-white text-[#1A1A1A] border-[#3B2314]'
            }">
              <span class="w-2 h-2 rounded-full ${cafeteria.temWifi ? 'bg-emerald-500' : 'bg-amber-500'}"></span>
              <span class="text-xs font-bold font-serif whitespace-nowrap">${cafeteria.nome}</span>
              <span class="text-[10px] font-extrabold px-1 rounded bg-amber-400 text-[#1A1A1A] flex items-center gap-0.5">
                ★ ${cafeteria.nota !== null && cafeteria.nota !== undefined ? cafeteria.nota.toFixed(1) : 'OSM'}
              </span>
            </div>
            <div class="w-2 h-2 bg-[#3B2314] rotate-45 mx-auto -mt-1 shadow-md"></div>
          </div>
        `;

        const icon = L.divIcon({
          className: `cafeteria-marker-${cafeteria.id}`,
          html: markerHtml,
          iconSize: [140, 40],
          iconAnchor: [70, 40]
        });

        const marker = L.marker([lat, lng], { icon })
          .addTo(map)
          .on('click', () => {
            onSelectCafeteria(cafeteria);
            map.panTo([lat, lng], { animate: true });
          });

        markersRef.current[cafeteria.id] = marker;
      }
    });
  }, [cafeterias, selectedCafeteria, onSelectCafeteria]);

  // Inicializa o Mapa Leaflet
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapInstanceRef.current) return;

    try {
      const defaultLat = userLat || -25.4284;
      const defaultLng = userLng || -49.2733;

      const map = L.map(mapContainerRef.current, {
        center: [defaultLat, defaultLng],
        zoom: 12, // Zoom adequado para raio de 15km
        zoomControl: false
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(map);

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      mapInstanceRef.current = map;

      // Event listeners para recálculo de clusters no zoom ou pan
      map.on('moveend', renderMapElements);
      map.on('zoomend', renderMapElements);

      setMapLoaded(true);

      setTimeout(() => {
        map.invalidateSize();
      }, 200);
    } catch (err) {
      console.error('Erro ao inicializar o mapa Leaflet:', err);
      setMapError(true);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Atualiza os marcadores de clusters quando as cafeterias ou a seleção mudar
  useEffect(() => {
    if (mapLoaded) {
      renderMapElements();
    }
  }, [mapLoaded, cafeterias, selectedCafeteria, renderMapElements]);

  // Atualiza a posição do marcador do Usuário
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || userLat === null || userLng === null) return;

    const userPos: [number, number] = [userLat, userLng];

    const userIcon = L.divIcon({
      className: 'custom-user-marker',
      html: `
        <div class="relative flex items-center justify-center w-6 h-6">
          <div class="absolute w-6 h-6 bg-blue-500/40 rounded-full animate-ping"></div>
          <div class="relative w-4 h-4 bg-blue-600 border-2 border-white rounded-full shadow-md"></div>
        </div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });

    if (userMarkerRef.current) {
      userMarkerRef.current.setLatLng(userPos);
    } else {
      userMarkerRef.current = L.marker(userPos, { icon: userIcon, zIndexOffset: 1000 })
        .addTo(map)
        .bindPopup('<b>Você está aqui</b>');
    }

    if (userCircleRef.current) {
      userCircleRef.current.setLatLng(userPos);
    } else {
      userCircleRef.current = L.circle(userPos, {
        radius: 800, // Raio visual no mapa indicando proximidade
        color: '#3b82f6',
        fillColor: '#3b82f6',
        fillOpacity: 0.08,
        weight: 1.5
      }).addTo(map);
    }
  }, [userLat, userLng, mapLoaded]);

  // Centralizar na posição do usuário
  const handleCentralizarUsuario = () => {
    const map = mapInstanceRef.current;
    if (map && userLat !== null && userLng !== null) {
      map.flyTo([userLat, userLng], 16, { duration: 1 });
    } else {
      onSolicitarPermissao();
    }
  };

  return (
    <div className="relative w-full h-full min-h-[450px] sm:min-h-[550px] bg-[#EFECE6] rounded-2xl overflow-hidden border border-[#1A1A1A]/10 shadow-inner flex flex-col">
      {/* Container do Mapa Leaflet */}
      <div 
        ref={mapContainerRef} 
        className="w-full h-full flex-1 z-0"
        style={{ width: '100%', height: '100%', minHeight: '450px' }}
      />

      {/* Fallback de Carregamento ou Erro */}
      {(!mapLoaded || mapError) && (
        <div className="absolute inset-0 z-10 bg-[#FAF7F2] flex flex-col items-center justify-center p-6 text-center">
          <RefreshCw className="w-8 h-8 text-[#5A4033] animate-spin mb-3" />
          <h3 className="text-base font-bold text-[#1A1A1A] font-serif">
            Carregando Radar de Cafeterias...
          </h3>
          <p className="text-xs text-[#1A1A1A]/60 max-w-sm mt-1">
            Sincronizando coordenadas GPS e camadas interativas de mapa.
          </p>
        </div>
      )}

      {/* Overlay de Controle de GPS e Permissões */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Status de Permissão */}
        <div className="pointer-events-auto bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-md border border-[#1A1A1A]/10 flex items-center gap-2 text-xs">
          {statusPermissao === 'granted' ? (
            <>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-semibold text-[#1A1A1A]">GPS Ativo (Foreground)</span>
            </>
          ) : statusPermissao === 'denied' ? (
            <>
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <span className="font-semibold text-amber-900">GPS Negado (Usando Padrão)</span>
              <button 
                onClick={onSolicitarPermissao}
                className="ml-1 text-[11px] underline text-[#3B2314] font-bold hover:text-black cursor-pointer"
              >
                Ativar GPS
              </button>
            </>
          ) : (
            <>
              <Compass className="w-4 h-4 text-[#5A4033]" />
              <span className="font-semibold text-[#1A1A1A]">Solicitar GPS</span>
              <button 
                onClick={onSolicitarPermissao}
                className="ml-1 px-2 py-0.5 bg-[#3B2314] text-white rounded-full font-bold text-[10px] cursor-pointer"
              >
                Permitir
              </button>
            </>
          )}
        </div>

        {/* Botão para Centralizar no Usuário */}
        <button
          onClick={handleCentralizarUsuario}
          className="pointer-events-auto flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white hover:bg-[#F9F6F0] text-[#1A1A1A] font-semibold text-xs shadow-md border border-[#1A1A1A]/10 transition-transform active:scale-95 cursor-pointer ml-auto"
          title="Centralizar Minha Posição"
        >
          <Navigation className="w-3.5 h-3.5 text-blue-600 fill-blue-600" />
          Minha Posição
        </button>
      </div>

      {/* Legenda inferior do Mapa */}
      <div className="absolute bottom-4 left-4 z-20 pointer-events-none hidden sm:block">
        <div className="pointer-events-auto bg-white/90 backdrop-blur-md px-3.5 py-2 rounded-xl shadow-md border border-[#1A1A1A]/10 text-xs flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-blue-600 border-2 border-white shadow-xs"></span>
            <span className="text-[#1A1A1A]/80 font-medium">Você</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-full bg-[#3B2314] text-white border border-amber-400 font-bold text-[9px] flex items-center justify-center">☕</span>
            <span className="text-[#1A1A1A]/90 font-bold">Cluster (Raio 15km)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#3B2314] border-2 border-amber-400 shadow-xs"></span>
            <span className="text-[#1A1A1A]/80 font-medium">Cafeteria Individual</span>
          </div>
          <div className="flex items-center gap-1 text-emerald-700 font-medium">
            <Wifi className="w-3 h-3" /> Wi-Fi
          </div>
          <div className="flex items-center gap-1 text-amber-700 font-medium">
            <Zap className="w-3 h-3" /> Tomadas
          </div>
        </div>
      </div>
    </div>
  );
};
