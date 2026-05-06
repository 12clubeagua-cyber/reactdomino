/*
   ========================================================================
   EXPORTMANAGER.JS - GESTOR DE EXPORTAÇÃO DE VÍDEO
   Captura o fluxo visual e gera arquivos compartilháveis.
   ========================================================================
*/

window.ExportManager = {
    recorder: null,
    chunks: [],

    startExport: async () => {
        const board = document.getElementById('game-area');
        if (!board) return;

        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        window.ExportManager.chunks = [];
        window.ExportManager.recorder = new MediaRecorder(stream);
        
        window.ExportManager.recorder.ondataavailable = e => window.ExportManager.chunks.push(e.data);
        window.ExportManager.recorder.onstop = window.ExportManager.download;
        
        window.ExportManager.recorder.start();
        window.Dashboard.setMessage("GRAVANDO REPLAY...", "active");
        
        // Inicia o replay após gravar
        window.ReplayManager.play().then(() => {
            setTimeout(() => window.ExportManager.recorder.stop(), 1000);
        });
    },

    download: () => {
        const blob = new Blob(window.ExportManager.chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `domino_replay_${Date.now()}.webm`;
        a.click();
        window.Dashboard.setMessage("REPLAY EXPORTADO!");
    }
};
