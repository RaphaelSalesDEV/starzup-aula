let messageCount = 0;

        function getCurrentTime() {
            const now = new Date();
            return now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        }

        function sendMessage() {
            const input = document.getElementById('chatInput');
            const message = input.value.trim();
            
            if (message === '') return;
            
            addUserMessage(message);
            input.value = '';
            
            setTimeout(() => {
                addBotResponse(message);
            }, 800);
        }

        function sendQuickReply(message) {
            addUserMessage(message);
            
            setTimeout(() => {
                addBotResponse(message);
            }, 800);
        }

        function addUserMessage(message) {
            const chatMessages = document.getElementById('chatMessages');
            const quickReplies = document.querySelector('.quick-replies');
            
            if (quickReplies && messageCount === 0) {
                quickReplies.style.display = 'none';
            }
            
            const messageDiv = document.createElement('div');
            messageDiv.className = 'message user-message';
            messageDiv.innerHTML = `
                <div class="message-content">
                    <p>${message}</p>
                    <span class="message-time">${getCurrentTime()}</span>
                </div>
                <div class="message-avatar user-avatar">👤</div>
            `;
            
            chatMessages.appendChild(messageDiv);
            scrollToBottom();
            messageCount++;
        }

        function addBotResponse(userMessage) {
            const chatMessages = document.getElementById('chatMessages');
            const messageDiv = document.createElement('div');
            messageDiv.className = 'message bot-message';
            
            const response = getBotResponse(userMessage);
            
            messageDiv.innerHTML = `
                <div class="message-avatar">🤖</div>
                <div class="message-content">
                    ${response}
                    <span class="message-time">${getCurrentTime()}</span>
                </div>
            `;
            
            chatMessages.appendChild(messageDiv);
            scrollToBottom();
        }

        function getBotResponse(message) {
            message = message.toLowerCase();
            
            if (message.includes('cadastr')) {
                return `
                    <p>Para se cadastrar na Starz Up:</p>
                    <ol>
                        <li>Clique no botão "Cadastrar" no menu superior</li>
                        <li>Preencha seus dados (nome, email e senha)</li>
                        <li>Aceite os termos de uso</li>
                        <li>Confirme seu email</li>
                    </ol>
                    <p>É rápido e gratuito! 🎮</p>
                `;
            }
            
            if (message.includes('torneio')) {
                return `
                    <p>Nossos torneios disponíveis:</p>
                    <ul>
                        <li><strong>CS2</strong> - Taxa: R$ 10</li>
                        <li><strong>VALORANT</strong> - Taxa: R$ 10</li>
                        <li><strong>Rocket League</strong> - Taxa: R$ 10</li>
                        <li><strong>Fortnite</strong> - Taxa: R$ 10</li>
                    </ul>
                    <p>Novos torneios toda semana! 🏆</p>
                `;
            }
            
            if (message.includes('pagamento') || message.includes('pagar')) {
                return `
                    <p>Aceitamos as seguintes formas de pagamento:</p>
                    <ul>
                        <li>💳 Cartão de Crédito</li>
                        <li>💳 Cartão de Débito</li>
                        <li>📱 PIX</li>
                        <li>🏦 Boleto Bancário</li>
                    </ul>
                    <p>Todos os pagamentos são seguros e criptografados! 🔒</p>
                `;
            }
            
            if (message.includes('regra')) {
                return `
                    <p>Principais regras dos torneios:</p>
                    <ul>
                        <li>Respeito entre jogadores</li>
                        <li>Proibido uso de cheats ou hacks</li>
                        <li>Pontualidade nos jogos</li>
                        <li>Seguir as configurações oficiais</li>
                    </ul>
                    <p>Leia o regulamento completo antes de participar! 📋</p>
                `;
            }
            
            if (message.includes('olá') || message.includes('oi')) {
                return `<p>Olá! Como posso ajudá-lo hoje? 😊</p>`;
            }
            
            if (message.includes('obrigad')) {
                return `<p>Por nada! Estou aqui para ajudar sempre que precisar! 🌟</p>`;
            }
            
            return `
                <p>Desculpe, não entendi sua pergunta. 😅</p>
                <p>Você pode me perguntar sobre:</p>
                <ul>
                    <li>Como se cadastrar</li>
                    <li>Torneios disponíveis</li>
                    <li>Formas de pagamento</li>
                    <li>Regras dos torneios</li>
                </ul>
            `;
        }

        function handleKeyPress(event) {
            if (event.key === 'Enter') {
                sendMessage();
            }
        }

        function scrollToBottom() {
            const chatMessages = document.getElementById('chatMessages');
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }

        function toggleChat() {
            const chatMessages = document.getElementById('chatMessages');
            const chatInput = document.querySelector('.chat-input-container');
            
            if (chatMessages.style.display === 'none') {
                chatMessages.style.display = 'block';
                chatInput.style.display = 'block';
            } else {
                chatMessages.style.display = 'none';
                chatInput.style.display = 'none';
            }
        }
