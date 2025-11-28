# 🎮 Starz Up - Plataforma de Torneios de Jogos Online

## 📋 Sobre o Projeto

**Starz Up** é uma plataforma web completa para organização e gerenciamento de torneios competitivos de jogos eletrônicos. O projeto oferece uma experiência moderna e intuitiva para jogadores se inscreverem em campeonatos, gerenciarem saldo, interagirem com a comunidade e competirem em seus jogos favoritos.

### 🎯 Jogos Suportados

- **CS2** (Counter-Strike 2)
- **VALORANT** (FPS Tático)
- **Rocket League** (Futebol com Carros)
- **Fortnite** (Battle Royale)

---

## ✨ Funcionalidades Principais

### 👥 Para Usuários

- **Cadastro e Autenticação Completa**
  - Sistema de login/cadastro com Firebase Authentication
  - Upload de avatar personalizado com compressão automática
  - Perfil de usuário com estatísticas de desempenho

- **Dashboard Interativo**
  - Visualização de estatísticas pessoais (torneios, vitórias, derrotas)
  - Feed de atividades em tempo real
  - Próximos torneios disponíveis

- **Sistema de Torneios**
  - Inscrição em campeonatos por jogo
  - Filtros por categoria (CS2, VALORANT, etc.)
  - Visualização de prêmios e taxas de inscrição
  - Sistema de vagas limitadas

- **Gerenciamento de Saldo**
  - Depósitos e saques
  - Histórico de transações
  - Saldo em tempo real

- **Comunidade**
  - Visualização de jogadores cadastrados
  - Estatísticas públicas de outros usuários
  - Sistema de equipes (em desenvolvimento)

- **Suporte**
  - FAQ integrado
  - Opções de contato (chat, email)

### 🛠️ Para Administradores

- **Painel Administrativo**
  - Criação de novos torneios
  - Gerenciamento completo de campeonatos
  - Exclusão de torneios
  - Visualização de inscritos

- **Controle Total**
  - Permissões elevadas no Firebase
  - Acesso a dados de todos os usuários
  - Moderação da plataforma

---

## 🏗️ Arquitetura do Projeto

### 📁 Estrutura de Arquivos

```
starzup/
├── 📄 index.html              # Página inicial pública
├── 📄 login.html              # Página de login
├── 📄 cadastro.html           # Página de cadastro
├── 📄 dashboard.html          # Dashboard do usuário
├── 📄 style.css               # Estilos da página inicial
├── 📄 cadastro.css            # Estilos do cadastro
├── 📄 dashboard.css           # Estilos do dashboard
├── 📄 firebase-config.js      # Configuração do Firebase
├── 📄 cadastro-script.js      # Lógica de cadastro
├── 📄 dashboard-script.js     # Lógica do dashboard
├── 📄 login-script.js         # Lógica de login
│
├── 📁 apostas/                # Seção de apostas (em manutenção)
│   ├── apostas.html
│   └── apostas.css
│
├── 📁 campeonatos/            # Seção de campeonatos
│   ├── tournaments.html
│   ├── tournaments.css
│   └── tournaments-script.js
│
├── 📁 comunidade/             # Seção de comunidade
│   ├── comunidade.html
│   └── comunidade.css
│
├── 📁 imagens/                # Assets visuais
│   ├── logoempresa.png
│   ├── logocs.png
│   ├── logovalorant.png
│   ├── logorocketleague.png
│   ├── logofortnite.png
│   ├── avatar-default.png
│   └── seta.png
│
└── 📁 suporte/                # Seção de suporte
    ├── suporte.html
    └── suporte.css
```

---

## 🔥 Tecnologias Utilizadas

### Frontend

- **HTML5** - Estrutura semântica
- **CSS3** - Estilização moderna com gradientes e animações
- **JavaScript ES6+** - Lógica e interatividade
- **Firebase SDK 10.7.1** - Integração com backend

### Backend & Infraestrutura

- **Firebase Authentication** - Sistema de autenticação
- **Firebase Realtime Database** - Banco de dados NoSQL em tempo real
- **Firebase Security Rules** - Controle de acesso e permissões

### Design

- **Design Responsivo** - Mobile-first approach
- **Glassmorphism** - Efeitos modernos de vidro
- **Gradientes Vibrantes** - Paleta de cores neon/cyberpunk
- **Animações CSS** - Transições suaves e efeitos hover

---

## 🚀 Instalação e Configuração

### Pré-requisitos

- Navegador web moderno (Chrome, Firefox, Edge, Safari)
- Conta no Firebase (gratuita)
- Editor de código (VS Code recomendado)

### Passo a Passo

#### 1. Clone o Repositório

```bash
git clone https://github.com/seu-usuario/starzup.git
cd starzup
```

#### 2. Configure o Firebase

Acesse o [Firebase Console](https://console.firebase.google.com/) e:

1. Crie um novo projeto
2. Ative **Authentication** (método Email/Password)
3. Ative **Realtime Database**
4. Configure as **Security Rules** (veja seção abaixo)
5. Copie as credenciais do projeto

#### 3. Atualize as Credenciais

Edite o arquivo `firebase-config.js`:

```javascript
const firebaseConfig = {
    apiKey: "SUA_API_KEY",
    authDomain: "SEU_PROJETO.firebaseapp.com",
    databaseURL: "https://SEU_PROJETO.firebaseio.com",
    projectId: "SEU_PROJETO_ID",
    storageBucket: "SEU_PROJETO.appspot.com",
    messagingSenderId: "SEU_SENDER_ID",
    appId: "SEU_APP_ID"
};
```

#### 4. Configure as Security Rules do Firebase

No Firebase Console, vá em **Realtime Database > Rules** e cole:

```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "auth != null",
        ".write": "$uid === auth.uid || root.child('users').child(auth.uid).child('isAdmin').val() === true",
        "nome": {
          ".validate": "newData.isString() && newData.val().length >= 3"
        },
        "email": {
          ".validate": "newData.isString()"
        },
        "avatar": {
          ".validate": "newData.isString()"
        },
        "saldo": {
          ".validate": "newData.isNumber() && newData.val() >= 0"
        },
        "vitorias": {
          ".validate": "newData.isNumber() && newData.val() >= 0"
        },
        "derrotas": {
          ".validate": "newData.isNumber() && newData.val() >= 0"
        },
        "isAdmin": {
          ".validate": "newData.isBoolean()"
        }
      }
    },
    "tournaments": {
      ".read": true,
      ".write": "auth != null && root.child('users').child(auth.uid).child('isAdmin').val() === true",
      "$tournamentId": {
        ".read": true,
        ".write": "auth != null && root.child('users').child(auth.uid).child('isAdmin').val() === true",
        "players": {
          ".write": "auth != null"
        }
      }
    },
    "transactions": {
      "$uid": {
        ".read": "$uid === auth.uid || root.child('users').child(auth.uid).child('isAdmin').val() === true",
        ".write": "$uid === auth.uid"
      }
    }
  }
}
```

#### 5. Execute o Projeto

Você pode usar qualquer servidor local. Exemplos:

**Opção 1: Live Server (VS Code)**
```bash
# Instale a extensão Live Server no VS Code
# Clique com botão direito em index.html > Open with Live Server
```

**Opção 2: Python**
```bash
python -m http.server 8000
# Acesse http://localhost:8000
```

**Opção 3: Node.js**
```bash
npx http-server
```

---

## 🔐 Sistema de Permissões

### Regras de Segurança Explicadas

#### 👤 Usuários (`/users`)

- **Leitura**: Qualquer usuário autenticado pode ler dados de outros usuários
- **Escrita**: Apenas o próprio usuário ou um administrador pode modificar dados
- **Validações**:
  - Nome mínimo de 3 caracteres
  - Email obrigatório
  - Saldo sempre >= 0
  - Estatísticas (vitórias/derrotas) sempre >= 0

#### 🏆 Torneios (`/tournaments`)

- **Leitura**: Todos podem ver torneios (mesmo não autenticados)
- **Escrita**: Apenas administradores podem criar/editar/excluir
- **Exceção**: Lista de jogadores pode ser modificada por qualquer usuário autenticado (para inscrições)

#### 💰 Transações (`/transactions`)

- **Leitura**: Apenas o dono das transações ou administradores
- **Escrita**: Apenas o próprio usuário

### Como Tornar um Usuário Administrador

1. Acesse o Firebase Console
2. Vá em **Realtime Database**
3. Navegue até `/users/{uid}/`
4. Adicione/edite o campo `isAdmin: true`

---

## 📊 Estrutura do Banco de Dados

### Modelo de Dados

```
firebase-realtime-database/
│
├── users/
│   └── {userId}/
│       ├── nome: string
│       ├── email: string
│       ├── avatar: string (base64 ou URL)
│       ├── saldo: number
│       ├── dataCriacao: timestamp
│       ├── torneiosInscritos: array
│       ├── apostas: array
│       ├── vitorias: number
│       ├── derrotas: number
│       ├── partidasJogadas: number
│       └── isAdmin: boolean
│
├── tournaments/
│   └── {tournamentId}/
│       ├── name: string
│       ├── game: string (cs2|valorant|rocket|fortnite)
│       ├── date: string (YYYY-MM-DD)
│       ├── time: string (HH:mm)
│       ├── prize: number
│       ├── maxPlayers: number
│       ├── fee: number
│       ├── description: string
│       ├── createdBy: userId
│       ├── createdAt: timestamp
│       ├── players: array
│       └── status: string (open|closed|finished)
│
└── transactions/
    └── {userId}/
        └── {transactionId}/
            ├── type: string (deposit|withdraw)
            ├── amount: number
            └── date: timestamp
```

---

## 💻 Funcionalidades Detalhadas

### 1. Sistema de Cadastro

**Arquivo**: `cadastro.html` + `cadastro-script.js`

- Upload de avatar com preview em tempo real
- Compressão automática de imagens (máx 400x400px, qualidade 70%)
- Validação de email e senha (mín. 6 caracteres)
- Criação automática de perfil no Realtime Database
- Geração de avatar padrão caso usuário não faça upload

**Tecnologia de Compressão**:
```javascript
// Redimensiona e comprime para otimizar armazenamento
resizeImage(file, maxWidth: 400, maxHeight: 400, quality: 0.7)
```

### 2. Dashboard Dinâmico

**Arquivo**: `dashboard.html` + `dashboard-script.js`

**Recursos**:
- **Navegação SPA**: Troca de seções sem recarregar página
- **Stats em Tempo Real**: Atualização automática via Firebase listeners
- **Filtros de Torneios**: Por jogo (CS2, Valorant, etc.)
- **Sistema de Inscrição**: Validação de saldo e disponibilidade
- **Painel Admin**: Aparece apenas para usuários com `isAdmin: true`

**Listeners em Tempo Real**:
```javascript
onValue(ref(database, 'tournaments'), (snapshot) => {
  // Atualiza interface automaticamente quando torneios mudam
});
```

### 3. Gerenciamento de Torneios (Admin)

**Funcionalidades Admin**:
- Formulário completo de criação
- Validação de todos os campos
- Preview de torneios criados
- Exclusão com confirmação
- Visualização de inscritos

**Campos do Torneio**:
- Nome do torneio
- Jogo (dropdown)
- Data e horário
- Prêmio em R$
- Número máximo de jogadores
- Taxa de inscrição
- Descrição detalhada

### 4. Sistema de Saldo

**Operações**:
- **Depósito**: Valor mínimo R$ 10,00
- **Saque**: Validação de saldo disponível
- **Histórico**: Registro de todas as transações
- **Sincronização**: Atualização em tempo real em toda a interface

**Segurança**:
- Validações no frontend e backend (Firebase Rules)
- Saldo nunca pode ser negativo
- Transações registradas com timestamp

### 5. Comunidade

**Visualização**:
- Cards com avatar, nome e email
- Estatísticas públicas (torneios, vitórias)
- Design em grid responsivo
- Sistema de equipes (planejado)

---

## 🎨 Design System

### Paleta de Cores

```css
:root {
    --primary: #8B5CF6;        /* Roxo principal */
    --primary-dark: #6D28D9;   /* Roxo escuro */
    --secondary: #EC4899;      /* Rosa neon */
    --accent: #F97316;         /* Laranja */
    --dark: #1E1B2E;          /* Fundo escuro */
    --darker: #0F0D1A;        /* Fundo mais escuro */
    --gray: #2D2A3E;          /* Cinza cards */
    --light-gray: #A78BFA;    /* Cinza claro */
    --success: #F59E0B;       /* Amarelo/ouro */
}
```

### Componentes Visuais

- **Cards**: Background `var(--card-bg)` com border-radius 12px
- **Botões**: Gradientes com efeito hover scale
- **Inputs**: Fundo escuro com borda sutil
- **Navegação**: Sticky navbar com backdrop-blur
- **Animações**: Float, pulse, fadeIn

---

## 🔄 Fluxo de Usuário

### Novo Usuário

1. Acessa `index.html` (landing page)
2. Clica em "Cadastrar"
3. Preenche formulário e faz upload de avatar
4. Sistema cria conta no Firebase Auth
5. Cria perfil no Realtime Database
6. Redireciona para `dashboard.html`

### Usuário Existente

1. Acessa `index.html`
2. Clica em "Acessar"
3. Faz login no `login.html`
4. Firebase valida credenciais
5. Redireciona para `dashboard.html`
6. Carrega dados personalizados

### Inscrição em Torneio

1. Usuário navega até "Campeonatos"
2. Filtra por jogo desejado
3. Clica em "Inscrever-se"
4. Sistema valida:
   - Saldo suficiente
   - Torneio não lotado
   - Não está já inscrito
5. Deduz taxa do saldo
6. Adiciona usuário na lista de players
7. Atualiza interface em tempo real

### Admin Criando Torneio

1. Admin acessa "Campeonatos"
2. Clica em "⚙️ Painel Administrativo"
3. Preenche formulário completo
4. Clica em "✨ Criar Torneio"
5. Firebase valida permissões
6. Torneio aparece para todos os usuários
7. Admin pode gerenciar/excluir

---

## 📱 Responsividade

### Breakpoints

- **Desktop**: > 1024px
- **Tablet**: 768px - 1024px
- **Mobile**: < 768px

### Ajustes Mobile

- Navbar colapsa
- Grid de torneios vira coluna única
- Sidebar do dashboard esconde labels
- Stats exibidos em 2 colunas
- Botões ocupam largura total

---

## 🐛 Solução de Problemas

### Avatar não carrega

**Problema**: Imagem muito grande ou formato inválido

**Solução**:
- Aceita apenas imagens (PNG, JPG, JPEG)
- Limite de 5MB antes da compressão
- Compressão automática para ~200KB

### Torneios não aparecem

**Problema**: Firebase Rules bloqueando leitura

**Solução**:
```json
"tournaments": {
  ".read": true  // Permite leitura pública
}
```

### Não consegue criar torneio

**Problema**: Usuário não é admin

**Solução**:
```
Firebase Console > Database > users/{uid}/isAdmin = true
```

### Erro ao se inscrever

**Problema**: Saldo insuficiente ou torneio lotado

**Solução**:
- Adicione saldo na seção "Saldo"
- Verifique vagas disponíveis

---

## 🚧 Roadmap / Melhorias Futuras

### Em Desenvolvimento

- [ ] Sistema de apostas completo
- [ ] Chat em tempo real
- [ ] Sistema de equipes
- [ ] Matchmaking automático
- [ ] Rankings globais

### Planejado

- [ ] Notificações push
- [ ] Integração com Discord
- [ ] Stream de partidas
- [ ] Replays e highlights
- [ ] Sistema de conquistas
- [ ] Loja de itens virtuais
- [ ] Torneios automáticos
- [ ] API pública

### Otimizações

- [ ] Service Workers (PWA)
- [ ] Lazy loading de imagens
- [ ] Cache de dados
- [ ] Compressão Gzip
- [ ] CDN para assets

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Para contribuir:

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/NovaFuncionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/NovaFuncionalidade`)
5. Abra um Pull Request

### Padrões de Código

- Use nomes descritivos para variáveis e funções
- Comente código complexo
- Mantenha consistência com o estilo existente
- Teste antes de commitar

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

---

## 👨‍💻 Autor

**Equipe Starz Up**

- Website: [starzup.com](https://starzup.com)
- Discord: [/starzup](https://discord.gg/starzup)
- Email: suporte@starzup.com

---

## 🙏 Agradecimentos

- **Firebase** pela infraestrutura robusta
- **Comunidade de Gamers** pelo feedback
- **UI Avatars** pelo serviço de avatares padrão
- **Google Fonts** pelas fontes utilizadas

---

## 📞 Suporte

Encontrou algum problema? Precisa de ajuda?

- 📧 Email: raphaelsales08@gmail.com
**⭐ Se este projeto te ajudou, deixe uma estrela no GitHub!**

**🎮 Bons jogos e boa sorte nos torneios!**
