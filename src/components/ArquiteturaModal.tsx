import React from 'react';
import { Layers, Database, Code, CheckCircle, Smartphone, HardDrive, Terminal } from 'lucide-react';

export const ArquiteturaModal: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12 text-[#1A1A1A]">
      {/* Header Section */}
      <div className="stamped-border bg-[#1A1A1A] text-[#F5F2ED] p-6 sm:p-8 space-y-3">
        <div className="inline-flex items-center gap-2 border border-[#F5F2ED]/30 px-3 py-1 font-sans text-[10px] uppercase tracking-widest text-[#F5F2ED]/80">
          <Layers className="w-3.5 h-3.5" /> Arquitetura de Software Mobile • React Native
        </div>
        <h2 className="font-serif text-3xl font-semibold tracking-tight text-[#F5F2ED]">
          04. Documentação de Arquitetura & Modelagem
        </h2>
        <p className="font-sans text-xs opacity-80 leading-relaxed max-w-2xl">
          Visão técnica detalhada do núcleo de dados, modelo relacional, persistência local e padrões de código preparados para produção em <strong>React Native (Expo / CLI)</strong>.
        </p>
      </div>

      {/* Grid de Seções Técnicas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* 1. Mapeamento do Banco de Dados SQLite */}
        <div className="stamped-border bg-white/60 p-6 space-y-4">
          <div className="flex items-center gap-2.5 border-b border-[#1A1A1A]/10 pb-3">
            <Database className="w-5 h-5 text-[#5A4033]" />
            <div>
              <h3 className="font-serif text-xl font-semibold text-[#1A1A1A]">1. Schema DDL (SQLite)</h3>
              <p className="font-sans text-[10px] uppercase tracking-wider opacity-60">Mapeamento relacional e integridade</p>
            </div>
          </div>

          <div className="stamped-border bg-[#1A1A1A] text-[#F5F2ED] p-4 font-mono text-xs overflow-x-auto space-y-3">
            <div>
              <span className="text-[#F5F2ED]/50">// Tabela 1: Grãos em Estoque</span>
              <pre className="text-amber-200 mt-1">{`CREATE TABLE graos (
  id TEXT PRIMARY KEY NOT NULL,
  nome TEXT NOT NULL,
  torrefacao TEXT NOT NULL,
  origem TEXT NOT NULL,
  nivelTorra TEXT NOT NULL,
  quantidadeRestante REAL NOT NULL DEFAULT 0,
  criadoEm TEXT NOT NULL
);`}</pre>
            </div>

            <div className="border-t border-[#F5F2ED]/20 pt-3">
              <span className="text-[#F5F2ED]/50">// Tabela 2: Diário de Degustações</span>
              <pre className="text-amber-200 mt-1">{`CREATE TABLE degustacoes (
  id TEXT PRIMARY KEY NOT NULL,
  graoId TEXT NOT NULL,
  data TEXT NOT NULL,
  metodoPreparo TEXT NOT NULL,
  nota INTEGER CHECK(nota BETWEEN 1 AND 5),
  notasSensoriais TEXT NOT NULL, -- JSON Array
  doseGramas REAL,
  volumeAguaMl REAL,
  observacoes TEXT,
  FOREIGN KEY (graoId) 
    REFERENCES graos(id) 
    ON DELETE CASCADE
);`}</pre>
            </div>
          </div>

          <div className="font-sans text-xs space-y-2 opacity-80">
            <p className="font-bold uppercase tracking-wider text-[10px] text-[#5A4033]">Observações de Modelagem:</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li><strong>Relacionamento 1:N:</strong> Um <i>Grão</i> possui múltiplos registros de <i>Degustação</i>.</li>
              <li><strong>JSON Array:</strong> As <i>notasSensoriais</i> são armazenadas como array serializado em JSON.</li>
              <li><strong>Cascade Delete:</strong> Ao remover um grão, o repositório exclui em cascata suas degustações.</li>
            </ul>
          </div>
        </div>

        {/* 2. Padrões de Código & Repositório */}
        <div className="stamped-border bg-white/60 p-6 space-y-4">
          <div className="flex items-center gap-2.5 border-b border-[#1A1A1A]/10 pb-3">
            <Code className="w-5 h-5 text-[#5A4033]" />
            <div>
              <h3 className="font-serif text-xl font-semibold text-[#1A1A1A]">2. Repository Pattern</h3>
              <p className="font-sans text-[10px] uppercase tracking-wider opacity-60">Isolamento entre UI e Persistência</p>
            </div>
          </div>

          <div className="space-y-3 font-sans text-xs">
            <div className="stamped-border bg-[#F5F2ED]/80 p-3.5 space-y-1">
              <span className="font-bold uppercase tracking-wider text-[10px] text-[#5A4033] flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-700" /> UI Component Layer (Views)
              </span>
              <p className="opacity-80">
                Componentes como <code className="font-mono bg-black/5 px-1">DespensaView</code> não acessam o armazenamento diretamente.
              </p>
            </div>

            <div className="stamped-border bg-[#F5F2ED]/80 p-3.5 space-y-1">
              <span className="font-bold uppercase tracking-wider text-[10px] text-[#5A4033] flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-700" /> Repository Layer (DAO)
              </span>
              <p className="opacity-80">
                <code className="font-mono bg-black/5 px-1">GraoRepository</code> e <code className="font-mono bg-black/5 px-1">DegustacaoRepository</code> gerenciam regras de negócio e abates no estoque.
              </p>
            </div>

            <div className="stamped-border bg-[#F5F2ED]/80 p-3.5 space-y-1">
              <span className="font-bold uppercase tracking-wider text-[10px] text-[#5A4033] flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-700" /> Database Adapter
              </span>
              <p className="opacity-80">
                <code className="font-mono bg-black/5 px-1">LocalDatabaseAdapter</code> expõe interface Promise compativel com AsyncStorage ou Expo SQLite.
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* 3. Guia de Implementação Nativa em React Native */}
      <div className="stamped-border bg-white/60 p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-2.5 border-b border-[#1A1A1A]/10 pb-3">
          <Smartphone className="w-5 h-5 text-[#5A4033]" />
          <div>
            <h3 className="font-serif text-2xl font-semibold text-[#1A1A1A]">3. Guia de Subscrição Nativa (Expo CLI)</h3>
            <p className="font-sans text-[10px] uppercase tracking-wider opacity-60">Comandos para adaptar a persistência em ambiente móvel real</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
          <div className="stamped-border bg-[#1A1A1A] text-[#F5F2ED] p-4 space-y-2">
            <p className="text-amber-200 flex items-center gap-1 font-sans font-bold text-xs uppercase tracking-wider">
              <Terminal className="w-4 h-4 text-emerald-400" /> Opção A: AsyncStorage
            </p>
            <p className="text-[#F5F2ED]/70 font-sans text-[11px]">Para chave-valor em apps de pequeno/médio porte:</p>
            <pre className="bg-black/40 p-2.5 border border-[#F5F2ED]/20 text-emerald-400">{`npx expo install @react-native-async-storage/async-storage`}</pre>
          </div>

          <div className="stamped-border bg-[#1A1A1A] text-[#F5F2ED] p-4 space-y-2">
            <p className="text-amber-200 flex items-center gap-1 font-sans font-bold text-xs uppercase tracking-wider">
              <HardDrive className="w-4 h-4 text-amber-400" /> Opção B: Expo SQLite
            </p>
            <p className="text-[#F5F2ED]/70 font-sans text-[11px]">Para banco relacional SQL nativo de alto desempenho:</p>
            <pre className="bg-black/40 p-2.5 border border-[#F5F2ED]/20 text-amber-300">{`npx expo install expo-sqlite`}</pre>
          </div>
        </div>
      </div>
    </div>
  );
};
