/*
   ========================================================================
   CAMPAIGNENGINE.JS - MOTOR DE CAMPANHA
   Gerencia a progressao linear do jogador atraves de estagios.
   ========================================================================
*/

window.CampaignEngine = {
    stages: [
        { id: 1, name: "Aprendizado", mode: "standard" },
        { id: 2, name: "Desafio Tatico", mode: "closed" },
        { id: 3, name: "Sobrevivencia", mode: "survival" }
    ],

    getProgress: () => {
        return window.safeGetStorage('domino_campaign_progress', 0);
    },

    advance: () => {
        const current = window.CampaignEngine.getProgress();
        if (current < window.CampaignEngine.stages.length - 1) {
            window.safeSetStorage('domino_campaign_progress', current + 1);
        }
    },

    getCurrentStage: () => {
        return window.CampaignEngine.stages[window.CampaignEngine.getProgress()];
    }
};
