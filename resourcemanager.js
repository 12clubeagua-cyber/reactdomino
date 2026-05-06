/*
   ========================================================================
   RESOURCEMANAGER.JS - O GESTOR DE CICLO DE VIDA
   Previne vazamentos de memoria destruindo instâncias de rede e listeners.
   ========================================================================
*/

window.ResourceManager = {
    listeners: [],
    instances: [],

    registerListener: (target, type, handler) => {
        target.addEventListener(type, handler);
        window.ResourceManager.listeners.push({ target, type, handler });
    },

    registerInstance: (instance, destroyMethod = 'destroy') => {
        window.ResourceManager.instances.push({ instance, destroyMethod });
    },

    cleanup: () => {
        // Remove todos os event listeners registrados
        window.ResourceManager.listeners.forEach(l => {
            l.target.removeEventListener(l.type, l.handler);
        });
        window.ResourceManager.listeners = [];

        // Destroi instâncias (PeerJS, etc)
        window.ResourceManager.instances.forEach(i => {
            if (i.instance && typeof i.instance[i.destroyMethod] === 'function') {
                i.instance[i.destroyMethod]();
            }
        });
        window.ResourceManager.instances = [];
    }
};
