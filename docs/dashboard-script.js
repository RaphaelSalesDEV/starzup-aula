// dashboard-script.js
import { auth, database } from './firebase-config.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { ref, get, set, update, onValue } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// Verificar autenticação
onAuthStateChanged(auth, (user) => {
    if (user) {
        loadUserData(user);
        loadDashboardData(user.uid);
    } else {
        // Redirecionar para index se não estiver logado
        window.location.href = 'index.html';
    }
});

// Carregar dados do usuário
async function loadUserData(user) {
    const userName = document.getElementById('userName');
    const userEmail = document.getElementById('userEmail');
    const welcomeName = document.getElementById('welcomeName');
    
    userName.textContent = user.displayName || 'Jogador';
    userEmail.textContent = user.email;
    welcomeName.textContent = user.displayName || 'Jogador';
    
    // Carregar saldo do usuário
    const userRef = ref(database, 'users/' + user.uid);
    const snapshot = await get(userRef);
    
    if (snapshot.exists()) {
        const userData = snapshot.val();
        updateBalance(userData.saldo || 0);
        updateStats(userData);
    }
}

// Atualizar saldo na interface
function updateBalance(saldo) {
    const balanceElements = document.querySelectorAll('#headerBalance, #currentBalance');
    balanceElements.forEach(el => {
        el.textContent = `R$ ${saldo.toFixed(2)}`;
    });
}

// Atualizar estatísticas
function updateStats(userData) {
    document.getElementById('statTorneios').textContent = userData.torneiosInscritos?.length || 0;
    document.getElementById('statPartidas').textContent = userData.partidasJogadas || 0;
    document.getElementById('statVitorias').textContent = userData.vitorias || 0;
    document.getElementById('statRanking').textContent = userData.ranking ? `#${userData.ranking}` : '#-';
}

// Carregar dados do dashboard
async function loadDashboardData(userId) {
    loadUpcomingTournaments();
    loadActivityFeed(userId);
}

// Carregar próximos torneios
async function loadUpcomingTournaments() {
    const container = document.getElementById('upcomingTournaments');
    
    // Dados mockados - você pode substituir por dados reais do Firebase
    const tournaments = [
        { 
            name: 'CS2 Championship',
            game: 'CS2',
            date: '15/11/2025',
            prize: 'R$ 5.000',
            players: '32/64'
        },
        { 
            name: 'VALORANT Pro League',
            game: 'VALORANT',
            date: '18/11/2025',
            prize: 'R$ 3.000',
            players: '16/32'
        },
        { 
            name: 'Rocket League Cup',
            game: 'Rocket League',
            date: '20/11/2025',
            prize: 'R$ 2.000',
            players: '24/48'
        }
    ];
    
    container.innerHTML = tournaments.map(t => `
        <div class="tournament-item" style="background: var(--dark-bg); padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
            <h4 style="color: var(--primary-color); margin-bottom: 0.5rem;">${t.name}</h4>
            <p style="color: var(--text-secondary); font-size: 0.9rem;">${t.game} | ${t.date}</p>
            <div style="display: flex; justify-content: space-between; margin-top: 0.5rem;">
                <span style="color: var(--success);">💰 ${t.prize}</span>
                <span style="color: var(--text-secondary);">👥 ${t.players}</span>
            </div>
        </div>
    `).join('');
}

// Carregar feed de atividades
async function loadActivityFeed(userId) {
    const container = document.getElementById('activityFeed');
    
    // Dados mockados
    const activities = [
        { type: 'win', text: 'Vitória no torneio CS2 Casual', time: '2h atrás' },
        { type: 'bet', text: 'Aposta realizada - R$ 50', time: '5h atrás' },
        { type: 'register', text: 'Inscrito em VALORANT Pro', time: '1 dia atrás' }
    ];
    
    container.innerHTML = activities.map(a => `
        <div class="activity-item" style="padding: 1rem; border-left: 3px solid var(--primary-color); background: var(--dark-bg); border-radius: 4px; margin-bottom: 0.5rem;">
            <p style="margin-bottom: 0.25rem;">${a.text}</p>
            <small style="color: var(--text-secondary);">${a.time}</small>
        </div>
    `).join('');
}

// Navegação entre seções
document.querySelectorAll('.nav-menu a').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Remover active de todos
        document.querySelectorAll('.nav-menu a').forEach(l => l.classList.remove('active'));
        document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
        
        // Adicionar active no clicado
        link.classList.add('active');
        const section = link.dataset.section;
        document.getElementById(`section-${section}`).classList.add('active');
    });
});

// Filtros de campeonatos
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        const game = btn.dataset.game;
        loadTournamentsByGame(game);
    });
});

// Carregar torneios por jogo
function loadTournamentsByGame(game) {
    const container = document.getElementById('tournamentsGrid');
    
    // Dados mockados
    const allTournaments = [
        { game: 'cs2', name: 'CS2 Championship', prize: 'R$ 5.000', date: '15/11/2025' },
        { game: 'valorant', name: 'VALORANT Pro League', prize: 'R$ 3.000', date: '18/11/2025' },
        { game: 'rocket', name: 'Rocket League Cup', prize: 'R$ 2.000', date: '20/11/2025' },
        { game: 'fortnite', name: 'Fortnite Battle', prize: 'R$ 4.000', date: '22/11/2025' }
    ];
    
    const filtered = game === 'all' ? allTournaments : allTournaments.filter(t => t.game === game);
    
    container.innerHTML = filtered.map(t => `
        <div class="tournament-card" style="background: var(--card-bg); padding: 1.5rem; border-radius: 12px;">
            <h3 style="margin-bottom: 1rem; color: var(--primary-color);">${t.name}</h3>
            <p style="color: var(--text-secondary); margin-bottom: 0.5rem;">📅 ${t.date}</p>
            <p style="color: var(--success); margin-bottom: 1rem;">💰 ${t.prize}</p>
            <button class="btn-primary" style="width: 100%;">Inscrever-se</button>
        </div>
    `).join('');
}

// Tabs da comunidade
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        
        btn.classList.add('active');
        document.getElementById(`${btn.dataset.tab}Content`).classList.add('active');
    });
});

// FAQ
document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
        btn.parentElement.classList.toggle('active');
    });
});

// Gerenciamento de saldo
document.getElementById('depositBtn')?.addEventListener('click', async () => {
    const amount = parseFloat(document.getElementById('depositAmount').value);
    
    if (!amount || amount < 10) {
        alert('Valor mínimo de depósito: R$ 10');
        return;
    }
    
    const user = auth.currentUser;
    if (!user) return;
    
    try {
        const userRef = ref(database, 'users/' + user.uid);
        const snapshot = await get(userRef);
        const currentBalance = snapshot.val()?.saldo || 0;
        
        await update(userRef, {
            saldo: currentBalance + amount
        });
        
        // Adicionar transação
        const transactionRef = ref(database, `transactions/${user.uid}/${Date.now()}`);
        await set(transactionRef, {
            type: 'deposit',
            amount: amount,
            date: new Date().toISOString()
        });
        
        updateBalance(currentBalance + amount);
        alert(`Depósito de R$ ${amount.toFixed(2)} realizado com sucesso!`);
        document.getElementById('depositAmount').value = '';
        
    } catch (error) {
        console.error('Erro ao depositar:', error);
        alert('Erro ao realizar depósito');
    }
});

document.getElementById('withdrawBtn')?.addEventListener('click', async () => {
    const amount = parseFloat(document.getElementById('withdrawAmount').value);
    
    if (!amount || amount < 10) {
        alert('Valor mínimo de saque: R$ 10');
        return;
    }
    
    const user = auth.currentUser;
    if (!user) return;
    
    try {
        const userRef = ref(database, 'users/' + user.uid);
        const snapshot = await get(userRef);
        const currentBalance = snapshot.val()?.saldo || 0;
        
        if (amount > currentBalance) {
            alert('Saldo insuficiente');
            return;
        }
        
        await update(userRef, {
            saldo: currentBalance - amount
        });
        
        // Adicionar transação
        const transactionRef = ref(database, `transactions/${user.uid}/${Date.now()}`);
        await set(transactionRef, {
            type: 'withdraw',
            amount: amount,
            date: new Date().toISOString()
        });
        
        updateBalance(currentBalance - amount);
        alert(`Saque de R$ ${amount.toFixed(2)} realizado com sucesso!`);
        document.getElementById('withdrawAmount').value = '';
        
    } catch (error) {
        console.error('Erro ao sacar:', error);
        alert('Erro ao realizar saque');
    }
});

// Logout
document.getElementById('logoutBtn').addEventListener('click', async () => {
    if (confirm('Deseja realmente sair?')) {
        try {
            await signOut(auth);
            window.location.href = 'index.html';
        } catch (error) {
            console.error('Erro ao fazer logout:', error);
            alert('Erro ao sair');
        }
    }
});

// Inicializar dados
loadTournamentsByGame('all');
