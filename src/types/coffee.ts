/**
 * ARQUITETURA DE DOMÍNIO - CAFÉ DESPENSA & DEGUSTAÇÃO
 * 
 * Este arquivo contém as definições de tipos e interfaces do domínio.
 * Em um projeto React Native, estes modelos são compartilhados entre os
 * componentes de UI, repositórios de dados e ORM (ex: WatermelonDB, TypeORM)
 * ou adaptadores de banco de dados (SQLite/AsyncStorage).
 */

// Níveis de Torra do Café
export type NivelTorra = 
  | 'Clara' 
  | 'Média-Clara' 
  | 'Média' 
  | 'Média-Escura' 
  | 'Escura';

// Métodos de Preparo Populares
export type MetodoPreparo = 
  | 'V60' 
  | 'Prensa Francesa' 
  | 'Espresso' 
  | 'Aeropress' 
  | 'Chemex' 
  | 'Moka / Cafeteira Italiana' 
  | 'Pressca' 
  | 'Koar' 
  | 'Clever' 
  | 'Filtro de Pano' 
  | 'Outro';

/**
 * Entidade Grão (Estoque na Despensa)
 * Mapeamento de Tabela SQLite:
 * CREATE TABLE graos (
 *   id TEXT PRIMARY KEY,
 *   nome TEXT NOT NULL,
 *   torrefacao TEXT NOT NULL,
 *   origem TEXT NOT NULL,
 *   nivelTorra TEXT NOT NULL,
 *   quantidadeRestante REAL NOT NULL DEFAULT 0,
 *   criadoEm TEXT NOT NULL
 * );
 */
export interface Grao {
  id: string;
  userId?: string;           // UID do usuário proprietário do grão no Firestore
  nome: string;               // Ex: "Fazenda Primavera - Catuaí Vermelho"
  torrefacao: string;         // Ex: "Coffee Lab", "Um Coffee Co.", "Academia do Café"
  origem: string;             // Ex: "Sul de Minas", "Cerrado Mineiro", "Alta Mogiana", "Colômbia"
  nivelTorra: NivelTorra;     // Ex: "Média"
  quantidadeRestante: number; // Em gramas (g), ex: 250
  criadoEm: string;           // ISO Date string
}

/**
 * Entidade Degustação (Diário de Avaliação)
 * Mapeamento de Tabela SQLite:
 * CREATE TABLE degustacoes (
 *   id TEXT PRIMARY KEY,
 *   graoId TEXT NOT NULL,
 *   data TEXT NOT NULL,
 *   metodoPreparo TEXT NOT NULL,
 *   nota INTEGER CHECK(nota >= 1 AND nota <= 5),
 *   notasSensoriais TEXT NOT NULL, -- Armazenado como JSON Stringified em SQLite: ["frutado", "achocolatado"]
 *   doseGramas REAL,               -- Opcional: Gramas usadas na receita (ex: 18g)
 *   volumeAguaMl REAL,            -- Opcional: Volume de água (ex: 250ml)
 *   observacoes TEXT,              -- Opcional: Comentários adicionais
 *   FOREIGN KEY (graoId) REFERENCES graos(id) ON DELETE CASCADE
 * );
 */
export interface Degustacao {
  id: string;
  userId?: string;            // UID do usuário no Firestore
  graoId: string;             // Relacionamento (Chave Estrangeira) com a entidade Grao
  graoNomeSnapshot?: string;  // Cópia do nome do grão para preservar histórico
  data: string;               // Data da degustação
  metodoPreparo: MetodoPreparo | string; // Método utilizado no preparo
  metodo?: string;            // Alias para metodoPreparo
  nota: number;               // Avaliação de 1 a 5 estrelas
  notasSensoriais: string[];  // Array de descritores sensoriais
  descritores?: string[];     // Alias para notasSensoriais
  doseGramas?: number;        // Gramas de café usadas
  dose?: number;              // Alias para doseGramas
  volumeAguaMl?: number;      // Ml de água
  agua?: number;              // Alias para volumeAguaMl
  observacoes?: string;       // Notas/Comentários sobre a extração
  impressoes?: string;        // Alias para observacoes
  criadoEm?: string;          // Timestamp ISO de criação
}

// Tipo DTO para criação de novos Grãos (sem id e criadoEm)
export type CriarGraoDTO = Omit<Grao, 'id' | 'criadoEm'>;

// Tipo DTO para atualização de Grãos
export type AtualizarGraoDTO = Partial<CriarGraoDTO>;

// Tipo DTO para criação de novas Degustações (sem id)
export type CriarDegustacaoDTO = Omit<Degustacao, 'id'>;

// Lista de Notas Sensoriais pré-definidas comuns
export const NOTAS_SENSORIAIS_SUGERIDAS = [
  'Frutado',
  'Achocolatado',
  'Cítrico',
  'Floral',
  'Caramelo',
  'Nozes / Castanhas',
  'Especiarias',
  'Mel',
  'Vinado / Fermentado',
  'Amêndoa',
  'Cacau Amargo',
  'Rapadura',
  'Baunilha',
  'Frutas Vermelhas',
  'Frutas Amarelas',
  'Herbal / Chá'
];

export const NIVEIS_TORRA: NivelTorra[] = [
  'Clara',
  'Média-Clara',
  'Média',
  'Média-Escura',
  'Escura'
];

export const METODOS_PREPARO: MetodoPreparo[] = [
  'V60',
  'Prensa Francesa',
  'Espresso',
  'Aeropress',
  'Chemex',
  'Moka / Cafeteira Italiana',
  'Pressca',
  'Koar',
  'Clever',
  'Filtro de Pano',
  'Outro'
];
