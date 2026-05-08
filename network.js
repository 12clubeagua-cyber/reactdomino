/**
 * NETWORK.JS - Nova Camada de Rede via WebSocket (Go Server)
 * Substitui o PeerJS por uma conexão autoritativa e estável.
 */

window.Network = {
    socket: null,
    roomId: null,
    isHost: false,

    /**
     * Inicializa a conexão com o servidor Go
     */
    connect: function(url = "ws://localhost:8080/ws") {
        return new Promise((resolve, reject) => {
            console.log("Conectando ao Servidor Go...");
            this.socket = new WebSocket(url);

            this.socket.onopen = () => {
                console.log("Conectado com sucesso ao Backend Go.");
                resolve();
            };

            this.socket.onmessage = (event) => {
                const data = JSON.parse(event.data);
                this._handleMessage(data);
            };

            this.socket.onerror = (err) => {
                console.error("Erro na conexão WebSocket:", err);
                reject(err);
            };

            this.socket.onclose = () => {
                console.warn("Conexão com servidor fechada.");
                if (typeof window.showReconnectOverlay === 'function') window.showReconnectOverlay();
            };
        });
    },

    /**
     * Envia uma requisição/jogada para o servidor
     */
    request: function(payload) {
        if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
            console.error("Socket não está aberto.");
            return;
        }

        const message = {
            type: payload.type,
            roomId: this.roomId || "lobby",
            payload: payload
        };

        this.socket.send(JSON.stringify(message));
    },

    /**
     * @private Distribui mensagens recebidas para os módulos corretos
     */
    _handleMessage: function(message) {
        // Se a mensagem veio do servidor, ela chega encapsulada ou direta dependendo do Broadcast do Go
        // No nosso servidor simples, estamos fazendo echo/broadcast do payload original
        const data = message.payload || message;
        
        console.log(`[Network] Recebido: ${data.type}`, data);

        if (typeof window.Multiplayer !== 'undefined' && typeof window.Multiplayer.onMessage === 'function') {
            window.Multiplayer.onMessage(data);
        }
    }
};
