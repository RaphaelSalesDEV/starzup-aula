// tournaments-script.js
import { auth, database } from '../firebase-config.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { ref, get, onValue } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

let currentUser = null;
let allTournaments = [];

// Verificar autenticação
onAuthStateChanged(auth, (user) => {
    currentUser = user;
    console.log('Estado de autenticação:', user ? 'Logado' : 'Não logado');
});

// Carregar torneios ao carregar a página
window.addEventListener('DOMContentLoaded', () => {
    loadTournamentsFromFirebase();
    setupFilterButtons();
});

// Configurar botões de filtro
function setupFilterButtons() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remover active de todos
            filterButtons.forEach(b => b.classList.remove('active'));
            // Adicionar active no clicado
            btn.classList.add('active');
            
            const gameFilter = btn.dataset.game;
            filterTournaments(gameFilter);
        });
    });
}

// Carregar torneios do Firebase
function loadTournamentsFromFirebase() {
    const tournamentsRef = ref(database, 'tournaments');
    
    // Listener em tempo real
    onValue(tournamentsRef, (snapshot) => {
        if (snapshot.exists()) {
            allTournaments = [];
            
            snapshot.forEach((childSnapshot) => {
                const tournament = {
                    id: childSnapshot.key,
                    ...childSnapshot.val()
                };
                
                // Apenas torneios abertos
                if (tournament.status === 'open') {
                    allTournaments.push(tournament);
                }
            });
            
            // Ordenar por data
            allTournaments.sort((a, b) => {
                const dateA = new Date(a.date + ' ' + a.time);
                const dateB = new Date(b.date + ' ' + b.time);
                return dateA - dateB;
            });
            
            console.log('Torneios carregados:', allTournaments.length);
            
            // Atualizar estatísticas
            updateStats();
            
            // Mostrar todos inicialmente
            filterTournaments('all');
        } else {
            console.log('Nenhum torneio encontrado');
            showEmptyState();
        }
    }, (error) => {
        console.error('Erro ao carregar torneios:', error);
        showErrorState();
    });
}

// Filtrar torneios por jogo
function filterTournaments(gameFilter) {
    let filteredTournaments = allTournaments;
    
    if (gameFilter !== 'all') {
        filteredTournaments = allTournaments.filter(t => t.game === gameFilter);
    }
    
    displayTournaments(filteredTournaments);
}

// Exibir torneios na página
function displayTournaments(tournaments) {
    const gamesGrid = document.querySelector('.games-grid');
    
    if (!gamesGrid) {
        console.error('Grid de jogos não encontrado');
        return;
    }
    
    if (tournaments.length === 0) {
        gamesGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
                <div style="font-size: 4rem; margin-bottom: 1rem; opacity: 0.5;">🎮</div>
                <h3 style="color: var(--light-gray); margin-bottom: 0.5rem;">Nenhum torneio disponível</h3>
                <p style="color: var(--text-secondary);">Novos torneios serão adicionados em breve!</p>
            </div>
        `;
        return;
    }
    
    gamesGrid.innerHTML = tournaments.map(tournament => createTournamentCard(tournament)).join('');
}

// Criar card de torneio
function createTournamentCard(tournament) {
    const playersCount = tournament.players?.length || 0;
    const maxPlayers = tournament.maxPlayers || 0;
    const isFull = playersCount >= maxPlayers;
    const progress = maxPlayers > 0 ? (playersCount / maxPlayers) * 100 : 0;
    
    // Ícones por jogo
    const gameIcons = {
        'cs2': '🎯',
        'valorant': '⚔️',
        'rocket': '🚀',
        'fortnite': '🏝️'
    };
    
    const gameIcon = gameIcons[tournament.game] || '🎮';
    
    // Formatar data
    const tournamentDate = formatDate(tournament.date);
    const tournamentTime = tournament.time || '00:00';
    
    return `
        <div class="game-card tournament-card-public" data-tournament-id="${tournament.id}">
            <div class="tournament-header" style="background: linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(236, 72, 153, 0.2)); padding: 1.5rem; border-radius: 20px 20px 0 0;">
                <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">
                    <div style="font-size: 3rem;">${gameIcon}</div>
                    <div style="flex: 1;">
                        <h3 style="margin: 0; font-size: 1.5rem; color: white;">${tournament.name}</h3>
                        <p style="margin: 0.25rem 0 0 0; color: var(--light-gray); font-size: 0.9rem; text-transform: uppercase; font-weight: 600;">
                            ${getGameName(tournament.game)}
                        </p>
                    </div>
                </div>
                
                ${isFull ? `
                    <div style="background: rgba(255, 0, 0, 0.2); padding: 0.5rem 1rem; border-radius: 20px; text-align: center; border: 2px solid rgba(255, 0, 0, 0.5);">
                        <span style="color: #ff4444; font-weight: bold;">🔒 LOTADO</span>
                    </div>
                ` : ''}
            </div>
            
            <div class="game-info" style="padding: 1.5rem;">
                <div style="display: grid; gap: 1rem; margin-bottom: 1.5rem;">
                    <div style="display: flex; align-items: center; gap: 0.75rem;">
                        <span style="font-size: 1.5rem;">📅</span>
                        <div>
                            <p style="margin: 0; color: var(--light-gray); font-size: 0.8rem;">Data e Horário</p>
                            <p style="margin: 0; color: white; font-weight: 600;">${tournamentDate} às ${tournamentTime}</p>
                        </div>
                    </div>
                    
                    <div style="display: flex; align-items: center; gap: 0.75rem;">
                        <span style="font-size: 1.5rem;">💰</span>
                        <div>
                            <p style="margin: 0; color: var(--light-gray); font-size: 0.8rem;">Prêmio Total</p>
                            <p style="margin: 0; color: #00d9ff; font-weight: 600; font-size: 1.2rem;">R$ ${tournament.prize.toFixed(2)}</p>
                        </div>
                    </div>
                    
                    <div style="display: flex; align-items: center; gap: 0.75rem;">
                        <span style="font-size: 1.5rem;">💳</span>
                        <div>
                            <p style="margin: 0; color: var(--light-gray); font-size: 0.8rem;">Taxa de Inscrição</p>
                            <p style="margin: 0; color: #ff0080; font-weight: 600;">R$ ${tournament.fee.toFixed(2)}</p>
                        </div>
                    </div>
                </div>
                
                <div style="margin-bottom: 1.5rem;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                        <span style="color: var(--light-gray); font-size: 0.9rem;">Vagas</span>
                        <span style="color: white; font-weight: 600;">${playersCount}/${maxPlayers}</span>
                    </div>
                    <div style="width: 100%; height: 8px; background: rgba(255, 255, 255, 0.1); border-radius: 10px; overflow: hidden;">
                        <div style="width: ${progress}%; height: 100%; background: linear-gradient(90deg, var(--primary), var(--secondary)); transition: width 0.3s;"></div>
                    </div>
                </div>
                
                <p style="color: var(--light-gray); font-size: 0.9rem; line-height: 1.6; margin-bottom: 1.5rem; min-height: 3em;">
                    ${tournament.description || 'Torneio competitivo com prêmios em dinheiro.'}
                </p>
                
                <button 
                    class="btn-participate" 
                    onclick="handleParticipate('${tournament.id}')"
                    ${isFull ? 'disabled' : ''}
                    style="width: 100%; padding: 1rem; background: ${isFull ? 'rgba(255, 255, 255, 0.1)' : 'linear-gradient(135deg, var(--primary), var(--secondary))'}; border: none; border-radius: 10px; color: white; font-weight: bold; font-size: 1.1rem; cursor: ${isFull ? 'not-allowed' : 'pointer'}; transition: all 0.3s;">
                    ${isFull ? '🔒 Torneio Lotado' : '🎮 Participar Agora'}
                </button>
            </div>
        </div>
    `;
}

// Nome completo do jogo
function getGameName(gameCode) {
    const gameNames = {
        'cs2': 'Counter-Strike 2',
        'valorant': 'VALORANT',
        'rocket': 'Rocket League',
        'fortnite': 'Fortnite'
    };
    return gameNames[gameCode] || gameCode.toUpperCase();
}

// Formatar data
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
    });
}

// Atualizar estatísticas da plataforma
function updateStats() {
    // Total de prêmios
    const totalPrizes = allTournaments.reduce((sum, t) => sum + (t.prize || 0), 0);
    document.querySelector('.stats-grid .stat-item:nth-child(1) .stat-number').textContent = 
        `R$ ${(totalPrizes / 1000).toFixed(0)}K+`;
    
    // Total de jogadores (somando todos os inscritos)
    const totalPlayers = allTournaments.reduce((sum, t) => sum + (t.players?.length || 0), 0);
    document.querySelector('.stats-grid .stat-item:nth-child(2) .stat-number').textContent = 
        `${totalPlayers.toLocaleString('pt-BR')}+`;
    
    // Total de torneios
    document.querySelector('.stats-grid .stat-item:nth-child(3) .stat-number').textContent = 
        `${allTournaments.length}+`;
}

// Mostrar estado vazio
function showEmptyState() {
    const gamesGrid = document.querySelector('.games-grid');
    if (gamesGrid) {
        gamesGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 2rem;">
                <div style="font-size: 5rem; margin-bottom: 1.5rem; opacity: 0.5;">🎮</div>
                <h2 style="color: white; margin-bottom: 1rem;">Nenhum Torneio Disponível</h2>
                <p style="color: var(--light-gray); font-size: 1.1rem; max-width: 500px; margin: 0 auto;">
                    Novos torneios emocionantes serão adicionados em breve. Fique ligado!
                </p>
            </div>
        `;
    }
}

// Mostrar estado de erro
function showErrorState() {
    const gamesGrid = document.querySelector('.games-grid');
    if (gamesGrid) {
        gamesGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 2rem;">
                <div style="font-size: 5rem; margin-bottom: 1.5rem; opacity: 0.5;">⚠️</div>
                <h2 style="color: white; margin-bottom: 1rem;">Erro ao Carregar</h2>
                <p style="color: var(--light-gray); font-size: 1.1rem; max-width: 500px; margin: 0 auto 2rem;">
                    Não foi possível carregar os torneios. Por favor, recarregue a página.
                </p>
                <button onclick="location.reload()" style="padding: 1rem 2rem; background: linear-gradient(135deg, var(--primary), var(--secondary)); border: none; border-radius: 10px; color: white; font-weight: bold; cursor: pointer;">
                    🔄 Recarregar Página
                </button>
            </div>
        `;
    }
}

// Handler para participar do torneio
window.handleParticipate = function(tournamentId) {
    if (!currentUser) {
        // Usuário não autenticado - salvar ID do torneio e redirecionar
        localStorage.setItem('pendingTournamentId', tournamentId);
        
        // Mostrar mensagem e redirecionar
        const confirmed = confirm('Você precisa estar logado para participar de torneios.\n\nDeseja fazer login ou criar uma conta agora?');
        
        if (confirmed) {
            window.location.href = 'cadastro.html';
        }
    } else {
        // Usuário autenticado - redirecionar para dashboard
        localStorage.setItem('pendingTournamentId', tournamentId);
        window.location.href = 'dashboard.html';
    }
};

// Adicionar botões de filtro na página se não existirem
function addFilterButtons() {
    const gamesShowcase = document.querySelector('.games-showcase .container');
    
    if (gamesShowcase && !document.querySelector('.tournament-filters')) {
        const filtersDiv = document.createElement('div');
        filtersDiv.className = 'tournament-filters';
        filtersDiv.style.cssText = 'display: flex; gap: 1rem; justify-content: center; margin: 2rem 0; flex-wrap: wrap;';
        filtersDiv.innerHTML = `
            <button class="filter-btn active" data-game="all" style="padding: 0.75rem 1.5rem; background: linear-gradient(135deg, var(--primary), var(--secondary)); border: none; border-radius: 20px; color: white; font-weight: bold; cursor: pointer; transition: all 0.3s;">
                Todos os Jogos
            </button>
            <button class="filter-btn" data-game="cs2" style="padding: 0.75rem 1.5rem; background: var(--gray); border: none; border-radius: 20px; color: white; font-weight: bold; cursor: pointer; transition: all 0.3s;">
                🎯 CS2
            </button>
            <button class="filter-btn" data-game="valorant" style="padding: 0.75rem 1.5rem; background: var(--gray); border: none; border-radius: 20px; color: white; font-weight: bold; cursor: pointer; transition: all 0.3s;">
                ⚔️ VALORANT
            </button>
            <button class="filter-btn" data-game="rocket" style="padding: 0.75rem 1.5rem; background: var(--gray); border: none; border-radius: 20px; color: white; font-weight: bold; cursor: pointer; transition: all 0.3s;">
                🚀 Rocket League
            </button>
            <button class="filter-btn" data-game="fortnite" style="padding: 0.75rem 1.5rem; background: var(--gray); border: none; border-radius: 20px; color: white; font-weight: bold; cursor: pointer; transition: all 0.3s;">
                🏝️ Fortnite
            </button>
        `;
        
        const gamesGrid = document.querySelector('.games-grid');
        gamesShowcase.insertBefore(filtersDiv, gamesGrid);
        
        setupFilterButtons();
    }
}

// Adicionar filtros após carregar a página
setTimeout(addFilterButtons, 100);
