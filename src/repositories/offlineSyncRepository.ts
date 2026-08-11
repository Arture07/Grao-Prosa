import { CriarDegustacaoDTO, Degustacao } from '../types/coffee';
import { degustacaoRepository } from './degustacaoRepository';
import { graoRepository } from './graoRepository';

export interface OfflineDegustacaoItem {
  id: string;
  dto: CriarDegustacaoDTO & {
    userId?: string;
    graoNomeSnapshot?: string;
    metodo?: string;
    dose?: number;
    agua?: number;
    descritores?: string[];
    impressoes?: string;
    ratio?: string;
    criadoEm?: string;
  };
  abaterEstoque: boolean;
  doseGramas: number;
  graoId: string;
  timestamp: number;
}

const LOCAL_STORAGE_KEY = 'grao_offline_degustacoes';

export class OfflineSyncRepository {
  /**
   * Retorna a lista de degustações salvas localmente enquanto offline
   */
  public getPending(): OfflineDegustacaoItem[] {
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error('Erro ao ler degustações offline do localStorage:', e);
      return [];
    }
  }

  /**
   * Adiciona uma nova degustação à fila offline local
   */
  public addPending(
    dto: CriarDegustacaoDTO & Record<string, any>,
    abaterEstoque: boolean,
    doseGramas: number,
    graoId: string
  ): OfflineDegustacaoItem {
    const pendingList = this.getPending();
    const newItem: OfflineDegustacaoItem = {
      id: `offline_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      dto,
      abaterEstoque,
      doseGramas,
      graoId,
      timestamp: Date.now()
    };
    pendingList.push(newItem);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(pendingList));
    return newItem;
  }

  /**
   * Remove um item da fila offline pelo ID
   */
  public removePending(id: string): void {
    const pendingList = this.getPending();
    const filtered = pendingList.filter(item => item.id !== id);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(filtered));
  }

  /**
   * Limpa toda a fila offline
   */
  public clearAll(): void {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  }

  /**
   * Converte a fila de itens pendentes em objetos Degustacao para renderização otimista
   */
  public getOptimisticDegustacoes(): Degustacao[] {
    const pending = this.getPending();
    return pending.map(item => ({
      id: item.id,
      userId: item.dto.userId,
      graoId: item.graoId,
      graoNomeSnapshot: item.dto.graoNomeSnapshot || 'Grão em Estoque',
      data: item.dto.data || new Date().toISOString().split('T')[0],
      metodoPreparo: item.dto.metodoPreparo || item.dto.metodo || 'V60',
      metodo: item.dto.metodoPreparo || item.dto.metodo || 'V60',
      nota: Number(item.dto.nota) || 5,
      notasSensoriais: item.dto.notasSensoriais || item.dto.descritores || [],
      descritores: item.dto.descritores || item.dto.notasSensoriais || [],
      doseGramas: item.doseGramas,
      dose: item.doseGramas,
      volumeAguaMl: Number(item.dto.volumeAguaMl ?? item.dto.agua) || 0,
      agua: Number(item.dto.agua ?? item.dto.volumeAguaMl) || 0,
      observacoes: item.dto.observacoes || item.dto.impressoes || '',
      impressoes: item.dto.impressoes || item.dto.observacoes || '',
      ratio: item.dto.ratio || '1:--',
      criadoEm: item.dto.criadoEm || new Date(item.timestamp).toISOString(),
      isPendingSync: true
    }));
  }

  /**
   * Sincroniza todos os itens da fila offline com o Firestore
   */
  public async sincronizarTudo(userId?: string): Promise<{ sucessoCount: number; falhaCount: number }> {
    const pendingList = this.getPending();
    if (pendingList.length === 0) {
      return { sucessoCount: 0, falhaCount: 0 };
    }

    let sucessoCount = 0;
    let falhaCount = 0;

    for (const item of pendingList) {
      try {
        // 1. Salvar degustação no Firestore
        await degustacaoRepository.salvar(item.dto, userId);

        // 2. Se configurado para abater estoque, abater quantidade do grão no Firestore
        if (item.abaterEstoque && item.doseGramas > 0 && item.graoId) {
          try {
            await graoRepository.abaterEstoque(item.graoId, item.doseGramas, userId);
          } catch (errEstoque) {
            console.warn('Aviso ao abater estoque durante sincronização offline:', errEstoque);
          }
        }

        // Remove do armazenamento local após salvar com sucesso
        this.removePending(item.id);
        sucessoCount++;
      } catch (err) {
        console.error(`Erro ao sincronizar item offline ${item.id}:`, err);
        falhaCount++;
      }
    }

    return { sucessoCount, falhaCount };
  }
}

export const offlineSyncRepository = new OfflineSyncRepository();
