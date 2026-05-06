/*
   ========================================================================
   CROSSSYNCREWARDMANAGER.JS - RECOMPENSAS DE SINCRONIZACAO
   Premia jogadores por autenticacao em multiplos dispositivos.
   ========================================================================
*/

window.CrossSyncRewardManager = {
    STORAGE_KEY: 'domino_sync_devices',

    checkAndReward: () => {
        const deviceId = window.navigator.userAgent + window.screen.width;
        const devices = window.safeGetStorage(window.CrossSyncRewardManager.STORAGE_KEY, []);
        
        if (!devices.includes(deviceId)) {
            devices.push(deviceId);
            window.safeSetStorage(window.CrossSyncRewardManager.STORAGE_KEY, devices);
            
            // Recompensa de Pioneer
            window.ProgressionManager.addXp(250);
            window.Dashboard.setMessage("BONUS PIONEIRO: Novo dispositivo sincronizado!", "active");
        }
    }
};

window.CrossSyncRewardManager.checkAndReward();
