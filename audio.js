/* 
   ========================================================================
   AUDIO.JS - SISTEMA DE SOM SINTETIZADO (VERSAO OTIMIZADA)
   Gerencia buffers e sintese de audio para latencia zero.
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

        const now = window.AudioManager.ctx.currentTime;
        
        // 1. Oscilador Principal (Corpo do som)
        const osc = window.AudioManager.ctx.createOscillator();
        const gain = window.AudioManager.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, now);
        
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

        osc.connect(gain);
        gain.connect(window.AudioManager.sfxGain);

        // 2. Ruido Branco (Impacto da peca)
        const bufferSize = window.AudioManager.ctx.sampleRate * 0.02; // 20ms de impacto
        const buffer = window.AudioManager.ctx.createBuffer(1, bufferSize, window.AudioManager.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

        const noise = window.AudioManager.ctx.createBufferSource();
        const noiseGain = window.AudioManager.ctx.createGain();
        noise.buffer = buffer;
        
        noiseGain.gain.setValueAtTime(0.15, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);

        noise.connect(noiseGain);
        noiseGain.connect(window.AudioManager.sfxGain);

        osc.start(now);
        osc.stop(now + dur);
        noise.start(now);
        noise.stop(now + 0.02);
    },

    startBGM: function() {
        if (!window.AudioManager.isInitialized) window.AudioManager.init();
        window.AudioManager.resume();

        if (window.AudioManager.bgmInterval) clearInterval(window.AudioManager.bgmInterval);

        // Configuracoes da melodia (Escala Pentatonica de Do Maior - Estilo Stardew)
        const scale = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25]; // C4, D4, E4, G4, A4, C5
        let step = 0;

        const playNote = (freq, dur, type, vol) => {
            if (!window.AudioManager.ctx) return;
            const osc = window.AudioManager.ctx.createOscillator();
            const gain = window.AudioManager.ctx.createGain();
            
            osc.type = type;
            osc.frequency.setValueAtTime(freq, window.AudioManager.ctx.currentTime);
            
            // Envelope suave
            gain.gain.setValueAtTime(0, window.AudioManager.ctx.currentTime);
            gain.gain.linearRampToValueAtTime(vol, window.AudioManager.ctx.currentTime + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.001, window.AudioManager.ctx.currentTime + dur);
            
            osc.connect(gain);
            gain.connect(window.AudioManager.bgmGain);
            
            osc.start();
            osc.stop(window.AudioManager.ctx.currentTime + dur);
        };

        // Loop do sequenciador (BPM lento para clima relaxante)
        window.AudioManager.bgmInterval = setInterval(() => {
            if (document.hidden) return; // Pausa se a aba estiver em segundo plano

            // 1. Melodia Principal (Pluck suave)
            if (step % 2 === 0) {
                const noteIdx = Math.floor(Math.random() * scale.length);
                const freq = scale[noteIdx];
                playNote(freq, 1.5, 'triangle', 0.1);
            }

            // 2. Harmonia de Fundo (Pad etereo)
            if (step % 8 === 0) {
                const baseNote = scale[0] / 2; // C3 (grave)
                playNote(baseNote, 4.0, 'sine', 0.05);
                playNote(baseNote * 1.5, 4.0, 'sine', 0.03); // G3 (quinta)
            }

            step++;
        }, 800); // 800ms por step (~75 BPM)
    },

    stopBGM: function() {
        if (window.AudioManager.bgmInterval) clearInterval(window.AudioManager.bgmInterval);
    }
};

window.safeAudioInit = () => window.AudioManager.init();

window.playClack = (freq, dur) => {
    if (navigator.vibrate) try { navigator.vibrate(30); } catch (e) {}
    
    // Impacto refinado: Frequencia alta + Ruido de fundo (The Carmack Way)
    const f = freq ?? (800 + Math.random() * 200);
    window.AudioManager.playTone(f, dur ?? 0.08, 'sine');
};

/**
 * Som de embaralhar as pecas na mesa
 */
window.playShuffle = function() {
    if (!window.AudioManager.isInitialized) window.AudioManager.init();
    const ctx = window.AudioManager.ctx;
    const now = ctx.currentTime;
    
    // Gera 1 segundo de "ruido de atrito"
    const bufferSize = ctx.sampleRate * 1.0;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * 0.15;

    const noise = ctx.createBufferSource();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();
    
    noise.buffer = buffer;
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1000, now);
    filter.frequency.exponentialRampToValueAtTime(400, now + 1.0); // Efeito de abafamento

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.0);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(window.AudioManager.sfxGain);

    noise.start();
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