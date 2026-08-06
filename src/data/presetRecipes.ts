import { ReceitaCafe } from '../types/timer';

export const RECEITAS_PREDEFINIDAS: ReceitaCafe[] = [
  {
    id: 'v60-46',
    nome: 'V60 — Método 4:6 (Tetsu Kasuya)',
    metodo: 'V60',
    descricao: 'Método campeão mundial do World Brewers Cup. Divide 40% da água para acidez/doçura e 60% para o corpo.',
    proporcaoPadrao: 15,
    doseCafePadraoG: 20,
    etapas: [
      {
        id: 'e1',
        nome: 'Bloom (Pré-infusão)',
        duracaoSegundos: 45,
        volumeAguaAlvoMl: 60,
        instrucao: 'Despeje 60ml de água em movimentos circulares para liberar os gases de CO2 (desgasificação).'
      },
      {
        id: 'e2',
        nome: 'Ataque 1 (Doçura & Acidez)',
        duracaoSegundos: 45,
        volumeAguaAlvoMl: 120,
        instrucao: 'Despeje até atingir 120ml acumulados. Vertido firme no centro.'
      },
      {
        id: 'e3',
        nome: 'Ataque 2 (Corpo)',
        duracaoSegundos: 45,
        volumeAguaAlvoMl: 180,
        instrucao: 'Despeje até 180ml acumulados. Mantenha o fluxo constante.'
      },
      {
        id: 'e4',
        nome: 'Ataque 3 (Equilíbrio)',
        duracaoSegundos: 45,
        volumeAguaAlvoMl: 240,
        instrucao: 'Despeje até 240ml acumulados.'
      },
      {
        id: 'e5',
        nome: 'Ataque Final & Drenagem',
        duracaoSegundos: 45,
        volumeAguaAlvoMl: 300,
        instrucao: 'Despeje até 300ml finais. Aguarde a água baixar completamente no filtro.'
      }
    ]
  },
  {
    id: 'aeropress-invertido',
    nome: 'Aeropress — Método Invertido Usual',
    metodo: 'Aeropress',
    descricao: 'Extração por imersão rápida seguida de filtragem sob pressão manual.',
    proporcaoPadrao: 14,
    doseCafePadraoG: 16,
    etapas: [
      {
        id: 'a1',
        nome: 'Bloom Rápido',
        duracaoSegundos: 30,
        volumeAguaAlvoMl: 60,
        instrucao: 'Despeje 60ml de água fervente (92°C) e mexa suavemente com a pá durante 10 segundos.'
      },
      {
        id: 'a2',
        nome: 'Preenchimento Total',
        duracaoSegundos: 60,
        volumeAguaAlvoMl: 224,
        instrucao: 'Despeje o restante até 224ml. Encaixe o filtro com papel escaldado sem pressionar.'
      },
      {
        id: 'a3',
        nome: 'Pressionar Embolo',
        duracaoSegundos: 30,
        volumeAguaAlvoMl: 224,
        instrucao: 'Vire a Aeropress na xícara e pressione o êmbolo suavemente por 30s até ouvir o chiado de ar.'
      }
    ]
  },
  {
    id: 'prensa-francesa',
    nome: 'Prensa Francesa — Método Hoffmann',
    metodo: 'Prensa Francesa',
    descricao: 'Método limpo e encorpado sem amargor por sedimentos, popularizado por James Hoffmann.',
    proporcaoPadrao: 16,
    doseCafePadraoG: 20,
    etapas: [
      {
        id: 'p1',
        nome: 'Infusão Direta Total',
        duracaoSegundos: 240, // 4 minutos
        volumeAguaAlvoMl: 320,
        instrucao: 'Despeje rapidamente os 320ml de água fervente garantindo que o pó seja umedecido. Aguarde 4 minutos.'
      },
      {
        id: 'p2',
        nome: 'Quebra da Crosta & Mexer',
        duracaoSegundos: 30,
        volumeAguaAlvoMl: 320,
        instrucao: 'Com uma colher, mexa suavemente a crosta superficial para que o pó afunde no fundo.'
      },
      {
        id: 'p3',
        nome: 'Decantação Final',
        duracaoSegundos: 180, // 3 minutos
        volumeAguaAlvoMl: 320,
        instrucao: 'Aguarde os óleos e partículas assentarem. Encaixe o embolo apenas no topo sem empurrar para baixo.'
      }
    ]
  },
  {
    id: 'chemex-suave',
    nome: 'Chemex — Filtro de Vidro Elegante',
    metodo: 'Chemex',
    descricao: 'Extração limpa com filtro de papel mais espesso, ressaltando notas florais e frutadas.',
    proporcaoPadrao: 16,
    doseCafePadraoG: 25,
    etapas: [
      {
        id: 'c1',
        nome: 'Bloom Extenso',
        duracaoSegundos: 45,
        volumeAguaAlvoMl: 75,
        instrucao: 'Despeje 75ml de água e aguarde a expansão do leito de café.'
      },
      {
        id: 'c2',
        nome: 'Vertido Principal 1',
        duracaoSegundos: 60,
        volumeAguaAlvoMl: 200,
        instrucao: 'Despeje de forma lenta e circular até atingir 200ml acumulados.'
      },
      {
        id: 'c3',
        nome: 'Vertido Principal 2 & Drenagem',
        duracaoSegundos: 105,
        volumeAguaAlvoMl: 400,
        instrucao: 'Complete até 400ml de água. Deixe o líquido drenar por gravidade.'
      }
    ]
  }
];
