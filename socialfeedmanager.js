/*
   ========================================================================
   SOCIALFEEDMANAGER.JS - GESTOR DE FEED SOCIAL
   Agrega conquistas e marcos recentes da comunidade.
   ========================================================================
*/

window.SocialFeedManager = {
    feed: [],

    addEntry: (msg) => {
        window.SocialFeedManager.feed.unshift({ msg, time: new Date().toLocaleTimeString() });
        if (window.SocialFeedManager.feed.length > 5) window.SocialFeedManager.feed.pop();
        window.SocialFeedManager.render();
    },

    render: () => {
        const container = document.getElementById('social-feed');
        if (!container) return;
        container.innerHTML = window.SocialFeedManager.feed
            .map(e => `<div>${e.time} - ${e.msg}</div>`)
            .join('');
    }
};
