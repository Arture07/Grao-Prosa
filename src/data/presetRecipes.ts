import { ReceitaCafe } from '../types/timer';

export const RECEITAS_PREDEFINIDAS: ReceitaCafe[] = [
  {
    id: 'v60-46',
    nome: 'recipes.v60-46.name',
    metodo: 'V60',
    descricao: 'recipes.v60-46.description',
    proporcaoPadrao: 15,
    doseCafePadraoG: 20,
    etapas: [
      {
        id: 'e1',
        nome: 'recipes.v60-46.steps.e1.name',
        duracaoSegundos: 45,
        volumeAguaAlvoMl: 60,
        instrucao: 'recipes.v60-46.steps.e1.instruction'
      },
      {
        id: 'e2',
        nome: 'recipes.v60-46.steps.e2.name',
        duracaoSegundos: 45,
        volumeAguaAlvoMl: 120,
        instrucao: 'recipes.v60-46.steps.e2.instruction'
      },
      {
        id: 'e3',
        nome: 'recipes.v60-46.steps.e3.name',
        duracaoSegundos: 45,
        volumeAguaAlvoMl: 180,
        instrucao: 'recipes.v60-46.steps.e3.instruction'
      },
      {
        id: 'e4',
        nome: 'recipes.v60-46.steps.e4.name',
        duracaoSegundos: 45,
        volumeAguaAlvoMl: 240,
        instrucao: 'recipes.v60-46.steps.e4.instruction'
      },
      {
        id: 'e5',
        nome: 'recipes.v60-46.steps.e5.name',
        duracaoSegundos: 45,
        volumeAguaAlvoMl: 300,
        instrucao: 'recipes.v60-46.steps.e5.instruction'
      }
    ]
  },
  {
    id: 'aeropress-invertido',
    nome: 'recipes.aeropress-invertido.name',
    metodo: 'Aeropress',
    descricao: 'recipes.aeropress-invertido.description',
    proporcaoPadrao: 14,
    doseCafePadraoG: 16,
    etapas: [
      {
        id: 'a1',
        nome: 'recipes.aeropress-invertido.steps.a1.name',
        duracaoSegundos: 30,
        volumeAguaAlvoMl: 60,
        instrucao: 'recipes.aeropress-invertido.steps.a1.instruction'
      },
      {
        id: 'a2',
        nome: 'recipes.aeropress-invertido.steps.a2.name',
        duracaoSegundos: 60,
        volumeAguaAlvoMl: 224,
        instrucao: 'recipes.aeropress-invertido.steps.a2.instruction'
      },
      {
        id: 'a3',
        nome: 'recipes.aeropress-invertido.steps.a3.name',
        duracaoSegundos: 30,
        volumeAguaAlvoMl: 224,
        instrucao: 'recipes.aeropress-invertido.steps.a3.instruction'
      }
    ]
  },
  {
    id: 'prensa-francesa',
    nome: 'recipes.prensa-francesa.name',
    metodo: 'Prensa Francesa',
    descricao: 'recipes.prensa-francesa.description',
    proporcaoPadrao: 16,
    doseCafePadraoG: 20,
    etapas: [
      {
        id: 'p1',
        nome: 'recipes.prensa-francesa.steps.p1.name',
        duracaoSegundos: 240, // 4 minutos
        volumeAguaAlvoMl: 320,
        instrucao: 'recipes.prensa-francesa.steps.p1.instruction'
      },
      {
        id: 'p2',
        nome: 'recipes.prensa-francesa.steps.p2.name',
        duracaoSegundos: 30,
        volumeAguaAlvoMl: 320,
        instrucao: 'recipes.prensa-francesa.steps.p2.instruction'
      },
      {
        id: 'p3',
        nome: 'recipes.prensa-francesa.steps.p3.name',
        duracaoSegundos: 180, // 3 minutos
        volumeAguaAlvoMl: 320,
        instrucao: 'recipes.prensa-francesa.steps.p3.instruction'
      }
    ]
  },
  {
    id: 'chemex-suave',
    nome: 'recipes.chemex-suave.name',
    metodo: 'Chemex',
    descricao: 'recipes.chemex-suave.description',
    proporcaoPadrao: 16,
    doseCafePadraoG: 25,
    etapas: [
      {
        id: 'c1',
        nome: 'recipes.chemex-suave.steps.c1.name',
        duracaoSegundos: 45,
        volumeAguaAlvoMl: 75,
        instrucao: 'recipes.chemex-suave.steps.c1.instruction'
      },
      {
        id: 'c2',
        nome: 'recipes.chemex-suave.steps.c2.name',
        duracaoSegundos: 60,
        volumeAguaAlvoMl: 200,
        instrucao: 'recipes.chemex-suave.steps.c2.instruction'
      },
      {
        id: 'c3',
        nome: 'recipes.chemex-suave.steps.c3.name',
        duracaoSegundos: 105,
        volumeAguaAlvoMl: 400,
        instrucao: 'recipes.chemex-suave.steps.c3.instruction'
      }
    ]
  }
];

