// 🎬 modules/sequence-manager.js
// Responsabilidad: Gestionar secuencias automáticas de gráficos (Ej: Invitado -> Tema -> Publicidad)

export class SequenceManager {
    constructor(app) {
        this.app = app;
        this.isActive = false;
        this.currentStep = 0;
        this.timer = null;
        
        // 🎵 Playlist de Publicidad (URLs)
        this.adPlaylist = [];
        this.currentAdIndex = 0;
        
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
        console.log(`📺 Playlist actualizada: ${this.adPlaylist.length} anuncios cargados`, this.adPlaylist);
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

        // --- PASO 1: INVITADO + LUGAR (0s - 20s) ---
        console.log('👉 PASO 1: Mostrar Invitado y Lugar');
        await this.updateFirebase({
            Mostrar_Invitado: false,
            Mostrar_Tema: false,
            Mostrar_Publicidad: false,
            Mostrar_Lugar: true,
        });

        // Programar Paso 2
        this.timer = setTimeout(() => this.step1_Invitado(), 800); // 1 segundos
    }

    async step1_Invitado() {
        if (!this.isActive) return;
        console.log('👉 PASO 1: Mostrar Invitado (Lugar sigue)');
        
        await this.updateFirebase({
            Mostrar_Invitado: true,
            // Lugar sigue true
        });

        // Programar Paso 2
        this.timer = setTimeout(() => this.step2_Tema(), 15000); // 15 segundos
    }

    async step2_Tema() {
        if (!this.isActive) return;
        console.log('👉 PASO 2: Ocultar Invitado, Mostrar Tema (Lugar sigue)');
        
        await this.updateFirebase({
            Mostrar_Invitado: false,
            Mostrar_Tema: true
            // Lugar sigue true
        });

        // Programar Paso 3
        this.timer = setTimeout(() => this.step3_Publicidad(), 10000); // 10 segundos
    }

    async step3_Publicidad() {
        if (!this.isActive) return;
        console.log('👉 PASO 3: Ocultar Tema, Mostrar Publicidad');

        // 1. Determinar qué publicidad mostrar (Playlist o Estática)
        let nextAdUrl = this.getNextAd();
        let usingPlaylist = true;

        // Si no hay playlist, intentar usar la publicidad estática actual
        if (!nextAdUrl) {
            console.log('⚠️ Playlist vacía. Verificando publicidad estática...');
            nextAdUrl = window.lastFirebaseData?.urlImagenPublicidad;
            usingPlaylist = false;
        }

        // Si definitivamente no hay publicidad, saltar este paso y terminar
        if (!nextAdUrl) {
            console.log('⚠️ No hay publicidad disponible. Finalizando secuencia anticipadamente...');
            await this.updateFirebase({ Mostrar_Tema: false }); // Apagar tema previo
            this.step4_Final();
            return;
        }

        console.log(`📺 Mostrando publicidad: ${usingPlaylist ? 'Rotativa' : 'Estática'} - ${nextAdUrl}`);

        // 2. Actualizar Firebase (Imagen + Visibilidad)
        // Solo actualizamos la URL si viene de la playlist
        if (usingPlaylist && this.app.modules.firebaseClient) {
            await this.app.modules.firebaseClient.writeData(
                'CLAVE_STREAM_FB/STREAM_LIVE/GRAFICOS/urlImagenPublicidad', 
                nextAdUrl
            );
        }

        await this.updateFirebase({
            Mostrar_Tema: false,
            Mostrar_Publicidad: true
            // Lugar sigue true
        });

        // Programar Paso 4 (Final)
        this.timer = setTimeout(() => this.step4_Final(), 15000); // 15 segundos
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
     * Obtener siguiente publicidad de la playlist
     */
    getNextAd() {
        if (this.adPlaylist.length === 0) return "";
        
        // ✅ Protección: Asegurar que el índice es válido si la lista cambió de tamaño
        if (this.currentAdIndex >= this.adPlaylist.length) {
            this.currentAdIndex = 0;
        }

        const url = this.adPlaylist[this.currentAdIndex];
        
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
        this.isActive = false;
        console.log('🛑 Secuencia detenida manualmente');
    }

    async updateFirebase(updates) {
        if (!this.app.modules.firebaseClient) return;
        
        // Actualizar cada campo
        for (const [key, value] of Object.entries(updates)) {
            const path = `CLAVE_STREAM_FB/STREAM_LIVE/GRAFICOS/${key}`;
            await this.app.modules.firebaseClient.writeData(path, value);
        }
    }
}
