/**
 * ==========================================================================
 * ADRASTIA // UNDERGROUND AMBIENT AUDIO ENGINE (js/audio.js)
 * Features: Pure Web Audio API Synthetic Ambient Drone & Visual Equalizer
 * Version: 2.0.0
 * ==========================================================================
 */

(function (window) {
    'use strict';

    // Internal Audio State
    let audioCtx = null;
    let masterGain = null;
    let osc1 = null;
    let osc2 = null;
    let noiseNode = null;
    let filterNode = null;
    let isPlaying = false;

    // Local Storage Audio Preference
    const STORAGE_KEY = 'ADRASTIA_AUDIO_ACTIVE';

    // --- 1. Synthesizer Setup (Web Audio API) ---
    function initSynth() {
        if (audioCtx) return;

        const AudioContext = window.AudioContext || window.webkitAudioContext;
        audioCtx = new AudioContext();

        // Master Gain
        masterGain = audioCtx.createGain();
        masterGain.gain.setValueAtTime(0, audioCtx.currentTime);
        masterGain.connect(audioCtx.destination);

        // Low-pass Filter for dark, underground resonance
        filterNode = audioCtx.createBiquadFilter();
        filterNode.type = 'lowpass';
        filterNode.frequency.setValueAtTime(280, audioCtx.currentTime);
        filterNode.Q.setValueAtTime(4, audioCtx.currentTime);
        filterNode.connect(masterGain);

        // Oscillator 1: Deep Sine (55Hz / Note A1)
        osc1 = audioCtx.createOscillator();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(55, audioCtx.currentTime);
        osc1.connect(filterNode);

        // Oscillator 2: Slightly detuned Sawtooth for industrial warmth
        osc2 = audioCtx.createOscillator();
        osc2.type = 'sawtooth';
        osc2.frequency.setValueAtTime(55.6, audioCtx.currentTime);

        const osc2Gain = audioCtx.createGain();
        osc2Gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
        osc2.connect(osc2Gain);
        osc2Gain.connect(filterNode);

        // Analog Noise Generator (Tape Static Texture)
        const bufferSize = audioCtx.sampleRate * 2;
        const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            output[i] = (Math.random() * 2 - 1) * 0.02; // Very gentle white noise
        }

        noiseNode = audioCtx.createBufferSource();
        noiseNode.buffer = noiseBuffer;
        noiseNode.loop = true;

        const noiseFilter = audioCtx.createBiquadFilter();
        noiseFilter.type = 'bandpass';
        noiseFilter.frequency.setValueAtTime(1200, audioCtx.currentTime);
        noiseFilter.Q.setValueAtTime(1, audioCtx.currentTime);

        noiseNode.connect(noiseFilter);
        noiseFilter.connect(masterGain);

        // Start Oscillators
        osc1.start();
        osc2.start();
        noiseNode.start();
    }

    // Smooth Fade In
    function startAudio() {
        initSynth();
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }

        // Smooth Volume Ramp to prevent popping
        masterGain.gain.cancelScheduledValues(audioCtx.currentTime);
        masterGain.gain.setValueAtTime(masterGain.gain.value, audioCtx.currentTime);
        masterGain.gain.linearRampToValueAtTime(0.3, audioCtx.currentTime + 1.5);
        isPlaying = true;
        updateWidgetUI(true);
        localStorage.setItem(STORAGE_KEY, 'true');
    }

    // Smooth Fade Out
    function stopAudio() {
        if (!audioCtx || !masterGain) return;
        masterGain.gain.cancelScheduledValues(audioCtx.currentTime);
        masterGain.gain.setValueAtTime(masterGain.gain.value, audioCtx.currentTime);
        masterGain.gain.linearRampToValueAtTime(0.0001, audioCtx.currentTime + 0.8);
        isPlaying = false;
        updateWidgetUI(false);
        localStorage.setItem(STORAGE_KEY, 'false');
    }

    function toggleAudio() {
        if (isPlaying) {
            stopAudio();
        } else {
            startAudio();
        }
    }

    // --- 2. Inject Brutalist Audio Widget UI ---
    function injectAudioWidget() {
        if (document.getElementById('adrAudioWidget')) return;

        // Scoped Styles for Audio Controller
        const style = document.createElement('style');
        style.innerHTML = `
            .adr-audio-widget {
                position: fixed;
                bottom: 24px;
                left: 24px;
                z-index: 9998;
                background: rgba(8, 8, 12, 0.95);
                border: 1px solid #2a2a38;
                padding: 8px 14px;
                display: flex;
                align-items: center;
                gap: 10px;
                font-family: 'Space Mono', monospace;
                font-size: 0.72rem;
                color: #888;
                cursor: pointer;
                user-select: none;
                transition: all 0.2s ease;
                backdrop-filter: blur(8px);
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.6);
            }
            .adr-audio-widget:hover {
                border-color: var(--accent-green, #00ff66);
                color: #fff;
                transform: translateY(-2px);
            }
            .adr-audio-widget.active {
                border-color: var(--accent-pink, #ff0055);
                color: #fff;
                box-shadow: 0 0 15px rgba(255, 0, 85, 0.3);
            }
            .audio-bars {
                display: flex;
                align-items: flex-end;
                gap: 3px;
                height: 14px;
            }
            .audio-bar {
                width: 3px;
                background: #555;
                height: 3px;
                transition: height 0.1s ease, background-color 0.2s ease;
            }
            .adr-audio-widget.active .audio-bar {
                background: var(--accent-pink, #ff0055);
                animation: sound-bars 1s infinite alternate ease-in-out;
            }
            .adr-audio-widget.active .audio-bar:nth-child(1) { animation-delay: 0.1s; }
            .adr-audio-widget.active .audio-bar:nth-child(2) { animation-delay: 0.3s; }
            .adr-audio-widget.active .audio-bar:nth-child(3) { animation-delay: 0.2s; }
            .adr-audio-widget.active .audio-bar:nth-child(4) { animation-delay: 0.4s; }

            @keyframes sound-bars {
                0% { height: 3px; }
                50% { height: 14px; }
                100% { height: 6px; }
            }

            @media (max-width: 600px) {
                .adr-audio-widget { bottom: 12px; left: 12px; padding: 6px 10px; font-size: 0.65rem; }
            }
        `;
        document.head.appendChild(style);

        const widgetMarkup = `
            <div class="adr-audio-widget" id="adrAudioWidget" title="Toggle Underground Ambient Frequency">
                <div class="audio-bars">
                    <div class="audio-bar"></div>
                    <div class="audio-bar"></div>
                    <div class="audio-bar"></div>
                    <div class="audio-bar"></div>
                </div>
                <span id="adrAudioLabel">FREQ: OFF // 55Hz</span>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', widgetMarkup);

        const widgetEl = document.getElementById('adrAudioWidget');
        widgetEl.addEventListener('click', toggleAudio);
    }

    function updateWidgetUI(active) {
        const widget = document.getElementById('adrAudioWidget');
        const label = document.getElementById('adrAudioLabel');
        if (!widget || !label) return;

        if (active) {
            widget.classList.add('active');
            label.innerText = 'FREQ: 55Hz [LIVE AMBIENT]';
            label.style.color = 'var(--accent-pink, #ff0055)';
        } else {
            widget.classList.remove('active');
            label.innerText = 'FREQ: OFF // 55Hz';
            label.style.color = '';
        }
    }

    // Expose API
    window.AdrastiaAudio = {
        toggle: toggleAudio,
        start: startAudio,
        stop: stopAudio,
        isPlaying: () => isPlaying
    };

    // Auto Ingest UI on DOM Ready
    document.addEventListener('DOMContentLoaded', () => {
        injectAudioWidget();
    });

})(window);
