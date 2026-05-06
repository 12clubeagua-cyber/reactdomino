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
        if (this.isInitialized) return;
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioContextClass();
        
        // Canais de audio
        this.sfxGain = this.ctx.createGain();
        this.bgmGain = this.ctx.createGain();
        
        this.sfxGain.connect(this.ctx.destination);
        this.bgmGain.connect(this.ctx.destination);
        
        // Aplica volumes salvos
        this.sfxGain.gain.value = parseFloat(localStorage.getItem('domino_sfx_vol') || 0.5);
        this.bgmGain.gain.value = parseFloat(localStorage.getItem('domino_bgm_vol') || 0.3);
        
        this.isInitialized = true;
    },

    resume: function() {
        if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
    },

    setVolumes: function(sfx, bgm) {
        if (!this.isInitialized) this.init();
        this.sfxGain.gain.value = sfx;
        this.bgmGain.gain.value = bgm;
        localStorage.setItem('domino_sfx_vol', sfx);
        localStorage.setItem('domino_bgm_vol', bgm);
    },

    playTone: function(freq, dur, type = 'triangle') {
        if (!this.isInitialized) this.init();
        this.resume();

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        
        gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + dur);

        osc.connect(gain);
        gain.connect(this.sfxGain); // Conecta ao canal SFX

        osc.start();
        osc.stop(this.ctx.currentTime + dur);
    },

    startBGM: function(intensity = 'calm') {
        if (!this.isInitialized) this.init();
        this.resume();

        if (this.bgmNode) this.bgmNode.stop();

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        const baseFreq = intensity === 'calm' ? 110 : 165;
        osc.frequency.setValueAtTime(baseFreq, this.ctx.currentTime);
        
        gain.gain.setValueAtTime(0.1, this.ctx.currentTime);

        osc.connect(gain);
        gain.connect(this.bgmGain); // Conecta ao canal BGM

        osc.start();
        this.bgmNode = osc;
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

window.playShuffleSound = () => {
    let count = 0;
    const interval = setInterval(() => {
        window.playClack(200 + Math.random() * 400, 0.05);
        if (++count > 15) clearInterval(interval);
    }, 80);
};

window.speak = (text) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'pt-BR';
    utter.rate = 1.1;
    window.speechSynthesis.speak(utter);
};