# ☕ Grão & Prosa - Specialty Coffee & Sensory Journal

![Status](https://img.shields.io/badge/status-conclu%C3%ADdo-success)
![React](https://img.shields.io/badge/React-18-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8)
![Firebase](https://img.shields.io/badge/Firebase-Auth%20%26%20Firestore-ffca28)

O **Grão & Prosa** é uma aplicação web progressiva (PWA) de alta performance desenvolvida para entusiastas, degustadores e baristas de cafés especiais. A plataforma resolve o desafio da gestão precisa de estoque de grãos de origem controlada, eliminando perdas e rastreando métricas sutilíssimas de extração (moagem, temperatura, proporção e tempo de infusão). Além de registrar diários sensoriais com roda de descritores e avaliações, o aplicativo oferece um assistente de vertido interativo e mapeamento geoespacial em tempo real para descoberta de cafeterias de especialidade.

---

## 📸 Visão Geral das Funcionalidades

### 📦 Gestão Inteligente de Despensa (Pantry Engine)
- **Rastreabilidade de Lotes:** Cadastro detalhado de grãos com variedade, processo de beneficiamento (Lavado, Natural, Fermentado), altitude, mestre torrador e data de torra.
- **Abatimento Automático de Estoque:** Integração reativa entre a ficha de degustação e a despensa. A cada extração finalizada, a dose utilizada em gramas é abatida automaticamente do saldo total do lote.
- **Alertas de Frescor:** Monitoramento do tempo decorrido desde a torra para garantir o uso dentro da janela ideal de degasagem.

### 📝 Diário Sensorial Completo
- **Ajuste Fino de Extração:** Registro preciso de massa de café (g), volume de água (ml), temperatura (°C), método (V60, Aeropress, Prensa Francesa, Chemex, Espresso, etc.) e clique do moedor.
- **Roda de Descritores Sensoriais:** Seleção dinâmica de notas olfativas e degustativas (*Frutado, Achocolatado, Cítrico, Floral, Caramelo, Nozes, Especiarias, etc.*) totalmente internacionalizadas.
- **Pontuação e Legendas Dinâmicas:** Sistema de avaliação de 1 a 5 estrelas com feedback tátil e legendas personalizadas (*Ruim, Razoável, Bom, Muito Bom, Memorável*).

### ⏱️ Ferramentas de Barista e Cronômetro de Vertido
- **Guias de Vertido em Fases:** Cronômetro integrado com acompanhamento passo a passo das fases de extração (*Pré-infusão / Bloom*, *Primeiro Vertido*, *Ataques Subsequentes*).
- **Calculadora de Proporção em Tempo Real:** Cálculo automático de relação Café x Água (ex: `1:15`, `1:16`) durante o planejamento e execução da receita.

### 📍 Radar GPS de Cafeterias de Especialidade
- **Mapeamento Espacial com Overpass/OSM:** Busca geoespacial em tempo real utilizando APIs do OpenStreetMap para localizar cafeterias próximas em um raio expansível.
- **Filtragem & Desduplicação Server-side:** Query otimizada no servidor Node.js/Express interceptando requisições com remoção estrita de duplicatas por ID OSM e suporte a nós, caminhos e relações (`node`, `way`, `relation`).
- **Atributos de Conforto:** Identificação rápida de Wi-Fi, tomadas e especialidade do estabelecimento.

### 🌍 Suporte Global e Internacionalização (i18n)
- **Arquitetura Reativa de Idiomas:** Suporte nativo completo com troca em tempo real entre três idiomas:
  - 🇧🇷 **Português (pt-BR)**
  - 🇺🇸 **Inglês (en-US)**
  - 🇩🇪 **Alemão (de-DE)**
- **Dicionários Modulares:** Gestão de traduções cobrindo 100% da interface, incluindo textos interpolados (`{{dose}}g`), legendas dinâmicas e termos específicos da cultura do café.

### 📱 Experiência Nativa PWA (Progressive Web App)
- **Instalação em Dispositivos Móveis:** Suporte completo a Web App Manifest com suporte a modo offline, ícones adaptativos e inicialização *standalone*.
- **Design System Editorial:** Estética visual inspirada em cadernos de anotações artesanais, tipografia serifada refinada e esquema de cores quente e acolhedor (`#FAF7F2`).

### 🔒 Segurança e Autenticação de Usuários
- **Firebase Authentication & Firestore:** Autenticação individual por e-mail e senha com persistência isolada por ID de usuário (`uid`).
- **Verificação Obrigatória de E-mail:** Tela de bloqueio global (`VerifyEmailScreen`) que exige confirmação do e-mail de ativação antes de liberar o acesso às funcionalidades internas.
- **Política de Senhas Fortes (Regex):** Validação no client-side exigindo no mínimo 6 caracteres, contendo pelo menos uma letra maiúscula, um número e um caractere especial.

---

## 🛠️ Arquitetura e Tech Stack

| Camada | Tecnologia / Biblioteca |
| :--- | :--- |
| **Core Frontend** | React 18, TypeScript, Vite |
| **Estilização & UI** | Tailwind CSS, Lucide React (Ícones) |
| **Backend & Persistence** | Firebase Authentication, Cloud Firestore |
| **Server Proxy** | Node.js, Express (Overpass API CORS Proxy) |
| **Internacionalização** | i18next, react-i18next |
| **Geolocalização & Mapas** | OpenStreetMap, Overpass API, Leaflet |
| **PWA & Offline** | `vite-plugin-pwa`, Service Workers |

---

## 📂 Estrutura do Projeto

```text
grao-e-prosa/
├── public/                  # Ativos públicos e ícones do PWA
├── server.ts                # Servidor Express (Proxy da Overpass API e Server SSR/Static)
├── src/
│   ├── components/          # Componentes visuais e telas do app
│   │   ├── BrewingTimerView.tsx   # Cronômetro e Calculadora Barista
│   │   ├── DespensaView.tsx       # Gestão do estoque de grãos
│   │   ├── DiarioView.tsx         # Lista e histórico de degustações
│   │   ├── NovaDegustacaoForm.tsx # Formulário de degustação e descritores
│   │   ├── RadarCafeteriasView.tsx# Radar GPS e mapa interativo
│   │   ├── LoginScreen.tsx        # Tela de Login minimalista
│   │   ├── RegisterScreen.tsx     # Tela de Cadastro com validação forte
│   │   └── VerifyEmailScreen.tsx  # Bloqueio de e-mail não verificado
│   ├── context/             # Contextos globais (AuthContext)
│   ├── data/                # Dados estáticos e backups de fallback
│   ├── hooks/               # Custom Hooks (useAuth, useCafeterias, useBrewTimer, etc.)
│   ├── locales/             # Dicionários JSON de i18n (pt.json, en.json, de.json)
│   ├── repositories/        # Camada de abstração de dados (Firestore & LocalStorage)
│   ├── types/               # Definições de Interfaces e Tipos TypeScript
│   ├── App.tsx              # Roteamento global e estados principais
│   ├── firebaseConfig.ts    # Configuração e inicialização do SDK Firebase
│   ├── i18n.ts              # Configuração da biblioteca de i18n
│   └── main.tsx             # Ponto de entrada do React DOM
├── .env.example             # Modelo de variáveis de ambiente
├── package.json             # Dependências e scripts de execução
├── tsconfig.json            # Configuração do compilador TypeScript
└── vite.config.ts           # Configuração de build do Vite e PWA
```

---

## 🚀 Como Rodar o Projeto Localmente

### Pré-requisitos
- **Node.js** (versão 18.x ou superior)
- **npm** ou **yarn** / **bun**

### Passo a Passo

1. **Clonar o Repositório:**
   ```bash
   git clone https://github.com/[Seu-Usuario]/grao-e-prosa.git
   cd grao-e-prosa
   ```

2. **Instalar as Dependências:**
   ```bash
   npm install
   ```

3. **Configurar as Variáveis de Ambiente:**
   Crie um arquivo `.env` na raiz do projeto tomando como base o arquivo `.env.example`:
   ```bash
   cp .env.example .env
   ```
   Preencha com as credenciais do seu projeto do Firebase:
   ```env
   VITE_FIREBASE_API_KEY=seu_api_key
   VITE_FIREBASE_AUTH_DOMAIN=seu_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=seu_project_id
   VITE_FIREBASE_STORAGE_BUCKET=seu_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=seu_sender_id
   VITE_FIREBASE_APP_ID=seu_app_id
   ```

4. **Executar o Servidor de Desenvolvimento:**
   ```bash
   npm run dev
   ```
   Abra o seu navegador em `http://localhost:3000`.

5. **Gerar o Build de Produção:**
   ```bash
   npm run build
   npm start
   ```

---

## 👨‍💻 Autor

Desenvolvido por **[Artur Kuzma Marques]**.

- 💼 **LinkedIn:** [linkedin.com/in/seu-perfil](https://www.linkedin.com/in/devarturkuzmamarques/)
- 🐙 **GitHub:** [github.com/seu-usuario](https://github.com/Arture07)
- ✉️ **E-mail:** [seu.email@exemplo.com](mailto:akmarques03@gmail.com)

---
