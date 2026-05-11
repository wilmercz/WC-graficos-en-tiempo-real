// 🎥 modules/webrtc-manager.js
// Responsabilidad: Gestionar la conexión P2P con la App Kotlin para video en vivo (B-Roll)

export class WebRTCManager {
    constructor(app) {
        this.app = app;
        this.peerConnection = null;
        this.videoElement = null;
        this.containerElement = null;
        
        // Estado solicitado por Firebase vs Estado real de conexión
        this.firebaseRequestedVisible = false;
        this.firebaseRequestedMuted = true; // ✅ Rastrea si Firebase quiere el audio encendido
        this.isConnected = false;
        this._processedCandidates = new Set();  // ✅ Evita procesar IPs duplicadas
        this.pendingCandidates = []; // ✅ Sala de espera para IPs de Android

        // Rutas de Firebase para la Señalización (Signaling)
        this.SIGNALING_PATH = 'CLAVE_STREAM_FB/STREAM_LIVE/WEBRTC';
    }

    init() {
        console.log('🎥 Inicializando WebRTC Manager...');
        this.createDOMElement();
        this.setupFirebaseSignaling();
    }

    /**
     * Crear los elementos DOM para el video si no existen
     */
    createDOMElement() {
        this.containerElement = document.getElementById('grafico-envivo');
        
        if (!this.containerElement) {
            this.containerElement = document.createElement('div');
            this.containerElement.id = 'grafico-envivo';
            
            this.videoElement = document.createElement('video');
            this.videoElement.id = 'envivo-video';
            this.videoElement.autoplay = true;
            this.videoElement.playsInline = true;
            this.videoElement.muted = true; // Por defecto muteado
            
            // Atributos obligatorios para decodificación móvil/WebRTC en Chrome/Safari:
            this.videoElement.setAttribute('autoplay', '');
            this.videoElement.setAttribute('playsinline', '');
            this.videoElement.setAttribute('muted', '');
            this.videoElement.style.pointerEvents = 'none'; // Evita bloqueos de clicks del sistema
            this.videoElement.style.width = '100%';
            this.videoElement.style.height = '100%';
            this.videoElement.style.objectFit = 'cover';
            
            this.containerElement.appendChild(this.videoElement);
            // Insertar justo al principio del body (debajo de todo)
            document.body.insertBefore(this.containerElement, document.body.firstChild);
            
            console.log('🎥 Contenedor WebRTC B-Roll creado dinámicamente');

            // -------------------------------------------------------------------
            // 🔓 DETECCIÓN GLOBAL DE CLIC EN PANTALLA (INVISIBLE)
            // Cualquier clic en la pantalla validará el permiso de humano para el audio.
            // -------------------------------------------------------------------
            const unlockAudioOnInteraction = () => {
                if (!window.webrtcHumanClickDone) {
                    console.log('👆 ¡CLIC DETECTADO! Registrando humano en Chrome...');
                    window.webrtcHumanClickDone = true;
                    
                    // 1. 📢 FEEDBACK VISUAL: Activar "Síguenos" (Redes) respetando el tiempo global (15 segundos)
                    if (this.app) {
                        this.app.updateFirebaseVisibility('redes', true);
                        // Lee la configuración global (en segundos) y la pasa a milisegundos
                        const duracionRedes = (window.currentConfig?.duracionRedes || 9) * 1000;
                        setTimeout(() => this.app.updateFirebaseVisibility('redes', false), duracionRedes);
                    }

                    // 2. Reactivar audio/video si el WebRTC ya estaba esperando
                    if (this.videoElement && this.isConnected && this.firebaseRequestedVisible) {
                        this.videoElement.muted = this.firebaseRequestedMuted;
                        this.videoElement.play().catch(e => console.warn('🎥 Falló reactivación por toque:', e));
                    }
                }
            };
            document.addEventListener('click', unlockAudioOnInteraction);
            document.addEventListener('touchstart', unlockAudioOnInteraction, { passive: true });
            // -------------------------------------------------------------------
        } else {
            this.videoElement = this.containerElement.querySelector('video');
        }
    }

    /**
     * Escuchar las ofertas y candidatos de Kotlin en Firebase
     */
    setupFirebaseSignaling() {
        if (!this.app.modules.firebaseClient) {
            console.error('🎥 Error: FirebaseClient no está disponible para WebRTC');
            return;
        }

        const fb = this.app.modules.firebaseClient;

        // 1. Escuchar la "Oferta" de Kotlin
        fb.onDataChange(`${this.SIGNALING_PATH}/offer`, async (offer) => {
            if (offer && offer.type && offer.sdp) {
                console.log('🎥 ✉️ Oferta WebRTC recibida de Kotlin. Preparando conexión...');
                await this.handleOffer(offer);
            }
        });

        // 2. Escuchar los "Candidatos ICE" (Rutas de red/IPs) de Kotlin
        fb.onDataChange(`${this.SIGNALING_PATH}/candidates/android`, (candidatesData) => {
            if (!candidatesData) return; // ❌ Eliminamos el bloqueo de peerConnection
            
            Object.entries(candidatesData).forEach(([id, candidate]) => {
                if (this._processedCandidates.has(id)) return;  // Ya fue procesado, ignorar
                this._processedCandidates.add(id);
                
                // 🛡️ SALA DE ESPERA: Si la oferta aún no se termina de procesar, guardar IP
                if (!this.peerConnection || !this.peerConnection.remoteDescription) {
                    console.log('⏳ Guardando candidato de Android en sala de espera...');
                    this.pendingCandidates.push(candidate);
                } else {
                    this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate))
                        .catch(e => console.error('🎥 Error añadiendo ICE candidate:', e));
                }
            });
        });
    }

    /**
     * Procesar la oferta y crear la respuesta
     */
    async handleOffer(offer) {
        this._processedCandidates.clear(); // ✅ Limpiar IPs de sesiones anteriores
        this.pendingCandidates = []; // ✅ Limpiar sala de espera

        // Limpiar conexión anterior si existía
        if (this.peerConnection) {
            this.peerConnection.close();
        }

        // Crear nueva conexión
        this.peerConnection = new RTCPeerConnection({
            iceServers: [
                // STUN (sin rate limit, siempre disponibles)
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' },
        
                // TURN público (Open Relay Project)
                // Coincide exactamente con la configuración en Kotlin
                {
                    urls: 'turn:relay.metered.ca:80',
                    username: 'openrelayproject',
                    credential: 'openrelayproject'
                },
                {
                    urls: 'turn:relay.metered.ca:443',
                    username: 'openrelayproject',
                    credential: 'openrelayproject'
                },
                {
                    urls: 'turn:relay.metered.ca:443?transport=tcp',
                    username: 'openrelayproject',
                    credential: 'openrelayproject'
                }
            ]
        });

        // Escuchar cuando el video de Kotlin llega
        this.peerConnection.ontrack = (event) => {
            console.log(`🎥 📺 ¡Track de ${event.track.kind} recibido de Kotlin!`);
            
            // 🛡️ ESTÁNDAR PURO DE WEBRTC:
            // Asignar el stream directamente.
            if (event.streams && event.streams[0]) {
                if (this.videoElement.srcObject !== event.streams[0]) {
                    console.log('✅ Asignando stream completo al elemento video');
                    this.videoElement.srcObject = event.streams[0];
                }
            } else {
                if (!this.videoElement.srcObject) {
                    this.videoElement.srcObject = new MediaStream();
                }
                this.videoElement.srcObject.addTrack(event.track);
            }
            
            // 🚀 INTENTO SEGURO DE REPRODUCCIÓN (Anti-Autoplay Block)
            const safePlay = () => {
                // Si el humano ya hizo clic en el botón rojo, respetamos lo que diga Firebase
                if (window.webrtcHumanClickDone) {
                    this.videoElement.muted = this.firebaseRequestedMuted;
                }

                const playPromise = this.videoElement.play();
                if (playPromise !== undefined) {
                    playPromise.catch(e => {
                        if (e.name === 'NotAllowedError') {
                            console.warn('🔇 Chrome bloqueó el video. Necesitas hacer clic en el botón rojo de arriba.');
                            this.videoElement.muted = true;
                            this.videoElement.play().catch(err => console.error('🎥 Falló el play incluso silenciado:', err));
                        } else if (e.name !== 'AbortError') {
                            console.error('🎥 ❌ Error de Autoplay WebRTC:', e);
                        }
                    });
                }
            };
            
            safePlay(); // Intentar de inmediato
            this.videoElement.onloadedmetadata = () => safePlay();
            this.videoElement.onloadeddata = () => safePlay(); // Intentar al recibir el frame
            
            // 🔍 DEBUG: Monitorear resoluciones extrañas (Dummy Frames)
            this.videoElement.addEventListener('resize', () => {
                console.log(`🎥 📏 Resolución del video recibida: ${this.videoElement.videoWidth}x${this.videoElement.videoHeight}`);
            });
        };

        // Monitorear estado de la conexión (NUESTRO DOBLE SEGURO)
        this.peerConnection.onconnectionstatechange = () => {
            const state = this.peerConnection.connectionState;
            console.log(`🎥 Estado de conexión WebRTC: ${state}`);
            this.isConnected = (state === 'connected');
            this.evaluateVisibility(); // Re-evaluar si podemos mostrar la imagen
            
            // 🧹 Limpieza automática si el celular se desconecta o se apaga la pantalla
            if (state === 'disconnected' || state === 'failed') {
                console.log('🎥 🧹 Limpiando reproductor por pérdida de señal');
                if (this.videoElement) this.videoElement.srcObject = null;
            }
        };

        // Enviar nuestros candidatos de red a Kotlin
        this.peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                const fb = this.app.modules.firebaseClient;
                // Guardar candidato en Firebase con un ID único basado en el timestamp
                const pushId = Date.now().toString();
                fb.writeData(`${this.SIGNALING_PATH}/candidates/web/${pushId}`, event.candidate.toJSON());
            }
        };

        // Aplicar la oferta de Kotlin
        await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
        
        // Crear nuestra respuesta (Answer) para mandar a Firebase
        const answer = await this.peerConnection.createAnswer();
        await this.peerConnection.setLocalDescription(answer);
        
        // 🔥 VACIAR SALA DE ESPERA DE INMEDIATO DESPUÉS DEL LOCAL DESCRIPTION
        console.log(`🚀 Procesando ${this.pendingCandidates.length} candidatos ICE acumulados`);
        this.pendingCandidates.forEach(candidate => {
            this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate))
                .catch(e => console.error('🎥 Error tardío añadiendo ICE candidate:', e));
        });
        this.pendingCandidates = [];
        
        // Enviar nuestra respuesta a Kotlin por Firebase
        console.log('🎥 ✉️ Enviando Respuesta WebRTC a Kotlin...');
        this.app.modules.firebaseClient.writeData(`${this.SIGNALING_PATH}/answer`, {
            type: answer.type,
            sdp: answer.sdp
        });
    }

    /**
     * Recibir comando de Firebase (Mostrar/Ocultar EnVivo y Audio)
     */
    handleCommand(mostrar, muted) {
        this.firebaseRequestedVisible = mostrar;
        this.firebaseRequestedMuted = muted;
        
        if (this.videoElement) {
            this.videoElement.muted = muted;
            
            // 🛡️ RECOVERY EXTREMO: Si CameraFi/Chrome apaga el video al intentar ponerle sonido
            if (mostrar) {
                const playPromise = this.videoElement.play();
                if (playPromise !== undefined) {
                    playPromise.catch(e => {
                        // Si el bloqueo ocurre, aceptamos el silencio pero salvamos la imagen
                        console.warn('🔇 CameraFi bloqueó el audio. Rescatando el video en Mute para evitar pantalla negra.');
                        this.videoElement.muted = true;
                        this.videoElement.play().catch(err => console.error('Error final:', err));
                    });
                }
            }
        }
        
        this.evaluateVisibility();
    }

    /**
     * EL DOBLE SEGURO: Evalúa si debe mostrar la capa basándose en Firebase Y la red
     */
    evaluateVisibility() {
        // Solo se hace visible si Firebase lo pide Y estamos realmente conectados
        const shouldShow = this.firebaseRequestedVisible && this.isConnected;
        this.containerElement.classList.toggle('visible', shouldShow);
    }
}