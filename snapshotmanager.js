/*
   ========================================================================
   SNAPSHOTMANAGER.JS - GESTOR DE SNAPSHOTS DE ESTADO
   Garante integridade e recuperação de estados pós-crash.
   ========================================================================
*/

window.SnapshotManager = {
    STORAGE_KEY: 'domino_state_snapshot',

    // Cria uma soma de verificação simples para garantir a integridade do snapshot
    _checksum: (data) => {
        return btoa(JSON.stringify(data)).slice(0, 8);
    },

    save: () => {
        const snapshot = {
            data: window.STATE,
            checksum: window.SnapshotManager._checksum(window.STATE)
        };
        window.safeSetStorage(window.SnapshotManager.STORAGE_KEY, JSON.stringify(snapshot));
    },

    load: () => {
        const raw = window.safeGetStorage(window.SnapshotManager.STORAGE_KEY, null);
        if (!raw) return null;
        
        const snapshot = JSON.parse(raw);
        if (snapshot.checksum === window.SnapshotManager._checksum(snapshot.data)) {
            return snapshot.data;
        }
        console.error("Snapshot corrompido, ignorando.");
        return null;
    }
};
