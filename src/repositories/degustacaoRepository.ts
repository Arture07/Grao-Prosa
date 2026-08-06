/**
 * REPOSITÓRIO DE DEGUSTAÇÕES (DIÁRIO DE DEGUSTAÇÃO)
 * 
 * Gerencia o diário de avaliações, notas sensoriais e histórico de preparos.
 */

import { dbAdapter } from '../database/databaseAdapter';
import { Degustacao, CriarDegustacaoDTO } from '../types/coffee';

export class DegustacaoRepository {
  private key = dbAdapter.getKeys().DEGUSTACOES;

  /**
   * Listar todas as degustações cadastradas no diário
   */
  public async listarTodas(): Promise<Degustacao[]> {
    const degustacoes = await dbAdapter.getItem<Degustacao>(this.key);
    // Ordenar pelas mais recentes pela data de avaliação
    return degustacoes.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
  }

  /**
   * Listar degustações filtradas por um grão específico
   */
  public async listarPorGraoId(graoId: string): Promise<Degustacao[]> {
    const todas = await this.listarTodas();
    return todas.filter(d => d.graoId === graoId);
  }

  /**
   * Buscar registro de degustação por ID
   */
  public async buscarPorId(id: string): Promise<Degustacao | null> {
    const todas = await this.listarTodas();
    return todas.find(d => d.id === id) || null;
  }

  /**
   * Salvar uma nova degustação no diário
   */
  public async salvar(dto: CriarDegustacaoDTO): Promise<Degustacao> {
    const todas = await this.listarTodas();

    const novaDegustacao: Degustacao = {
      ...dto,
      id: `degust-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      data: dto.data || new Date().toISOString().split('T')[0],
      nota: Math.min(5, Math.max(1, Number(dto.nota) || 5)),
      notasSensoriais: Array.isArray(dto.notasSensoriais) ? dto.notasSensoriais : []
    };

    const novaLista = [novaDegustacao, ...todas];
    await dbAdapter.setItem(this.key, novaLista);

    return novaDegustacao;
  }

  /**
   * Deletar uma degustação específica
   */
  public async deletar(id: string): Promise<boolean> {
    const todas = await this.listarTodas();
    const novaLista = todas.filter(d => d.id !== id);

    if (novaLista.length === todas.length) {
      return false;
    }

    await dbAdapter.setItem(this.key, novaLista);
    return true;
  }

  /**
   * Deletar todas as degustações associadas a um determinado grão (exclusão em cascata)
   */
  public async deletarPorGraoId(graoId: string): Promise<number> {
    const todas = await this.listarTodas();
    const filtradas = todas.filter(d => d.graoId !== graoId);
    const removidos = todas.length - filtradas.length;

    if (removidos > 0) {
      await dbAdapter.setItem(this.key, filtradas);
    }

    return removidos;
  }

  /**
   * Média de nota de um grão baseado no seu histórico de degustações
   */
  public async calcularMediaNotaGrao(graoId: string): Promise<{ media: number; total: number }> {
    const degustacoes = await this.listarPorGraoId(graoId);
    if (degustacoes.length === 0) return { media: 0, total: 0 };

    const soma = degustacoes.reduce((acc, curr) => acc + curr.nota, 0);
    return {
      media: Number((soma / degustacoes.length).toFixed(1)),
      total: degustacoes.length
    };
  }
}

export const degustacaoRepository = new DegustacaoRepository();
