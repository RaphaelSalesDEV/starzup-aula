// dashboard-script.js
import { auth, database } from './firebase-config.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { ref, get, set, update, onValue, push, remove } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

let currentUser = null;
let isAdmin = false;

// Verificar autenticação
onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentUser = user;
        await checkAdminStatus(user);
        loadUserData(user);
        loadDashboardData(user.uid);
        setupRealtimeListeners();
    } else {
        window.location.href = 'index.html';
    }
});

// Verificar se é administrador
async function checkAdminStatus(user) {
    const adminRef = ref(database, 'admins/' + user.uid);
    const snapshot = await get(adminRef);
    isAdmin = snapshot.exists();
    
    if (isAdmin) {
        showAdminFeatures();
    }
}

// Mostrar recursos de admin
function showAdminFeatures() {
    // Adicionar botão de admin no menu
    const navMenu = document.querySelector('.nav-menu');
    const adminItem = document.createElement('li');
    adminItem.innerHTML = `
        <a href="#admin" data-section="admin">
            <span class="icon">⚙️</span>
            <span>Admin</span>
        </a>
    `;
    navMenu.appendChild(adminItem);
    
    // Criar seção de admin
    const mainContent = document.querySelector('.main-content');
    const adminSection = document.createElement('section');
    adminSection.id = 'section-admin';
    adminSection.className = 'content-section';
    adminSection.innerHTML = `
        <h1>Painel Administrativo</h1>
        <div class="admin-container">
            <div class="admin-card">
                <h2>Criar Novo Torneio</h2>
                <form id="createTournamentForm" class="tournament-form">
                    <div class="form-group">
                        <label>Nome do Torneio</label>
                        <input type="text" id="tournamentName" required>
                    </div>
                    
                    <div class="form-group">
                        <label>Jogo</label>
                        <select id="tournamentGame" required>
                            <option value="cs2">CS2</option>
                            <option value="valorant">VALORANT</option>
                            <option value="rocket">Rocket League</option>
                            <option value="fortnite">Fortnite</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label>Data do Torneio</label>
                        <input type="date" id="tournamentDate" required>
                    </div>
                    
                    <div class="form-group">
                        <label>Horário</label>
                        <input type="time" id="tournamentTime" required>
                    </div>
                    
                    <div class="form-group">
                        <label>Prêmio (R$)</label>
                        <input type="number" id="tournamentPrize" min="0" step="0.01" required>
                    </div>
                    
                    <div class="form-group">
                        <label>Número Máximo de Jogadores</label>
                        <input type="number" id="tournamentMaxPlayers" min="2" required>
                    </div>
                    
                    <div class="form-group">
                        <label>Taxa de Inscrição (R$)</label>
                        <input type="number" id="tournamentFee" min="0" step="0.01" required>
                    </div>
                    
                    <div class="form-group">
                        <label>Descrição</label>
                        <textarea id="tournamentDescription" rows="4" required></textarea>
                    </div>
                    
                    <button type="submit" class="btn-primary">Criar Torneio</button>
                </form>
            </div>
            
            <div class="admin-card">
                <h2>Torneios Criados</h2>
                <div id="adminTournamentsList" class="admin-tournaments-list">
                    <p class="loading">Carregando torneios...</p>
                </div>
            </div>
        </div>
    `;
    mainContent.appendChild(adminSection);
    
    // Adicionar estilos para admin
    const style = document.createElement('style');
    style.textContent = `
        .admin-container {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 2rem;
        }
        
        .admin-card {
            background: var(--card-bg);
            padding: 2rem;
            border-radius: 12px;
        }
        
        .admin-card h2 {
            margin-bottom: 1.5rem;
            padding-bottom: 1rem;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .tournament-form {
            display: flex;
            flex-direction: column;
            gap: 1rem;
        }
        
        .form-group {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
        }
        
        .form-group label {
            color: var(--text-secondary);
            font-size: 0.9rem;
        }
        
        .form-group input,
        .form-group select,
        .form-group textarea {
            padding: 0.75rem;
            background: var(--dark-bg);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 8px;
            color: white;
            font-family: inherit;
        }
        
        .admin-tournaments-list {
            max-height: 600px;
            overflow-y: auto;
        }
        
        .admin-tournament-item {
            background: var(--dark-bg);
            padding: 1rem;
            border-radius: 8px;
            margin-bottom: 1rem;
        }
        
        .admin-tournament-item h4 {
            color: var(--primary-color);
            margin-bottom: 0.5rem;
        }
        
        .admin-tournament-actions {
            display: flex;
            gap: 0.5rem;
            margin-top: 1rem;
        }
        
        .btn-danger {
            padding: 0.5rem 1rem;
            background: var(--danger);
            border: none;
            border-radius: 6px;
            color: white;
            cursor: pointer;
            transition: opacity 0.3s;
        }
        
        .btn-danger:hover {
            opacity: 0.8;
        }
        
        @media (max-width: 1024px) {
            .admin-container {
                grid-template-columns: 1fr;
            }
        }
    `;
    document.head.appendChild(style);
    
    // Setup form de criar torneio
    setTimeout(() => {
        setupCreateTournamentForm();
        loadAdminTournaments();
    }, 100);
}

// Setup form de criação de torneio
function setupCreateTournamentForm() {
    const form = document.getElementById('createTournamentForm');
    if (!form) return;
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const tournamentData = {
            name: document.getElementById('tournamentName').value,
            game: document.getElementById('tournamentGame').value,
            date: document.getElementById('tournamentDate').value,
            time: document.getElementById('tournamentTime').value,
            prize: parseFloat(document.getElementById('tournamentPrize').value),
            maxPlayers: parseInt(document.getElementById('tournamentMaxPlayers').value),
            fee: parseFloat(document.getElementById('tournamentFee').value),
            description: document.getElementById('tournamentDescription').value,
            createdBy: currentUser.uid,
            createdAt: Date.now(),
            players: [],
            status: 'open'
        };
        
        try {
            const tournamentsRef = ref(database, 'tournaments');
            await push(tournamentsRef, tournamentData);
            
            alert('Torneio criado com sucesso!');
            form.reset();
            loadAdminTournaments();
            loadTournamentsByGame('all');
        } catch (error) {
            console.error('Erro ao criar torneio:', error);
            alert('Erro ao criar torneio: ' + error.message);
        }
    });
}

// Carregar torneios do admin
async function loadAdminTournaments() {
    const container = document.getElementById('adminTournamentsList');
    if (!container) return;
    
    const tournamentsRef = ref(database, 'tournaments');
    const snapshot = await get(tournamentsRef);
    
    if (!snapshot.exists()) {
        container.innerHTML = '<p class="empty-state">Nenhum torneio criado ainda</p>';
        return;
    }
    
    const tournaments = [];
    snapshot.forEach((childSnapshot) => {
        tournaments.push({
            id: childSnapshot.key,
            ...childSnapshot.val()
        });
    });
    
    container.innerHTML = tournaments.map(t => `
        <div class="admin-tournament-item">
            <h4>${t.name}</h4>
            <p style="color: var(--text-secondary); font-size: 0.9rem;">
                ${t.game.toUpperCase()} | ${formatDate(t.date)} ${t.time}
            </p>
            <p style="color: var(--success); margin-top: 0.5rem;">
                💰 Prêmio: R$ ${t.prize.toFixed(2)}
            </p>
            <p style="color: var(--text-secondary); margin-top: 0.25rem;">
                👥 Inscritos: ${t.players?.length || 0}/${t.maxPlayers}
            </p>
            <div class="admin-tournament-actions">
                <button class="btn-danger" onclick="deleteTournament('${t.id}')">
                    🗑️ Excluir
                </button>
            </div>
        </div>
    `).join('');
}

// Excluir torneio
window.deleteTournament = async function(tournamentId) {
    if (!confirm('Tem certeza que deseja excluir este torneio?')) return;
    
    try {
        await remove(ref(database, 'tournaments/' + tournamentId));
        alert('Torneio excluído com sucesso!');
        loadAdminTournaments();
        loadTournamentsByGame('all');
    } catch (error) {
        console.error('Erro ao excluir torneio:', error);
        alert('Erro ao excluir torneio');
    }
};

// Formatar data
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
}

// Carregar dados do usuário
async function loadUserData(user) {
    const userName = document.getElementById('userName');
    const userEmail = document.getElementById('userEmail');
    const welcomeName = document.getElementById('welcomeName');
    
    userName.textContent = user.displayName || user.email.split('@')[0];
    userEmail.textContent = user.email;
    welcomeName.textContent = user.displayName || user.email.split('@')[0];
    
    // Inicializar dados do usuário se não existir
    const userRef = ref(database, 'users/' + user.uid);
    const snapshot = await get(userRef);
    
    if (!snapshot.exists()) {
        await set(userRef, {
            email: user.email,
            displayName: user.displayName || user.email.split('@')[0],
            saldo: 0,
            torneiosInscritos: [],
            partidasJogadas: 0,
            vitorias: 0,
            createdAt: Date.now()
        });
        updateBalance(0);
    } else {
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
    document.getElementById('statRanking').textContent = '#-';
}

// Carregar dados do dashboard
async function loadDashboardData(userId) {
    loadUpcomingTournaments();
    loadActivityFeed(userId);
}

// Carregar próximos torneios
async function loadUpcomingTournaments() {
    const container = document.getElementById('upcomingTournaments');
    const tournamentsRef = ref(database, 'tournaments');
    
    try {
        const snapshot = await get(tournamentsRef);
        
        if (!snapshot.exists()) {
            container.innerHTML = '<p class="empty-state">Nenhum torneio disponível</p>';
            return;
        }
        
        const tournaments = [];
        snapshot.forEach((childSnapshot) => {
            const tournament = childSnapshot.val();
            if (tournament.status === 'open') {
                tournaments.push({
                    id: childSnapshot.key,
                    ...tournament
                });
            }
        });
        
        // Ordenar por data
        tournaments.sort((a, b) => new Date(a.date) - new Date(b.date));
        
        container.innerHTML = tournaments.slice(0, 3).map(t => `
            <div class="tournament-item" style="background: var(--dark-bg); padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
                <h4 style="color: var(--primary-color); margin-bottom: 0.5rem;">${t.name}</h4>
                <p style="color: var(--text-secondary); font-size: 0.9rem;">
                    ${t.game.toUpperCase()} | ${formatDate(t.date)} ${t.time}
                </p>
                <div style="display: flex; justify-content: space-between; margin-top: 0.5rem;">
                    <span style="color: var(--success);">💰 ${t.prize.toFixed(2)}</span>
                    <span style="color: var(--text-secondary);">👥 ${t.players?.length || 0}/${t.maxPlayers}</span>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Erro ao carregar torneios:', error);
        container.innerHTML = '<p class="empty-state">Erro ao carregar torneios</p>';
    }
}

// Carregar feed de atividades
async function loadActivityFeed(userId) {
    const container = document.getElementById('activityFeed');
    container.innerHTML = '<p class="empty-state">Nenhuma atividade recente</p>';
}

// Navegação entre seções
document.querySelectorAll('.nav-menu a').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        
        document.querySelectorAll('.nav-menu a').forEach(l => l.classList.remove('active'));
        document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
        
        link.classList.add('active');
        const section = link.dataset.section;
        document.getElementById(`section-${section}`).classList.add('active');
        
        // Carregar dados específicos da seção
        if (section === 'campeonatos') {
            loadTournamentsByGame('all');
        } else if (section === 'comunidade') {
            loadCommunityUsers();
        }
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
async function loadTournamentsByGame(game) {
    const container = document.getElementById('tournamentsGrid');
    const tournamentsRef = ref(database, 'tournaments');
    
    try {
        const snapshot = await get(tournamentsRef);
        
        if (!snapshot.exists()) {
            container.innerHTML = '<p class="loading">Nenhum campeonato disponível no momento</p>';
            return;
        }
        
        const tournaments = [];
        snapshot.forEach((childSnapshot) => {
            const tournament = {
                id: childSnapshot.key,
                ...childSnapshot.val()
            };
            
            if (tournament.status === 'open' && (game === 'all' || tournament.game === game)) {
                tournaments.push(tournament);
            }
        });
        
        if (tournaments.length === 0) {
            container.innerHTML = '<p class="loading">Nenhum campeonato encontrado</p>';
            return;
        }
        
        container.innerHTML = tournaments.map(t => {
            const isRegistered = t.players?.includes(currentUser.uid);
            const isFull = t.players?.length >= t.maxPlayers;
            
            return `
                <div class="tournament-card" style="background: var(--card-bg); padding: 1.5rem; border-radius: 12px;">
                    <h3 style="margin-bottom: 1rem; color: var(--primary-color);">${t.name}</h3>
                    <p style="color: var(--text-secondary); margin-bottom: 0.5rem;">
                        🎮 ${t.game.toUpperCase()}
                    </p>
                    <p style="color: var(--text-secondary); margin-bottom: 0.5rem;">
                        📅 ${formatDate(t.date)} ${t.time}
                    </p>
                    <p style="color: var(--success); margin-bottom: 0.5rem;">
                        💰 Prêmio: R$ ${t.prize.toFixed(2)}
                    </p>
                    <p style="color: var(--warning); margin-bottom: 0.5rem;">
                        💳 Taxa: R$ ${t.fee.toFixed(2)}
                    </p>
                    <p style="color: var(--text-secondary); margin-bottom: 1rem;">
                        👥 ${t.players?.length || 0}/${t.maxPlayers} inscritos
                    </p>
                    <p style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 1rem;">
                        ${t.description}
                    </p>
                    ${isRegistered 
                        ? '<button class="btn-secondary" style="width: 100%;" disabled>✓ Inscrito</button>'
                        : isFull
                        ? '<button class="btn-secondary" style="width: 100%;" disabled>Lotado</button>'
                        : `<button class="btn-primary" style="width: 100%;" onclick="registerTournament('${t.id}', ${t.fee})">Inscrever-se</button>`
                    }
                </div>
            `;
        }).join('');
    } catch (error) {
        console.error('Erro ao carregar torneios:', error);
        container.innerHTML = '<p class="loading">Erro ao carregar campeonatos</p>';
    }
}

// Inscrever em torneio
window.registerTournament = async function(tournamentId, fee) {
    if (!currentUser) return;
    
    try {
        // Verificar saldo
        const userRef = ref(database, 'users/' + currentUser.uid);
        const userSnapshot = await get(userRef);
        const userData = userSnapshot.val();
        
        if (userData.saldo < fee) {
            alert('Saldo insuficiente! Você precisa de R$ ' + fee.toFixed(2));
            return;
        }
        
        // Verificar se torneio ainda está aberto
        const tournamentRef = ref(database, 'tournaments/' + tournamentId);
        const tournamentSnapshot = await get(tournamentRef);
        const tournament = tournamentSnapshot.val();
        
        if (tournament.players?.length >= tournament.maxPlayers) {
            alert('Torneio lotado!');
            return;
        }
        
        if (tournament.players?.includes(currentUser.uid)) {
            alert('Você já está inscrito neste torneio!');
            return;
        }
        
        // Registrar no torneio
        const players = tournament.players || [];
        players.push(currentUser.uid);
        
        await update(tournamentRef, { players });
        
        // Deduzir taxa do saldo
        const newBalance = userData.saldo - fee;
        await update(userRef, {
            saldo: newBalance,
            torneiosInscritos: [...(userData.torneiosInscritos || []), tournamentId]
        });
        
        // Registrar transação
        const transactionRef = push(ref(database, 'transactions/' + currentUser.uid));
        await set(transactionRef, {
            type: 'tournament_fee',
            amount: -fee,
            tournamentId: tournamentId,
            tournamentName: tournament.name,
            date: Date.now()
        });
        
        updateBalance(newBalance);
        alert('Inscrição realizada com sucesso!');
        loadTournamentsByGame(document.querySelector('.filter-btn.active').dataset.game);
        loadUpcomingTournaments();
        
    } catch (error) {
        console.error('Erro ao se inscrever:', error);
        alert('Erro ao realizar inscrição');
    }
};

// Carregar usuários da comunidade
async function loadCommunityUsers() {
    const container = document.getElementById('chatContent');
    const usersRef = ref(database, 'users');
    
    try {
        const snapshot = await get(usersRef);
        
        if (!snapshot.exists()) {
            container.innerHTML = '<p class="empty-state">Nenhum usuário encontrado</p>';
            return;
        }
        
        const users = [];
        snapshot.forEach((childSnapshot) => {
            if (childSnapshot.key !== currentUser.uid) {
                users.push({
                    id: childSnapshot.key,
                    ...childSnapshot.val()
                });
            }
        });
        
        container.innerHTML = `
            <div class="users-list" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 1rem;">
                ${users.map(user => `
                    <div class="user-card" style="background: var(--dark-bg); padding: 1.5rem; border-radius: 8px; text-align: center;">
                        <div style="width: 60px; height: 60px; background: linear-gradient(135deg, var(--primary-color), var(--secondary-color)); border-radius: 50%; margin: 0 auto 1rem; display: flex; align-items: center; justify-content: center; font-size: 1.5rem;">
                            ${user.displayName ? user.displayName[0].toUpperCase() : '👤'}
                        </div>
                        <h4 style="margin-bottom: 0.5rem;">${user.displayName || 'Usuário'}</h4>
                        <p style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 0.5rem;">${user.email}</p>
                        <div style="display: flex; gap: 0.5rem; justify-content: center; margin-top: 1rem; flex-wrap: wrap;">
                            <span style="background: rgba(255, 0, 128, 0.2); padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.8rem;">
                                🏆 ${user.torneiosInscritos?.length || 0} torneios
                            </span>
                            <span style="background: rgba(0, 217, 255, 0.2); padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.8rem;">
                                ⭐ ${user.vitorias || 0} vitórias
                            </span>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    } catch (error) {
        console.error('Erro ao carregar usuários:', error);
        container.innerHTML = '<p class="empty-state">Erro ao carregar usuários</p>';
    }
}

// Tabs da comunidade
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        
        btn.classList.add('active');
        const tabId = btn.dataset.tab;
        document.getElementById(`${tabId}Content`).classList.add('active');
        
        if (tabId === 'chat') {
            loadCommunityUsers();
        }
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
        
        const transactionRef = push(ref(database, 'transactions/' + user.uid));
        await set(transactionRef, {
            type: 'deposit',
            amount: amount,
            date: Date.now()
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
        
        const transactionRef = push(ref(database, 'transactions/' + user.uid));
        await set(transactionRef, {
            type: 'withdraw',
            amount: -amount,
            date: Date.now()
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

// Setup listeners em tempo real
function setupRealtimeListeners() {
    // Listener para torneios
    const tournamentsRef = ref(database, 'tournaments');
    onValue(tournamentsRef, () => {
        if (document.getElementById('section-campeonatos').classList.contains('active')) {
            const activeFilter = document.querySelector('.filter-btn.active').dataset.game;
            loadTournamentsByGame(activeFilter);
        }
        loadUpcomingTournaments();
    });
}

// Inicializar
loadTournamentsByGame('all');
