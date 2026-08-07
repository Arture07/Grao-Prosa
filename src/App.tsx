import React, { useState, useEffect, useCallback } from 'react';
import { Grao, Degustacao } from './types/coffee';
import { graoRepository } from './repositories/graoRepository';
import { degustacaoRepository } from './repositories/degustacaoRepository';
import { dbAdapter } from './database/databaseAdapter';

import { Header } from './components/Header';
import { DespensaView } from './components/DespensaView';
import { NovaDegustacaoForm } from './components/NovaDegustacaoForm';
import { DiarioView } from './components/DiarioView';
import { BrewingTimerView } from './components/BrewingTimerView';
import { RadarCafeteriasView } from './components/RadarCafeteriasView';
import { GraoFormModal } from './components/GraoFormModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<'despensa' | 'nova-degustacao' | 'diario' | 'cronometro' | 'radar'>('despensa');
  const [graos, setGraos] = useState<Grao[]>([]);
  const [degustacoes, setDegustacoes] = useState<Degustacao[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Estados de Modais, Filtros e Transferência do Timer
  const [isGraoModalOpen, setIsGraoModalOpen] = useState<boolean>(false);
  const [graoParaEditar, setGraoParaEditar] = useState<Grao | null>(null);
  const [graoPreSelecionadoId, setGraoPreSelecionadoId] = useState<string | undefined>(undefined);
  const [filtroGraoId, setFiltroGraoId] = useState<string | undefined>(undefined);
  const [dadosTimerParaDegustacao, setDadosTimerParaDegustacao] = useState<{ metodo: string; doseG: number; aguaMl: number } | undefined>(undefined);

  // Mapeamento id -> Grao para busca O(1) rápida
  const graosMap = graos.reduce<Record<string, Grao>>((acc, g) => {
    acc[g.id] = g;
    return acc;
  }, {});

  // Carrega todos os dados do banco local
  const carregarDados = useCallback(async () => {
    try {
      setIsLoading(true);
      const [listaGraos, listaDegustacoes] = await Promise.all([
        graoRepository.listarTodos(),
        degustacaoRepository.listarTodas()
      ]);
      setGraos(listaGraos);
      setDegustacoes(listaDegustacoes);
    } catch (err) {
      console.error('Erro ao carregar dados do banco local:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  // Ação: Iniciar Nova Degustação com Grão pré-selecionado
  const handleDegustarGrao = (graoId: string) => {
    setGraoPreSelecionadoId(graoId);
    setActiveTab('nova-degustacao');
  };

  // Ação: Abrir modal para novo grão
  const handleOpenNovoGrao = () => {
    setGraoParaEditar(null);
    setIsGraoModalOpen(true);
  };

  // Ação: Abrir modal para editar grão existente
  const handleEditGrao = (grao: Grao) => {
    setGraoParaEditar(grao);
    setIsGraoModalOpen(true);
  };

  // Ação: Ver histórico de degustações de um grão específico
  const handleVerHistoricoGrao = (graoId: string) => {
    setFiltroGraoId(graoId);
    setActiveTab('diario');
  };

  // Ação: Resetar o banco local para valores de exemplo
  const handleResetDatabase = async () => {
    if (confirm('Deseja restaurar o banco de dados local para os dados padrão de exemplo (seed)?')) {
      await dbAdapter.resetDatabase();
      await carregarDados();
      alert('Banco de dados resetado com sucesso!');
    }
  };

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900 font-sans antialiased flex flex-col">
      {/* Header Fixo com Tabs e Botões de Ação */}
      <Header
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (tab !== 'nova-degustacao') setGraoPreSelecionadoId(undefined);
          if (tab !== 'diario') setFiltroGraoId(undefined);
        }}
        onOpenNovoGrao={handleOpenNovoGrao}
        onResetDatabase={handleResetDatabase}
      />

      {/* Conteúdo Principal */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64 space-y-3">
            <div className="w-10 h-10 border-4 border-amber-800 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-semibold text-stone-500">Carregando dados do banco local...</p>
          </div>
        ) : (
          <>
            {activeTab === 'despensa' && (
              <DespensaView
                graos={graos}
                onRefresh={carregarDados}
                onOpenNovoGrao={handleOpenNovoGrao}
                onEditGrao={handleEditGrao}
                onDegustarGrao={handleDegustarGrao}
                onVerHistoricoGrao={handleVerHistoricoGrao}
              />
            )}

            {activeTab === 'nova-degustacao' && (
              <NovaDegustacaoForm
                graos={graos}
                graoPreSelecionadoId={graoPreSelecionadoId}
                dadosPrePreenchidos={dadosTimerParaDegustacao}
                onSuccess={() => {
                  carregarDados();
                  setActiveTab('diario');
                  setGraoPreSelecionadoId(undefined);
                  setDadosTimerParaDegustacao(undefined);
                }}
                onCancel={() => {
                  setActiveTab('despensa');
                  setGraoPreSelecionadoId(undefined);
                  setDadosTimerParaDegustacao(undefined);
                }}
              />
            )}

            {activeTab === 'diario' && (
              <DiarioView
                degustacoes={degustacoes}
                graosMap={graosMap}
                onRefresh={carregarDados}
                onNovaDegustacaoClick={() => {
                  setGraoPreSelecionadoId(undefined);
                  setDadosTimerParaDegustacao(undefined);
                  setActiveTab('nova-degustacao');
                }}
                filtroGraoId={filtroGraoId}
                onClearFiltroGrao={() => setFiltroGraoId(undefined)}
              />
            )}

            {activeTab === 'cronometro' && (
              <BrewingTimerView
                onRegistrarDegustacao={(dados) => {
                  setDadosTimerParaDegustacao(dados);
                  setActiveTab('nova-degustacao');
                }}
              />
            )}

            {activeTab === 'radar' && (
              <RadarCafeteriasView
                onRegistrarDegustacao={(cafeteria) => {
                  setDadosTimerParaDegustacao({
                    metodo: cafeteria.especialidades[0] || 'V60',
                    doseG: 18,
                    aguaMl: 270
                  });
                  setActiveTab('nova-degustacao');
                }}
              />
            )}
          </>
        )}
      </main>

      {/* Modal Formulário de Grão (Criar / Editar) */}
      <GraoFormModal
        isOpen={isGraoModalOpen}
        graoParaEditar={graoParaEditar}
        onClose={() => {
          setIsGraoModalOpen(false);
          setGraoParaEditar(null);
        }}
        onSuccess={() => {
          carregarDados();
        }}
      />
    </div>
  );
}
