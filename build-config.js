// build-config.js
// Este script é executado pela Vercel durante o deploy.
// Ele lê as variáveis de ambiente e gera o firebase-config.js automaticamente.

const fs = require('fs');

const requiredVars = [
  'FIREBASE_API_KEY',
  'FIREBASE_AUTH_DOMAIN',
  'FIREBASE_DATABASE_URL',
  'FIREBASE_PROJECT_ID',
  'FIREBASE_STORAGE_BUCKET',
  'FIREBASE_MESSAGING_SENDER',
  'FIREBASE_APP_ID'
];

// Verificar se todas as variáveis estão definidas
const missing = requiredVars.filter(v => !process.env[v]);
if (missing.length > 0) {
  console.error('❌ Variáveis de ambiente faltando:', missing.join(', '));
  process.exit(1);
}

const config = `// firebase-config.js
// Arquivo gerado automaticamente pelo build-config.js — NÃO edite manualmente.
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "${process.env.FIREBASE_API_KEY}",
  authDomain: "${process.env.FIREBASE_AUTH_DOMAIN}",
  databaseURL: "${process.env.FIREBASE_DATABASE_URL}",
  projectId: "${process.env.FIREBASE_PROJECT_ID}",
  storageBucket: "${process.env.FIREBASE_STORAGE_BUCKET}",
  messagingSenderId: "${process.env.FIREBASE_MESSAGING_SENDER}",
  appId: "${process.env.FIREBASE_APP_ID}"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const database = getDatabase(app);
`;

fs.writeFileSync('docs/firebase-config.js', config);
console.log('✅ firebase-config.js gerado em docs/ com sucesso!');
