import React, { useState, useEffect } from 'react';
import { Grao, CriarGraoDTO, NivelTorra, NIVEIS_TORRA } from '../types/coffee';
import { graoRepository } from '../repositories/graoRepository';
import { Coffee, X, Save, Scale, Flame, MapPin, Building2, Check, Sparkles } from 'lucide-react';

interface GraoFormModalProps {
  isOpen: boolean;
  graoParaEditar?: Grao | null;
  onClose: () => void;
  onSuccess: () => void;
}

interface FormErros {
  nome?: string;
  quantidadeRestante?: string;
}

export const GraoFormModal: React.FC<GraoFormModalProps> = ({
  isOpen,
  graoParaEditar,
  onClose,
  onSuccess
}) => {
  // Estado dos Campos do Formulário
  const [nome, setNome] = useState('');
  const [torrefacao, setTorrefacao] = useState('');
  const [origem, setOrigem] = useState('');
  const [nivelTorra, setNivelTorra] = useState<NivelTorra>('Média');
  const [quantidadeRestante, setQuantidadeRestante] = useState<number | string>(250);
  
  // Estado de Erros Visuais e Submissão
  const [erros, setErros] = useState<FormErros>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Efeito para Hidratar ou Limpar o Formulário
  useEffect(() => {
    if (graoParaEditar) {
      setNome(graoParaEditar.nome || '');
      setTorrefacao(graoParaEditar.torrefacao || '');
      setOrigem(graoParaEditar.origem || '');
      setNivelTorra(graoParaEditar.nivelTorra || 'Média');
      setQuantidadeRestante(graoParaEditar.quantidadeRestante ?? 250);
      setErros({});
    } else {
      limparFormulario();
    }
  }, [graoParaEditar, isOpen]);

  const limparFormulario = () => {
    setNome('');
    setTorrefacao('');
    setOrigem('');
    setNivelTorra('Média');
    setQuantidadeRestante(250);
    setErros({});
  };

  if (!isOpen) return null;

  // Lógica de Validação e Salvamento
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const novosErros: FormErros = {};

    // 1. Validação do Nome do Café / Fazenda (Obrigatório)
    if (!nome.trim()) {
      novosErros.nome = 'Por favor, informe a fazenda ou nome do café.';
    }

    // 2. Validação da Quantidade em Gramas (Obrigatório e numérico > 0)
    const qtdNum = Number(quantidadeRestante);
    if (quantidadeRestante === '' || isNaN(qtdNum) || qtdNum <= 0) {
      novosErros.quantidadeRestante = 'Por favor, informe uma quantidade válida em gramas (ex: 250).';
    }

    if (Object.keys(novosErros).length > 0) {
      setErros(novosErros);
      return;
    }

    setErros({});
    setIsSubmitting(true);

    try {
      // TODO: Salvar no AsyncStorage / SQLite
      if (graoParaEditar) {
        await graoRepository.atualizar(graoParaEditar.id, {
          nome: nome.trim(),
          torrefacao: torrefacao.trim() || 'Desconhecida',
          origem: origem.trim() || 'Não especificada',
          nivelTorra,
          quantidadeRestante: qtdNum
        });
      } else {
        const novoDTO: CriarGraoDTO = {
          nome: nome.trim(),
          torrefacao: torrefacao.trim() || 'Desconhecida',
          origem: origem.trim() || 'Não especificada',
          nivelTorra,
          quantidadeRestante: qtdNum
        };
        await graoRepository.salvar(novoDTO);
      }

      limparFormulario();
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Erro ao salvar grão no repositório local:', err);
      setErros({ nome: 'Erro ao salvar no banco de dados local. Tente novamente.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#1A1A1A]/75 backdrop-blur-xs z-50 flex items-center justify-center p-2 sm:p-4 animate-fadeIn">
      <div className="bg-[#F5F2ED] border border-[#1A1A1A]/15 shadow-2xl max-w-md w-full p-4 sm:p-6 relative my-auto text-[#1A1A1A] rounded-xl max-h-[92vh] flex flex-col">
        
        {/* Botão Fechar */}
        <button
          onClick={onClose}
          type="button"
          className="absolute top-3.5 right-3.5 p-1.5 text-[#1A1A1A]/40 hover:text-[#1A1A1A] transition-colors cursor-pointer rounded-full hover:bg-black/5 z-10"
          aria-label="Fechar formulário"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Cabeçalho Elegante e Compacto */}
        <div className="border-b border-[#1A1A1A]/10 pb-2.5 pr-8 shrink-0">
          <div className="flex items-center gap-1.5 text-[#7B1E27] font-semibold text-[10px] uppercase tracking-widest mb-0.5">
            <Sparkles className="w-3 h-3" />
            <span>Módulo Despensa</span>
          </div>
          <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#1A1A1A] tracking-tight">
            {graoParaEditar ? 'Editar Grão' : 'Adicionar à Despensa'}
          </h3>
          <p className="font-sans text-[11px] text-[#1A1A1A]/60 mt-0.5 leading-snug">
            Informe os dados do lote para controle de estoque e degustação.
          </p>
        </div>

        {/* Corpo do Formulário Com Rolagem Suave */}
        <div className="overflow-y-auto flex-1 py-3 pr-1 space-y-3.5 scrollbar-thin scrollbar-thumb-black/10">
          <form id="grao-form" onSubmit={handleSave} className="space-y-3.5 font-sans text-xs">
            
            {/* Campo 1: Fazenda / Nome do Café (Obrigatório) */}
            <div className="space-y-1">
              <label className="block font-bold uppercase tracking-wider text-[10px] text-[#1A1A1A] flex items-center gap-1">
                <Coffee className="w-3 h-3 text-[#7B1E27]" /> Fazenda / Nome do Café *
              </label>
              <input
                type="text"
                placeholder="Ex: Catuaí Amarelo - Sítio da Serra"
                value={nome}
                onChange={(e) => {
                  setNome(e.target.value);
                  if (erros.nome) setErros(prev => ({ ...prev, nome: undefined }));
                }}
                className={`w-full bg-transparent border-b ${
                  erros.nome ? 'border-red-600' : 'border-[#1A1A1A]/25 focus:border-[#7B1E27]'
                } px-1 py-1.5 text-xs text-[#1A1A1A] focus:outline-none transition-colors rounded-none placeholder:text-[#1A1A1A]/35`}
              />
              {erros.nome && (
                <p className="text-red-600 text-[10px] font-semibold mt-0.5">
                  {erros.nome}
                </p>
              )}
            </div>

            {/* Campo 2: Torrefação / Marca */}
            <div className="space-y-1">
              <label className="block font-bold uppercase tracking-wider text-[10px] text-[#1A1A1A] flex items-center gap-1">
                <Building2 className="w-3 h-3 text-[#5A4033]" /> Torrefação / Marca
              </label>
              <input
                type="text"
                placeholder="Ex: Coffee Lab / Um Coffee Co."
                value={torrefacao}
                onChange={(e) => setTorrefacao(e.target.value)}
                className="w-full bg-transparent border-b border-[#1A1A1A]/25 focus:border-[#7B1E27] px-1 py-1.5 text-xs text-[#1A1A1A] focus:outline-none transition-colors rounded-none placeholder:text-[#1A1A1A]/35"
              />
            </div>

            {/* Campo 3: Origem / Região */}
            <div className="space-y-1">
              <label className="block font-bold uppercase tracking-wider text-[10px] text-[#1A1A1A] flex items-center gap-1">
                <MapPin className="w-3 h-3 text-[#5A4033]" /> Origem / Região
              </label>
              <input
                type="text"
                placeholder="Ex: Mantiqueira de Minas - MG"
                value={origem}
                onChange={(e) => setOrigem(e.target.value)}
                className="w-full bg-transparent border-b border-[#1A1A1A]/25 focus:border-[#7B1E27] px-1 py-1.5 text-xs text-[#1A1A1A] focus:outline-none transition-colors rounded-none placeholder:text-[#1A1A1A]/35"
              />
            </div>

            {/* Campo 4: Nível de Torra (Chips Horizontais Selecionáveis sem Barra Amarela) */}
            <div className="space-y-1.5 pt-0.5">
              <label className="block font-bold uppercase tracking-wider text-[10px] text-[#1A1A1A] flex items-center gap-1">
                <Flame className="w-3 h-3 text-[#7B1E27]" /> Nível de Torra
              </label>
              
              <div 
                className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {NIVEIS_TORRA.map((torra) => {
                  const isSelected = nivelTorra === torra;
                  return (
                    <button
                      key={torra}
                      type="button"
                      onClick={() => setNivelTorra(torra)}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all duration-150 cursor-pointer flex items-center gap-1 ${
                        isSelected
                          ? 'bg-[#7B1E27] text-white shadow-xs ring-1 ring-[#7B1E27]/40'
                          : 'bg-black/5 text-[#1A1A1A]/75 border border-[#1A1A1A]/10 hover:bg-black/10'
                      }`}
                    >
                      {isSelected && <Check className="w-2.5 h-2.5 text-amber-300 stroke-[3]" />}
                      <span>{torra}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Campo 5: Quantidade (Gramas) */}
            <div className="space-y-1 pt-0.5">
              <label className="block font-bold uppercase tracking-wider text-[10px] text-[#1A1A1A] flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Scale className="w-3 h-3 text-[#7B1E27]" /> Quantidade (Gramas) *
                </span>
                <span className="text-[9px] text-[#1A1A1A]/50 font-medium">Padrão: 250g</span>
              </label>
              <input
                type="number"
                min="1"
                max="10000"
                placeholder="250"
                value={quantidadeRestante}
                onChange={(e) => {
                  setQuantidadeRestante(e.target.value);
                  if (erros.quantidadeRestante) setErros(prev => ({ ...prev, quantidadeRestante: undefined }));
                }}
                className={`w-full bg-transparent border-b ${
                  erros.quantidadeRestante ? 'border-red-600' : 'border-[#1A1A1A]/25 focus:border-[#7B1E27]'
                } px-1 py-1.5 text-xs text-[#1A1A1A] focus:outline-none transition-colors rounded-none font-semibold placeholder:text-[#1A1A1A]/35`}
              />
              {erros.quantidadeRestante && (
                <p className="text-red-600 text-[10px] font-semibold mt-0.5">
                  {erros.quantidadeRestante}
                </p>
              )}
            </div>
          </form>
        </div>

        {/* Rodapé Fixo com Ações */}
        <div className="pt-3 border-t border-[#1A1A1A]/10 flex gap-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-4 bg-transparent border border-[#1A1A1A]/20 text-[#1A1A1A] font-sans text-xs uppercase tracking-widest font-semibold hover:bg-black/5 transition-colors cursor-pointer rounded-lg text-center"
          >
            Cancelar
          </button>

          <button
            type="submit"
            form="grao-form"
            disabled={isSubmitting}
            className="flex-1 py-2.5 px-5 bg-[#7B1E27] hover:bg-[#5A121A] text-white font-sans text-xs uppercase tracking-widest font-semibold transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 rounded-lg active:scale-[0.99]"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSubmitting ? 'SALVANDO...' : graoParaEditar ? 'ATUALIZAR GRÃO' : 'SALVAR GRÃO'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};

