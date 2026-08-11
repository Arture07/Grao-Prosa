import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Grao } from '../types/coffee';
import { graoRepository } from '../repositories/graoRepository';
import { degustacaoRepository } from '../repositories/degustacaoRepository';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';
import { 
  Coffee, 
  Plus, 
  AlertTriangle, 
  Star, 
  Trash2, 
  Edit3, 
  SlidersHorizontal,
  Scale,
  ChevronRight,
  BookOpen,
  Loader2
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
  const { t } = useTranslation();
  const [listaGraos, setListaGraos] = useState<Grao[]>(graos);
  const [mediasNotas, setMediasNotas] = useState<Record<string, { media: number; total: number }>>({});
  const [busca, setBusca] = useState('');
  const [deletandoId, setDeletandoId] = useState<string | null>(null);
  const [itemParaDeletar, setItemParaDeletar] = useState<string | null>(null);
  const [erroDelete, setErroDelete] = useState<string | null>(null);

  // Sincroniza o estado local quando a prop 'graos' for atualizada no componente pai
  useEffect(() => {
    setListaGraos(graos);
  }, [graos]);

  // Carrega as médias de avaliação de cada grão
  useEffect(() => {
    async function carregarMedias() {
      const medias: Record<string, { media: number; total: number }> = {};
      for (const g of listaGraos) {
        if (g.id) {
          const stats = await degustacaoRepository.calcularMediaNotaGrao(g.id);
          medias[g.id] = stats;
        }
      }
      setMediasNotas(medias);
    }
    if (listaGraos.length > 0) {
      carregarMedias();
    }
  }, [listaGraos]);

  // Função para confirmar e deletar um grão do estoque
  const handleConfirmarDeletar = async () => {
    if (!itemParaDeletar) return;
    const id = itemParaDeletar;
    setErroDelete(null);
    setDeletandoId(id);

    try {
      await graoRepository.deletar(id);
      // Atualiza instantaneamente o estado local APÓS o await ter sucesso
      setListaGraos(prev => prev.filter(item => item.id !== id));
      setItemParaDeletar(null);
      onRefresh();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error("ERRO FIREBASE:", errorMessage);
      setErroDelete(t('pantry.errorDelete'));
    } finally {
      setDeletandoId(null);
    }
  };

  // Filtragem
  const graosFiltrados = listaGraos.filter(g => 
    g.nome.toLowerCase().includes(busca.toLowerCase()) ||
    g.torrefacao.toLowerCase().includes(busca.toLowerCase()) ||
    g.origem.toLowerCase().includes(busca.toLowerCase())
  );

  // Estatísticas do Estoque
  const totalEstoqueGramas = listaGraos.reduce((acc, g) => acc + g.quantidadeRestante, 0);
  const graosBaixoEstoque = listaGraos.filter(g => g.quantidadeRestante <= 50).length;

  return (
    <div className="space-y-8 pb-12">
      {/* Banner de Erro de Exclusão */}
      {erroDelete && (
        <div className="stamped-border bg-red-50 text-red-800 p-3.5 text-xs font-sans flex items-center justify-between border-red-700">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-700 shrink-0" />
            <span>{erroDelete}</span>
          </div>
          <button 
            onClick={() => setErroDelete(null)}
            className="text-red-900 font-bold uppercase tracking-wider text-[10px] underline cursor-pointer"
          >
            {t('common.close')}
          </button>
        </div>
      )}

      {/* Title & Section Subtitle */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between border-b border-[#1A1A1A]/10 pb-4 gap-2">
        <div>
          <h2 className="font-serif text-3xl font-semibold tracking-tight text-[#1A1A1A]">
            {t('pantry.title')}
          </h2>
          <p className="font-sans text-[10px] uppercase tracking-[0.2em] opacity-60 mt-0.5">
            {t('pantry.subtitle')}
          </p>
        </div>

        <button
          onClick={onOpenNovoGrao}
          className="bg-[#1A1A1A] hover:bg-[#333] text-[#F5F2ED] px-4 py-2 font-sans text-xs uppercase tracking-widest font-medium transition-all flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          {t('pantry.addGrain')}
        </button>
      </div>

      {/* Cards de Resumo do Estoque */}
      <div className="space-y-3">
        {/* Linha 1: Grãos Cadastrados e Total em Estoque */}
        <div className="flex flex-row gap-3">
          <div className="flex-1 stamped-border bg-white/50 p-3.5 sm:p-5 flex items-center justify-between min-w-0">
            <div className="min-w-0">
              <p className="font-sans text-[9px] sm:text-[10px] uppercase tracking-wider sm:tracking-widest text-[#1A1A1A]/60 font-semibold truncate">
                {t('pantry.registeredGrains')}
              </p>
              <p className="font-serif text-2xl sm:text-3xl font-semibold text-[#1A1A1A] mt-0.5 sm:mt-1 truncate">
                {listaGraos.length}
              </p>
            </div>
            <Coffee className="w-5 h-5 sm:w-6 sm:h-6 text-[#5A4033] opacity-60 shrink-0 ml-1.5" />
          </div>

          <div className="flex-1 stamped-border bg-white/50 p-3.5 sm:p-5 flex items-center justify-between min-w-0">
            <div className="min-w-0">
              <p className="font-sans text-[9px] sm:text-[10px] uppercase tracking-wider sm:tracking-widest text-[#1A1A1A]/60 font-semibold truncate">
                {t('pantry.totalStock')}
              </p>
              <p className="font-serif text-2xl sm:text-3xl font-semibold text-[#1A1A1A] mt-0.5 sm:mt-1 truncate">
                {totalEstoqueGramas >= 1000 
                  ? `${(totalEstoqueGramas / 1000).toFixed(2)} kg` 
                  : `${totalEstoqueGramas} g`}
              </p>
            </div>
            <Scale className="w-5 h-5 sm:w-6 sm:h-6 text-[#5A4033] opacity-60 shrink-0 ml-1.5" />
          </div>
        </div>

        {/* Linha 2: Estoque Crítico */}
        {graosBaixoEstoque > 0 && (
          <div className="w-full stamped-border bg-red-50/70 border-red-200 p-3.5 sm:p-5 flex items-center justify-between">
            <div>
              <p className="font-sans text-[9px] sm:text-[10px] uppercase tracking-wider sm:tracking-widest text-red-900/80 font-bold">
                {t('pantry.criticalStock')}
              </p>
              <p className="font-serif text-2xl sm:text-3xl font-semibold text-red-700 mt-0.5 sm:mt-1">
                {graosBaixoEstoque} {graosBaixoEstoque === 1 ? t('pantry.criticalPackageSingular') : t('pantry.criticalPackagePlural')}
              </p>
            </div>
            <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-red-700 shrink-0 ml-2" />
          </div>
        )}
      </div>

      {/* Campo de Pesquisa */}
      <div className="relative">
        <input
          type="text"
          placeholder={t('pantry.searchPlaceholder')}
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
            {busca ? t('pantry.emptySearchTitle') : t('pantry.emptyPantryTitle')}
          </h3>
          <p className="font-sans text-xs text-[#1A1A1A]/60 max-w-md mx-auto">
            {busca 
              ? t('pantry.emptySearchDesc') 
              : t('pantry.emptyPantryDesc')}
          </p>
          {!busca && (
            <button
              onClick={onOpenNovoGrao}
              className="mt-4 inline-flex items-center gap-2 bg-[#1A1A1A] text-[#F5F2ED] px-5 py-2.5 font-sans text-xs uppercase tracking-widest font-medium cursor-pointer hover:bg-[#333]"
            >
              <Plus className="w-4 h-4" /> {t('pantry.registerFirstBatch')}
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
                        title={t('pantry.editGrain')}
                        className="p-1.5 text-[#1A1A1A]/40 hover:text-[#1A1A1A] transition-colors cursor-pointer"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (!grao.id) {
                            throw new Error('ID do documento está indefinido no botão');
                          }
                          setItemParaDeletar(grao.id);
                        }}
                        disabled={deletandoId === grao.id}
                        title={t('pantry.deleteGrain')}
                        className="p-1.5 text-[#1A1A1A]/40 hover:text-red-700 transition-colors cursor-pointer disabled:opacity-30"
                      >
                        {deletandoId === grao.id ? (
                          <Loader2 className="w-4 h-4 animate-spin text-red-700" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Badges / Detail Line */}
                  <p className="font-sans text-[11px] uppercase tracking-wider opacity-60 italic border-b border-[#1A1A1A]/10 pb-3">
                    {t('pantry.origin')}: {grao.origem} • {t('pantry.roast')} {grao.nivelTorra}
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
                        {stats.media > 0 ? stats.media.toFixed(1) : t('pantry.noRating')}
                      </span>
                      <span className="text-[10px] opacity-60">
                        ({stats.total} {stats.total === 1 ? t('pantry.ratingSingular') : t('pantry.ratingPlural')})
                      </span>
                    </div>

                    <button
                      onClick={() => onVerHistoricoGrao(grao.id)}
                      className="font-sans text-[10px] uppercase tracking-wider text-[#5A4033] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <BookOpen className="w-3 h-3" /> {t('pantry.viewJournal')}
                    </button>
                  </div>

                  {/* Stock Level Gauge */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between items-center text-xs font-sans">
                      <span className="text-[11px] font-medium opacity-70">{t('pantry.remainingAmount')}</span>
                      <span className={`font-bold ${isEstoqueBaixo ? 'text-red-700' : 'text-[#1A1A1A]'}`}>
                        {grao.quantidadeRestante}g {isEstoqueBaixo && t('pantry.lowStockWarning')}
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
                    <span>{t('pantry.rateCoffee')}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de Confirmação de Exclusão */}
      <ConfirmDeleteModal
        isOpen={!!itemParaDeletar}
        titulo={t('pantry.deleteModalTitle')}
        mensagem={t('pantry.deleteModalMessage')}
        isLoading={!!deletandoId}
        onConfirm={handleConfirmarDeletar}
        onCancel={() => setItemParaDeletar(null)}
      />
    </div>
  );
};
