/* 
   ========================================================================
   IDENTITY.JS - O CARTÓRIO (VERSÃO BLINDADA)
   Gerencia a identidade, avatares e estatísticas do jogador.
   ======================================================================== 
*/

window.Identity = {
    STORAGE_KEY: 'userName',
    PROFILE_KEY: 'userProfile',

    get: function() {
        return window.safeGetStorage(window.Identity.STORAGE_KEY, 'JOGADOR');
    },

    getProfile: function() {
        return window.safeGetStorage(window.Identity.PROFILE_KEY, { avatar: '👤', color: '#ffcc33' });
    },

    set: function(rawName) {
        if (!rawName) return false;
        const cleaned = rawName.trim().toUpperCase();
        if (cleaned.length > 0 && cleaned.length <= 10 && /^[A-ZÁ-Ú ]+$/.test(cleaned)) {
            window.safeSetStorage(window.Identity.STORAGE_KEY, cleaned);
            if (typeof window.NameManager !== 'undefined') window.NameManager.set(0, cleaned);
            return true;
        }
        return false;
    },

    setProfile: function(avatar, color) {
        const profile = { avatar, color };
        window.safeSetStorage(window.Identity.PROFILE_KEY, profile);
    },

    promptChange: function() {
        const input = prompt("Digite seu apelido (até 10 letras):", window.Identity.get());
        if (input !== null && window.Identity.set(input)) {
            // Nova lógica para avatar simples
            const avatar = prompt("Escolha um emoji de avatar:", '👤');
            window.Identity.setProfile(avatar || '👤', '#ffcc33');
            window.Dashboard?.updateScore?.();
        }
    },

    init: function() {
        const savedName = window.safeGetStorage(window.Identity.STORAGE_KEY, null);
        if (!savedName) {
            window.Identity.promptChange();
        } else {
            window.NameManager?.set(0, savedName);
        }
    }
};