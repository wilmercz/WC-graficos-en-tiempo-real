// 🎵 modules/audio-manager.js
// Responsabilidad: Gestión de música de fondo, playlists y controles de audio

export class AudioManager {
    constructor(app) {
        this.app = app;
        this.audioElement = new Audio();
        this.audioElement.loop = false; // Lo apagamos para controlar la playlist manualmente
        
        this.playlist = [];
        this.currentIndex = 0;
        this.currentUrl = '';
        
        // Evento que detecta cuando termina la pista actual
        this.audioElement.onended = () => this.playNext();
        
        console.log('🎵 AudioManager: Instanciado y listo.');
    }

    init() {
        if (this.app.modules.firebaseClient) {
            // Escuchamos la ruta específica para audio
            const AUDIO_PATH = 'CLAVE_STREAM_FB/STREAM_LIVE/CONTROL_AUDIO';
            console.log('🎵 AudioManager escuchando ruta:', AUDIO_PATH);
            
            this.app.modules.firebaseClient.onDataChange(AUDIO_PATH, (data) => {
                this.processCommand(data);
            });
        } else {
            console.warn('⚠️ AudioManager: No se encontró firebaseClient.');
        }
    }

    processCommand(data) {
        if (!data) return;

        this.handleUrlChange(data.URL);
        this.handleVolumeChange(data.VOLUMEN);
        this.handleStateChange(data.ESTADO);
    }

    handleUrlChange(inputUrl) {
        if (!inputUrl) return;

        let newPlaylist = [];
        
        // Identificar si viene como Array real, String JSON, o String simple
        if (Array.isArray(inputUrl)) {
            newPlaylist = inputUrl;
        } else if (typeof inputUrl === 'string') {
            try {
                // Intentar parsear por si mandaron un Array como texto (Ej: '["url1", "url2"]')
                const parsed = JSON.parse(inputUrl);
                if (Array.isArray(parsed)) {
                    newPlaylist = parsed;
                } else {
                    newPlaylist = [inputUrl];
                }
            } catch(e) {
                // Si falla el parseo, asumimos que es una única URL normal
                newPlaylist = [inputUrl];
            }
        }

        // Si la lista realmente cambió, actualizamos
        if (JSON.stringify(this.playlist) !== JSON.stringify(newPlaylist)) {
            console.log('🎵 AudioManager: Nueva Playlist cargada con', newPlaylist.length, 'pistas.');
            this.playlist = newPlaylist;
            this.currentIndex = 0;

            if (this.playlist.length > 0) {
                this.loadTrack(this.playlist[this.currentIndex]);
            }
        }
    }

    loadTrack(url) {
        if (url && url !== this.currentUrl) {
            const wasPlaying = !this.audioElement.paused;
            this.currentUrl = url;
            this.audioElement.src = this.currentUrl;
            
            // Si estaba sonando, que siga sonando la nueva
            if (wasPlaying) {
                this.playAudio();
            }
        }
    }

    playNext() {
        if (this.playlist.length === 0) return;

        this.currentIndex++;
        
        // Si llegamos al final de la playlist, volvemos a empezar (Looping)
        if (this.currentIndex >= this.playlist.length) {
            this.currentIndex = 0;
        }

        this.loadTrack(this.playlist[this.currentIndex]);
        this.playAudio(); // Reproducir la siguiente pista automáticamente
    }

    handleStateChange(state) {
        if (!state) return;
        const cmd = state.toUpperCase();

        if (cmd === 'PLAY') {
            this.playAudio();
        } else if (cmd === 'STOP') {
            this.stopAudio();
        } else if (cmd === 'PAUSE') {
            this.audioElement.pause();
        }
    }

    handleVolumeChange(volInput) {
        if (volInput === undefined || volInput === null) return;
        
        let vol = Number(volInput);
        if (isNaN(vol)) vol = 100;
        if (vol < 0) vol = 0;
        if (vol > 100) vol = 100;

        // El navegador espera un valor entre 0.0 y 1.0
        const normalizedVol = vol / 100;
        this.audioElement.volume = normalizedVol;
    }

    playAudio() {
        if (!this.currentUrl) return;

        const playPromise = this.audioElement.play();
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                console.warn('⚠️ AudioManager: Autoplay bloqueado por el navegador (Asegúrate de haber interactuado con la página primero).', error);
            });
        }
    }

    stopAudio() {
        this.audioElement.pause();
        this.audioElement.currentTime = 0;
        this.currentIndex = 0; // Reiniciar playlist desde la 1ra canción
        
        if (this.playlist.length > 0) {
            this.currentUrl = this.playlist[0];
            this.audioElement.src = this.currentUrl;
        }
    }
}