// 🎬 modules/sequence-manager.js
// Responsabilidad: Gestionar secuencias automáticas de gráficos (Ej: Invitado -> Tema -> Publicidad)

export class SequenceManager {
    constructor(app) {
        this.app = app;
        this.isActive = false;
        this.currentStep = 0;
        this.timer = null;
        
        this.originalLugar = ""; // Para guardar el lugar original
        this.hasPendingAd = false; // ✅ Control de publicidad pre-cargada

        // 🎵 Playlist de Publicidad (URLs)
        this.adPlaylist = [];
        this.currentAdIndex = 0;

        // 🔄 Configuración para rotación exclusiva de publicidad
        this.isAdRotationActive = false;
        this.adRotationTimer = null;
        this.adRotationDuration = 6000; // 6 segundos (Aumentado +1s)
        
        // Iniciar escucha de la lista remota
        this.setupRemotePlaylist();
    }

    /**
     * Configurar escucha de la lista de publicidad en Firebase
     */
    setupRemotePlaylist() {
        if (this.app.modules.firebaseClient) {
            const RUTA_LISTA = 'CLAVE_STREAM_FB/STREAM_LIVE/GRAFICOS/LISTA_PUBLICIDAD';
            console.log('🔗 Secuenciador escuchando lista:', RUTA_LISTA);

            this.app.modules.firebaseClient.onDataChange(RUTA_LISTA, (data) => {
                this.processRemotePlaylist(data);
            });
        } else {
            console.warn('⚠️ FirebaseClient no disponible para SequenceManager');
        }
    }

    /**
     * Procesar datos de la lista remota
     */
    processRemotePlaylist(data) {
        console.log('📥 RAW DATA recibido de Firebase (Lista Publicidad):', data);
        if (!data) {
            this.adPlaylist = [];
            console.log('⚠️ Playlist de publicidad vacía o nula en Firebase');
            return;
        }

        const urls = [];
        
        // Manejar si es Array o Objeto (Firebase devuelve objetos para listas con IDs)
        if (Array.isArray(data)) {
            data.forEach(item => {
                if (typeof item === 'string') urls.push(item);
                else if (item?.url) urls.push(item.url);
            });
        } else if (typeof data === 'object') {
            Object.values(data).forEach(item => {
                // ✅ MEJORA: Soportar strings directos en objetos (ej: {id1: "url1", id2: "url2"})
                if (typeof item === 'string') urls.push(item);
                else if (item?.url) urls.push(item.url);
            });
        }

        this.adPlaylist = urls;
        console.log(`📺 Playlist FINAL: ${this.adPlaylist.length} anuncios detectados.`);
        this.adPlaylist.forEach((u, i) => console.log(`   🔹 [${i + 1}] ${u}`));
    }

    /**
     * 🚀 INICIAR SECUENCIA: Invitado -> Tema -> Publicidad (con Lugar persistente)
     */
    async startGuestAdSequence() {
        if (this.isActive) {
            console.warn('⚠️ Ya hay una secuencia activa. Deteniéndola...');
            this.stopSequence();
        }

        console.log('🎬 INICIANDO SECUENCIA: Invitado + Publicidad');
        this.isActive = true;
        this.hasPendingAd = false;

        // --- PRE-CARGA DE PUBLICIDAD ---
        // 🚀 Actualizamos la imagen AHORA para que tenga ~26s para cargar antes de mostrarse
        this.preloadAd();

        // --- PASO 0: FECHA (0s - 6s) ---
        // Guardar lugar original para restaurarlo después
        this.originalLugar = window.lastFirebaseData?.Lugar || "En Vivo";
        
        // Generar fecha actual (Ej: "Lunes 9 de febrero")
        const date = new Date();
        const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
        const fechaTexto = date.toLocaleDateString('es-ES', options);
        // Capitalizar primera letra
        const fechaFinal = fechaTexto.charAt(0).toUpperCase() + fechaTexto.slice(1);

        console.log(`👉 PASO 0: Mostrar Fecha (${fechaFinal})`);

        // 1. Ocultar Lugar actual (si está visible) para transición suave
        await this.updateFirebase({
            Mostrar_Invitado: false,
            Mostrar_Tema: false,
            Mostrar_Publicidad: false,
            Mostrar_Lugar: false // <--- Ocultar primero
        });

        // 2. Esperar animación de salida (800ms)
        this.timer = setTimeout(async () => {
            if (!this.isActive) return;

            // Cambiar icono a calendario localmente
            const lugarEl = document.getElementById('grafico-lugar');
            if (lugarEl) lugarEl.classList.add('show-calendar');

            // Mostrar Fecha
            await this.updateFirebase({
                Lugar: fechaFinal,
                Mostrar_Lugar: true
            });

            // ⚡ CORRECCIÓN: Mostrar invitado 1/2 segundos después (en paralelo a la fecha)
            setTimeout(() => this.step1_Invitado(), 500);

            // Esperar 7 segundos (Aumentado +1s) y cambiar a Lugar original
            this.timer = setTimeout(() => this.step0_RestoreLugar(), 7000); 
        }, 800);
    }

    async preloadAd() {
        const nextAdUrl = this.getNextAd();
        if (nextAdUrl) {
            this.hasPendingAd = true;
            console.log(`🔄 Pre-cargando publicidad al inicio: ${nextAdUrl}`);
            if (this.app.modules.firebaseClient) {
                await this.app.modules.firebaseClient.writeData(
                    'CLAVE_STREAM_FB/STREAM_LIVE/GRAFICOS/urlImagenPublicidad', 
                    nextAdUrl
                );
            }
        }
    }

    async step0_RestoreLugar() {
        if (!this.isActive) return;
        console.log(`👉 RESTAURANDO LUGAR: ${this.originalLugar}`);

        // 1. Ocultar Fecha para transición suave
        await this.updateFirebase({
            Mostrar_Lugar: false
        });

        // 2. Esperar animación de salida (800ms)
        this.timer = setTimeout(async () => {
            if (!this.isActive) return;

            // Restaurar icono original
            const lugarEl = document.getElementById('grafico-lugar');
            if (lugarEl) lugarEl.classList.remove('show-calendar');

            // Restaurar texto original y mostrar
            await this.updateFirebase({
                Lugar: this.originalLugar,
                Mostrar_Lugar: true
            });

            // YA NO LLAMAMOS A INVITADO AQUÍ (Se llamó en paralelo al inicio)
        }, 800);
    }

    async step1_Invitado() {
        if (!this.isActive) return;
        console.log('👉 PASO 1: Mostrar Invitado (Lugar sigue)');
        
        await this.updateFirebase({
            Mostrar_Invitado: true,
            // Lugar sigue true
        });

        // Programar Paso 2
        this.timer = setTimeout(() => this.step2_Tema(), 12000); // Reducido a 12 segundos (-3s)
    }

    async step2_Tema() {
        if (!this.isActive) return;
        console.log('👉 PASO 2: Ocultar Invitado, Mostrar Tema (Lugar sigue)');
        
        // 1. Ocultar Invitado primero (Transición suave tipo Fecha)
        await this.updateFirebase({
            Mostrar_Invitado: false
        });

        // 2. Esperar a que salga (600ms) antes de mostrar el Tema
        this.timer = setTimeout(async () => {
            if (!this.isActive) return;
            await this.updateFirebase({ Mostrar_Tema: true });
            
            // Programar Paso 3
            this.timer = setTimeout(() => this.step3_Publicidad(), 7000);
        }, 600);
    }

    async step3_Publicidad() {
        if (!this.isActive) return;
        console.log('👉 PASO 3: Ocultar Tema, Mostrar Publicidad');

        // Verificar si hay publicidad disponible (Pre-cargada o Estática)
        const currentUrl = window.lastFirebaseData?.urlImagenPublicidad;
        
        if (!this.hasPendingAd && !currentUrl) {
            console.log('⚠️ No hay publicidad disponible. Finalizando secuencia anticipadamente...');
            await this.updateFirebase({ Mostrar_Tema: false }); // Apagar tema previo
            this.step4_Final();
            return;
        }

        console.log('📺 Activando publicidad (Imagen ya precargada al inicio)');

        // 1. Ocultar Tema primero
        await this.updateFirebase({
            Mostrar_Tema: false
        });

        // 2. Esperar a que salga (600ms) antes de mostrar Publicidad
        this.timer = setTimeout(async () => {
            if (!this.isActive) return;
            await this.updateFirebase({ Mostrar_Publicidad: true });
            
            // Programar Paso 4 (Final)
            this.timer = setTimeout(() => this.step4_Final(), 8000);
        }, 600);
    }

    async step4_Final() {
        if (!this.isActive) return;
        console.log('👉 PASO 4: Finalizar (Ocultar Publicidad y Lugar)');

        await this.updateFirebase({
            Mostrar_Publicidad: false,
            Mostrar_Lugar: false,
            mostrar_secuencia_invitado_tema: false // ✅ IMPORTANTE: Apagar el interruptor para evitar bucle
        });

        this.isActive = false;
        console.log('✅ Secuencia completada');
    }

    /**
     * 🔄 INICIAR ROTACIÓN CONTINUA DE PUBLICIDAD
     * Trigger: Mostrar_SecuenciaPublicidad
     */
    startAdRotation() {
        if (this.isAdRotationActive) return;
        
        // ✅ Protección: Lista vacía
        if (this.adPlaylist.length === 0) {
            console.warn('⚠️ Lista de publicidad vacía, no se puede iniciar rotación.');
            return;
        }

        console.log('🔄 📺 INICIANDO ROTACIÓN DE PUBLICIDAD (Loop)');
        this.isAdRotationActive = true;
        
        // ✅ REINICIAR ÍNDICE Y CONTADOR
        this.currentAdIndex = 0;
        this.itemsShownCount = 0; // ✅ Nuevo contador para control preciso
        
        // 1. Mostrar primera imagen inmediatamente
        this.rotateAdStep();
        
        // ✅ FIX: Usar contador para verificar si ya terminamos (caso lista de 1 elemento)
        if (this.itemsShownCount >= this.adPlaylist.length) {
            return;
        }

        // 2. Iniciar timer
        this.adRotationTimer = setInterval(() => {
            this.rotateAdStep();
        }, this.adRotationDuration);
    }

    /**
     * 🛑 DETENER ROTACIÓN CONTINUA
     */
    stopAdRotation() {
        if (!this.isAdRotationActive) return;
        
        console.log('🛑 📺 DETENIENDO ROTACIÓN DE PUBLICIDAD');
        this.isAdRotationActive = false;
        
        if (this.adRotationTimer) {
            clearInterval(this.adRotationTimer);
            this.adRotationTimer = null;
        }
        
        // Ocultar publicidad al terminar
        if (this.app.modules.lowerThirds) {
            this.app.modules.lowerThirds.hidePublicidad();
        }
    }

    /**
     * Paso individual de rotación
     */
    rotateAdStep() {
        if (!this.isAdRotationActive) return;

        // Usar la lógica existente para obtener siguiente URL
        const url = this.getNextAd();
        
        if (url && this.app.modules.lowerThirds) {
            this.itemsShownCount++; // ✅ Incrementar contador de mostrados

            // Preload de la siguiente (para el próximo tick)
            this.preloadNextAdInLoop();
            
            // Actualizar DOM
            this.app.modules.lowerThirds.updatePublicidadContent({ url: url });
            
            // Asegurar que esté visible
            this.app.modules.lowerThirds.showPublicidad();
            
            console.log(`📺 Publicidad mostrada (${this.itemsShownCount}/${this.adPlaylist.length}): ${url}`);

            // ✅ DETECTAR FIN DE LISTA USANDO CONTADOR (Más seguro que el índice)
            if (this.itemsShownCount >= this.adPlaylist.length) {
                console.log('🏁 Fin de lista de publicidad. Programando apagado...');
                
                // Detener el intervalo para no repetir
                if (this.adRotationTimer) {
                    clearInterval(this.adRotationTimer);
                    this.adRotationTimer = null;
                }
                
                // Programar el apagado después de que termine de mostrarse este último anuncio
                setTimeout(() => {
                    this.finishAdSequence();
                }, this.adRotationDuration);
            }
        }
    }

    /**
     * Finalizar secuencia de publicidad y apagar en Firebase
     */
    async finishAdSequence() {
        // Verificar si sigue activa (para evitar conflictos si se detuvo manualmente)
        if (!this.isAdRotationActive) return;

        console.log('🛑 📺 Secuencia de publicidad completada. Apagando...');
        this.stopAdRotation(); // Detiene localmente y oculta

        // Apagar interruptores en Firebase
        await this.updateFirebase({
            Mostrar_SecuenciaPublicidad: false,
            Mostrar_Publicidad: false
        });
    }

    /**
     * Pre-cargar siguiente imagen en el loop
     */
    preloadNextAdInLoop() {
        if (this.adPlaylist.length === 0) return;
        const nextIndex = (this.currentAdIndex + 1) % this.adPlaylist.length;
        const nextUrl = this.adPlaylist[nextIndex];
        if (nextUrl) {
            const img = new Image();
            img.src = nextUrl;
        }
    }

    /**
     * Obtener siguiente publicidad de la playlist
     */
    getNextAd() {
        if (this.adPlaylist.length === 0) return "";
        
        // ✅ Protección: Asegurar que el índice es válido si la lista cambió de tamaño
        if (this.currentAdIndex >= this.adPlaylist.length) {
            this.currentAdIndex = 0;
        }

        const url = this.adPlaylist[this.currentAdIndex];
        console.log(`🔄 getNextAd: Índice ${this.currentAdIndex} de ${this.adPlaylist.length} -> ${url}`);
        
        // Avanzar índice (rotación circular)
        this.currentAdIndex = (this.currentAdIndex + 1) % this.adPlaylist.length;
        
        return url;
    }

    addAdToPlaylist(url) {
        this.adPlaylist.push(url);
        console.log(`➕ Publicidad agregada. Total: ${this.adPlaylist.length}`);
    }

    stopSequence() {
        if (this.timer) clearTimeout(this.timer);
        
        // Si detenemos mientras mostramos la fecha, restaurar el lugar inmediatamente
        const lugarEl = document.getElementById('grafico-lugar');
        if (lugarEl && lugarEl.classList.contains('show-calendar')) {
            lugarEl.classList.remove('show-calendar');
            if (this.originalLugar) {
                this.updateFirebase({ Lugar: this.originalLugar });
            }
        }

        this.isActive = false;
        console.log('🛑 Secuencia detenida manualmente');
    }

    async updateFirebase(updates) {
        if (!this.app.modules.firebaseClient) return;
        
        try {
            // Actualizar cada campo
            for (const [key, value] of Object.entries(updates)) {
                const path = `CLAVE_STREAM_FB/STREAM_LIVE/GRAFICOS/${key}`;
                await this.app.modules.firebaseClient.writeData(path, value);
            }
        } catch (error) {
            console.error(`❌ ERROR en secuencia: Falló la escritura en Firebase para las actualizaciones:`, updates, error);
            this.stopSequence(); // Detener la secuencia para evitar comportamiento inesperado.
        }
    }
}
