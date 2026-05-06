/*
   ========================================================================
   TELEMETRYENGINE.JS - MOTOR DE MONITORAMENTO
   Captura erros e latência de rede para diagnóstico proativo.
   ========================================================================
*/

window.TelemetryEngine = {
    logs: [],
    
    init: () => {
        window.onerror = (msg, url, line) => {
            window.TelemetryEngine.report('error', { msg, url, line });
        };
        
        window.onunhandledrejection = (event) => {
            window.TelemetryEngine.report('promise_error', { reason: event.reason });
        };
    },

    report: (type, data) => {
        const payload = { type, data, ts: Date.now(), platform: navigator.platform };
        window.TelemetryEngine.logs.push(payload);
        
        // Envio programado para um endpoint de telemetria
        if (window.TelemetryEngine.logs.length >= 5) {
            console.log("Enviando telemetria:", window.TelemetryEngine.logs);
            window.TelemetryEngine.logs = [];
        }
    }
};

window.TelemetryEngine.init();
