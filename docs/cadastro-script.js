// cadastro-script.js
import { auth, database } from './firebase-config.js';
import { createUserWithEmailAndPassword, updateProfile } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { ref, set } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('form');
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const nome = document.getElementById('nome').value;
        const email = document.getElementById('email').value;
        const senha = document.getElementById('senha').value;
        
        try {
            // Criar usuário no Firebase Auth
            const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
            const user = userCredential.user;
            
            // Atualizar perfil com o nome
            await updateProfile(user, {
                displayName: nome
            });
            
            // Salvar dados adicionais no Realtime Database
            await set(ref(database, 'users/' + user.uid), {
                nome: nome,
                email: email,
                saldo: 0,
                dataCriacao: new Date().toISOString(),
                torneiosInscritos: [],
                apostas: []
            });
            
            alert('Cadastro realizado com sucesso!');
            window.location.href = 'dashboard.html';
            
        } catch (error) {
            console.error('Erro no cadastro:', error);
            let mensagem = 'Erro ao realizar cadastro. ';
            
            switch(error.code) {
                case 'auth/email-already-in-use':
                    mensagem += 'Este e-mail já está cadastrado.';
                    break;
                case 'auth/invalid-email':
                    mensagem += 'E-mail inválido.';
                    break;
                case 'auth/weak-password':
                    mensagem += 'Senha muito fraca.';
                    break;
                default:
                    mensagem += error.message;
            }
            
            alert(mensagem);
        }
    });
});
