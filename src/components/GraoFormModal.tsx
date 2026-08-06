import React, { useState, useEffect } from 'react';
import { Grao, CriarGraoDTO, NivelTorra, NIVEIS_TORRA } from '../types/coffee';
import { graoRepository } from '../repositories/graoRepository';
import { Coffee, X, Save, Scale, Flame, MapPin, Building2 } from 'lucide-react';

interface GraoFormModalProps {
  isOpen: boolean;
  graoParaEditar?: Grao | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const GraoFormModal: React.FC<GraoFormModalProps> = ({
  isOpen,
  graoParaEditar,
  onClose,
  onSuccess
}) => {
  const [nome, setNome] = useState('');
  const [torrefacao, setTorrefacao] = useState('');
  const [origem, setOrigem] = useState('');
  const [nivelTorra, setNivelTorra] = useState<NivelTorra>('Média');
  const [quantidadeRestante, setQuantidadeRestante] = useState<number>(250);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (graoParaEditar) {
      setNome(graoParaEditar.nome);
      setTorrefacao(graoParaEditar.torrefacao);
      setOrigem(graoParaEditar.origem);
      setNivelTorra(graoParaEditar.nivelTorra);
      setQuantidadeRestante(graoParaEditar.quantidadeRestante);
    } else {
      // Form limpo para novo grão
      setNome('');
      setTorrefacao('');
      setOrigem('');
      setNivelTorra('Média');
      setQuantidadeRestante(250);
    }
  }, [graoParaEditar, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nome.trim() || !torrefacao.trim() || !origem.trim()) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    setIsSubmitting(true);

    try {
      if (graoParaEditar) {
        // Atualiza grão existente
        await graoRepository.atualizar(graoParaEditar.id, {
          nome: nome.trim(),
          torrefacao: torrefacao.trim(),
          origem: origem.trim(),
          nivelTorra,
          quantidadeRestante: Number(quantidadeRestante) || 0
        });
      } else {
        // Cria novo grão
        const novoDTO: CriarGraoDTO = {
          nome: nome.trim(),
          torrefacao: torrefacao.trim(),
          origem: origem.trim(),
          nivelTorra,
          quantidadeRestante: Number(quantidadeRestante) || 0
        };
        await graoRepository.salvar(novoDTO);
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error('Erro ao salvar grão:', err);
      alert('Falha ao salvar informações do grão.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#1A1A1A]/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="stamped-border bg-[#F5F2ED] max-w-lg w-full p-6 sm:p-8 space-y-6 relative my-8 text-[#1A1A1A]">
        {/* Botão Fechar */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-[#1A1A1A]/40 hover:text-[#1A1A1A] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Cabeçalho */}
        <div className="border-b border-[#1A1A1A]/10 pb-4">
          <p className="font-sans text-[10px] uppercase tracking-widest opacity-60">Entidade: Grão (Estoque)</p>
          <h3 className="font-serif text-3xl font-semibold text-[#1A1A1A] mt-0.5">
            {graoParaEditar ? 'Editar Grão do Estoque' : 'Cadastrar Novo Grão'}
          </h3>
          <p className="font-sans text-xs opacity-60 mt-1">Insira os dados cadastrais do lote para controle de gramas.</p>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-4 font-sans text-xs">
          {/* Nome do Grão */}
          <div className="space-y-1.5">
            <label className="block font-bold uppercase tracking-wider text-[#1A1A1A]">
              Nome do Grão / Varietal *
            </label>
            <input
              type="text"
              placeholder="Ex: Catuaí Amarelo Fermentado - Sítio da Serra"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full bg-white stamped-border px-3.5 py-2.5 text-xs text-[#1A1A1A] focus:outline-none"
              required
            />
          </div>

          {/* Torrefação */}
          <div className="space-y-1.5">
            <label className="block font-bold uppercase tracking-wider text-[#1A1A1A] flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-[#5A4033]" /> Torrefação / Marca *
            </label>
            <input
              type="text"
              placeholder="Ex: Um Coffee Co. / Coffee Lab"
              value={torrefacao}
              onChange={(e) => setTorrefacao(e.target.value)}
              className="w-full bg-white stamped-border px-3.5 py-2.5 text-xs text-[#1A1A1A] focus:outline-none"
              required
            />
          </div>

          {/* Origem */}
          <div className="space-y-1.5">
            <label className="block font-bold uppercase tracking-wider text-[#1A1A1A] flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#5A4033]" /> Origem / Região Produtora *
            </label>
            <input
              type="text"
              placeholder="Ex: Mantiqueira de Minas (MG)"
              value={origem}
              onChange={(e) => setOrigem(e.target.value)}
              className="w-full bg-white stamped-border px-3.5 py-2.5 text-xs text-[#1A1A1A] focus:outline-none"
              required
            />
          </div>

          {/* Nível de Torra e Quantidade Restante */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block font-bold uppercase tracking-wider text-[#1A1A1A] flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-[#5A4033]" /> Perfil de Torra *
              </label>
              <select
                value={nivelTorra}
                onChange={(e) => setNivelTorra(e.target.value as NivelTorra)}
                className="w-full bg-white stamped-border px-3 py-2.5 text-xs text-[#1A1A1A] focus:outline-none cursor-pointer"
              >
                {NIVEIS_TORRA.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block font-bold uppercase tracking-wider text-[#1A1A1A] flex items-center gap-1">
                <Scale className="w-3.5 h-3.5 text-[#5A4033]" /> Restante (g) *
              </label>
              <input
                type="number"
                min="0"
                max="10000"
                value={quantidadeRestante}
                onChange={(e) => setQuantidadeRestante(Number(e.target.value))}
                className="w-full bg-white stamped-border px-3.5 py-2.5 text-xs text-[#1A1A1A] focus:outline-none"
                required
              />
            </div>
          </div>

          {/* Botões */}
          <div className="flex gap-3 pt-4 border-t border-[#1A1A1A]/10">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 bg-transparent stamped-border text-[#1A1A1A] font-sans text-xs uppercase tracking-widest font-medium hover:bg-black/5 cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 px-4 bg-[#1A1A1A] hover:bg-[#333] text-[#F5F2ED] font-sans text-xs uppercase tracking-widest font-medium transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isSubmitting ? 'Salvando...' : graoParaEditar ? 'Atualizar Grão' : 'Salvar no Estoque'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
