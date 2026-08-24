/**
 * ==========================================================================
 * ADRASTIA // UNDERGROUND AUDIO ENGINE (js/audio.js)
 * Features: Real Music Track Player, Dynamic Audio URL, Smooth Fade Engine & Equalizer
 * Version: 3.0.0
 * ==========================================================================
 */

(function (window) {
    'use strict';

    // Default Underground Track (Can be overridden via localStorage or custom MP3)
    const DEFAULT_TRACK_URL = 'https://assets.mixkit.co/music/preview/mixkit-cyber-city-dark-synthwave-1188.mp3';
    const STORAGE_KEY_ACTIVE = 'ADRASTIA_AUDIO_ACTIVE';
    const STORAGE_KEY_TRACK = 'adrastia_audio_track';

    let audioElement = null;
    let fadeInterval = null;
    let isPlaying = false;
    const TARGET_VOLUME = 0.55;

    // --- 1. Audio Track Initialization ---
    function getTrackSource() {
        return localStorage.getItem(STORAGE_KEY_TRACK) || DEFAULT_TRACK_URL;
    }

    function initAudio() {
        if (audioElement) return;

        audioElement = new Audio();
        audioElement.src = getTrackSource();
        audioElement.loop = true;
        audioElement.preload = 'metadata';
        audioElement.volume = 0;

        // Auto reload if user changes track dynamically
        window.addEventListener('adr:audio-track-updated', (e) => {
            const newUrl = e.detail || getTrackSource();
            const wasPlaying = isPlaying;
            if (audioElement) {
                audioElement.pause();
                audioElement.src = newUrl;
                if (wasPlaying) startAudio();
            }
        });
    }

    // --- 2. Smooth Fade-in & Fade-out Engine ---
    function startAudio() {
        initAudio();
        
        // Ensure source is current
        const currentSrc = getTrackSource();
        if (audioElement.src !== currentSrc) {
            audioElement.src = currentSrc;
        }

        clearInterval(fadeInterval);
        audioElement.play().then(() => {
            isPlaying = true;
            updateWidgetUI(true);
            localStorage.setItem(STORAGE_KEY_ACTIVE, 'true');

            // Smooth Fade-in
            fadeInterval = setInterval(() => {
                if (audioElement.volume < TARGET_VOLUME) {
                    audioElement.volume = Math.min(TARGET_VOLUME, audioElement.volume + 0.05);
                } else {
                    clearInterval(fadeInterval);
                }
            }, 80);
        }).catch(err => {
            console.warn('[ADRASTIA AUDIO] Autoplay prevented or track error:', err);
            isPlaying = false;
            updateWidgetUI(false);
        });
    }

    function stopAudio() {
        if (!audioElement) return;

        clearInterval(fadeInterval);
        fadeInterval = setInterval(() => {
            if (audioElement.volume > 0.05) {
                audioElement.volume = Math.max(0, audioElement.volume - 0.08);
            } else {
                audioElement.volume = 0;
                audioElement.pause();
                clearInterval(fadeInterval);
                isPlaying = false;
                updateWidgetUI(false);
                localStorage.setItem(STORAGE_KEY_ACTIVE, 'false');
            }
        }, 60);
    }

    function toggleAudio() {
        if (isPlaying) {
            stopAudio();
        } else {
            startAudio();
        }
    }

    // --- 3. Inject Brutalist Visual Widget ---
    function injectAudioWidget() {
        if (document.getElementById('adrAudioWidget')) return;

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
                animation: sound-bars 0.8s infinite alternate ease-in-out;
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
            <div class="adr-audio-widget" id="adrAudioWidget" title="Click to Toggle Soundtrack">
                <div class="audio-bars">
                    <div class="audio-bar"></div>
                    <div class="audio-bar"></div>
                    <div class="audio-bar"></div>
                    <div class="audio-bar"></div>
                </div>
                <span id="adrAudioLabel">AUDIO: OFF // 00Hz</span>
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
            label.innerText = 'SOUNDTRACK: LIVE [PLAYING]';
            label.style.color = 'var(--accent-pink, #ff0055)';
        } else {
            widget.classList.remove('active');
            label.innerText = 'AUDIO: OFF // 00Hz';
            label.style.color = '';
        }
    }

    // --- 4. Expose Public Engine API ---
    window.AdrastiaAudio = {
        toggle: toggleAudio,
        start: startAudio,
        stop: stopAudio,
        isPlaying: () => isPlaying,
        setTrack: (url) => {
            localStorage.setItem(STORAGE_KEY_TRACK, url);
            window.dispatchEvent(new CustomEvent('adr:audio-track-updated', { detail: url }));
        }
    };

    // Auto Ingest Widget on DOM Ready
    document.addEventListener('DOMContentLoaded', () => {
        injectAudioWidget();
    });

})(window);
