/*
   ========================================================================
   NOTIFICATIONMANAGER.JS - GESTOR DE ALERTA DO USUARIO
   Gerencia permissoes e exibicao de notificacoes locais.
   ========================================================================
*/

window.NotificationManager = {
    requestPermission: async () => {
        if (!('Notification' in window)) return;
        if (Notification.permission === 'granted') return true;
        return await Notification.requestPermission() === 'granted';
    },

    notify: (title, body) => {
        if (Notification.permission !== 'granted') return;
        
        if (navigator.serviceWorker.ready) {
            navigator.serviceWorker.ready.then(reg => {
                reg.showNotification(title, {
                    body: body,
                    icon: '/favicon.ico',
                    badge: '/favicon.ico',
                    tag: 'domino-turn'
                });
            });
        }
    }
};
