import { useState, useMemo, useEffect, useCallback } from 'react';
import { Cafeteria } from '../types/cafeteria';
import { calcularDistanciaHaversineKm } from '../data/mockCafeterias';

/**
 * Auxiliar para construir um endereço amigável a partir das tags do OpenStreetMap (OSM)
 */
function formatOsmAddress(tags: Record<string, string> | undefined): string {
  if (!tags) return 'Endereço não especificado no mapa';

  const parts: string[] = [];

  if (tags['addr:street']) {
    let street = tags['addr:street'];
    if (tags['addr:housenumber']) {
      street += `, ${tags['addr:housenumber']}`;
    }
    parts.push(street);
  }

  if (tags['addr:suburb'] || tags['addr:neighbourhood']) {
    parts.push(tags['addr:suburb'] || tags['addr:neighbourhood']);
  }

  if (tags['addr:city']) {
    parts.push(tags['addr:city']);
  }

  if (parts.length > 0) {
    return parts.join(' - ');
  }

  return 'Endereço não especificado no mapa';
}

/**
 * Função assíncrona fetchNearbyCafes que utiliza a Overpass API do OpenStreetMap (OSM)
 * para buscar todas as cafeterias em um raio de 15km em uma única requisição.
 * 
 * - Query Overpass QL: [out:json][timeout:25];(node["amenity"="cafe"](around:15000,lat,lng););out center;
 * - Mapeia json.elements para a estrutura { id, nome, latitude, longitude, endereco, nota: null }.
 * - Filtro negativo (Blocklist) para remover sorveterias, docerias, açaís e chocolaterias.
 */
export async function fetchNearbyCafes(
  lat: number | null | undefined,
  lng: number | null | undefined,
  radiusMeters: number = 15000
): Promise<Cafeteria[]> {
  // 1. Validação Estrita do GPS
  if (
    lat === null ||
    lat === undefined ||
    lng === null ||
    lng === undefined ||
    isNaN(lat) ||
    isNaN(lng) ||
    (lat === 0 && lng === 0)
  ) {
    console.warn('[GPS Valid] Coordenadas de GPS nulas ou inválidas:', { lat, lng });
    const gpsMessage = 'Aguardando sinal de GPS...';

    if (typeof window !== 'undefined' && window.alert) {
      window.alert(`Alerta de GPS: ${gpsMessage}`);
    }
    throw new Error(gpsMessage);
  }

  console.log(`[GPS Status OK] Latitude: ${lat}, Longitude: ${lng}`);

  // Chama o backend proxy local para evitar restrições de CORS/rede no navegador
  const url = `/api/overpass/cafes?lat=${lat}&lng=${lng}&radius=${radiusMeters}`;

  console.log(`[Overpass API Proxy Call] Disparando requisição ao servidor proxy: ${url}`);

  try {
    const response = await fetch(url);

    if (!response.ok) {
      const httpMsg = `Erro HTTP ${response.status}: ${response.statusText}`;
      console.error('[Overpass API HTTP Error]', response);
      throw new Error(httpMsg);
    }

    const data = await response.json();

    if (!data || !Array.isArray(data.elements)) {
      console.warn('[Overpass API] Resposta sem elementos. Retornando array vazio.');
      return [];
    }

    console.log(`[Overpass API Sucesso] ${data.elements.length} cafeterias brutas encontradas.`);

    // 2. Blocklist para remover estabelecimentos indesejados (sorveterias, docerias, açaís, etc.)
    const blocklist = [
      "freddo", "sorvete", "sorveteria", "gelato", "gelateria", "açaí", "acai", "chocolate", "doceria", "bolos"
    ];

    const elementosFiltrados = data.elements.filter((element: any) => {
      const nome = element.tags?.name || '';
      if (!nome) return true; // Mantém com fallback de 'Cafeteria Local'
      const nomeLower = nome.toLowerCase();
      return !blocklist.some((item) => nomeLower.includes(item));
    });

    console.log(`[Blocklist Filtro] ${data.elements.length} locais brutos OSM -> ${elementosFiltrados.length} cafeterias reais após remoção de docerias/sorveterias.`);

    // 3. Mapeamento final para a estrutura do app { id, nome, latitude, longitude, endereco, nota: null }
    return elementosFiltrados.map((element: any) => {
      const elementLat = element.lat;
      const elementLng = element.lon;
      const distKm = calcularDistanciaHaversineKm(lat, lng, elementLat, elementLng);
      const endereco = formatOsmAddress(element.tags);

      return {
        id: element.id.toString(),
        nome: element.tags?.name || 'Cafeteria Local',
        latitude: elementLat,
        longitude: elementLng,
        endereco: endereco,
        bairro: element.tags?.['addr:suburb'] || element.tags?.['addr:neighbourhood'] || undefined,
        nota: null, // OSM não possui sistema de avaliação de notas
        totalAvaliacoes: 0,
        temWifi: element.tags?.['internet_access'] === 'wlan' || element.tags?.['internet_access'] === 'yes',
        temTomadas: element.tags?.['socket'] !== undefined || element.tags?.['power'] !== undefined,
        descricao: `Cafeteria cadastrada no OpenStreetMap (ID: ${element.id}).`,
        especialidades: element.tags?.['cuisine'] ? [element.tags['cuisine']] : ['Café Especial', 'Espresso'],
        horarioFuncionamento: element.tags?.['opening_hours'] || 'Consulte no local',
        distanciaKm: distKm,
        origemOSM: true
      };
    });

  } catch (err: unknown) {
    const errorObj = err instanceof Error ? err : new Error(String(err));
    console.error('[Overpass API Catch Block]', errorObj);

    if (typeof window !== 'undefined' && window.alert) {
      window.alert(`Erro na API Overpass: ${errorObj.message}`);
    }

    return [];
  }
}

export function useCafeterias(userLat: number | null, userLng: number | null) {
  const [cafeterias, setCafeterias] = useState<Cafeteria[]>([]);
  const [isLoadingApi, setIsLoadingApi] = useState<boolean>(false);
  const [errorApi, setErrorApi] = useState<string | null>(null);
  const [selectedCafeteria, setSelectedCafeteria] = useState<Cafeteria | null>(null);

  // Filtros
  const [filtroWifi, setFiltroWifi] = useState<boolean>(false);
  const [filtroTomadas, setFiltroTomadas] = useState<boolean>(false);
  const [filtroNotaMin, setFiltroNotaMin] = useState<number>(0);
  const [termoBusca, setTermoBusca] = useState<string>('');

  // Busca cafeterias via Overpass API (OSM) ao atualizar a localização
  const carregarCafeteriasOSM = useCallback(async (lat: number | null, lng: number | null) => {
    if (lat === null || lat === undefined || lng === null || lng === undefined || isNaN(lat) || isNaN(lng) || (lat === 0 && lng === 0)) {
      console.warn('[GPS Guard] Tentativa de busca abortada. Coordenadas de GPS ausentes/nulas.');
      const gpsMsg = 'Aguardando sinal de GPS...';
      setErrorApi(gpsMsg);
      setCafeterias([]);
      return;
    }

    setIsLoadingApi(true);
    setErrorApi(null);

    try {
      const resultados = await fetchNearbyCafes(lat, lng, 15000);
      setCafeterias(resultados);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao buscar cafeterias na Overpass API.';
      setErrorApi(msg);
      setCafeterias([]);
    } finally {
      setIsLoadingApi(false);
    }
  }, []);

  // Efeito disparado quando a latitude ou longitude do GPS muda
  useEffect(() => {
    const defaultLat = userLat ?? -25.4284;
    const defaultLng = userLng ?? -49.2733;

    carregarCafeteriasOSM(defaultLat, defaultLng);
  }, [userLat, userLng, carregarCafeteriasOSM]);

  // Cafeterias processadas com filtros
  const cafeteriasFiltradas = useMemo(() => {
    return cafeterias
      .map(c => {
        let distanciaKm = c.distanciaKm;
        if (distanciaKm === undefined && userLat !== null && userLng !== null) {
          distanciaKm = calcularDistanciaHaversineKm(userLat, userLng, c.latitude, c.longitude);
        }
        return {
          ...c,
          distanciaKm
        };
      })
      .filter(c => {
        if (filtroWifi && !c.temWifi) return false;
        if (filtroTomadas && !c.temTomadas) return false;
        if (filtroNotaMin > 0 && (c.nota === null || c.nota < filtroNotaMin)) return false;
        if (termoBusca.trim()) {
          const buscaLower = termoBusca.toLowerCase();
          const matchNome = c.nome.toLowerCase().includes(buscaLower);
          const matchEndereco = c.endereco.toLowerCase().includes(buscaLower);
          if (!matchNome && !matchEndereco) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (a.distanciaKm !== undefined && b.distanciaKm !== undefined) {
          return a.distanciaKm - b.distanciaKm;
        }
        if (a.nota !== null && b.nota !== null) {
          return b.nota - a.nota;
        }
        return 0;
      });
  }, [cafeterias, userLat, userLng, filtroWifi, filtroTomadas, filtroNotaMin, termoBusca]);

  const selecionarCafeteria = (cafeteria: Cafeteria | null) => {
    setSelectedCafeteria(cafeteria);
  };

  const recarregar = () => {
    const defaultLat = userLat ?? -25.4284;
    const defaultLng = userLng ?? -49.2733;
    carregarCafeteriasOSM(defaultLat, defaultLng);
  };

  return {
    cafeterias: cafeteriasFiltradas,
    totalOriginal: cafeterias.length,
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
  };
}

