/* 
   ========================================================================
   AUDIO.JS - SISTEMA DE SOM SINTETIZADO (VERSÃO OTIMIZADA)
   Gerencia buffers e síntese de áudio para latência zero.
   ======================================================================== 
*/

window.AudioManager = {
    ctx: null,
    isInitialized: false,
    bgmNode: null,
    sfxGain: null,
    bgmGain: null,

    init: function() {
        if (window.AudioManager.isInitialized) return;
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        window.AudioManager.ctx = new AudioContextClass();
        
        // Canais de audio
        window.AudioManager.sfxGain = window.AudioManager.ctx.createGain();
        window.AudioManager.bgmGain = window.AudioManager.ctx.createGain();
        
        window.AudioManager.sfxGain.connect(window.AudioManager.ctx.destination);
        window.AudioManager.bgmGain.connect(window.AudioManager.ctx.destination);
        
        // Aplica volumes salvos
        window.AudioManager.sfxGain.gain.value = parseFloat(window.safeGetStorage('domino_sfx_vol', 0.5));
        window.AudioManager.bgmGain.gain.value = parseFloat(window.safeGetStorage('domino_bgm_vol', 0.3));
        
        window.AudioManager.isInitialized = true;
    },

    resume: function() {
        if (window.AudioManager.ctx && window.AudioManager.ctx.state === 'suspended') window.AudioManager.ctx.resume();
    },

    setVolumes: function(sfx, bgm) {
        if (!window.AudioManager.isInitialized) window.AudioManager.init();
        window.AudioManager.sfxGain.gain.value = sfx;
        window.AudioManager.bgmGain.gain.value = bgm;
        window.safeSetStorage('domino_sfx_vol', sfx);
        window.safeSetStorage('domino_bgm_vol', bgm);
    },

    playTone: function(freq, dur, type = 'triangle') {
        if (!window.AudioManager.isInitialized) window.AudioManager.init();
        window.AudioManager.resume();

        const osc = window.AudioManager.ctx.createOscillator();
        const gain = window.AudioManager.ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, window.AudioManager.ctx.currentTime);
        
        gain.gain.setValueAtTime(0.3, window.AudioManager.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, window.AudioManager.ctx.currentTime + dur);

        osc.connect(gain);
        gain.connect(window.AudioManager.sfxGain); // Conecta ao canal SFX

        osc.start();
        osc.stop(window.AudioManager.ctx.currentTime + dur);
    },

    startBGM: function(intensity = 'calm') {
        if (!window.AudioManager.isInitialized) window.AudioManager.init();
        window.AudioManager.resume();

        if (window.AudioManager.bgmNode) window.AudioManager.bgmNode.stop();

        const osc = window.AudioManager.ctx.createOscillator();
        const gain = window.AudioManager.ctx.createGain();

        osc.type = 'sine';
        const baseFreq = intensity === 'calm' ? 110 : 165;
        osc.frequency.setValueAtTime(baseFreq, window.AudioManager.ctx.currentTime);
        
        gain.gain.setValueAtTime(0.1, window.AudioManager.ctx.currentTime);

        osc.connect(gain);
        gain.connect(window.AudioManager.bgmGain); // Conecta ao canal BGM

        osc.start();
        window.AudioManager.bgmNode = osc;
    }
};

window.safeAudioInit = () => window.AudioManager.init();

window.playClack = (freq, dur) => {
    if (navigator.vibrate) try { navigator.vibrate(30); } catch (e) {}
    window.AudioManager.playTone(freq ?? 800, dur ?? 0.1);
};

window.playPass = () => {
    window.playClack(window.CONFIG?.AUDIO?.PASS_FREQ ?? 300, 0.12);
    window.speak("Passei");
};

window.playVictory = () => {
    const notes = [600, 800, 1000];
    notes.forEach((freq, i) => setTimeout(() => window.playClack(freq, 0.1), i * 120));
    window.speak("Ganhei");
};

window.speak = (text) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'pt-BR';
    utter.rate = 1.1;
    window.speechSynthesis.speak(utter);
};