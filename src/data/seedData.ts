import { Grao, Degustacao } from '../types/coffee';

export const GRAOS_INICIAIS: Grao[] = [
  {
    id: 'grao-1',
    nome: 'Bourbon Amarelo - Sítio da Serra',
    torrefacao: 'Café do Mercado',
    origem: 'Mantiqueira de Minas (MG)',
    nivelTorra: 'Média-Clara',
    quantidadeRestante: 210,
    criadoEm: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'grao-2',
    nome: 'Catuaí Vermelho - Ninho da Águia',
    torrefacao: 'Um Coffee Co.',
    origem: 'Caparaó (ES)',
    nivelTorra: 'Clara',
    quantidadeRestante: 180,
    criadoEm: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'grao-3',
    nome: 'Mundo Novo Extra Intenso',
    torrefacao: 'Academia do Café',
    origem: 'Alta Mogiana (SP)',
    nivelTorra: 'Média-Escura',
    quantidadeRestante: 35, // Quantidade baixa para testar alerta de estoque
    criadoEm: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  }
];

export const DEGUSTACOES_INICIAIS: Degustacao[] = [
  {
    id: 'degust-1',
    graoId: 'grao-1',
    data: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    metodoPreparo: 'V60',
    nota: 5,
    notasSensoriais: ['Frutado', 'Caramelo', 'Cítrico'],
    doseGramas: 18,
    volumeAguaMl: 280,
    observacoes: 'Acidez brilhante e doçura alta no retrogosto. Moagem média-fina.'
  },
  {
    id: 'degust-2',
    graoId: 'grao-2',
    data: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    metodoPreparo: 'Aeropress',
    nota: 4,
    notasSensoriais: ['Floral', 'Mel', 'Herbal / Chá'],
    doseGramas: 15,
    volumeAguaMl: 200,
    observacoes: 'Método invertido, 2 min de infusão. Corpo sedoso.'
  },
  {
    id: 'degust-3',
    graoId: 'grao-1',
    data: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    metodoPreparo: 'Espresso',
    nota: 4,
    notasSensoriais: ['Achocolatado', 'Nozes / Castanhas'],
    doseGramas: 19,
    volumeAguaMl: 40,
    observacoes: 'Crema aveludada, acidez mais contida que na V60.'
  }
];
