/*
   ========================================================================
   UIANIMATOR.JS - GESTOR DE TRANSIÇÕES DE UI
   Gerencia animações de entrada e saída para telas do Lobby.
   ========================================================================
*/

window.UIAnimator = {
    animateTransition: (outEl, inEl) => {
        outEl.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        outEl.style.opacity = '0';
        outEl.style.transform = 'translateX(-20px)';
        
        setTimeout(() => {
            outEl.classList.remove('active');
            outEl.style.opacity = '1';
            outEl.style.transform = 'translateX(0)';
            
            inEl.style.opacity = '0';
            inEl.style.transform = 'translateX(20px)';
            inEl.classList.add('active');
            
            setTimeout(() => {
                inEl.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                inEl.style.opacity = '1';
                inEl.style.transform = 'translateX(0)';
            }, 10);
        }, 300);
    }
};
