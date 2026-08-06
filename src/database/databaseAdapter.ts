/**
 * BANCO DE DADOS LOCAL E ADAPTADOR DE PERSISTÊNCIA
 * 
 * Em React Native, este módulo seria implementado com:
 * 1. AsyncStorage: '@react-native-async-storage/async-storage' para chave-valor simples
 * 2. SQLite: 'expo-sqlite' ou 'react-native-quick-sqlite' para consultas relacionais em SQL
 * 3. WatermelonDB / Realm: para ORM reativo de alto desempenho
 * 
 * Abaixo implementamos uma camada DAO (Data Access Object) genérica assíncrona
 * que encapsula o armazenamento local garantindo a mesma interface assíncrona (Promises)
 * que um banco SQLite ou AsyncStorage utilizaria no mobile.
 */

import { Grao, Degustacao } from '../types/coffee';
import { GRAOS_INICIAIS, DEGUSTACOES_INICIAIS } from '../data/seedData';

const KEYS = {
  GRAOS: '@cafe_app:graos_v1',
  DEGUSTACOES: '@cafe_app:degustacoes_v1',
  INITIALIZED: '@cafe_app:is_initialized_v1',
};

/**
 * Simula operações I/O assíncronas do SQLite/AsyncStorage com tratamento de exceções
 */
export class LocalDatabaseAdapter {
  private static instance: LocalDatabaseAdapter;

  private constructor() {
    this.initializeDatabase();
  }

  public static getInstance(): LocalDatabaseAdapter {
    if (!LocalDatabaseAdapter.instance) {
      LocalDatabaseAdapter.instance = new LocalDatabaseAdapter();
    }
    return LocalDatabaseAdapter.instance;
  }

  /**
   * Inicializa o banco de dados com dados de semente (seed) caso esteja vazio.
   * Em React Native com SQLite, corresponderia à execução do `CREATE TABLE IF NOT EXISTS`
   */
  private initializeDatabase(): void {
    try {
      const isInitialized = localStorage.getItem(KEYS.INITIALIZED);
      if (!isInitialized) {
        localStorage.setItem(KEYS.GRAOS, JSON.stringify(GRAOS_INICIAIS));
        localStorage.setItem(KEYS.DEGUSTACOES, JSON.stringify(DEGUSTACOES_INICIAIS));
        localStorage.setItem(KEYS.INITIALIZED, 'true');
      }
    } catch (error) {
      console.error('Erro ao inicializar o banco local:', error);
    }
  }

  /**
   * Reseta o banco de dados para os dados padrão (útil para testes e depuração)
   */
  public async resetDatabase(): Promise<void> {
    try {
      localStorage.setItem(KEYS.GRAOS, JSON.stringify(GRAOS_INICIAIS));
      localStorage.setItem(KEYS.DEGUSTACOES, JSON.stringify(DEGUSTACOES_INICIAIS));
      localStorage.setItem(KEYS.INITIALIZED, 'true');
    } catch (error) {
      console.error('Erro ao resetar o banco:', error);
      throw error;
    }
  }

  // --- MÉTODOS DE LEITURA E ESCRITA GENÉRICOS ---

  public async getItem<T>(key: string): Promise<T[]> {
    return new Promise((resolve, reject) => {
      try {
        const raw = localStorage.getItem(key);
        if (!raw) return resolve([]);
        const parsed = JSON.parse(raw) as T[];
        resolve(parsed);
      } catch (error) {
        console.error(`Erro ao ler chave ${key} do banco local:`, error);
        reject(error);
      }
    });
  }

  public async setItem<T>(key: string, value: T[]): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        localStorage.setItem(key, JSON.stringify(value));
        resolve();
      } catch (error) {
        console.error(`Erro ao salvar chave ${key} no banco local:`, error);
        reject(error);
      }
    });
  }

  public getKeys() {
    return KEYS;
  }
}

export const dbAdapter = LocalDatabaseAdapter.getInstance();
