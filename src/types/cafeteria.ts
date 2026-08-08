/**
 * DOMAIN MODEL - RADAR DE CAFETERIAS & GEOLOCALIZAÇÃO (FASE 3)
 */

export interface Review {
  author_name: string;
  rating: number;
  text: string;
  relative_time_description?: string;
  profile_photo_url?: string;
}

export interface Cafeteria {
  id: string; // Google place_id, OSM node id ou ID customizado
  nome: string;
  latitude: number;
  longitude: number;
  temWifi: boolean;
  temTomadas: boolean;
  nota: number | null; // 1.0 a 5.0 (rating) ou null se OpenStreetMap
  totalAvaliacoes?: number; // user_ratings_total
  endereco: string;
  bairro?: string;
  descricao: string;
  especialidades: string[];
  horarioFuncionamento: string;
  horariosSemana?: string[]; // Lista com os horários de cada dia da semana (weekday_text)
  fotoUrl?: string;
  distanciaKm?: number; // Calculado dinamicamente via Haversine
  distanciaRotaTexto?: string; // Distância de rota real via Distance Matrix (ex: "15,1 km de carro")
  duracaoRotaTexto?: string; // Tempo estimado de rota (ex: "22 min de carro")
  reviews?: Review[]; // Lista com até 5 avaliações reais do Google
  origemGooglePlaces?: boolean;
  origemOSM?: boolean;
  openNow?: boolean;
  isLoadingDetails?: boolean;
  enriquecidoGoogle?: boolean;
  dadosComunidade?: boolean;
}

/**
 * Interface da resposta JSON bruta da API Google Places Nearby Search
 */
export interface GooglePlacesResult {
  place_id: string;
  name: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  rating?: number;
  user_ratings_total?: number;
  vicinity?: string;
  formatted_address?: string;
  types?: string[];
  opening_hours?: {
    open_now?: boolean;
  };
  photos?: Array<{
    photo_reference: string;
  }>;
}

export interface GooglePlacesResponse {
  results: GooglePlacesResult[];
  status: string;
  error_message?: string;
  next_page_token?: string;
}

export type PermissionStatus = 'undetermined' | 'granted' | 'denied' | 'requesting';

export interface UserLocationState {
  latitude: number | null;
  longitude: number | null;
  precisaoMetros?: number | null;
  statusPermissao: PermissionStatus;
  carregando: boolean;
  erroMensagem: string | null;
}
