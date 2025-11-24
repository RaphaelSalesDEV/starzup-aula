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
        await loadUserData(user);
        loadDashboardData(user.uid);
        setupRealtimeListeners();
    } else {
        window.location.href = 'index.html';
    }
});

// Verificar se é administrador
async function checkAdminStatus(user) {
    const userRef = ref(database, 'users/' + user.uid);
    const snapshot = await get(userRef);
    
    if (snapshot.exists()) {
        const userData = snapshot.val();
        isAdmin = userData.isAdmin === true;
        
        if (isAdmin) {
            console.log('✅ Usuário é ADMINISTRADOR');
        }
    }
}

// Carregar dados do usuário
async function loadUserData(user) {
    const userName = document.getElementById('userName');
    const userEmail = document.getElementById('userEmail');
    const welcomeName = document.getElementById('welcomeName');
    const userAvatar = document.getElementById('userAvatar');
    
    // Atualizar nome e email
    const displayName = user.displayName || user.email.split('@')[0];
    userName.textContent = displayName;
    userEmail.textContent = user.email;
    welcomeName.textContent = displayName;
    
    // Carregar dados do database
    const userRef = ref(database, 'users/' + user.uid);
    const snapshot = await get(userRef);
    
    if (snapshot.exists()) {
        const userData = snapshot.val();
        
        // Carregar avatar SEMPRE do Database (prioridade total)
        const avatarUrl = userData.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=8B5CF6&color=fff&size=400&bold=true`;
        
        // Atualizar imagem com tratamento de erro
        userAvatar.src = avatarUrl;
        userAvatar.onerror = function() {
            console.warn('Erro ao carregar avatar, usando padrão');
            this.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=8B5CF6&color=fff&size=400&bold=true`;
        };
        
        // Atualizar saldo e stats
        updateBalance(userData.saldo || 0);
        updateStats(userData);
    } else {
        // Criar dados do usuário se não existir
        const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=8B5CF6&color=fff&size=400&bold=true`;
        
        await set(userRef, {
            email: user.email,
            displayName: displayName,
            avatar: avatarUrl,
            saldo: 0,
            torneiosInscritos: [],
            partidasJogadas: 0,
            vitorias: 0,
            derrotas: 0,
            isAdmin: false,
            createdAt: Date.now()
        });
        
        userAvatar.src = avatarUrl;
        updateBalance(0);
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
        
        tournaments.sort((a, b) => new Date(a.date) - new Date(b.date));
        
        container.innerHTML = tournaments.slice(0, 3).map(t => `
            <div class="tournament-item" style="background: var(--dark-bg); padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
                <h4 style="color: var(--primary-color); margin-bottom: 0.5rem;">${t.name}</h4>
                <p style="color: var(--text-secondary); font-size: 0.9rem;">
                    ${t.game.toUpperCase()} | ${formatDate(t.date)} ${t.time}
                </p>
                <div style="display: flex; justify-content: space-between; margin-top: 0.5rem;">
                    <span style="color: var(--success);">💰 R$ ${t.prize.toFixed(2)}</span>
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

// Formatar data
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
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
    const campeonatosSection = document.getElementById('section-campeonatos');
    
    // Adicionar painel admin se for administrador
    if (isAdmin) {
        let adminSection = document.getElementById('adminTournamentsSection');
        
        if (!adminSection) {
            const filters = campeonatosSection.querySelector('.filters');
            
            // Botão toggle admin
            const toggleBtn = document.createElement('button');
            toggleBtn.className = 'toggle-admin-btn';
            toggleBtn.innerHTML = '⚙️ Painel Administrativo';
            toggleBtn.style.cssText = 'margin-bottom: 1rem; padding: 0.75rem 1.5rem; background: linear-gradient(135deg, var(--primary-color), var(--secondary-color)); border: none; border-radius: 8px; color: white; cursor: pointer; font-weight: bold; display: flex; align-items: center; gap: 0.5rem;';
            
            // Admin section
            const adminDiv = document.createElement('div');
            adminDiv.id = 'adminTournamentsSection';
            adminDiv.style.cssText = 'display: none; background: var(--card-bg); padding: 2rem; border-radius: 12px; margin-bottom: 2rem;';
            adminDiv.innerHTML = `
                <h2 style="margin-bottom: 1.5rem; padding-bottom: 1rem; border-bottom: 1px solid rgba(255, 255, 255, 0.1); color: var(--primary-color);">⚙️ Criar Novo Torneio</h2>
                <form id="createTournamentForm" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin-bottom: 2rem;">
                    <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                        <label style="color: var(--text-secondary); font-size: 0.9rem;">Nome do Torneio</label>
                        <input type="text" id="tournamentName" required style="padding: 0.75rem; background: var(--dark-bg); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; color: white;">
                    </div>
                    
                    <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                        <label style="color: var(--text-secondary); font-size: 0.9rem;">Jogo</label>
                        <select id="tournamentGame" required style="padding: 0.75rem; background: var(--dark-bg); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; color: white;">
                            <option value="cs2">CS2</option>
                            <option value="valorant">VALORANT</option>
                            <option value="rocket">Rocket League</option>
                            <option value="fortnite">Fortnite</option>
                        </select>
                    </div>
                    
                    <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                        <label style="color: var(--text-secondary); font-size: 0.9rem;">Data</label>
                        <input type="date" id="tournamentDate" required style="padding: 0.75rem; background: var(--dark-bg); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; color: white;">
                    </div>
                    
                    <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                        <label style="color: var(--text-secondary); font-size: 0.9rem;">Horário</label>
                        <input type="time" id="tournamentTime" required style="padding: 0.75rem; background: var(--dark-bg); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; color: white;">
                    </div>
                    
                    <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                        <label style="color: var(--text-secondary); font-size: 0.9rem;">Prêmio (R$)</label>
                        <input type="number" id="tournamentPrize" min="0" step="0.01" required style="padding: 0.75rem; background: var(--dark-bg); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; color: white;">
                    </div>
                    
                    <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                        <label style="color: var(--text-secondary); font-size: 0.9rem;">Máx. Jogadores</label>
                        <input type="number" id="tournamentMaxPlayers" min="2" required style="padding: 0.75rem; background: var(--dark-bg); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; color: white;">
                    </div>
                    
                    <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                        <label style="color: var(--text-secondary); font-size: 0.9rem;">Taxa (R$)</label>
                        <input type="number" id="tournamentFee" min="0" step="0.01" required style="padding: 0.75rem; background: var(--dark-bg); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; color: white;">
                    </div>
                    
                    <div style="grid-column: 1 / -1; display: flex; flex-direction: column; gap: 0.5rem;">
                        <label style="color: var(--text-secondary); font-size: 0.9rem;">Descrição</label>
                        <textarea id="tournamentDescription" rows="4" required style="padding: 0.75rem; background: var(--dark-bg); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; color: white; font-family: inherit;"></textarea>
                    </div>
                    
                    <div style="grid-column: 1 / -1;">
                        <button type="submit" class="btn-primary" style="width: 100%;">✨ Criar Torneio</button>
                    </div>
                </form>
                
                <h2 style="margin-top: 2rem; margin-bottom: 1rem;">Gerenciar Torneios</h2>
                <div id="adminTournamentsList" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1rem;"></div>
            `;
            
            toggleBtn.onclick = () => {
                if (adminDiv.style.display === 'none') {
                    adminDiv.style.display = 'block';
                    toggleBtn.innerHTML = '👁️ Ver Torneios Públicos';
                    loadAdminTournaments();
                } else {
                    adminDiv.style.display = 'none';
                    toggleBtn.innerHTML = '⚙️ Painel Administrativo';
                }
            };
            
            campeonatosSection.insertBefore(toggleBtn, filters);
            campeonatosSection.insertBefore(adminDiv, filters);
            
            // Setup form
            setTimeout(() => setupCreateTournamentForm(), 100);
        }
    }
    
    // Carregar torneios públicos
    const tournamentsRef = ref(database, 'tournaments');
    
    try {
        const snapshot = await get(tournamentsRef);
        
        if (!snapshot.exists()) {
            container.innerHTML = '<p class="loading">Nenhum campeonato disponível</p>';
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
                    <p style="color: var(--text-secondary); margin-bottom: 0.5rem;">🎮 ${t.game.toUpperCase()}</p>
                    <p style="color: var(--text-secondary); margin-bottom: 0.5rem;">📅 ${formatDate(t.date)} ${t.time}</p>
                    <p style="color: var(--success); margin-bottom: 0.5rem;">💰 Prêmio: R$ ${t.prize.toFixed(2)}</p>
                    <p style="color: var(--warning); margin-bottom: 0.5rem;">💳 Taxa: R$ ${t.fee.toFixed(2)}</p>
                    <p style="color: var(--text-secondary); margin-bottom: 1rem;">👥 ${t.players?.length || 0}/${t.maxPlayers} inscritos</p>
                    <p style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 1rem;">${t.description}</p>
                    ${isRegistered 
                        ? '<button class="btn-secondary" style="width: 100%;" disabled>✓ Inscrito</button>'
                        : isFull
                        ? '<button class="btn-secondary" style="width: 100%;" disabled>Lotado</button>'
                        : `<button class="btn-primary" style="width: 100%;" onclick="registerTournament('${t.id}', ${t.fee})">Inscrever-se</button>`
                    }
                    ${isAdmin ? `<button class="btn-danger" style="width: 100%; margin-top: 0.5rem; padding: 0.75rem; background: var(--danger); border: none; border-radius: 8px; color: white; cursor: pointer;" onclick="deleteTournament('${t.id}')">🗑️ Excluir</button>` : ''}
                </div>
            `;
        }).join('');
    } catch (error) {
        console.error('Erro:', error);
        container.innerHTML = '<p class="loading">Erro ao carregar</p>';
    }
}

// Setup form de criação
function setupCreateTournamentForm() {
    const form = document.getElementById('createTournamentForm');
    if (!form) return;
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        console.log('Tentando criar torneio...');
        
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
        
        console.log('Dados do torneio:', tournamentData);
        
        try {
            const tournamentsRef = ref(database, 'tournaments');
            const newTournamentRef = await push(tournamentsRef, tournamentData);
            console.log('Torneio criado com ID:', newTournamentRef.key);
            
            alert('Torneio criado com sucesso!');
            form.reset();
            loadAdminTournaments();
            loadTournamentsByGame('all');
        } catch (error) {
            console.error('Erro completo:', error);
            console.error('Código do erro:', error.code);
            console.error('Mensagem do erro:', error.message);
            alert('Erro ao criar torneio: ' + error.message);
        }
    });
}

// Carregar torneios admin
async function loadAdminTournaments() {
    const container = document.getElementById('adminTournamentsList');
    if (!container) return;
    
    const snapshot = await get(ref(database, 'tournaments'));
    
    if (!snapshot.exists()) {
        container.innerHTML = '<p class="empty-state">Nenhum torneio</p>';
        return;
    }
    
    const tournaments = [];
    snapshot.forEach((child) => {
        tournaments.push({ id: child.key, ...child.val() });
    });
    
    container.innerHTML = tournaments.map(t => `
        <div style="background: var(--dark-bg); padding: 1rem; border-radius: 8px;">
            <h4 style="color: var(--primary-color); margin-bottom: 0.5rem;">${t.name}</h4>
            <p style="color: var(--text-secondary); font-size: 0.9rem;">${t.game.toUpperCase()} | ${formatDate(t.date)}</p>
            <p style="color: var(--success); margin-top: 0.5rem;">💰 R$ ${t.prize.toFixed(2)}</p>
            <p style="color: var(--text-secondary);">👥 ${t.players?.length || 0}/${t.maxPlayers}</p>
            <button onclick="deleteTournament('${t.id}')" style="width: 100%; margin-top: 1rem; padding: 0.5rem; background: var(--danger); border: none; border-radius: 6px; color: white; cursor: pointer;">🗑️ Excluir</button>
        </div>
    `).join('');
}

// Excluir torneio
window.deleteTournament = async function(id) {
    if (!confirm('Excluir este torneio?')) return;
    
    try {
        await remove(ref(database, 'tournaments/' + id));
        alert('Torneio excluído!');
        loadAdminTournaments();
        loadTournamentsByGame('all');
    } catch (error) {
        alert('Erro ao excluir');
    }
};

// Inscrever em torneio
window.registerTournament = async function(tournamentId, fee) {
    if (!currentUser) return;
    
    try {
        const userRef = ref(database, 'users/' + currentUser.uid);
        const userSnapshot = await get(userRef);
        const userData = userSnapshot.val();
        
        if (userData.saldo < fee) {
            alert(`Saldo insuficiente! Você precisa de R$ ${fee.toFixed(2)}`);
            return;
        }
        
        const tournamentRef = ref(database, 'tournaments/' + tournamentId);
        const tournamentSnapshot = await get(tournamentRef);
        const tournament = tournamentSnapshot.val();
        
        if (tournament.players?.length >= tournament.maxPlayers) {
            alert('Torneio lotado!');
            return;
        }
        
        if (tournament.players?.includes(currentUser.uid)) {
            alert('Você já está inscrito!');
            return;
        }
        
        const players = tournament.players || [];
        players.push(currentUser.uid);
        
        await update(tournamentRef, { players });
        
        const newBalance = userData.saldo - fee;
        await update(userRef, {
            saldo: newBalance,
            torneiosInscritos: [...(userData.torneiosInscritos || []), tournamentId]
        });
        
        updateBalance(newBalance);
        alert('Inscrição realizada!');
        loadTournamentsByGame(document.querySelector('.filter-btn.active').dataset.game);
        loadUpcomingTournaments();
        
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao se inscrever');
    }
};

// Carregar usuários comunidade
async function loadCommunityUsers() {
    const container = document.getElementById('chatContent');
    const snapshot = await get(ref(database, 'users'));
    
    if (!snapshot.exists()) {
        container.innerHTML = '<p class="empty-state">Nenhum usuário</p>';
        return;
    }
    
    const users = [];
    snapshot.forEach((child) => {
        if (child.key !== currentUser.uid) {
            users.push({ id: child.key, ...child.val() });
        }
    });
    
    container.innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 1rem;">
            ${users.map(user => `
                <div style="background: var(--dark-bg); padding: 1.5rem; border-radius: 8px; text-align: center;">
                    <div style="width: 60px; height: 60px; background: linear-gradient(135deg, var(--primary-color), var(--secondary-color)); border-radius: 50%; margin: 0 auto 1rem; display: flex; align-items: center; justify-content: center; font-size: 1.5rem;">
                        ${user.displayName ? user.displayName[0].toUpperCase() : '👤'}
                    </div>
                    <h4 style="margin-bottom: 0.5rem;">${user.displayName || 'Usuário'}</h4>
                    <p style="color: var(--text-secondary); font-size: 0.9rem;">${user.email}</p>
                    <div style="display: flex; gap: 0.5rem; justify-content: center; margin-top: 1rem; flex-wrap: wrap;">
                        <span style="background: rgba(255, 0, 128, 0.2); padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.8rem;">
                            🏆 ${user.torneiosInscritos?.length || 0}
                        </span>
                        <span style="background: rgba(0, 217, 255, 0.2); padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.8rem;">
                            ⭐ ${user.vitorias || 0}
                        </span>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

// Tabs comunidade
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        
        btn.classList.add('active');
        const tabId = btn.dataset.tab;
        document.getElementById(`${tabId}Content`).classList.add('active');
        
        if (tabId === 'chat') loadCommunityUsers();
    });
});

// FAQ
document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
        btn.parentElement.classList.toggle('active');
    });
});

// Depósito
document.getElementById('depositBtn')?.addEventListener('click', async () => {
    const amount = parseFloat(document.getElementById('depositAmount').value);
    
    if (!amount || amount < 10) {
        alert('Valor mínimo: R$ 10');
        return;
    }
    
    try {
        const userRef = ref(database, 'users/' + currentUser.uid);
        const snapshot = await get(userRef);
        const currentBalance = snapshot.val()?.saldo || 0;
        
        await update(userRef, { saldo: currentBalance + amount });
        
        await set(push(ref(database, 'transactions/' + currentUser.uid)), {
            type: 'deposit',
            amount: amount,
            date: Date.now()
        });
        
        updateBalance(currentBalance + amount);
        alert(`Depósito de R$ ${amount.toFixed(2)} realizado!`);
        document.getElementById('depositAmount').value = '';
    } catch (error) {
        alert('Erro ao depositar');
    }
});

// Saque
document.getElementById('withdrawBtn')?.addEventListener('click', async () => {
    const amount = parseFloat(document.getElementById('withdrawAmount').value);
    
    if (!amount || amount < 10) {
        alert('Valor mínimo: R$ 10');
        return;
    }
    
    try {
        const userRef = ref(database, 'users/' + currentUser.uid);
        const snapshot = await get(userRef);
        const currentBalance = snapshot.val()?.saldo || 0;
        
        if (amount > currentBalance) {
            alert('Saldo insuficiente');
            return;
        }
        
        await update(userRef, { saldo: currentBalance - amount });
        
        await set(push(ref(database, 'transactions/' + currentUser.uid)), {
            type: 'withdraw',
            amount: -amount,
            date: Date.now()
        });
        
        updateBalance(currentBalance - amount);
        alert(`Saque de R$ ${amount.toFixed(2)} realizado!`);
        document.getElementById('withdrawAmount').value = '';
    } catch (error) {
        alert('Erro ao sacar');
    }
});

// Logout
document.getElementById('logoutBtn').addEventListener('click', async () => {
    if (confirm('Deseja sair?')) {
        try {
            await signOut(auth);
            window.location.href = 'index.html';
        } catch (error) {
            alert('Erro ao sair');
        }
    }
});

// Listeners em tempo real
function setupRealtimeListeners() {
    onValue(ref(database, 'tournaments'), () => {
        if (document.getElementById('section-campeonatos').classList.contains('active')) {
            const activeFilter = document.querySelector('.filter-btn.active').dataset.game;
            loadTournamentsByGame(activeFilter);
        }
        loadUpcomingTournaments();
    });
}

loadTournamentsByGame('all');
