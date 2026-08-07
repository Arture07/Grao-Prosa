/**
 * REPOSITÓRIO DE GRÃOS FIRESTORE (ESTOQUE / MINHA DESPENSA)
 * 
 * Padrão Repository refatorado para integração nativa com o Cloud Firestore.
 * Armazena e recupera grãos da coleção 'graos', associando cada registro ao userId.
 */

import { 
  collection, 
  addDoc, 
  getDocs, 
  getDoc, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where 
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../firebaseConfig';
import { Grao, CriarGraoDTO, AtualizarGraoDTO } from '../types/coffee';
import { degustacaoRepository } from './degustacaoRepository';

export class GraoRepository {
  private collectionName = 'graos';

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
   * Obtém a referência da coleção de grãos do Firestore
   */
  private getCollection() {
    return collection(db, this.collectionName);
  }

  /**
   * Listar todos os grãos do usuário logado no Firestore
   */
  public async listarTodos(userId?: string): Promise<Grao[]> {
    const currentUid = this.getEffectiveUid(userId);

    try {
      const q = query(this.getCollection(), where('userId', '==', currentUid));
      const querySnapshot = await getDocs(q);

      const graos: Grao[] = [];
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        graos.push({
          id: docSnap.id,
          userId: data.userId,
          nome: data.nome || '',
          torrefacao: data.torrefacao || '',
          origem: data.origem || '',
          nivelTorra: data.nivelTorra || 'Média',
          quantidadeRestante: Number(data.quantidadeRestante) || 0,
          criadoEm: data.criadoEm || new Date().toISOString()
        });
      });

      // Ordena localmente por data de criação (mais recentes primeiro)
      return graos.sort((a, b) => new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime());
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, this.collectionName);
    }
  }

  /**
   * Buscar um grão específico pelo ID do documento Firestore
   */
  public async buscarPorId(id: string): Promise<Grao | null> {
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
        nome: data.nome || '',
        torrefacao: data.torrefacao || '',
        origem: data.origem || '',
        nivelTorra: data.nivelTorra || 'Média',
        quantidadeRestante: Number(data.quantidadeRestante) || 0,
        criadoEm: data.criadoEm || new Date().toISOString()
      };
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `${this.collectionName}/${id}`);
    }
  }

  /**
   * Salvar um novo grão no Firestore vinculado ao userId do usuário logado
   */
  public async salvar(dto: CriarGraoDTO, userId?: string): Promise<Grao> {
    const currentUid = this.getEffectiveUid(userId);

    const payload = {
      userId: currentUid,
      nome: dto.nome.trim(),
      torrefacao: (dto.torrefacao || '').trim(),
      origem: (dto.origem || '').trim(),
      nivelTorra: dto.nivelTorra || 'Média',
      quantidadeRestante: Number(dto.quantidadeRestante) || 0,
      criadoEm: new Date().toISOString()
    };

    try {
      const docRef = await addDoc(this.getCollection(), payload);
      return {
        id: docRef.id,
        ...payload
      };
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, this.collectionName);
    }
  }

  /**
   * Atualizar os dados de um grão existente no Firestore
   */
  public async atualizar(id: string, dto: AtualizarGraoDTO, userId?: string): Promise<Grao> {
    const currentUid = this.getEffectiveUid(userId);

    const docRef = doc(db, this.collectionName, id);

    const updatePayload: Record<string, any> = {
      userId: currentUid
    };

    if (dto.nome !== undefined) updatePayload.nome = dto.nome.trim();
    if (dto.torrefacao !== undefined) updatePayload.torrefacao = dto.torrefacao.trim();
    if (dto.origem !== undefined) updatePayload.origem = dto.origem.trim();
    if (dto.nivelTorra !== undefined) updatePayload.nivelTorra = dto.nivelTorra;
    if (dto.quantidadeRestante !== undefined) {
      updatePayload.quantidadeRestante = Math.max(0, Number(dto.quantidadeRestante));
    }

    try {
      await updateDoc(docRef, updatePayload);
      const atualizado = await this.buscarPorId(id);
      if (!atualizado) {
        throw new Error('Grão atualizado não encontrado');
      }
      return atualizado;
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${this.collectionName}/${id}`);
    }
  }

  /**
   * Abater quantidade consumida do estoque
   */
  public async abaterEstoque(id: string, quantidadeGramas: number, userId?: string): Promise<Grao> {
    const grao = await this.buscarPorId(id);
    if (!grao) throw new Error(`Grão com ID ${id} não encontrado.`);

    const novaQuantidade = Math.max(0, grao.quantidadeRestante - quantidadeGramas);
    return this.atualizar(id, { quantidadeRestante: novaQuantidade }, userId);
  }

  /**
   * Deletar um grão do Firestore e remover em cascata suas degustações associadas
   */
  public async deletar(id: string): Promise<boolean> {
    try {
      const docRef = doc(db, this.collectionName, id);
      await deleteDoc(docRef);

      // Cascata: Remove degustações locais/associadas a este grão
      try {
        await degustacaoRepository.deletarPorGraoId(id);
      } catch (e) {
        console.warn('Erro ao remover degustações em cascata:', e);
      }

      return true;
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `${this.collectionName}/${id}`);
    }
  }
}

export const graoRepository = new GraoRepository();
