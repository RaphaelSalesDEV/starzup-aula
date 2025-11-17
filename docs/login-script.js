// login-script.js
import { auth } from './firebase-config.js';
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('.login-form');
    
    // Login com email e senha
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const senha = document.getElementById('senha').value;
        const btnLogin = form.querySelector('.btn-login');
        
        // Desabilitar botão durante o processo
        btnLogin.disabled = true;
        btnLogin.textContent = 'Entrando...';
        
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
                case 'auth/invalid-credential':
                    mensagem += 'E-mail ou senha incorretos.';
                    break;
                default:
                    mensagem += error.message;
            }
            
            alert(mensagem);
            
            // Reabilitar botão
            btnLogin.disabled = false;
            btnLogin.textContent = 'Entrar';
        }
    });
});
