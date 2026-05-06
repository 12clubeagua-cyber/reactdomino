/*
   ========================================================================
   CLOUDREPLAYMANAGER.JS - GESTOR DE REPLAYS NA NUVEM
   Armazena e recupera partidas épicas da comunidade.
   ========================================================================
*/

window.CloudReplayManager = {
    UPLOAD_ENDPOINT: 'https://api.dominoteste.com/replays/upload',
    FETCH_ENDPOINT: 'https://api.dominoteste.com/replays/featured',

    upload: async (history) => {
        try {
            await fetch(window.CloudReplayManager.UPLOAD_ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(history)
            });
            window.Dashboard.setMessage("REPLAY PUBLICADO!");
        } catch (e) {
            console.error("Falha ao publicar replay na nuvem.");
        }
    },

    fetchFeatured: async () => {
        try {
            const res = await fetch(window.CloudReplayManager.FETCH_ENDPOINT);
            return await res.json();
        } catch (e) {
            console.error("Falha ao buscar replays da comunidade.");
            return [];
        }
    }
};
