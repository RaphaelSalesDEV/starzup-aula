// login-script.js
import { auth } from './firebase-config.js';
import { signInWithEmailAndPassword, GoogleAuthProvider, FacebookAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('.login-form');
    
    // Login com email e senha
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const senha = document.getElementById('senha').value;
        
        try {
            await signInWithEmailAndPassword(auth, email, senha);
            window.location.href = 'dashboard.html';
        } catch (error) {
            console.error('Erro no login:', error);
            let mensagem = 'Erro ao fazer login. ';
            
            switch(error.code) {
                case 'auth/user-not-found':
                    mensagem += 'Usuário não encontrado.';
                    break;
                case 'auth/wrong-password':
                    mensagem += 'Senha incorreta.';
                    break;
                case 'auth/invalid-email':
                    mensagem += 'E-mail inválido.';
                    break;
                default:
                    mensagem += error.message;
            }
            
            alert(mensagem);
        }
    });
    
    // Login com Google
    const googleBtn = document.querySelector('.btn-social.google');
    googleBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        const provider = new GoogleAuthProvider();
        
        try {
            await signInWithPopup(auth, provider);
            window.location.href = 'dashboard.html';
        } catch (error) {
            console.error('Erro no login com Google:', error);
            alert('Erro ao fazer login com Google: ' + error.message);
        }
    });
    
    // Login com Facebook
    const facebookBtn = document.querySelector('.btn-social.facebook');
    facebookBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        const provider = new FacebookAuthProvider();
        
        try {
            await signInWithPopup(auth, provider);
            window.location.href = 'dashboard.html';
        } catch (error) {
            console.error('Erro no login com Facebook:', error);
            alert('Erro ao fazer login com Facebook: ' + error.message);
        }
    });
});
