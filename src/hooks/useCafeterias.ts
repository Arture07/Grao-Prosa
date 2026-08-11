import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { Cafeteria } from '../types/cafeteria';
import { calcularDistanciaHaversineKm, getFallbackCafeterias } from '../data/mockCafeterias';

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
  radiusMeters: number = 5000
): Promise<Cafeteria[]> {
  // 1. Validação do GPS: se não houver localização válida do usuário, não busca no Overpass
  if (
    lat === null ||
    lat === undefined ||
    lng === null ||
    lng === undefined ||
    isNaN(lat) ||
    isNaN(lng) ||
    (lat === 0 && lng === 0)
  ) {
    console.warn('[GPS Valid] Coordenadas de GPS não fornecidas.');
    return [];
  }

  // Chama o backend proxy local para evitar restrições de CORS/rede no navegador
  const url = `/api/overpass/cafes?lat=${lat}&lng=${lng}&radius=${radiusMeters}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      console.warn(`[Overpass API HTTP Warning] Status ${response.status}. Usando fallback local.`);
      return getFallbackCafeterias(lat, lng);
    }

    const data = await response.json();

    if (!data || !Array.isArray(data.elements) || data.elements.length === 0) {
      console.warn('[Overpass API] Resposta sem elementos. Usando fallback local.');
      return getFallbackCafeterias(lat, lng);
    }

    // 2. Remoção de duplicatas pelo ID do OpenStreetMap
    const seenIds = new Set<string>();
    const elementosUnicos = data.elements.filter((element: any) => {
      const idKey = element.id ? `${element.type || 'node'}_${element.id}` : null;
      if (!idKey || seenIds.has(idKey)) return false;
      seenIds.add(idKey);
      return true;
    });

    // 3. Blocklist para remover estabelecimentos indesejados (sorveterias, docerias, açaís, etc.)
    const blocklist = [
      "freddo", "sorvete", "sorveteria", "gelato", "gelateria", "açaí", "acai", "chocolate", "doceria", "bolos"
    ];

    const elementosFiltrados = elementosUnicos.filter((element: any) => {
      const nome = element.tags?.name || '';
      if (!nome) return true;
      const nomeLower = nome.toLowerCase();
      return !blocklist.some((item) => nomeLower.includes(item));
    });

    if (elementosFiltrados.length === 0) {
      return getFallbackCafeterias(lat, lng);
    }

    // 4. Mapeamento final para a estrutura do app com suporte a nodes, ways e relations
    return elementosFiltrados
      .map((element: any) => {
        const elementLat = element.lat ?? element.center?.lat;
        const elementLng = element.lon ?? element.center?.lon;
        if (!elementLat || !elementLng) return null;

        const distKm = calcularDistanciaHaversineKm(lat, lng, elementLat, elementLng);
        const endereco = formatOsmAddress(element.tags);

        const internetAccess = element.tags?.['internet_access'];
        const temWifi = internetAccess === 'wlan' || internetAccess === 'yes' || internetAccess === 'terminal';

        const socketTag = element.tags?.['socket'];
        const hasCapacitySockets = element.tags?.['capacity:sockets'] !== undefined;
        const temTomadas = socketTag === 'yes' || socketTag !== undefined || hasCapacitySockets || element.tags?.['power'] !== undefined;

        return {
          id: `${element.type || 'node'}_${element.id}`,
          nome: element.tags?.name || 'Cafeteria Local',
          latitude: elementLat,
          longitude: elementLng,
          endereco: endereco,
          bairro: element.tags?.['addr:suburb'] || element.tags?.['addr:neighbourhood'] || undefined,
          nota: null,
          totalAvaliacoes: 0,
          temWifi: temWifi,
          temTomadas: temTomadas,
          descricao: `Cafeteria cadastrada no OpenStreetMap (ID: ${element.id}).`,
          especialidades: element.tags?.['cuisine'] ? [element.tags['cuisine']] : ['Café Especial', 'Espresso'],
          horarioFuncionamento: element.tags?.['opening_hours'] || 'Consulte no local',
          distanciaKm: distKm,
          origemOSM: true
        };
      })
      .filter((c): c is Cafeteria => c !== null);

  } catch (err: unknown) {
    console.warn('[Overpass API Fetch Warning] Falha na requisição ao Overpass. Usando fallback suave:', err);
    return getFallbackCafeterias(lat, lng);
  }
}


/**
 * Interface para representar a localização geográfica atual do usuário
 */
export interface UserLocation {
  lat: number;
  lng: number;
}

/**
 * Função de Enriquecimento de Dados com Google Places / Distance Matrix (Hidratação Sob Demanda)
 * Disparada apenas quando o usuário clica em uma cafeteria/marcador ou lote top 15.
 */
export async function enrichCafeDetails(
  cafe: Cafeteria,
  userLocation: UserLocation | { lat: number; lng: number } | null | number,
  userLngParam?: number | null
): Promise<Cafeteria> {
  if (!cafe || cafe.enriquecidoGoogle) {
    return { ...cafe, isLoadingDetails: false };
  }

  let uLat: number | null = null;
  let uLng: number | null = null;

  if (typeof userLocation === 'number') {
    uLat = userLocation;
    uLng = userLngParam ?? null;
  } else if (userLocation && typeof userLocation.lat === 'number' && typeof userLocation.lng === 'number') {
    uLat = userLocation.lat;
    uLng = userLocation.lng;
  }

  try {
    let url = `/api/places/details?name=${encodeURIComponent(cafe.nome)}&lat=${cafe.latitude}&lng=${cafe.longitude}`;
    if (uLat !== null && uLng !== null && !isNaN(uLat) && !isNaN(uLng)) {
      url += `&userLat=${uLat}&userLng=${uLng}`;
    }
    url += `&timestamp=${Date.now()}`;

    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) {
      return { ...cafe, isLoadingDetails: false, enriquecidoGoogle: true, dadosComunidade: true };
    }
    const data = await res.json();
    if (data) {
      return {
        ...cafe,
        nota: data.nota !== undefined && data.nota !== null ? data.nota : cafe.nota,
        totalAvaliacoes: data.totalAvaliacoes || cafe.totalAvaliacoes,
        endereco: data.endereco || cafe.endereco,
        fotoUrl: data.fotoUrl || cafe.fotoUrl,
        openNow: data.openNow !== undefined ? data.openNow : cafe.openNow,
        horarioFuncionamento: data.horarioFuncionamento || cafe.horarioFuncionamento,
        horariosSemana: data.horariosSemana || cafe.horariosSemana,
        reviews: data.reviews || cafe.reviews,
        distanciaRotaTexto: data.distanciaRotaTexto || cafe.distanciaRotaTexto,
        duracaoRotaTexto: data.duracaoRotaTexto || cafe.duracaoRotaTexto,
        temWifi: data.temWifi !== undefined ? (cafe.temWifi || data.temWifi) : cafe.temWifi,
        temTomadas: data.temTomadas !== undefined ? (cafe.temTomadas || data.temTomadas) : cafe.temTomadas,
        descricao: data.descricao || cafe.descricao,
        enriquecidoGoogle: true,
        dadosComunidade: true,
        isLoadingDetails: false
      };
    }
  } catch (err) {
    console.warn('[enrichCafeDetails Error]', err);
  }

  return { ...cafe, isLoadingDetails: false, enriquecidoGoogle: true, dadosComunidade: true };
}

/**
 * Traçar Rota com Deep Linking Humanizado (Etiquetas de Coordenadas e Origem do GPS)
 * Evita exibir coordenadas cruas para o usuário final no aplicativo de mapas.
 */
export function handleOpenRoute(
  cafe: Cafeteria,
  userLocation?: UserLocation | { lat: number; lng: number } | null
) {
  if (!cafe) return;

  const { latitude: lat, longitude: lng, nome } = cafe;
  const nomeEncoded = encodeURIComponent(nome);

  const hasOrigin = userLocation && typeof userLocation.lat === 'number' && typeof userLocation.lng === 'number';
  const originStr = hasOrigin ? `${userLocation.lat},${userLocation.lng}` : '';

  let url = '';

  if (typeof navigator !== 'undefined' && /iPhone|iPad|iPod/i.test(navigator.userAgent)) {
    url = hasOrigin 
      ? `http://maps.apple.com/?saddr=${originStr}&daddr=${lat},${lng}&q=${nomeEncoded}`
      : `http://maps.apple.com/?ll=${lat},${lng}&q=${nomeEncoded}`;
  } else if (typeof navigator !== 'undefined' && /Android/i.test(navigator.userAgent)) {
    url = hasOrigin
      ? `https://www.google.com/maps/dir/?api=1&origin=${originStr}&destination=${lat},${lng}`
      : `geo:0,0?q=${lat},${lng}(${nomeEncoded})`;
  } else {
    url = hasOrigin
      ? `https://www.google.com/maps/dir/?api=1&origin=${originStr}&destination=${lat},${lng}`
      : `https://www.google.com/maps/search/?api=1&query=${lat},${lng}(${nomeEncoded})`;
  }

  if (typeof window !== 'undefined') {
    window.open(url, '_blank');
  }
}

export function useCafeterias(userLat: number | null, userLng: number | null) {
  const [cafeterias, setCafeterias] = useState<Cafeteria[]>([]);
  const [isLoadingApi, setIsLoadingApi] = useState<boolean>(false);
  const [errorApi, setErrorApi] = useState<string | null>(null);
  const [selectedCafeteria, setSelectedCafeteria] = useState<Cafeteria | null>(null);

  // Ref para manter as coordenadas mais recentes do usuário e evitar closures obsoletas
  const userLatRef = useRef<number | null>(userLat);
  const userLngRef = useRef<number | null>(userLng);

  useEffect(() => {
    userLatRef.current = userLat;
    userLngRef.current = userLng;
  }, [userLat, userLng]);

  // Ref para controle de concorrência e descarte de buscas antigas
  const batchRequestIdRef = useRef<number>(0);

  // Filtros
  const [filtroWifi, setFiltroWifi] = useState<boolean>(false);
  const [filtroTomadas, setFiltroTomadas] = useState<boolean>(false);
  const [filtroProdutividade, setFiltroProdutividade] = useState<boolean>(false);
  const [filtroNotaMin, setFiltroNotaMin] = useState<number>(0);
  const [termoBusca, setTermoBusca] = useState<string>('');

  // Requisito 3: Fallback no onPress (Para o resto do mapa além do Top 15)
  const selecionarCafeteria = useCallback(async (cafeteria: Cafeteria | null) => {
    if (!cafeteria) {
      setSelectedCafeteria(null);
      return;
    }

    // Se já foi hidratada pelo background batch ou por clique prévio, abre instantaneamente sem loading
    if (cafeteria.enriquecidoGoogle) {
      setSelectedCafeteria({ ...cafeteria, isLoadingDetails: false });
      return;
    }

    // Se for a 16ª+ cafeteria ou ainda não foi pré-carregada, exibe spinner de carregamento e faz o fetch pontual
    const cafeComLoading = { ...cafeteria, isLoadingDetails: true };
    setSelectedCafeteria(cafeComLoading);

    const currentLat = userLat ?? userLatRef.current;
    const currentLng = userLng ?? userLngRef.current;

    const userLocationObj = (currentLat !== null && currentLng !== null && !isNaN(currentLat) && !isNaN(currentLng))
      ? { lat: currentLat, lng: currentLng }
      : null;

    const cafeEnriquecido = await enrichCafeDetails(cafeteria, userLocationObj);
    setSelectedCafeteria(cafeEnriquecido);

    // Atualiza também na lista global
    setCafeterias(prev => prev.map(c => c.id === cafeteria.id ? cafeEnriquecido : c));
  }, [userLat, userLng]);

  // Requisito 1 & 2: Hidratação Silenciosa das Top 15 Cafeterias com Atualização Dinâmica de Estado
  const hidratarLoteTop15 = useCallback(async (
    topCafes: Cafeteria[],
    requestId: number,
    targetLat?: number | null,
    targetLng?: number | null
  ) => {
    const CHUNK_SIZE = 3; // Lote de 3 requisições paralelas para proteger a API contra Rate Limits

    const effLat = targetLat ?? userLat ?? userLatRef.current;
    const effLng = targetLng ?? userLng ?? userLngRef.current;

    const userLocationObj = (effLat !== null && effLng !== null && !isNaN(effLat) && !isNaN(effLng))
      ? { lat: effLat, lng: effLng }
      : null;

    if (!userLocationObj) {
      console.warn('[hidratarLoteTop15] Localização do usuário indisponível. Abortando hidratação em lote.');
      return;
    }

    for (let i = 0; i < topCafes.length; i += CHUNK_SIZE) {
      if (requestId !== batchRequestIdRef.current) break;

      const chunk = topCafes.slice(i, i + CHUNK_SIZE);
      const enrichedChunk = await Promise.all(
        chunk.map(cafe => enrichCafeDetails(cafe, userLocationObj))
      );

      if (requestId !== batchRequestIdRef.current) break;

      // Requisito 2: Atualização Dinâmica no Estado (pins no mapa se atualizam silenciosamente)
      setCafeterias(prev => {
        const updated = [...prev];
        for (const cafeEnriquecido of enrichedChunk) {
          const index = updated.findIndex(c => c.id === cafeEnriquecido.id);
          if (index !== -1) {
            updated[index] = cafeEnriquecido;
          }
        }
        return updated;
      });

      // Se o modal do card estiver aberto para uma das cafeterias hidratadas no lote, atualiza
      setSelectedCafeteria(currentSelected => {
        if (!currentSelected) return null;
        const match = enrichedChunk.find(c => c.id === currentSelected.id);
        return match ? { ...match, isLoadingDetails: false } : currentSelected;
      });
    }
  }, [userLat, userLng]);

  // Busca cafeterias via Overpass API (OSM) e inicia pré-carregamento em lote
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

    const requestId = ++batchRequestIdRef.current;

    try {
      const resultados = await fetchNearbyCafes(lat, lng, 5000);
      if (requestId !== batchRequestIdRef.current) return;

      // Ordena cafeterias por distância para pegar os 15 mais próximos do usuário
      const comDistancia = resultados.map(c => ({
        ...c,
        distanciaKm: c.distanciaKm ?? calcularDistanciaHaversineKm(lat, lng, c.latitude, c.longitude)
      })).sort((a, b) => (a.distanciaKm ?? 0) - (b.distanciaKm ?? 0));

      setCafeterias(comDistancia);

      // Requisito 1: Seleciona as 15 cafeterias mais próximas e dispara a hidratação em segundo plano
      const top15 = comDistancia.slice(0, 15);
      hidratarLoteTop15(top15, requestId, lat, lng);

    } catch (err: unknown) {
      if (requestId !== batchRequestIdRef.current) return;
      const msg = err instanceof Error ? err.message : 'Erro ao buscar cafeterias na Overpass API.';
      setErrorApi(msg);
      setCafeterias([]);
    } finally {
      if (requestId === batchRequestIdRef.current) {
        setIsLoadingApi(false);
      }
    }
  }, [hidratarLoteTop15]);

  // Efeito disparado quando a latitude ou longitude do GPS muda
  useEffect(() => {
    if (userLat === null || userLng === null || isNaN(userLat) || isNaN(userLng)) {
      setCafeterias([]);
      return;
    }

    carregarCafeteriasOSM(userLat, userLng);
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
        if (filtroProdutividade && (!c.temWifi && !c.temTomadas)) return false;
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
  }, [cafeterias, userLat, userLng, filtroWifi, filtroTomadas, filtroProdutividade, filtroNotaMin, termoBusca]);

  const recarregar = () => {
    if (userLat !== null && userLng !== null && !isNaN(userLat) && !isNaN(userLng)) {
      carregarCafeteriasOSM(userLat, userLng);
    }
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
    filtroProdutividade,
    setFiltroProdutividade,
    filtroNotaMin,
    setFiltroNotaMin,
    termoBusca,
    setTermoBusca
  };
}

