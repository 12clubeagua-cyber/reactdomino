/* 
   ========================================================================
   NETWORK.JS - O ADAPTADOR DE REDE (VERSAO BLINDADA)
   Abstrai toda a comunicacao P2P, tanto para o Host quanto para o Cliente.
   ======================================================================== 
*/

window.Network = {
    isHost: () => window.netMode === 'host',
    isClient: () => window.netMode === 'client',
    lastReceivedTs: 0,

    _validatePayload: (payload) => {
        if (!payload || typeof payload !== 'object') return false;
        if (typeof payload.type !== 'string') return false;
        
        // Validação temporal: descarta pacotes antigos (ghost packets)
        if (payload.ts && payload.ts < window.Network.lastReceivedTs) return false;
        if (payload.ts) window.Network.lastReceivedTs = payload.ts;
        
        return true;
    },

    sync: (payload) => {
        payload.ts = Date.now();
        if (!window.Network._validatePayload(payload)) return;
        if (window.Network.isHost()) {
            if (typeof window.broadcastToClients === 'function') {
                window.broadcastToClients(payload);
            }
        }
    },

    syncState: () => {
        if (window.Network.isHost()) {
            if (typeof window.broadcastState === 'function') {
                window.broadcastState();
            }
        }
    },

    request: (payload) => {
        payload.ts = Date.now();
        if (!window.Network._validatePayload(payload)) return;
        
        if (window.Network.isClient()) {
            if (window.myConnToHost && window.myConnToHost.open) {
                window.myConnToHost.send(payload);
            }
        }
    },

    startHeartbeat: () => {
        setInterval(() => {
            if (window.Network.isHost()) {
                window.Network.sync({ type: 'heartbeat' });
            }
        }, 5000);
    }
};

window.Network.startHeartbeat();