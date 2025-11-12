// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyB2_TH5LUtcOOqtpdp8qzCw5aphx50xJ2c",
  authDomain: "starzup-teste-aula.firebaseapp.com",
  databaseURL: "https://starzup-teste-aula-default-rtdb.firebaseio.com",
  projectId: "starzup-teste-aula",
  storageBucket: "starzup-teste-aula.firebasestorage.app",
  messagingSenderId: "939382403953",
  appId: "1:939382403953:web:9c8492ed3e87f22186bcd0",
  measurementId: "G-CGS2CLJM92"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const database = getDatabase(app);
