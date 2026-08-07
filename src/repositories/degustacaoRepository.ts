/**
 * REPOSITÓRIO DE DEGUSTAÇÕES FIRESTORE (DIÁRIO DE DEGUSTAÇÃO SENSORIAL)
 * 
 * Gerencia as avaliações e diário de degustações integrados ao Firebase Firestore,
 * na coleção 'degustacoes', mantendo relacionamento 1:N com a coleção 'graos'.
 */

import { 
  collection, 
  addDoc, 
  getDocs, 
  getDoc, 
  doc, 
  deleteDoc, 
  query, 
  where 
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../firebaseConfig';
import { Degustacao, CriarDegustacaoDTO } from '../types/coffee';

export class DegustacaoRepository {
  private collectionName = 'degustacoes';

  /**
   * Resolve o ID do usuário (autenticado ou convidado)
   */
  private getEffectiveUid(userId?: string): string {
    if (userId) return userId;
    if (auth.currentUser?.uid) return auth.currentUser.uid;
    let localId = localStorage.getItem('grao_guest_uid');
    if (!localId) {
      localId = 'guest_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
      localStorage.setItem('grao_guest_uid', localId);
    }
    return localId;
  }

  /**
   * Obtém a referência da coleção de degustações do Firestore
   */
  private getCollection() {
    return collection(db, this.collectionName);
  }

  /**
   * Listar todas as degustações cadastradas do usuário no Firestore (ordenado por data decrescente)
   */
  public async listarTodos(userId?: string): Promise<Degustacao[]> {
    const currentUid = this.getEffectiveUid(userId);

    try {
      const q = query(this.getCollection(), where('userId', '==', currentUid));
      const querySnapshot = await getDocs(q);

      const degustacoes: Degustacao[] = [];
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        degustacoes.push({
          id: docSnap.id,
          userId: data.userId,
          graoId: data.graoId || '',
          graoNomeSnapshot: data.graoNomeSnapshot || '',
          metodo: data.metodo || data.metodoPreparo || 'V60',
          metodoPreparo: data.metodoPreparo || data.metodo || 'V60',
          dose: Number(data.dose ?? data.doseGramas) || 0,
          doseGramas: Number(data.doseGramas ?? data.dose) || 0,
          agua: Number(data.agua ?? data.volumeAguaMl) || 0,
          volumeAguaMl: Number(data.volumeAguaMl ?? data.agua) || 0,
          descritores: Array.isArray(data.descritores) 
            ? data.descritores 
            : (Array.isArray(data.notasSensoriais) ? data.notasSensoriais : []),
          notasSensoriais: Array.isArray(data.notasSensoriais) 
            ? data.notasSensoriais 
            : (Array.isArray(data.descritores) ? data.descritores : []),
          impressoes: data.impressoes || data.observacoes || '',
          observacoes: data.observacoes || data.impressoes || '',
          nota: Number(data.nota) || 5,
          criadoEm: data.criadoEm || new Date().toISOString(),
          data: data.data || (data.criadoEm ? data.criadoEm.split('T')[0] : new Date().toISOString().split('T')[0])
        });
      });

      // Ordenar por data decrescente (mais recentes primeiro)
      return degustacoes.sort((a, b) => {
        const timeA = new Date(a.criadoEm || a.data).getTime();
        const timeB = new Date(b.criadoEm || b.data).getTime();
        return timeB - timeA;
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, this.collectionName);
      return [];
    }
  }

  /**
   * Alias para compatibilidade
   */
  public async listarTodas(userId?: string): Promise<Degustacao[]> {
    return this.listarTodos(userId);
  }

  /**
   * Listar degustações filtradas por um grão específico
   */
  public async listarPorGraoId(graoId: string, userId?: string): Promise<Degustacao[]> {
    const todas = await this.listarTodos(userId);
    return todas.filter(d => d.graoId === graoId);
  }

  /**
   * Buscar registro de degustação por ID no Firestore
   */
  public async buscarPorId(id: string): Promise<Degustacao | null> {
    try {
      const docRef = doc(db, this.collectionName, id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return null;
      }

      const data = docSnap.data();
      return {
        id: docSnap.id,
        userId: data.userId,
        graoId: data.graoId || '',
        graoNomeSnapshot: data.graoNomeSnapshot || '',
        metodo: data.metodo || data.metodoPreparo || 'V60',
        metodoPreparo: data.metodoPreparo || data.metodo || 'V60',
        dose: Number(data.dose ?? data.doseGramas) || 0,
        doseGramas: Number(data.doseGramas ?? data.dose) || 0,
        agua: Number(data.agua ?? data.volumeAguaMl) || 0,
        volumeAguaMl: Number(data.volumeAguaMl ?? data.agua) || 0,
        descritores: Array.isArray(data.descritores) ? data.descritores : (Array.isArray(data.notasSensoriais) ? data.notasSensoriais : []),
        notasSensoriais: Array.isArray(data.notasSensoriais) ? data.notasSensoriais : (Array.isArray(data.descritores) ? data.descritores : []),
        impressoes: data.impressoes || data.observacoes || '',
        observacoes: data.observacoes || data.impressoes || '',
        nota: Number(data.nota) || 5,
        criadoEm: data.criadoEm || new Date().toISOString(),
        data: data.data || (data.criadoEm ? data.criadoEm.split('T')[0] : new Date().toISOString().split('T')[0])
      };
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `${this.collectionName}/${id}`);
      return null;
    }
  }

  /**
   * Salvar uma nova degustação no Firestore vinculada ao userId do usuário logado
   */
  public async salvar(dto: CriarDegustacaoDTO, userId?: string): Promise<Degustacao> {
    const currentUid = this.getEffectiveUid(userId);

    const graoNomeSnapshot = (dto as any).graoNomeSnapshot || dto.graoNomeSnapshot || '';
    const metodoVal = dto.metodoPreparo || (dto as any).metodo || 'V60';
    const doseVal = Number(dto.doseGramas ?? (dto as any).dose) || 0;
    const aguaVal = Number(dto.volumeAguaMl ?? (dto as any).agua) || 0;
    const descritoresVal = Array.isArray(dto.notasSensoriais) 
      ? dto.notasSensoriais 
      : (Array.isArray((dto as any).descritores) ? (dto as any).descritores : []);
    const impressoesVal = (dto.observacoes || (dto as any).impressoes || '').trim();
    const dataVal = dto.data || new Date().toISOString().split('T')[0];
    const criadoEmVal = new Date(dataVal).toISOString();

    const payload = {
      userId: currentUid,
      graoId: dto.graoId || '',
      graoNomeSnapshot,
      metodo: metodoVal,
      metodoPreparo: metodoVal,
      dose: doseVal,
      doseGramas: doseVal,
      agua: aguaVal,
      volumeAguaMl: aguaVal,
      descritores: descritoresVal,
      notasSensoriais: descritoresVal,
      impressoes: impressoesVal,
      observacoes: impressoesVal,
      nota: Math.min(5, Math.max(1, Number(dto.nota) || 5)),
      criadoEm: criadoEmVal,
      data: dataVal
    };

    try {
      const docRef = await addDoc(this.getCollection(), payload);
      return {
        id: docRef.id,
        ...payload
      };
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, this.collectionName);
      throw error;
    }
  }

  /**
   * Deletar uma degustação do Firestore
   */
  public async deletar(id: string): Promise<boolean> {
    try {
      const docRef = doc(db, this.collectionName, id);
      await deleteDoc(docRef);
      return true;
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `${this.collectionName}/${id}`);
      return false;
    }
  }

  /**
   * Deletar todas as degustações associadas a um determinado grão
   */
  public async deletarPorGraoId(graoId: string, userId?: string): Promise<number> {
    try {
      const todas = await this.listarPorGraoId(graoId, userId);
      let removidos = 0;
      for (const d of todas) {
        await this.deletar(d.id);
        removidos++;
      }
      return removidos;
    } catch (error) {
      console.error('Erro ao deletar degustações por graoId:', error);
      return 0;
    }
  }

  /**
   * Média de nota de um grão baseado no seu histórico de degustações
   */
  public async calcularMediaNotaGrao(graoId: string, userId?: string): Promise<{ media: number; total: number }> {
    const degustacoes = await this.listarPorGraoId(graoId, userId);
    if (degustacoes.length === 0) return { media: 0, total: 0 };

    const soma = degustacoes.reduce((acc, curr) => acc + curr.nota, 0);
    return {
      media: Number((soma / degustacoes.length).toFixed(1)),
      total: degustacoes.length
    };
  }
}

export const degustacaoRepository = new DegustacaoRepository();
