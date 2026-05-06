/*
   ========================================================================
   NOTIFICATIONMANAGER.JS - GESTOR DE ALERTA DO USUARIO
   Gerencia permissões e exibição de notificações locais.
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
