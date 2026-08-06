/**
 * MODELO DE DOMÍNIO - CRONÔMETRO DE EXTRAÇÃO & RECEITAS DE CAFÉ (FASE 2)
 */

export interface EtapaReceita {
  id: string;
  nome: string;               // Ex: "Bloom / Pré-infusão", "Ataque 1", "Drenagem Final"
  duracaoSegundos: number;    // Duração desta etapa em segundos
  volumeAguaAlvoMl: number;   // Volume acumulado de água em ml até o final desta etapa
  instrucao: string;          // Instrução para o barista (ex: "Despeje 50ml em círculos concentricos")
}

export interface ReceitaCafe {
  id: string;
  nome: string;               // Ex: "V60 Clássico (Método 4:6)", "Aeropress Invertido"
  metodo: string;             // Ex: "V60", "Aeropress", "Chemex", "Prensa Francesa"
  descricao: string;          // Breve resumo técnico da receita
  proporcaoPadrao: number;    // Ex: 15 (para 1:15)
  doseCafePadraoG: number;    // Ex: 18g
  etapas: EtapaReceita[];
}

export type StatusCronometro = 'idle' | 'running' | 'paused' | 'completed';

export interface EstadoCronometro {
  status: StatusCronometro;
  tempoDecorridoMs: number;     // Tempo acumulado em milissegundos
  tempoTotalSegundos: number;   // Tempo total formatado em segundos
  etapaAtualIndex: number;      // Índice da etapa em execução
  etapaAtual: EtapaReceita | null;
  proximaEtapa: EtapaReceita | null;
  progressoEtapaPercentual: number; // 0 a 100
  progressoTotalPercentual: number; // 0 a 100
  volumeAguaAtualMl: number;    // Quantidade recomendada despejada no momento
}
