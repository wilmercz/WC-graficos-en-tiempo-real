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
        this.isConnected = false;

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
            if (candidatesData && this.peerConnection) {
                Object.values(candidatesData).forEach(candidate => {
                    this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate))
                        .catch(e => console.error('🎥 Error añadiendo ICE candidate:', e));
                });
            }
        });
    }

    /**
     * Procesar la oferta y crear la respuesta
     */
    async handleOffer(offer) {
        // Limpiar conexión anterior si existía
        if (this.peerConnection) {
            this.peerConnection.close();
        }

        // Crear nueva conexión
        this.peerConnection = new RTCPeerConnection({
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' } // Servidor STUN público para descubrir IPs
            ]
        });

        // Escuchar cuando el video de Kotlin llega
        this.peerConnection.ontrack = (event) => {
            console.log('🎥 📺 ¡Stream de video recibido de Kotlin!');
            if (this.videoElement.srcObject !== event.streams[0]) {
                this.videoElement.srcObject = event.streams[0];
            }
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
        if (this.videoElement) this.videoElement.muted = muted;
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