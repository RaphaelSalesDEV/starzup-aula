# 🎮 Starz Up - Online Gaming Tournament Platform

## 📋 About

**Starz Up** is a full-featured web platform for organizing and managing competitive gaming tournaments. It offers a modern, intuitive experience for players to register in championships, manage their balance, interact with the community, and compete in their favorite games.

### 🎯 Supported Games

- **CS2** (Counter-Strike 2)
- **VALORANT** (Tactical FPS)
- **Rocket League** (Soccer with Cars)
- **Fortnite** (Battle Royale)

---

## ✨ Features

### 👥 For Users

- **Authentication System** — Login/register with Firebase Authentication, custom avatar upload with automatic compression, and performance stats profile
- **Interactive Dashboard** — Personal statistics (tournaments, wins, losses), real-time activity feed, and upcoming tournaments
- **Tournament System** — Join championships by game, filter by category, view prizes and entry fees, limited slots system
- **Balance Management** — Deposits and withdrawals, transaction history, real-time balance sync
- **Community** — View registered players, public user stats, teams system (in development)
- **Support** — Integrated FAQ, contact options (chat, email)

### 🛠️ For Admins

- **Admin Panel** — Create and manage tournaments, delete championships, view registered players
- **Full Control** — Elevated Firebase permissions, access to all user data, platform moderation

---

## 🏗️ Project Architecture

### 📁 File Structure

```
starzup-aula/
│
├── build-config.js            # Generates firebase-config.js at deploy time
├── vercel.json                # Vercel build configuration
├── .gitignore                 # Excludes sensitive files from git
├── LICENSE
├── README.md
│
└── docs/                      # Main application (served by Vercel)
    ├── index.html             # Public landing page
    ├── login.html             # Login page
    ├── cadastro.html          # Register page
    ├── dashboard.html         # User dashboard
    ├── style.css
    ├── login.css
    ├── cadastro.css
    ├── dashboard.css
    ├── cadastro-script.js
    ├── dashboard-script.js
    ├── login-script.js
    ├── firebase-config.js     # ⚠️ Auto-generated at deploy — NOT in repository
    │
    ├── apostas/               # Betting section (under maintenance)
    ├── campeonatos/           # Championships section
    ├── comunidade/            # Community section
    ├── suporte/               # Support section
    └── imagens/               # Visual assets
```

---

## 🔥 Tech Stack

### Frontend
- **HTML5** — Semantic structure
- **CSS3** — Modern styling with gradients and animations
- **JavaScript ES6+** — Logic and interactivity
- **Firebase SDK 10.7.1** — Backend integration

### Backend & Infrastructure
- **Firebase Authentication** — Auth system
- **Firebase Realtime Database** — NoSQL real-time database
- **Firebase Security Rules** — Access control
- **Vercel** — Hosting and deployment

---

## 🚀 Setup & Installation

### Prerequisites

- Modern web browser (Chrome, Firefox, Edge, Safari)
- Firebase account (free)
- Vercel account (free)
- VS Code (recommended)

### Step by Step

#### 1. Clone the Repository

```bash
git clone https://github.com/RaphaelSalesDEV/starzup-aula.git
cd starzup-aula
```

#### 2. Set Up Firebase

Go to [Firebase Console](https://console.firebase.google.com/) and:

1. Create a new project
2. Enable **Authentication** (Email/Password method)
3. Enable **Realtime Database**
4. Configure **Security Rules** (see section below)
5. Copy your project credentials

#### 3. Configure Environment Variables on Vercel

In your Vercel project, go to **Settings → Environment Variables** and add:

```
FIREBASE_API_KEY
FIREBASE_AUTH_DOMAIN
FIREBASE_DATABASE_URL
FIREBASE_PROJECT_ID
FIREBASE_STORAGE_BUCKET
FIREBASE_MESSAGING_SENDER
FIREBASE_APP_ID
```

> The `firebase-config.js` file is **automatically generated at deploy time** by `build-config.js` using these environment variables. It is never stored in the repository.

#### 4. Configure Firebase Security Rules

In Firebase Console, go to **Realtime Database > Rules**:

```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "auth != null",
        ".write": "$uid === auth.uid || root.child('users').child(auth.uid).child('isAdmin').val() === true",
        "nome": { ".validate": "newData.isString() && newData.val().length >= 3" },
        "email": { ".validate": "newData.isString()" },
        "avatar": { ".validate": "newData.isString()" },
        "saldo": { ".validate": "newData.isNumber() && newData.val() >= 0" },
        "vitorias": { ".validate": "newData.isNumber() && newData.val() >= 0" },
        "derrotas": { ".validate": "newData.isNumber() && newData.val() >= 0" },
        "isAdmin": { ".validate": "newData.isBoolean()" }
      }
    },
    "tournaments": {
      ".read": true,
      ".write": "auth != null && root.child('users').child(auth.uid).child('isAdmin').val() === true",
      "$tournamentId": {
        ".read": true,
        ".write": "auth != null && root.child('users').child(auth.uid).child('isAdmin').val() === true",
        "players": { ".write": "auth != null" }
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

#### 5. Deploy

Push to your `main` branch — Vercel will automatically build and deploy.

---

## 🔐 Security Model

### How Credentials Are Protected

This project uses a **build-time secret injection** pattern:

1. Firebase credentials are stored as **Vercel Environment Variables** (never in the repository)
2. At deploy time, `build-config.js` reads those variables and generates `docs/firebase-config.js`
3. The generated file is served to the browser but **never committed to git**
4. `.gitignore` ensures `firebase-config.js` is always excluded

### Permission Rules

| Resource | Read | Write |
|---|---|---|
| `/users` | Any authenticated user | Owner or admin |
| `/tournaments` | Everyone (public) | Admins only |
| `/tournaments/players` | Everyone | Any authenticated user |
| `/transactions` | Owner or admin | Owner only |

### How to Make a User Admin

1. Go to Firebase Console
2. Navigate to **Realtime Database**
3. Find `/users/{uid}/`
4. Set `isAdmin: true`

---

## 📊 Database Structure

```
firebase-realtime-database/
│
├── users/
│   └── {userId}/
│       ├── nome: string
│       ├── email: string
│       ├── avatar: string (base64 or URL)
│       ├── saldo: number
│       ├── dataCriacao: timestamp
│       ├── torneiosInscritos: array
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

## 🎨 Design System

### Color Palette

```css
:root {
    --primary: #8B5CF6;        /* Main purple */
    --primary-dark: #6D28D9;   /* Dark purple */
    --secondary: #EC4899;      /* Neon pink */
    --accent: #F97316;         /* Orange */
    --dark: #1E1B2E;           /* Dark background */
    --darker: #0F0D1A;         /* Deeper background */
    --gray: #2D2A3E;           /* Card gray */
    --light-gray: #A78BFA;     /* Light gray */
    --success: #F59E0B;        /* Gold/yellow */
}
```

---

## 🚧 Roadmap

### In Development
- [ ] Full betting system
- [ ] Real-time chat
- [ ] Teams system
- [ ] Automatic matchmaking
- [ ] Global rankings

### Planned
- [ ] Push notifications
- [ ] Discord integration
- [ ] Match streaming
- [ ] Replays & highlights
- [ ] Achievement system
- [ ] Virtual item store
- [ ] Public API

---

## 🤝 Contributing

Contributions are welcome! To contribute:

1. Fork the project
2. Create a branch (`git checkout -b feature/NewFeature`)
3. Commit your changes (`git commit -m 'Add new feature'`)
4. Push to the branch (`git push origin feature/NewFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License. See the `LICENSE` file for details.

---

## 👨‍💻 Authors

**Raphael Sales // Rafael Colagrossi**

[![Gmail](https://img.shields.io/badge/rafaelcolagrossi%40gmail.com-D14836?style=flat&logo=gmail&logoColor=white)](mailto:rafaelcolagrossi@gmail.com)
[![Gmail](https://img.shields.io/badge/rafaelcolagrossi%40gmail.com-D14836?style=flat&logo=gmail&logoColor=white)](mailto:raphaelsales08@gmail.com)
  

---

## 🙏 Acknowledgements

- **Firebase** for the robust infrastructure
- **Vercel** for the seamless deployment platform
- **UI Avatars** for the default avatar service

---

**⭐ If this project helped you, leave a star on GitHub!**

