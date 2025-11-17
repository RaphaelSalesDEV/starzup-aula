// make-admin.js
// Execute este script no console do navegador para tornar um usuário administrador
// IMPORTANTE: Faça login com o usuário que você quer tornar admin primeiro!

import { auth, database } from './firebase-config.js';
import { ref, set } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

async function makeCurrentUserAdmin() {
    const user = auth.currentUser;
    
    if (!user) {
        console.error('Nenhum usuário logado! Faça login primeiro.');
        return;
    }
    
    try {
        const adminRef = ref(database, 'admins/' + user.uid);
        await set(adminRef, {
            email: user.email,
            displayName: user.displayName || user.email,
            createdAt: Date.now()
        });
        
        console.log('✅ Usuário promovido a administrador com sucesso!');
        console.log('Email:', user.email);
        console.log('UID:', user.uid);
        console.log('Recarregue a página para ver as funcionalidades de admin.');
        
    } catch (error) {
        console.error('❌ Erro ao tornar usuário admin:', error);
    }
}

// Tornar específico usuário admin por email
async function makeUserAdminByEmail(emailToPromote) {
    try {
        // Este método requer que você saiba o UID do usuário
        // Por segurança, use apenas no console com seu próprio usuário
        console.log('Use makeCurrentUserAdmin() para tornar o usuário atual admin');
        console.log('Ou adicione manualmente no Firebase Console em Database > admins > [UID]');
    } catch (error) {
        console.error('Erro:', error);
    }
}

// Executar automaticamente
makeCurrentUserAdmin();

// Exportar funções para uso manual no console
window.makeCurrentUserAdmin = makeCurrentUserAdmin;
