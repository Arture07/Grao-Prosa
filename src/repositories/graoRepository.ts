/**
 * REPOSITÓRIO DE GRÃOS (ESTOQUE / MINHA DESPENSA)
 * 
 * Padrão Repository: Separa a lógica de negócios e acesso a dados da UI.
 * Facilita a substituição da fonte de dados (ex: migrar de AsyncStorage para SQLite ou API REST).
 */

import { dbAdapter } from '../database/databaseAdapter';
import { Grao, CriarGraoDTO, AtualizarGraoDTO } from '../types/coffee';
import { degustacaoRepository } from './degustacaoRepository';

export class GraoRepository {
  private key = dbAdapter.getKeys().GRAOS;

  /**
   * Listar todos os grãos em estoque ordenados por data de cadastro (mais recentes primeiro)
   */
  public async listarTodos(): Promise<Grao[]> {
    const graos = await dbAdapter.getItem<Grao>(this.key);
    return graos.sort((a, b) => new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime());
  }

  /**
   * Buscar um grão específico pelo seu ID único
   */
  public async buscarPorId(id: string): Promise<Grao | null> {
    const graos = await this.listarTodos();
    return graos.find(g => g.id === id) || null;
  }

  /**
   * Salvar/Criar um novo grão no estoque
   */
  public async salvar(dto: CriarGraoDTO): Promise<Grao> {
    const graos = await this.listarTodos();
    const novoGrao: Grao = {
      ...dto,
      id: `grao-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      criadoEm: new Date().toISOString(),
      quantidadeRestante: Number(dto.quantidadeRestante) || 0
    };

    const novaLista = [novoGrao, ...graos];
    await dbAdapter.setItem(this.key, novaLista);
    return novoGrao;
  }

  /**
   * Atualizar os dados de um grão existente
   */
  public async atualizar(id: string, dto: AtualizarGraoDTO): Promise<Grao> {
    const graos = await this.listarTodos();
    const index = graos.findIndex(g => g.id === id);

    if (index === -1) {
      throw new Error(`Grão com ID ${id} não foi encontrado.`);
    }

    const graoAtualizado: Grao = {
      ...graos[index],
      ...dto,
      quantidadeRestante: dto.quantidadeRestante !== undefined 
        ? Math.max(0, Number(dto.quantidadeRestante))
        : graos[index].quantidadeRestante
    };

    graos[index] = graoAtualizado;
    await dbAdapter.setItem(this.key, graos);
    return graoAtualizado;
  }

  /**
   * Abater quantidade consumida do estoque (ex: ao realizar uma degustação)
   */
  public async abaterEstoque(id: string, quantidadeGramas: number): Promise<Grao> {
    const grao = await this.buscarPorId(id);
    if (!grao) throw new Error(`Grão com ID ${id} não encontrado.`);

    const novaQuantidade = Math.max(0, grao.quantidadeRestante - quantidadeGramas);
    return this.atualizar(id, { quantidadeRestante: novaQuantidade });
  }

  /**
   * Deletar um grão do estoque e remover em cascata suas degustações associadas
   */
  public async deletar(id: string): Promise<boolean> {
    const graos = await this.listarTodos();
    const novaLista = graos.filter(g => g.id !== id);

    if (novaLista.length === graos.length) {
      return false; // Nenhum item foi removido
    }

    await dbAdapter.setItem(this.key, novaLista);

    // Cascata: Remove todas as degustações associadas a este grão
    await degustacaoRepository.deletarPorGraoId(id);

    return true;
  }
}

export const graoRepository = new GraoRepository();
