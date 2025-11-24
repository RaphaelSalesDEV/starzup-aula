// cadastro-script.js
import { auth, database } from './firebase-config.js';
import { createUserWithEmailAndPassword, updateProfile } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { ref, set } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('cadastroForm');
    const avatarInput = document.getElementById('avatarInput');
    const avatarPreview = document.getElementById('avatarPreview');
    let avatarBase64 = null;
    
    // Função para redimensionar imagem
    function resizeImage(file, maxWidth, maxHeight, quality) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = function(e) {
                const img = new Image();
                
                img.onload = function() {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;
                    
                    // Calcular novas dimensões mantendo proporção
                    if (width > height) {
                        if (width > maxWidth) {
                            height *= maxWidth / width;
                            width = maxWidth;
                        }
                    } else {
                        if (height > maxHeight) {
                            width *= maxHeight / height;
                            height = maxHeight;
                        }
                    }
                    
                    canvas.width = width;
                    canvas.height = height;
                    
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    
                    // Converter para base64 com qualidade reduzida
                    const resizedBase64 = canvas.toDataURL('image/jpeg', quality);
                    resolve(resizedBase64);
                };
                
                img.onerror = reject;
                img.src = e.target.result;
            };
            
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }
    
    // Preview do avatar
    avatarInput.addEventListener('change', async function(e) {
        const file = e.target.files[0];
        
        if (file) {
            // Validar tamanho (máximo 5MB antes da compressão)
            if (file.size > 5 * 1024 * 1024) {
                alert('A imagem deve ter no máximo 5MB!');
                avatarInput.value = '';
                return;
            }
            
            // Validar tipo
            if (!file.type.startsWith('image/')) {
                alert('Por favor, selecione apenas imagens!');
                avatarInput.value = '';
                return;
            }
            
            try {
                // Mostrar loading
                avatarPreview.innerHTML = '<span style="font-size: 2rem;">⏳</span>';
                
                // Redimensionar imagem para 400x400 com qualidade 0.7
                avatarBase64 = await resizeImage(file, 400, 400, 0.7);
                
                // Verificar tamanho final
                const sizeInKB = (avatarBase64.length * 3) / 4 / 1024;
                console.log(`Imagem redimensionada: ${sizeInKB.toFixed(2)} KB`);
                
                // Se ainda estiver muito grande, reduzir mais
                if (sizeInKB > 200) {
                    avatarBase64 = await resizeImage(file, 300, 300, 0.6);
                    console.log('Imagem comprimida novamente para reduzir tamanho');
                }
                
                avatarPreview.innerHTML = `<img src="${avatarBase64}" alt="Avatar Preview">`;
                
            } catch (error) {
                console.error('Erro ao processar imagem:', error);
                alert('Erro ao processar imagem. Tente outra foto.');
                avatarInput.value = '';
                avatarPreview.innerHTML = '<span class="avatar-placeholder">👤</span>';
            }
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
            const avatarFinal = avatarBase64 || `https://ui-avatars.com/api/?name=${encodeURIComponent(nome)}&background=8B5CF6&color=fff&size=400&bold=true`;
            
            // Atualizar apenas o displayName (não o photoURL para evitar erro)
            await updateProfile(user, {
                displayName: nome
            });
            
            // Salvar dados no Realtime Database (incluindo o avatar)
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
                isAdmin: false
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
