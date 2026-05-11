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
            
            this.containerElement.appendChild(this.videoElement);
            // Insertar justo al principio del body (debajo de todo)
            document.body.insertBefore(this.containerElement, document.body.firstChild);
            
            console.log('🎥 Contenedor WebRTC B-Roll creado dinámicamente');

            // 🧪 BOTÓN DE PRUEBA PARA FORZAR PLAY
            /*
            const testBtn = document.createElement('button');
            testBtn.innerText = '▶ Forzar Play (Test)';
            testBtn.style.cssText = 'position: absolute; top: 50px; right: 10px; z-index: 99999; padding: 10px 15px; background: red; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: bold; box-shadow: 0px 4px 6px rgba(0,0,0,0.5);';
            testBtn.onclick = () => {
                console.log('🧪 Intentando Play manual por clic del usuario...');
                if (this.videoElement) {
                    // Intentar reproducir con audio activado
                    this.videoElement.muted = false; 
                    this.videoElement.play()
                        .then(() => console.log('✅ Play forzado por el usuario exitoso (El Autoplay estaba bloqueado)'))
                        .catch(e => console.error('❌ Error forzando play manual (El problema no era el Autoplay):', e));
                }
            };
            document.body.appendChild(testBtn);
            */

            // -------------------------------------------------------------------
            // 🔓 DESBLOQUEO DE AUDIO POR TOQUE EN PANTALLA
            // Si el navegador bloqueó el audio por falta de interacción,
            // tocar cualquier parte de la pantalla lo reactivará (solo si Firebase
            // ha ordenado que el audio debe estar encendido).
            // 🛑 Para DESACTIVAR esta función a futuro, comenta este bloque:
            // -------------------------------------------------------------------
            const unlockAudioOnInteraction = () => {
                // Si WebRTC existe, debe estar visible y Firebase pidió audio (muted = false)
                if (this.videoElement && this.firebaseRequestedVisible && this.firebaseRequestedMuted === false) {
                    console.log('👆 Interacción detectada: Restaurando audio de WebRTC...');
                    this.videoElement.muted = false;
                    this.videoElement.play().catch(e => console.warn('🎥 Falló reactivación por toque:', e));
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
        
                // TURN con credenciales reales de metered.ca
                // Obtén las tuyas gratis en https://dashboard.metered.ca/
                // Las mismas credenciales que pusiste en WebRTCManager.kt
                {
                    urls: 'turn:standard.relay.metered.ca:80',
                    username: 'METERED_USER',    // ← mismo que en Kotlin
                    credential: 'METERED_PASS'  // ← mismo que en Kotlin
                },
                {
                    urls: 'turn:standard.relay.metered.ca:80?transport=tcp',
                    username: 'METERED_USER',
                    credential: 'METERED_PASS'
                },
                {
                    urls: 'turn:standard.relay.metered.ca:443',
                    username: 'METERED_USER',
                    credential: 'METERED_PASS'
                },
                {
                    urls: 'turn:standard.relay.metered.ca:443?transport=tcp',
                    username: 'METERED_USER',
                    credential: 'METERED_PASS'
                }
            ]
        });

        // Escuchar cuando el video de Kotlin llega
        this.peerConnection.ontrack = (event) => {
            console.log(`🎥 📺 ¡Track de ${event.track.kind} recibido de Kotlin!`);
            
            // 🛡️ ESTÁNDAR PURO DE WEBRTC:
            // Asignar el stream directamente.
            if (event.streams && event.streams[0]) {
                this.videoElement.srcObject = event.streams[0];
            } else {
                if (!this.videoElement.srcObject) {
                    this.videoElement.srcObject = new MediaStream();
                }
                this.videoElement.srcObject.addTrack(event.track);
            }
            
            // 🚀 INTENTO SEGURO DE REPRODUCCIÓN (Anti-Autoplay Block)
            const safePlay = () => {
                const playPromise = this.videoElement.play();
                if (playPromise !== undefined) {
                    playPromise.catch(e => {
                        if (e.name === 'NotAllowedError') {
                            console.warn('🔇 Autoplay con audio bloqueado por Chrome. Forzando mute temporal...');
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
        
        // 🚀 INYECTAR CANDIDATOS EN ESPERA
        console.log(`📦 Inyectando ${this.pendingCandidates.length} candidatos en espera...`);
        this.pendingCandidates.forEach(candidate => {
            this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate))
                .catch(e => console.error('🎥 Error añadiendo ICE:', e));
        });
        this.pendingCandidates = [];
        
        // Crear nuestra respuesta
        const answer = await this.peerConnection.createAnswer();
        await this.peerConnection.setLocalDescription(answer);
        
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
            
            // Al intentar quitar el mute remotamente, asegurar que el video siga reproduciéndose
            if (mostrar && !this.videoElement.paused) {
                this.videoElement.play().catch(e => {
                    if (e.name === 'NotAllowedError') {
                        console.warn('🔇 Necesitas hacer click en la web una vez para poder activar el audio.');
                        this.videoElement.muted = true;
                    }
                });
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