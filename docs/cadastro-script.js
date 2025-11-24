// cadastro-script.js
import { auth, database } from './firebase-config.js';
import { createUserWithEmailAndPassword, updateProfile } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { ref, set } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('cadastroForm');
    const avatarInput = document.getElementById('avatarInput');
    const avatarPreview = document.getElementById('avatarPreview');
    let avatarBase64 = null;
    
    // Preview do avatar
    avatarInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        
        if (file) {
            // Validar tamanho (máximo 2MB)
            if (file.size > 2 * 1024 * 1024) {
                alert('A imagem deve ter no máximo 2MB!');
                avatarInput.value = '';
                return;
            }
            
            // Validar tipo
            if (!file.type.startsWith('image/')) {
                alert('Por favor, selecione apenas imagens!');
                avatarInput.value = '';
                return;
            }
            
            const reader = new FileReader();
            
            reader.onload = function(e) {
                avatarBase64 = e.target.result;
                avatarPreview.innerHTML = `<img src="${avatarBase64}" alt="Avatar Preview">`;
            };
            
            reader.readAsDataURL(file);
        }
    });
    
    // Clique no preview também abre o seletor
    avatarPreview.addEventListener('click', function() {
        avatarInput.click();
    });
    
    // Cadastro
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const nome = document.getElementById('nome').value;
        const email = document.getElementById('email').value;
        const senha = document.getElementById('senha').value;
        
        // Desabilitar botão durante o processo
        const btnSubmit = form.querySelector('.btn-primary');
        btnSubmit.disabled = true;
        btnSubmit.textContent = 'Cadastrando...';
        
        try {
            // Criar usuário no Firebase Auth
            const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
            const user = userCredential.user;
            
            // Avatar padrão caso não tenha sido selecionado
            const avatarFinal = avatarBase64 || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(nome) + '&background=8B5CF6&color=fff&size=200';
            
            // Atualizar perfil com o nome e avatar
            await updateProfile(user, {
                displayName: nome,
                photoURL: avatarFinal
            });
            
            // Salvar dados no Realtime Database
            await set(ref(database, 'users/' + user.uid), {
                nome: nome,
                email: email,
                avatar: avatarFinal,
                saldo: 0,
                dataCriacao: new Date().toISOString(),
                torneiosInscritos: [],
                apostas: [],
                vitorias: 0,
                derrotas: 0,
                partidasJogadas: 0,
                isAdmin: false // Por padrão, não é admin
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
            
            // Reabilitar botão
            btnSubmit.disabled = false;
            btnSubmit.textContent = 'Cadastrar';
        }
    });
});
