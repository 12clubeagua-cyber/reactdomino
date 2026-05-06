/*
   ========================================================================
   SOCIALMANAGER.JS - GESTOR DE CONEXOES SOCIAIS
   Facilita convites e gestao de amigos.
   ========================================================================
*/

window.SocialManager = {
    generateInviteLink: (roomCode) => {
        const baseUrl = window.location.origin + window.location.pathname;
        return `${baseUrl}?join=${roomCode}`;
    },

    processInvite: () => {
        const urlParams = new URLSearchParams(window.location.search);
        const roomCode = urlParams.get('join');
        if (roomCode) {
            // Remove o parametro para nao reprocessar no refresh
            window.history.replaceState({}, document.title, window.location.pathname);
            
            // Aguarda o carregamento do lobby para conectar
            setTimeout(() => {
                const input = document.getElementById('join-code-input');
                if (input) {
                    input.value = roomCode;
                    window.connectToHost();
                }
            }, 1000);
        }
    }
};
