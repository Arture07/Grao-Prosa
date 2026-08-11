import React, { useState, useEffect, useCallback } from 'react';
import { Grao, Degustacao } from './types/coffee';
import { graoRepository } from './repositories/graoRepository';
import { degustacaoRepository } from './repositories/degustacaoRepository';
import { offlineSyncRepository } from './repositories/offlineSyncRepository';
import { AuthProvider, useAuth } from './hooks/useAuth';

import { Header } from './components/Header';
import { DespensaView } from './components/DespensaView';
import { NovaDegustacaoForm } from './components/NovaDegustacaoForm';
import { DiarioView } from './components/DiarioView';
import { BrewingTimerView } from './components/BrewingTimerView';
import { RadarCafeteriasView } from './components/RadarCafeteriasView';
import { GraoFormModal } from './components/GraoFormModal';
import { LoginScreen } from './components/LoginScreen';
import { RegisterScreen } from './components/RegisterScreen';
import { VerifyEmailScreen } from './components/VerifyEmailScreen';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';

function MainApp() {
  const { user, uid, isLoadingAuth } = useAuth();
  const [authView, setAuthView] = useState<'login' | 'register'>('login');

  const [activeTab, setActiveTab] = useState<'despensa' | 'nova-degustacao' | 'diario' | 'cronometro' | 'radar'>('despensa');
  const [graos, setGraos] = useState<Grao[]>([]);
  const [degustacoes, setDegustacoes] = useState<Degustacao[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Estado de Conectividade e Sincronização Offline
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [pendingCount, setPendingCount] = useState<number>(() => offlineSyncRepository.getPending().length);
  const [syncFeedback, setSyncFeedback] = useState<{ message: string; type: 'success' | 'offline' | 'syncing' } | null>(null);

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

  // Monitora alterações na conectividade da rede (online/offline)
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setSyncFeedback({
        message: 'Modo Offline ativado. Novas degustações serão salvas localmente e sincronizadas ao reconectar.',
        type: 'offline'
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Carrega todos os dados do banco (Firestore para Grãos + Local/Offline para Degustações)
  const carregarDados = useCallback(async () => {
    if (!uid) return;
    try {
      setIsLoading(true);

      let listaGraos: Grao[] = [];
      let listaDegustacoes: Degustacao[] = [];

      try {
        const [gRes, dRes] = await Promise.all([
          graoRepository.listarTodos(uid),
          degustacaoRepository.listarTodas(uid)
        ]);
        if (gRes) listaGraos = gRes;
        if (dRes) listaDegustacoes = dRes;
      } catch (err) {
        console.warn('Conexão ao Firestore instável ou offline:', err);
      }

      // Renderização otimista: junta degustações salvas offline que ainda aguardam sincronização
      const degustacoesOffline = offlineSyncRepository.getOptimisticDegustacoes();
      setPendingCount(degustacoesOffline.length);

      const idMap = new Set(listaDegustacoes.map(d => d.id));
      const degustacoesUnificadas = [
        ...degustacoesOffline.filter(d => !idMap.has(d.id)),
        ...listaDegustacoes
      ];

      // Ordena todas as degustações por data de criação (mais recentes primeiro)
      degustacoesUnificadas.sort((a, b) => {
        const timeA = new Date(a.criadoEm || a.data).getTime();
        const timeB = new Date(b.criadoEm || b.data).getTime();
        return timeB - timeA;
      });

      setGraos(listaGraos);
      setDegustacoes(degustacoesUnificadas);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
    } finally {
      setIsLoading(false);
    }
  }, [uid]);

  // Função de sincronização automática dos itens offline com o Firestore
  const sincronizarFilaOffline = useCallback(async () => {
    if (!uid) return;
    const pendingList = offlineSyncRepository.getPending();
    if (pendingList.length === 0) {
      setPendingCount(0);
      return;
    }

    try {
      setIsSyncing(true);
      setSyncFeedback({
        message: `Sincronizando ${pendingList.length} degustação(ões) salva(s) offline com o Firestore...`,
        type: 'syncing'
      });

      const resultado = await offlineSyncRepository.sincronizarTudo(uid);

      if (resultado.sucessoCount > 0) {
        setSyncFeedback({
          message: `✨ ${resultado.sucessoCount} degustação(ões) registrada(s) offline sincronizada(s) com sucesso no Firestore!`,
          type: 'success'
        });

        setTimeout(() => {
          setSyncFeedback(prev => (prev?.type === 'success' ? null : prev));
        }, 6000);
      }

      // Recarrega lista unificada e atualizada do Firestore
      await carregarDados();
    } catch (err) {
      console.error('Erro ao sincronizar dados offline:', err);
    } finally {
      setIsSyncing(false);
      setPendingCount(offlineSyncRepository.getPending().length);
    }
  }, [uid, carregarDados]);

  // Executa sincronização automática quando a conexão é restabelecida ou ao carregar a aplicação online
  useEffect(() => {
    if (isOnline && uid && !isLoadingAuth) {
      sincronizarFilaOffline();
    }
  }, [isOnline, uid, isLoadingAuth, sincronizarFilaOffline]);

  useEffect(() => {
    if (!isLoadingAuth && user && uid) {
      carregarDados();
    }
  }, [isLoadingAuth, user, uid, carregarDados]);

  // Se o serviço de Autenticação ainda estiver carregando no início
  if (isLoadingAuth) {
    return (
      <div className="min-h-screen bg-[#F5F2ED] flex flex-col items-center justify-center p-4">
        <div className="w-10 h-10 border-4 border-[#7B1E27] border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs font-semibold uppercase tracking-widest text-[#1A1A1A]/60">
          Carregando Grão & Prosa...
        </p>
      </div>
    );
  }

  // Se o usuário NÃO estiver logado, exibe as Telas de Autenticação Real
  if (!user) {
    if (authView === 'login') {
      return <LoginScreen onNavigateToRegister={() => setAuthView('register')} />;
    }
    return <RegisterScreen onNavigateToLogin={() => setAuthView('login')} />;
  }

  // Trava de Roteamento Global: Se o usuário estiver logado, MAS user.emailVerified === false, renderiza exclusivamente <VerifyEmailScreen />
  if (!user.emailVerified) {
    return <VerifyEmailScreen />;
  }

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
      />

      {/* Banner de Status de Conexão e Sincronização Offline */}
      {(syncFeedback || !isOnline || pendingCount > 0) && (
        <div className="max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div
            className={`stamped-border p-3 flex flex-col sm:flex-row items-center justify-between text-xs font-sans gap-2 transition-all ${
              !isOnline || syncFeedback?.type === 'offline'
                ? 'bg-amber-100 text-amber-900 border-amber-800'
                : syncFeedback?.type === 'syncing'
                ? 'bg-blue-50 text-blue-900 border-blue-700'
                : 'bg-emerald-50 text-emerald-900 border-emerald-700'
            }`}
          >
            <div className="flex items-center gap-2">
              {!isOnline ? (
                <WifiOff className="w-4 h-4 text-amber-800 shrink-0" />
              ) : isSyncing ? (
                <RefreshCw className="w-4 h-4 text-blue-700 animate-spin shrink-0" />
              ) : (
                <Wifi className="w-4 h-4 text-emerald-700 shrink-0" />
              )}

              <span>
                {!isOnline
                  ? `Modo Offline ativado ${
                      pendingCount > 0
                        ? `• ${pendingCount} degustação(ões) salva(s) localmente aguardando conexão`
                        : '• Suas novas degustações serão salvas localmente e sincronizadas quando voltar online.'
                    }`
                  : syncFeedback?.message ||
                    (pendingCount > 0
                      ? `${pendingCount} degustação(ões) pendente(s) para sincronizar`
                      : 'Conectado e sincronizado com o Firestore')}
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {isOnline && pendingCount > 0 && !isSyncing && (
                <button
                  onClick={() => sincronizarFilaOffline()}
                  className="px-3 py-1 bg-[#1A1A1A] text-[#F5F2ED] font-bold text-[10px] uppercase tracking-wider hover:bg-[#333] transition-colors cursor-pointer flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" /> Sincronizar Agora
                </button>
              )}

              {syncFeedback && (
                <button
                  onClick={() => setSyncFeedback(null)}
                  className="text-[10px] uppercase font-bold tracking-wider opacity-70 hover:opacity-100 cursor-pointer"
                >
                  Fechar
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Conteúdo Principal */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64 space-y-3">
            <div className="w-10 h-10 border-4 border-[#7B1E27] border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-semibold text-stone-500">
              Buscando sua despensa...
            </p>
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

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
