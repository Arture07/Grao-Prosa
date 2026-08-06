import React, { useState } from 'react';
import { Degustacao, Grao } from '../types/coffee';
import { degustacaoRepository } from '../repositories/degustacaoRepository';
import { 
  BookOpen, 
  Star, 
  Calendar, 
  Coffee, 
  Trash2, 
  Search, 
  Scale, 
  Droplet,
  Tag,
  FileText
} from 'lucide-react';

interface DiarioViewProps {
  degustacoes: Degustacao[];
  graosMap: Record<string, Grao>;
  onRefresh: () => void;
  onNovaDegustacaoClick: () => void;
  filtroGraoId?: string;
  onClearFiltroGrao?: () => void;
}

export const DiarioView: React.FC<DiarioViewProps> = ({
  degustacoes,
  graosMap,
  onRefresh,
  onNovaDegustacaoClick,
  filtroGraoId,
  onClearFiltroGrao
}) => {
  const [busca, setBusca] = useState('');
  const [metodoFiltro, setMetodoFiltro] = useState<string>('todos');
  const [deletandoId, setDeletandoId] = useState<string | null>(null);

  // Filtragem
  const degustacoesFiltradas = degustacoes.filter((d) => {
    const grao = graosMap[d.graoId];
    const nomeGrao = grao ? grao.nome.toLowerCase() : '';
    const torrefacao = grao ? grao.torrefacao.toLowerCase() : '';
    const termoBusca = busca.toLowerCase();

    // Filtro por Grão
    if (filtroGraoId && d.graoId !== filtroGraoId) return false;

    // Filtro por Método
    if (metodoFiltro !== 'todos' && d.metodoPreparo !== metodoFiltro) return false;

    // Filtro de Texto
    const bateTexto = 
      nomeGrao.includes(termoBusca) ||
      torrefacao.includes(termoBusca) ||
      d.metodoPreparo.toLowerCase().includes(termoBusca) ||
      d.notasSensoriais.some(tag => tag.toLowerCase().includes(termoBusca)) ||
      (d.observacoes && d.observacoes.toLowerCase().includes(termoBusca));

    return bateTexto;
  });

  const handleDeletarDegustacao = async (id: string) => {
    if (confirm('Deseja realmente remover esta nota de degustação do seu diário?')) {
      setDeletandoId(id);
      try {
        await degustacaoRepository.deletar(id);
        onRefresh();
      } catch (err) {
        console.error('Erro ao deletar degustação:', err);
        alert('Falha ao remover o registro.');
      } finally {
        setDeletandoId(null);
      }
    }
  };

  const graoFiltroNome = filtroGraoId && graosMap[filtroGraoId] ? graosMap[filtroGraoId].nome : null;

  return (
    <div className="space-y-8 pb-12">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between border-b border-[#1A1A1A]/10 pb-4 gap-2">
        <div>
          <h2 className="font-serif text-3xl font-semibold tracking-tight text-[#1A1A1A]">
            03. Diário Sensorial
          </h2>
          <p className="font-sans text-[10px] uppercase tracking-[0.2em] opacity-60 mt-0.5">
            Histórico e Avaliações de Preparo
          </p>
        </div>

        <button
          onClick={onNovaDegustacaoClick}
          className="bg-[#1A1A1A] hover:bg-[#333] text-[#F5F2ED] px-4 py-2 font-sans text-xs uppercase tracking-widest font-medium transition-all flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <Coffee className="w-4 h-4" /> Registrar Degustação
        </button>
      </div>

      {/* Active Grain Filter Badge */}
      {graoFiltroNome && (
        <div className="stamped-border bg-amber-50/60 p-3 flex items-center justify-between text-xs font-sans text-[#5A4033]">
          <span>Exibindo histórico para o grão: <strong>{graoFiltroNome}</strong></span>
          <button
            onClick={onClearFiltroGrao}
            className="text-[#1A1A1A] hover:underline uppercase tracking-wider text-[10px] font-bold cursor-pointer"
          >
            Limpar Filtro
          </button>
        </div>
      )}

      {/* Search and Filter Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="sm:col-span-2 relative">
          <input
            type="text"
            placeholder="Buscar por grão, descritores sensoriais ou notas..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full bg-white/80 stamped-border pl-10 pr-4 py-2.5 text-xs font-sans text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A]"
          />
          <Search className="w-4 h-4 text-[#1A1A1A]/40 absolute left-3.5 top-3" />
        </div>

        <select
          value={metodoFiltro}
          onChange={(e) => setMetodoFiltro(e.target.value)}
          className="bg-white/80 stamped-border px-3 py-2.5 text-xs font-sans text-[#1A1A1A] focus:outline-none cursor-pointer"
        >
          <option value="todos">Todos os Métodos</option>
          <option value="V60">V60</option>
          <option value="Prensa Francesa">Prensa Francesa</option>
          <option value="Espresso">Espresso</option>
          <option value="Aeropress">Aeropress</option>
          <option value="Chemex">Chemex</option>
          <option value="Moka / Cafeteira Italiana">Moka</option>
        </select>
      </div>

      {/* Entry List */}
      {degustacoesFiltradas.length === 0 ? (
        <div className="stamped-border p-12 text-center bg-white/30 space-y-3">
          <BookOpen className="w-8 h-8 text-[#5A4033] opacity-40 mx-auto" />
          <h3 className="font-serif text-2xl text-[#1A1A1A] italic">Nenhum registro encontrado</h3>
          <p className="font-sans text-xs text-[#1A1A1A]/60 max-w-sm mx-auto">
            {busca || metodoFiltro !== 'todos' || filtroGraoId
              ? 'Nenhuma degustação corresponde aos filtros aplicados.'
              : 'Seu diário ainda não possui avaliações registradas. Extraia um café e faça seu primeiro registro!'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {degustacoesFiltradas.map((d) => {
            const grao = graosMap[d.graoId];

            return (
              <div
                key={d.id}
                className="stamped-border bg-white/60 p-6 space-y-4 hover:bg-white transition-all relative"
              >
                {/* Header Line */}
                <div className="flex items-start justify-between gap-3 border-b border-[#1A1A1A]/10 pb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-sans text-[10px] font-bold uppercase tracking-widest bg-[#1A1A1A] text-[#F5F2ED] px-2 py-0.5">
                        {d.metodoPreparo}
                      </span>
                      <span className="font-sans text-[10px] text-[#1A1A1A]/60 uppercase tracking-widest flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {d.data}
                      </span>
                    </div>

                    <h3 className="font-serif text-2xl font-semibold text-[#1A1A1A]">
                      {grao ? grao.nome : 'Grão Removido do Estoque'}
                    </h3>
                    {grao && (
                      <p className="font-sans text-[11px] uppercase tracking-wider opacity-60 italic mt-0.5">
                        {grao.torrefacao} • Torra {grao.nivelTorra} • Origem: {grao.origem}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Star Rating */}
                    <div className="flex items-center gap-1 border border-[#1A1A1A] px-2.5 py-1">
                      <Star className="w-3.5 h-3.5 fill-[#1A1A1A] text-[#1A1A1A]" />
                      <span className="font-serif font-bold text-sm text-[#1A1A1A]">{d.nota}/5</span>
                    </div>

                    <button
                      onClick={() => handleDeletarDegustacao(d.id)}
                      disabled={deletandoId === d.id}
                      title="Excluir Registro"
                      className="p-1.5 text-[#1A1A1A]/40 hover:text-red-700 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Parameters */}
                {(d.doseGramas || d.volumeAguaMl) && (
                  <div className="flex items-center gap-4 text-xs font-sans text-[#1A1A1A]/80 border-b border-[#1A1A1A]/5 pb-3">
                    {d.doseGramas && (
                      <span className="flex items-center gap-1">
                        <Scale className="w-3.5 h-3.5 text-[#5A4033]" /> Dose: <strong>{d.doseGramas}g</strong>
                      </span>
                    )}
                    {d.volumeAguaMl && (
                      <span className="flex items-center gap-1">
                        <Droplet className="w-3.5 h-3.5 text-[#5A4033]" /> Água: <strong>{d.volumeAguaMl}ml</strong>
                      </span>
                    )}
                    {d.doseGramas && d.volumeAguaMl && (
                      <span className="text-[10px] font-mono opacity-60">
                        Proporção: 1:{(d.volumeAguaMl / d.doseGramas).toFixed(1)}
                      </span>
                    )}
                  </div>
                )}

                {/* Sensory Descriptors / Tags */}
                {d.notasSensoriais.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="font-sans text-[10px] uppercase tracking-wider text-[#5A4033] font-semibold mr-1 flex items-center gap-1">
                      <Tag className="w-3 h-3" /> Descritores:
                    </span>
                    {d.notasSensoriais.map((tag) => (
                      <span
                        key={tag}
                        className="editorial-pill bg-[#F5F2ED] text-[#1A1A1A]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Notes */}
                {d.observacoes && (
                  <div className="stamped-border bg-[#F5F2ED]/60 p-3.5 text-xs text-[#1A1A1A] space-y-1">
                    <span className="font-sans text-[10px] uppercase tracking-wider font-semibold text-[#5A4033] flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5" /> Impressões do Preparo:
                    </span>
                    <p className="font-serif italic text-[#1A1A1A]/80 text-sm leading-relaxed">{d.observacoes}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
