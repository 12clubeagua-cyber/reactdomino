/*
   ========================================================================
   CINEMATICENGINE.JS - MOTOR DE CÂMERA CINEMATOGRÁFICA
   Gerencia zooms e focos dinâmicos em eventos decisivos.
   ========================================================================
*/

window.CinematicEngine = {
    active: true,
    isFreeCam: false,

    toggleFreeCam: () => {
        window.CinematicEngine.isFreeCam = !window.CinematicEngine.isFreeCam;
        window.Dashboard.setMessage(window.CinematicEngine.isFreeCam ? "CAMERA: LIVRE" : "CAMERA: AUTO", "active");
    },

    update: (dx, dy, dScale) => {
        if (!window.CinematicEngine.isFreeCam) return;
        // Aplica transformações de câmera livre
        const cam = window.currentCamera || { scale: 1, x: 0, y: 0 };
        window.currentCamera = {
            scale: Math.max(0.5, cam.scale + dScale),
            x: cam.x + dx,
            y: cam.y + dy
        };
        
        document.documentElement.style.setProperty('--cam-scale', window.currentCamera.scale);
        document.documentElement.style.setProperty('--cam-x', `${window.currentCamera.x}px`);
        document.documentElement.style.setProperty('--cam-y', `${window.currentCamera.y}px`);
    },

    focusTile: (targetPosition) => {
        if (!window.CinematicEngine.active || window.CinematicEngine.isFreeCam) return;
        
        const targetScale = 1.5;
        const targetX = -targetPosition.x;
        const targetY = -targetPosition.y;

        const startTime = performance.now();
        const duration = 800;

        const anim = (now) => {
            const elapsed = now - startTime;
            const t = Math.min(elapsed / duration, 1);
            
            const scale = 1 + (targetScale - 1) * t;
            const x = targetX * t;
            const y = targetY * t;

            document.documentElement.style.setProperty('--cam-scale', scale);
            document.documentElement.style.setProperty('--cam-x', `${x}px`);
            document.documentElement.style.setProperty('--cam-y', `${y}px`);

            if (t < 1) return;
            window.RenderPipeline.unregister(anim);
        };
        
        window.RenderPipeline.register(anim);
    }
};
