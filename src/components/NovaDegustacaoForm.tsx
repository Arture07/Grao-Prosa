import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Grao, CriarDegustacaoDTO, METODOS_PREPARO, NOTAS_SENSORIAIS_SUGERIDAS } from '../types/coffee';
import { degustacaoRepository } from '../repositories/degustacaoRepository';
import { graoRepository } from '../repositories/graoRepository';
import { offlineSyncRepository } from '../repositories/offlineSyncRepository';
import { useAuth } from '../hooks/useAuth';
import { 
  Coffee, 
  Star, 
  Tag, 
  Check, 
  Calendar, 
  Droplet, 
  Scale, 
  ArrowLeft,
  CheckCircle2,
  Info,
  Loader2
} from 'lucide-react';

interface NovaDegustacaoFormProps {
  graos?: Grao[];
  graoPreSelecionadoId?: string;
  dadosPrePreenchidos?: {
    metodo: string;
    doseG: number;
    aguaMl: number;
  };
  onSuccess: () => void;
  onCancel: () => void;
}

export const NovaDegustacaoForm: React.FC<NovaDegustacaoFormProps> = ({
  graos: graosProp,
  graoPreSelecionadoId,
  dadosPrePreenchidos,
  onSuccess,
  onCancel
}) => {
  const { t } = useTranslation();
  const { uid } = useAuth();

  // Estado de grãos carregados do Firestore
  const [listaGraos, setListaGraos] = useState<Grao[]>(graosProp || []);
  const [isLoadingGraos, setIsLoadingGraos] = useState<boolean>(!graosProp || graosProp.length === 0);

  const [graoId, setGraoId] = useState<string>(graoPreSelecionadoId || '');
  const [data, setData] = useState<string>(new Date().toISOString().split('T')[0]);
  const [metodoPreparo, setMetodoPreparo] = useState<string>(dadosPrePreenchidos?.metodo || 'V60');
  const [metodoOutro, setMetodoOutro] = useState<string>('');
  const [nota, setNota] = useState<number>(5);
  const [notasSensoriais, setNotasSensoriais] = useState<string[]>(['Frutado', 'Achocolatado']);
  const [novaTagCustom, setNovaTagCustom] = useState<string>('');
  
  // Receita e Estoque
  const [doseGramas, setDoseGramas] = useState<number>(dadosPrePreenchidos?.doseG || 18);
  const [volumeAguaMl, setVolumeAguaMl] = useState<number>(dadosPrePreenchidos?.aguaMl || 270);
  const [observacoes, setObservacoes] = useState<string>('');
  const [abaterEstoque, setAbaterEstoque] = useState<boolean>(true);

  // Cálculo reativo em tempo real do Ratio (Proporção Café:Água)
  const ratioCalculado = useMemo(() => {
    const dose = Number(doseGramas);
    const agua = Number(volumeAguaMl);
    if (!dose || !agua || dose <= 0 || agua <= 0 || isNaN(dose) || isNaN(agua)) {
      return '1:--';
    }
    const ratioValor = agua / dose;
    return `1:${ratioValor.toFixed(1)}`;
  }, [doseGramas, volumeAguaMl]);

  // Estados de salvamento
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sucessoMsg, setSucessoMsg] = useState(false);

  // Busca real de grãos no Firestore usando graoRepository.listarTodos(uid)
  useEffect(() => {
    let isMounted = true;

    async function carregarGraosReais() {
      if (!uid) return;
      try {
        setIsLoadingGraos(true);
        const realGraos = await graoRepository.listarTodos(uid);
        if (isMounted) {
          setListaGraos(realGraos);
          if (graoPreSelecionadoId) {
            setGraoId(graoPreSelecionadoId);
          } else if (realGraos.length > 0) {
            setGraoId(realGraos[0].id);
          }
        }
      } catch (err) {
        console.error('Erro ao buscar grãos no Firestore:', err);
      } finally {
        if (isMounted) setIsLoadingGraos(false);
      }
    }

    carregarGraosReais();

    return () => {
      isMounted = false;
    };
  }, [uid, graoPreSelecionadoId]);

  // Grão selecionado atualmente
  const graoSelecionado = listaGraos.find(g => g.id === graoId);

  // Alterna tag sensorial no array
  const toggleTagSensorial = (tag: string) => {
    if (notasSensoriais.includes(tag)) {
      setNotasSensoriais(notasSensoriais.filter(t => t !== tag));
    } else {
      setNotasSensoriais([...notasSensoriais, tag]);
    }
  };

  // Adiciona tag personalizada
  const handleAdicionarTagCustom = (e: React.FormEvent) => {
    e.preventDefault();
    const tagFormatada = novaTagCustom.trim();
    if (tagFormatada && !notasSensoriais.includes(tagFormatada)) {
      setNotasSensoriais([...notasSensoriais, tagFormatada]);
      setNovaTagCustom('');
    }
  };

  // Submissão do Formulário para o Firestore ou Fila Offline
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!graoId) {
      alert('Por favor, selecione um grão do estoque.');
      return;
    }

    setIsSubmitting(true);

    try {
      const metodoFinal = metodoPreparo === 'Outro' && metodoOutro.trim() 
        ? metodoOutro.trim() 
        : metodoPreparo;

      const graoNomeSnapshot = graoSelecionado ? graoSelecionado.nome : 'Grão do Estoque';

      const dto: CriarDegustacaoDTO & {
        userId?: string;
        graoNomeSnapshot?: string;
        metodo?: string;
        dose?: number;
        agua?: number;
        descritores?: string[];
        impressoes?: string;
        ratio?: string;
        criadoEm?: string;
      } = {
        userId: uid,
        graoId,
        graoNomeSnapshot,
        data,
        metodoPreparo: metodoFinal,
        metodo: metodoFinal,
        nota,
        notasSensoriais,
        descritores: notasSensoriais,
        doseGramas: Number(doseGramas) || 0,
        dose: Number(doseGramas) || 0,
        volumeAguaMl: Number(volumeAguaMl) || 0,
        agua: Number(volumeAguaMl) || 0,
        ratio: ratioCalculado,
        observacoes: observacoes.trim(),
        impressoes: observacoes.trim(),
        criadoEm: new Date(data).toISOString()
      };

      const isOfflineMode = !navigator.onLine;

      if (isOfflineMode) {
        offlineSyncRepository.addPending(dto, abaterEstoque, Number(doseGramas) || 0, graoId);
      } else {
        try {
          await degustacaoRepository.salvar(dto, uid);
          if (abaterEstoque && doseGramas > 0 && graoSelecionado) {
            await graoRepository.abaterEstoque(graoId, Number(doseGramas), uid);
          }
        } catch (err) {
          console.warn('Conexão falhou ao salvar degustação no Firestore, armazenando localmente para sincronização:', err);
          offlineSyncRepository.addPending(dto, abaterEstoque, Number(doseGramas) || 0, graoId);
        }
      }

      setSucessoMsg(true);
      setTimeout(() => {
        onSuccess();
      }, 1000);

    } catch (err) {
      console.error('Erro geral ao processar degustação:', err);
      alert('Erro ao registrar a degustação. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingGraos) {
    return (
      <div className="stamped-border bg-white/80 p-12 text-center space-y-3 max-w-lg mx-auto">
        <Loader2 className="w-8 h-8 text-[#7B1E27] animate-spin mx-auto" />
        <p className="font-serif text-lg font-semibold text-[#1A1A1A]">Buscando seu histórico...</p>
      </div>
    );
  }

  if (listaGraos.length === 0) {
    return (
      <div className="stamped-border bg-white/80 p-8 text-center space-y-4 max-w-lg mx-auto">
        <Info className="w-8 h-8 text-[#5A4033] mx-auto" />
        <h3 className="font-serif text-2xl font-bold text-[#1A1A1A]">Nenhum Grão no Estoque</h3>
        <p className="font-sans text-xs text-[#1A1A1A]/70 leading-relaxed">
          Para criar um registro no Diário Sensorial, primeiro adicione pelo menos um pacote de café na sua despensa.
        </p>
        <button
          onClick={onCancel}
          className="px-5 py-2.5 bg-[#1A1A1A] text-[#F5F2ED] font-sans text-xs uppercase tracking-widest font-medium cursor-pointer hover:bg-[#333]"
        >
          Ir para a Despensa
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      {/* Botão de Voltar */}
      <div className="flex items-center justify-between border-b border-[#1A1A1A]/10 pb-4">
        <button
          onClick={onCancel}
          className="font-sans text-xs uppercase tracking-wider text-[#1A1A1A]/60 hover:text-[#1A1A1A] flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> {t('tastingForm.back')}
        </button>
      </div>

      {/* Card do Formulário */}
      <div className="stamped-border bg-white/70 p-6 sm:p-8 space-y-6">
        <div>
          <h2 className="font-serif text-3xl font-semibold text-[#1A1A1A]">{t('tastingForm.title')}</h2>
          <p className="font-sans text-xs text-[#1A1A1A]/60 mt-1">{t('tastingForm.subtitle')}</p>
        </div>

        {sucessoMsg && (
          <div className="stamped-border bg-emerald-50 text-emerald-900 p-4 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
            <div>
              <p className="font-serif font-semibold text-sm">Degustação Registrada com Sucesso!</p>
              <p className="font-sans text-xs opacity-80">Registro salvo e estoque atualizado.</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 font-sans">
          {/* 1. Seleção do Grão Real */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#1A1A1A]">
              {t('tastingForm.selectGrain')} *
            </label>
            <div className="relative">
              <select
                value={graoId}
                onChange={(e) => setGraoId(e.target.value)}
                className="w-full bg-[#F5F2ED] stamped-border px-4 py-3 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A] cursor-pointer"
                required
              >
                {listaGraos.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.nome} — {g.torrefacao} ({g.quantidadeRestante}g restantes)
                  </option>
                ))}
              </select>
              <Coffee className="w-4 h-4 text-[#1A1A1A]/40 absolute right-4 top-3.5 pointer-events-none" />
            </div>

            {graoSelecionado && (
              <div className="stamped-border bg-amber-50/40 p-3 text-xs text-[#5A4033] flex justify-between items-center">
                <span>Torra: <strong>{graoSelecionado.nivelTorra}</strong> ({graoSelecionado.origem})</span>
                <span className="font-bold">{graoSelecionado.quantidadeRestante}g em estoque</span>
              </div>
            )}
          </div>

          {/* 2. Método e Data */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#1A1A1A]">
                {t('tastingForm.extractionMethod')} *
              </label>
              <select
                value={metodoPreparo}
                onChange={(e) => setMetodoPreparo(e.target.value)}
                className="w-full bg-[#F5F2ED] stamped-border px-4 py-3 text-xs text-[#1A1A1A] focus:outline-none cursor-pointer"
              >
                {METODOS_PREPARO.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>

              {metodoPreparo === 'Outro' && (
                <input
                  type="text"
                  placeholder="Especifique o método..."
                  value={metodoOutro}
                  onChange={(e) => setMetodoOutro(e.target.value)}
                  className="w-full bg-[#F5F2ED] stamped-border px-4 py-2.5 text-xs text-[#1A1A1A] focus:outline-none mt-2"
                  required
                />
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#1A1A1A]">
                {t('tastingForm.preparationDate')}
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={data}
                  onChange={(e) => setData(e.target.value)}
                  className="w-full bg-[#F5F2ED] stamped-border px-4 py-3 text-xs text-[#1A1A1A] focus:outline-none"
                  required
                />
                <Calendar className="w-4 h-4 text-[#1A1A1A]/40 absolute right-4 top-3.5 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* 3. Avaliação Geral (Nota de 1 a 5) */}
          <div className="stamped-border bg-white/40 p-4 space-y-2.5">
            <div className="flex justify-between items-center">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#1A1A1A]">
                {t('tastingForm.ratingLabel')} *
              </label>
              <span className="font-serif italic text-sm text-[#5A4033] font-semibold">
                {nota === 5 && `⭐⭐⭐⭐⭐ ${t('tastingForm.rating_5')}`}
                {nota === 4 && `⭐⭐⭐⭐ ${t('tastingForm.rating_4')}`}
                {nota === 3 && `⭐⭐⭐ ${t('tastingForm.rating_3')}`}
                {nota === 2 && `⭐⭐ ${t('tastingForm.rating_2')}`}
                {nota === 1 && `⭐ ${t('tastingForm.rating_1')}`}
              </span>
            </div>

            <div className="flex items-center justify-center gap-3 py-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setNota(star)}
                  className="p-1 cursor-pointer focus:outline-none transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-7 h-7 ${
                      star <= nota 
                        ? 'fill-[#1A1A1A] text-[#1A1A1A]' 
                        : 'text-[#1A1A1A]/20'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* 4. Descritores Sensoriais */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#1A1A1A] flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-[#5A4033]" />
                {t('tastingForm.sensoryDescriptorsTitle')}
              </label>
              <span className="text-[10px] uppercase opacity-60">
                {notasSensoriais.length} {notasSensoriais.length === 1 ? 'item' : 'itens'}
              </span>
            </div>

            <div className="flex flex-wrap gap-2 p-3 stamped-border bg-white/40 min-h-[70px]">
              {NOTAS_SENSORIAIS_SUGERIDAS.map((tag) => {
                const isSelected = notasSensoriais.includes(tag);
                const tagTraduzida = t(`descriptors.${tag.toLowerCase()}`, tag);
                return (
                  <button
                    type="button"
                    key={tag}
                    onClick={() => toggleTagSensorial(tag)}
                    className={`px-3 py-1 rounded-full text-xs font-sans transition-all flex items-center gap-1 cursor-pointer ${
                      isSelected
                        ? 'bg-[#1A1A1A] text-[#F5F2ED] font-semibold'
                        : 'bg-[#F5F2ED] text-[#1A1A1A] stamped-border hover:bg-black/5'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 text-[#F5F2ED]" />}
                    {tagTraduzida}
                  </button>
                );
              })}

              {notasSensoriais
                .filter(t => !NOTAS_SENSORIAIS_SUGERIDAS.includes(t))
                .map((customTag) => (
                  <button
                    type="button"
                    key={customTag}
                    onClick={() => toggleTagSensorial(customTag)}
                    className="px-3 py-1 rounded-full text-xs font-sans bg-[#1A1A1A] text-[#F5F2ED] font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Check className="w-3 h-3 text-[#F5F2ED]" />
                    {customTag}
                  </button>
                ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Adicionar novo descritor..."
                value={novaTagCustom}
                onChange={(e) => setNovaTagCustom(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAdicionarTagCustom(e)}
                className="flex-1 bg-[#F5F2ED] stamped-border px-3.5 py-2 text-xs text-[#1A1A1A] focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAdicionarTagCustom}
                className="px-4 py-2 bg-transparent stamped-border text-[#1A1A1A] text-xs uppercase tracking-wider font-medium hover:bg-black/5 cursor-pointer"
              >
                + Adicionar
              </button>
            </div>
          </div>

          {/* 5. Parâmetros da Receita */}
          <div className="border-t border-[#1A1A1A]/10 pt-4 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A]">
              {t('tastingForm.recipeParamsTitle')}
            </h4>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-[#1A1A1A]/70 flex items-center gap-1">
                  <Scale className="w-3.5 h-3.5 text-[#5A4033]" /> {t('tastingForm.doseG')}
                </label>
                <input
                  type="number"
                  min="1"
                  max="500"
                  value={doseGramas}
                  onChange={(e) => setDoseGramas(Number(e.target.value))}
                  className="w-full bg-[#F5F2ED] stamped-border px-3.5 py-2 text-xs text-[#1A1A1A] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-[#1A1A1A]/70 flex items-center gap-1">
                  <Droplet className="w-3.5 h-3.5 text-[#5A4033]" /> {t('tastingForm.waterMl')}
                </label>
                <input
                  type="number"
                  min="1"
                  max="2000"
                  value={volumeAguaMl}
                  onChange={(e) => setVolumeAguaMl(Number(e.target.value))}
                  className="w-full bg-[#F5F2ED] stamped-border px-3.5 py-2 text-xs text-[#1A1A1A] focus:outline-none"
                />
              </div>
            </div>

            {/* Indicador Reativo do Ratio (Café:Água) */}
            <div className="stamped-border bg-[#F5F2ED] p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-sans text-[10px] uppercase font-bold tracking-widest bg-[#1A1A1A] text-[#F5F2ED] px-2 py-0.5">
                  {t('tastingForm.extractedRatio')}
                </span>
                <span className="text-xs text-[#1A1A1A]/70 hidden sm:inline">
                  {t('tastingForm.realtimeRatio')}
                </span>
              </div>
              <div className="flex items-baseline gap-1.5 font-serif">
                <span className="text-xs text-[#5A4033] font-sans uppercase tracking-wider font-semibold">{t('tools.proportionLabel')}</span>
                <span className="font-bold text-base text-[#1A1A1A] font-mono tracking-tight bg-white px-2 py-0.5 stamped-border">
                  {ratioCalculado}
                </span>
              </div>
            </div>

            {/* Abater Estoque Toggle */}
            <div className="stamped-border bg-amber-50/50 p-3.5 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-[#1A1A1A]">{t('tastingForm.deductInventory')}</p>
                <p className="text-[11px] text-[#5A4033]">
                  {t('tastingForm.deductInventoryDesc', { dose: doseGramas })}
                </p>
              </div>

              <input
                type="checkbox"
                checked={abaterEstoque}
                onChange={(e) => setAbaterEstoque(e.target.checked)}
                className="w-4 h-4 cursor-pointer accent-[#1A1A1A]"
              />
            </div>
          </div>

          {/* Observações */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#1A1A1A]">
              {t('tastingForm.infusionNotes')}
            </label>
            <textarea
              rows={3}
              placeholder={t('tastingForm.sensoryNotesPlaceholder')}
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              className="w-full bg-[#F5F2ED] stamped-border p-3.5 text-xs text-[#1A1A1A] focus:outline-none"
            />
          </div>

          {/* Botões de Ação */}
          <div className="flex gap-4 pt-4 border-t border-[#1A1A1A]/10">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-3 px-4 bg-transparent stamped-border text-[#1A1A1A] font-sans text-xs uppercase tracking-widest font-medium hover:bg-black/5 cursor-pointer"
            >
              {t('tastingForm.cancel')}
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 px-4 bg-[#1A1A1A] hover:bg-[#333] text-[#F5F2ED] font-sans text-xs uppercase tracking-widest font-medium transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  Salvando degustação...
                </>
              ) : (
                t('tastingForm.saveTasting')
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
