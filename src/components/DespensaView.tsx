import React, { useState, useEffect } from 'react';
import { Grao } from '../types/coffee';
import { graoRepository } from '../repositories/graoRepository';
import { degustacaoRepository } from '../repositories/degustacaoRepository';
import { 
  Coffee, 
  Plus, 
  AlertTriangle, 
  Star, 
  Trash2, 
  Edit3, 
  SlidersHorizontal,
  Scale,
  MapPin,
  Flame,
  ChevronRight,
  BookOpen
} from 'lucide-react';

interface DespensaViewProps {
  graos: Grao[];
  onRefresh: () => void;
  onOpenNovoGrao: () => void;
  onEditGrao: (grao: Grao) => void;
  onDegustarGrao: (graoId: string) => void;
  onVerHistoricoGrao: (graoId: string) => void;
}

export const DespensaView: React.FC<DespensaViewProps> = ({
  graos,
  onRefresh,
  onOpenNovoGrao,
  onEditGrao,
  onDegustarGrao,
  onVerHistoricoGrao
}) => {
  const [mediasNotas, setMediasNotas] = useState<Record<string, { media: number; total: number }>>({});
  const [busca, setBusca] = useState('');
  const [deletandoId, setDeletandoId] = useState<string | null>(null);

  // Carrega as médias de avaliação de cada grão
  useEffect(() => {
    async function carregarMedias() {
      const medias: Record<string, { media: number; total: number }> = {};
      for (const g of graos) {
        const stats = await degustacaoRepository.calcularMediaNotaGrao(g.id);
        medias[g.id] = stats;
      }
      setMediasNotas(medias);
    }
    carregarMedias();
  }, [graos]);

  // Função para deletar um grão do estoque
  const handleDeletar = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Tem certeza que deseja excluir este grão? Todas as degustações associadas a ele também serão removidas do diário.')) {
      setDeletandoId(id);
      try {
        await graoRepository.deletar(id);
        onRefresh();
      } catch (err) {
        console.error('Erro ao deletar grão:', err);
        alert('Falha ao excluir o grão.');
      } finally {
        setDeletandoId(null);
      }
    }
  };

  // Filtragem
  const graosFiltrados = graos.filter(g => 
    g.nome.toLowerCase().includes(busca.toLowerCase()) ||
    g.torrefacao.toLowerCase().includes(busca.toLowerCase()) ||
    g.origem.toLowerCase().includes(busca.toLowerCase())
  );

  // Estatísticas do Estoque
  const totalEstoqueGramas = graos.reduce((acc, g) => acc + g.quantidadeRestante, 0);
  const graosBaixoEstoque = graos.filter(g => g.quantidadeRestante <= 50).length;

  return (
    <div className="space-y-8 pb-12">
      {/* Title & Section Subtitle */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between border-b border-[#1A1A1A]/10 pb-4 gap-2">
        <div>
          <h2 className="font-serif text-3xl font-semibold tracking-tight text-[#1A1A1A]">
            01. Minha Despensa
          </h2>
          <p className="font-sans text-[10px] uppercase tracking-[0.2em] opacity-60 mt-0.5">
            Gerenciamento de Estoque Local
          </p>
        </div>

        <button
          onClick={onOpenNovoGrao}
          className="bg-[#1A1A1A] hover:bg-[#333] text-[#F5F2ED] px-4 py-2 font-sans text-xs uppercase tracking-widest font-medium transition-all flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Adicionar Grão
        </button>
      </div>

      {/* Cards de Resumo do Estoque (Editorial Style) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="stamped-border bg-white/50 p-5 flex items-center justify-between">
          <div>
            <p className="font-sans text-[10px] uppercase tracking-widest text-[#1A1A1A]/60 font-semibold">Grãos Cadastrados</p>
            <p className="font-serif text-3xl font-semibold text-[#1A1A1A] mt-1">{graos.length}</p>
          </div>
          <Coffee className="w-6 h-6 text-[#5A4033] opacity-60" />
        </div>

        <div className="stamped-border bg-white/50 p-5 flex items-center justify-between">
          <div>
            <p className="font-sans text-[10px] uppercase tracking-widest text-[#1A1A1A]/60 font-semibold">Total em Estoque</p>
            <p className="font-serif text-3xl font-semibold text-[#1A1A1A] mt-1">
              {totalEstoqueGramas >= 1000 
                ? `${(totalEstoqueGramas / 1000).toFixed(2)} kg` 
                : `${totalEstoqueGramas} g`}
            </p>
          </div>
          <Scale className="w-6 h-6 text-[#5A4033] opacity-60" />
        </div>

        <div className={`stamped-border p-5 flex items-center justify-between ${graosBaixoEstoque > 0 ? 'bg-red-50/50' : 'bg-white/50'}`}>
          <div>
            <p className="font-sans text-[10px] uppercase tracking-widest text-[#1A1A1A]/60 font-semibold">Estoque Crítico (≤50g)</p>
            <p className={`font-serif text-3xl font-semibold ${graosBaixoEstoque > 0 ? 'text-red-700' : 'text-[#1A1A1A]'} mt-1`}>
              {graosBaixoEstoque} {graosBaixoEstoque === 1 ? 'pacote' : 'pacotes'}
            </p>
          </div>
          <AlertTriangle className={`w-6 h-6 ${graosBaixoEstoque > 0 ? 'text-red-700' : 'text-[#1A1A1A]/40'}`} />
        </div>
      </div>

      {/* Campo de Pesquisa */}
      <div className="relative">
        <input
          type="text"
          placeholder="Buscar grão por nome, torrefação ou origem..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="w-full bg-white/80 stamped-border px-4 py-3 pl-10 text-xs font-sans text-[#1A1A1A] placeholder-[#1A1A1A]/40 focus:outline-none focus:border-[#1A1A1A]"
        />
        <SlidersHorizontal className="w-4 h-4 text-[#1A1A1A]/40 absolute left-3.5 top-3.5" />
      </div>

      {/* Lista de Grãos */}
      {graosFiltrados.length === 0 ? (
        <div className="stamped-border p-12 text-center bg-white/30 space-y-3">
          <Coffee className="w-8 h-8 text-[#5A4033] opacity-40 mx-auto" />
          <h3 className="font-serif text-2xl text-[#1A1A1A] italic">
            {busca ? 'Nenhum grão encontrado na busca' : 'Sua despensa de café está vazia'}
          </h3>
          <p className="font-sans text-xs text-[#1A1A1A]/60 max-w-md mx-auto">
            {busca 
              ? 'Tente utilizar outros termos de busca.' 
              : 'Cadastre seus lotes de café para controlar a quantidade restante em gramas e registrar preparos no diário.'}
          </p>
          {!busca && (
            <button
              onClick={onOpenNovoGrao}
              className="mt-4 inline-flex items-center gap-2 bg-[#1A1A1A] text-[#F5F2ED] px-5 py-2.5 font-sans text-xs uppercase tracking-widest font-medium cursor-pointer hover:bg-[#333]"
            >
              <Plus className="w-4 h-4" /> Cadastrar Primeiro Lote
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {graosFiltrados.map((grao) => {
            const stats = mediasNotas[grao.id] || { media: 0, total: 0 };
            const isEstoqueBaixo = grao.quantidadeRestante <= 50;
            const percentualEstoque = Math.min(100, Math.round((grao.quantidadeRestante / 250) * 100));

            return (
              <div
                key={grao.id}
                className="stamped-border bg-white/60 p-6 flex flex-col justify-between group hover:bg-white transition-all space-y-4 relative"
              >
                <div>
                  {/* Item Header */}
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <span className="font-sans text-[10px] uppercase tracking-widest opacity-60 font-semibold block">
                        {grao.torrefacao}
                      </span>
                      <h3 className="font-serif text-2xl font-semibold text-[#1A1A1A] group-hover:text-[#5A4033] transition-colors leading-tight mt-0.5">
                        {grao.nome}
                      </h3>
                    </div>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => onEditGrao(grao)}
                        title="Editar Grão"
                        className="p-1.5 text-[#1A1A1A]/40 hover:text-[#1A1A1A] transition-colors cursor-pointer"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => handleDeletar(grao.id, e)}
                        disabled={deletandoId === grao.id}
                        title="Excluir Grão"
                        className="p-1.5 text-[#1A1A1A]/40 hover:text-red-700 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Badges / Detail Line */}
                  <p className="font-sans text-[11px] uppercase tracking-wider opacity-60 italic border-b border-[#1A1A1A]/10 pb-3">
                    Origem: {grao.origem} • Torra {grao.nivelTorra}
                  </p>

                  {/* Rating Line */}
                  <div className="flex items-center justify-between py-2 text-xs font-sans">
                    <div className="flex items-center gap-1">
                      <div className="flex text-[#1A1A1A]">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-3.5 h-3.5 ${
                              star <= Math.round(stats.media) 
                                ? 'fill-[#1A1A1A] text-[#1A1A1A]' 
                                : 'text-[#1A1A1A]/20'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="font-bold text-[#1A1A1A] ml-1">
                        {stats.media > 0 ? stats.media.toFixed(1) : 'S/N'}
                      </span>
                      <span className="text-[10px] opacity-60">
                        ({stats.total} {stats.total === 1 ? 'avaliação' : 'avaliações'})
                      </span>
                    </div>

                    <button
                      onClick={() => onVerHistoricoGrao(grao.id)}
                      className="font-sans text-[10px] uppercase tracking-wider text-[#5A4033] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <BookOpen className="w-3 h-3" /> Ver Diário
                    </button>
                  </div>

                  {/* Stock Level Gauge (Editorial Style) */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between items-center text-xs font-sans">
                      <span className="text-[11px] font-medium opacity-70">Quantidade Restante:</span>
                      <span className={`font-bold ${isEstoqueBaixo ? 'text-red-700' : 'text-[#1A1A1A]'}`}>
                        {grao.quantidadeRestante}g {isEstoqueBaixo && '(Baixo!)'}
                      </span>
                    </div>

                    <div className="stock-meter">
                      <div
                        className={`stock-level ${isEstoqueBaixo ? 'bg-red-700' : ''}`}
                        style={{ width: `${percentualEstoque}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Main Action Button */}
                <div className="pt-2">
                  <button
                    onClick={() => onDegustarGrao(grao.id)}
                    className="w-full bg-[#1A1A1A] hover:bg-[#333] text-[#F5F2ED] py-3 px-4 font-sans text-xs uppercase tracking-widest font-medium transition-all flex items-center justify-between cursor-pointer"
                  >
                    <span>Avaliar este Café</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
