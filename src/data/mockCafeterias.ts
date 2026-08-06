import { Cafeteria } from '../types/cafeteria';

/**
 * MOCK DE CAFETERIAS PRÓXIMAS (FASE 3)
 * Coordenadas de referência centradas na região da Av. Paulista / Jardins (São Paulo, SP)
 */
export const CAFETERIAS_MOCK: Cafeteria[] = [
  // Curitiba - PR (Fallback do Requisito 2)
  {
    id: 'curitiba-place-1',
    nome: 'Lucca Cafés Especiais',
    latitude: -25.4290,
    longitude: -49.2740,
    temWifi: true,
    temTomadas: true,
    nota: 4.9,
    endereco: 'Alameda Pres. Taunay, 40',
    bairro: 'Batel, Curitiba',
    descricao: 'Pioneira em cafés especiais em Curitiba. Torrefação própria e espaço de estudo com microlotes premiados.',
    especialidades: ['V60 Bourbon Vermelho', 'Espresso Duplo', 'Torta de Amora'],
    horarioFuncionamento: 'Seg a Dom: 08:00 - 20:00',
    origemGooglePlaces: true
  },
  {
    id: 'curitiba-place-2',
    nome: 'Supernova Coffee Roasters',
    latitude: -25.4260,
    longitude: -49.2710,
    temWifi: true,
    temTomadas: true,
    nota: 4.8,
    endereco: 'Rua Cel. Dulcídio, 544',
    bairro: 'Batel, Curitiba',
    descricao: 'Cafeteria minimalista e torrefação artesanal com foco em grãos orgânicos e métodos filtrados manuais.',
    especialidades: ['Flat White', 'Aeropress Moka', 'Brownie de Cacau 70%'],
    horarioFuncionamento: 'Seg a Sáb: 09:00 - 19:00',
    origemGooglePlaces: true
  },
  {
    id: 'curitiba-place-3',
    nome: 'Rause Café & Vinho',
    latitude: -25.4310,
    longitude: -49.2760,
    temWifi: true,
    temTomadas: false,
    nota: 4.7,
    endereco: 'Alameda Dr. Carlos de Carvalho, 696',
    bairro: 'Centro, Curitiba',
    descricao: 'Ambiente aconchegante combinando cafés especiais de alta pontuação e comidinhas artesanais.',
    especialidades: ['Chemex Compartilhado', 'Cold Brew Citrus', 'Toast de Queijo da Canastra'],
    horarioFuncionamento: 'Ter a Dom: 10:00 - 20:00',
    origemGooglePlaces: true
  },

  // São Paulo - SP (Av. Paulista / Jardins)
  {
    id: 'cafeteria-1',
    nome: 'Astro Specialty Coffee',
    latitude: -23.5615,
    longitude: -46.6560,
    temWifi: true,
    temTomadas: true,
    nota: 4.9,
    endereco: 'Alameda Santos, 1100',
    bairro: 'Cerqueira César, São Paulo',
    descricao: 'Cafeteria e microtorrefação artesanal focada em micro-lotes brasileiros e métodos de extração manuais.',
    especialidades: ['V60 Catuaí Amarelo', 'Espresso Duplo Cremoso', 'Croissant de Amêndoas'],
    horarioFuncionamento: 'Seg a Sáb: 08:00 - 19:00 | Dom: 09:00 - 17:00'
  },
  {
    id: 'cafeteria-2',
    nome: 'Koffee & Co. Workspace',
    latitude: -23.5640,
    longitude: -46.6520,
    temWifi: true,
    temTomadas: true,
    nota: 4.7,
    endereco: 'Rua Augusta, 1850',
    bairro: 'Consolação, São Paulo',
    descricao: 'Espaço pensado para produtividade e trabalho remoto com café especial de alta pontuação (>85 pontos SCA).',
    especialidades: ['Aeropress Invertido', 'Cold Brew Nitro', 'Toast de Abacate com OVO'],
    horarioFuncionamento: 'Seg a Sex: 07:30 - 20:00 | Sáb: 08:30 - 18:00'
  },
  {
    id: 'cafeteria-3',
    nome: 'Pequeno Grão Torrefação',
    latitude: -23.5580,
    longitude: -46.6590,
    temWifi: false,
    temTomadas: true,
    nota: 4.8,
    endereco: 'Rua Haddock Lobo, 920',
    bairro: 'Jardins, São Paulo',
    descricao: 'Ambiente intimista e silencioso. Foco em provas cegas, harmonizações de sobremesas e grãos fermentados.',
    especialidades: ['Syphon / Sifão Japonês', 'Moka Clássica', 'Bolo de Cenoura com Brigadeiro 70%'],
    horarioFuncionamento: 'Ter a Dom: 09:00 - 18:30'
  }
];

/**
 * Fórmula de Haversine para calcular a distância em quilômetros entre dois pontos geográficos.
 */
export function calcularDistanciaHaversineKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Raio da Terra em km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distancia = R * c;
  return Number(distancia.toFixed(2));
}
