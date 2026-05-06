/*
   ========================================================================
   CROSSSYNCREWARDMANAGER.JS - RECOMPENSAS DE SINCRONIZAÇÃO
   Premia jogadores por autenticação em múltiplos dispositivos.
   ========================================================================
*/

window.CrossSyncRewardManager = {
    STORAGE_KEY: 'domino_sync_devices',

    checkAndReward: () => {
        const deviceId = window.navigator.userAgent + window.screen.width;
        const devices = JSON.parse(localStorage.getItem(window.CrossSyncRewardManager.STORAGE_KEY) || '[]');
        
        if (!devices.includes(deviceId)) {
            devices.push(deviceId);
            localStorage.setItem(window.CrossSyncRewardManager.STORAGE_KEY, JSON.stringify(devices));
            
            // Recompensa de Pioneer
            window.ProgressionManager.addXp(250);
            window.Dashboard.setMessage("BONUS PIONEIRO: Novo dispositivo sincronizado!", "active");
        }
    }
};

window.CrossSyncRewardManager.checkAndReward();
