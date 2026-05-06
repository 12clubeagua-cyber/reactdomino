/*
   ========================================================================
   SCENARIOEDITOR.JS - EDITOR DE CENARIOS
   Permite que usuarios criem seus proprios desafios de domino.
   ========================================================================
*/

window.ScenarioEditor = {
    active: false,
    
    toggle: () => {
        window.ScenarioEditor.active = !window.ScenarioEditor.active;
        window.Dashboard.setMessage(window.ScenarioEditor.active ? "EDITOR: ON (Drag/Rotate)" : "EDITOR: OFF", "active");
        
        // Habilita Camera Livre no modo editor
        if (window.ScenarioEditor.active) window.CinematicEngine.isFreeCam = true;
    },

    placeTile: (e) => {
        if (!window.ScenarioEditor.active) return;
        const pos = { x: e.clientX, y: e.clientY, v1: Math.floor(Math.random()*7), v2: Math.floor(Math.random()*7) };
        window.STATE.positions.push(pos);
        window.Renderer.renderBoardFromState();
    }
};
document.getElementById('board-container').addEventListener('click', window.ScenarioEditor.placeTile);
