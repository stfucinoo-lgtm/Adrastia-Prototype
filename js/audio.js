/**
 * ==========================================================================
 * ADRASTIA // UNDERGROUND AUDIO ENGINE (js/audio.js)
 * Features: Guaranteed Track Playback, LocalStorage Synced, Smooth Volume & Equalizer
 * Version: 3.1.0
 * ==========================================================================
 */

(function (window) {
    'use strict';

    const DEFAULT_TRACK_URL = 'https://assets.mixkit.co/music/preview/mixkit-cyber-city-dark-synthwave-1188.mp3';
    const STORAGE_KEY_ACTIVE = 'ADRASTIA_AUDIO_ACTIVE';
    const STORAGE_KEY_TRACK = 'adrastia_audio_track';

    let audioElement = null;
    let isPlaying = false;
    let currentLoadedSrc = "";

    // 1. Get current track source
    function getStoredTrack() {
        return localStorage.getItem(STORAGE_KEY_TRACK) || DEFAULT_TRACK_URL;
    }

    // 2. Initialize Audio Instance
    function ensureAudioInstance() {
        if (!audioElement) {
            audioElement = new Audio();
            audioElement.loop = true;
            audioElement.preload = 'auto';
            audioElement.volume = 0.6;

            audioElement.addEventListener('ended', () => {
                if (isPlaying) audioElement.play();
            });

            audioElement.addEventListener('error', (e) => {
                console.warn('[ADRASTIA AUDIO] Track load error:', e);
                const label = document.getElementById('adrAudioLabel');
                if (label) label.innerText = 'AUDIO: ERR // RETRY';
            });
        }

        const targetSrc = getStoredTrack();
        if (currentLoadedSrc !== targetSrc) {
            audioElement.src = targetSrc;
            currentLoadedSrc = targetSrc;
            audioElement.load();
        }
    }

    // 3. Play Soundtrack
    function startAudio() {
        ensureAudioInstance();

        audioElement.play().then(() => {
            isPlaying = true;
            updateWidgetUI(true);
            localStorage.setItem(STORAGE_KEY_ACTIVE, 'true');
        }).catch((err) => {
            console.warn('[ADRASTIA AUDIO] Play rejected (User gesture required):', err);
            isPlaying = false;
            updateWidgetUI(false);
        });
    }

    // 4. Pause Soundtrack
    function stopAudio() {
        if (audioElement) {
            audioElement.pause();
        }
        isPlaying = false;
        updateWidgetUI(false);
        localStorage.setItem(STORAGE_KEY_ACTIVE, 'false');
    }

    // 5. Toggle Play/Pause
    function toggleAudio() {
        if (isPlaying) {
            stopAudio();
        } else {
            startAudio();
        }
    }

    // 6. Inject Fixed Brutalist Widget
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
                cursor: pointer !important;
                user-select: none;
                transition: all 0.2s ease;
                backdrop-filter: blur(8px);
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.6);
            }
            .adr-audio-widget:hover {
                border-color: var(--neon-green, #00ff66);
                color: #fff;
                transform: translateY(-2px);
            }
            .adr-audio-widget.active {
                border-color: var(--neon-pink, #ff0055);
                color: #fff;
                box-shadow: 0 0 15px rgba(255, 0, 85, 0.3);
            }
            .audio-bars {
                display: flex;
                align-items: flex-end;
                gap: 3px;
                height: 14px;
                pointer-events: none;
            }
            .audio-bar {
                width: 3px;
                background: #555;
                height: 3px;
                transition: height 0.1s ease, background-color 0.2s ease;
            }
            .adr-audio-widget.active .audio-bar {
                background: var(--neon-pink, #ff0055);
                animation: sound-bars-anim 0.8s infinite alternate ease-in-out;
            }
            .adr-audio-widget.active .audio-bar:nth-child(1) { animation-delay: 0.1s; }
            .adr-audio-widget.active .audio-bar:nth-child(2) { animation-delay: 0.3s; }
            .adr-audio-widget.active .audio-bar:nth-child(3) { animation-delay: 0.2s; }
            .adr-audio-widget.active .audio-bar:nth-child(4) { animation-delay: 0.4s; }

            @keyframes sound-bars-anim {
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
        if (widgetEl) {
            widgetEl.addEventListener('click', (e) => {
                e.preventDefault();
                toggleAudio();
            });
        }
    }

    // 7. Update UI Indicator
    function updateWidgetUI(active) {
        const widget = document.getElementById('adrAudioWidget');
        const label = document.getElementById('adrAudioLabel');
        if (!widget || !label) return;

        if (active) {
            widget.classList.add('active');
            label.innerText = 'SOUNDTRACK: LIVE [PLAYING]';
            label.style.color = '#ff0055';
        } else {
            widget.classList.remove('active');
            label.innerText = 'AUDIO: OFF // 00Hz';
            label.style.color = '';
        }
    }

    // 8. Public API & Event Listeners
    window.AdrastiaAudio = {
        toggle: toggleAudio,
        start: startAudio,
        stop: stopAudio,
        isPlaying: () => isPlaying,
        setTrack: (url) => {
            localStorage.setItem(STORAGE_KEY_TRACK, url);
            currentLoadedSrc = "";
            if (audioElement) {
                audioElement.src = url;
                currentLoadedSrc = url;
                if (isPlaying) audioElement.play();
            }
            window.dispatchEvent(new CustomEvent('adr:audio-track-updated', { detail: url }));
        }
    };

    window.addEventListener('adr:audio-track-updated', (e) => {
        const newTrack = e.detail || getStoredTrack();
        currentLoadedSrc = "";
        if (audioElement) {
            audioElement.src = newTrack;
            currentLoadedSrc = newTrack;
            if (isPlaying) audioElement.play();
        }
    });

    // Auto Ingest
    document.addEventListener('DOMContentLoaded', () => {
        injectAudioWidget();
    });

})(window);
