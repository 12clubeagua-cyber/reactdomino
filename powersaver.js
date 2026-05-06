/*
   ========================================================================
   POWERSAVER.JS - GERENCIADOR DE ECONOMIA DE ENERGIA
   Reduz o consumo de CPU/GPU em sessões longas.
   ========================================================================
*/

window.PowerSaver = {
    active: false,
    
    toggle: () => {
        window.PowerSaver.active = !window.PowerSaver.active;
        localStorage.setItem('domino_power_saver', window.PowerSaver.active);
        window.Dashboard.setMessage(`Modo Eco: ${window.PowerSaver.active ? 'Ligado' : 'Desligado'}`, 'active');
    },

    init: () => {
        window.PowerSaver.active = localStorage.getItem('domino_power_saver') === 'true';
    }
};

window.PowerSaver.init();
