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
        const docId = docSnap.id;
        graos.push({
          id: docId,
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
   * Salvar um novo grão no Firestore vinculado ao userId do usuário logado.
   * Se já existir um café com o exato mesmo nome, torrefação e origem criado hoje para este usuário,
   * mescla somando as quantidades restantes ao invés de criar um documento duplicado.
   */
  public async salvar(dto: CriarGraoDTO, userId?: string): Promise<Grao> {
    const currentUid = this.getEffectiveUid(userId);
    const nomeTrim = dto.nome.trim();
    const torrefacaoTrim = (dto.torrefacao || '').trim();
    const origemTrim = (dto.origem || '').trim();
    const qtdNova = Number(dto.quantidadeRestante) || 0;

    try {
      // 1. Buscar lotes do usuário com o mesmo nome
      const q = query(
        this.getCollection(), 
        where('userId', '==', currentUid),
        where('nome', '==', nomeTrim)
      );
      const querySnapshot = await getDocs(q);

      const hoje = new Date();
      let loteHoje: { id: string; data: any } | null = null;

      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const torrVal = (data.torrefacao || '').trim();
        const origVal = (data.origem || '').trim();

        // Verifica correspondência exata de torrefação e origem
        if (torrVal === torrefacaoTrim && origVal === origemTrim && data.criadoEm) {
          const dataCriacao = new Date(data.criadoEm);
          const mesmoDia = 
            dataCriacao.getFullYear() === hoje.getFullYear() &&
            dataCriacao.getMonth() === hoje.getMonth() &&
            dataCriacao.getDate() === hoje.getDate();

          if (mesmoDia) {
            loteHoje = { id: docSnap.id, data };
          }
        }
      });

      // 2. Se encontrou um lote criado hoje, soma a quantidade e atualiza o documento
      if (loteHoje) {
        const docId = loteHoje.id;
        const dadosAntigos = loteHoje.data;
        const qtdExistente = Number(dadosAntigos.quantidadeRestante) || 0;
        const novaQtdTotal = qtdExistente + qtdNova;

        const docRef = doc(db, this.collectionName, docId);
        await updateDoc(docRef, {
          quantidadeRestante: novaQtdTotal,
          nivelTorra: dto.nivelTorra || dadosAntigos.nivelTorra || 'Média'
        });

        return {
          id: docId,
          userId: currentUid,
          nome: nomeTrim,
          torrefacao: torrefacaoTrim,
          origem: origemTrim,
          nivelTorra: dto.nivelTorra || dadosAntigos.nivelTorra || 'Média',
          quantidadeRestante: novaQtdTotal,
          criadoEm: dadosAntigos.criadoEm || new Date().toISOString()
        };
      }

      // 3. Se não existe ou é de dia anterior, cria um novo lote (documento)
      const payload = {
        userId: currentUid,
        nome: nomeTrim,
        torrefacao: torrefacaoTrim,
        origem: origemTrim,
        nivelTorra: dto.nivelTorra || 'Média',
        quantidadeRestante: qtdNova,
        criadoEm: new Date().toISOString()
      };

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
  public async deletar(id: string): Promise<void> {
    if (!id) {
      console.error('ID do grão está indefinido para exclusão:', id);
      throw new Error('ID do documento está indefinido no botão');
    }
    const docRef = doc(db, this.collectionName, id);
    await deleteDoc(docRef);

    // Cascata: Remove degustações associadas a este grão no Firestore
    try {
      await degustacaoRepository.deletarPorGraoId(id);
    } catch (e) {
      console.warn('Aviso: Falha ao remover degustações em cascata:', e);
    }
  }
}

export const graoRepository = new GraoRepository();
