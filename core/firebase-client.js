// 📡 core/firebase-client.js
// Responsabilidad: SOLO conexión y comunicación con Firebase

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getDatabase, ref, onValue, set } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-database.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
import { EventBus } from '../utils/event-bus.js';

export class FirebaseClient {
    constructor(config) {
        this.config = config;
        this.app = null;
        this.auth = null;
        this.database = null;
        this.isConnected = false;
        this.dataListeners = new Map();
    }

    /**
     * Conectar con Firebase
     */
    async connect() {
        try {
            console.log('📡 Conectando con Firebase...');
            
            // Inicializar Firebase
            this.app = initializeApp(this.config);
            this.auth = getAuth(this.app);
            this.database = getDatabase(this.app);
            
            // Autenticación anónima
            await signInAnonymously(this.auth);
            
            this.isConnected = true;
            console.log('✅ Firebase conectado exitosamente');
            
            // Emitir evento de conexión
            EventBus.emit('firebase-connected');
            
            return true;
            
        } catch (error) {
            console.error('❌ Error conectando Firebase:', error);
            EventBus.emit('firebase-error', error);
            throw error;
        }
    }

    /**
     * Desconectar de Firebase
     */
    disconnect() {
        // Limpiar listeners
        this.dataListeners.clear();
        
        this.isConnected = false;
        console.log('🔌 Firebase desconectado');
        
        EventBus.emit('firebase-disconnected');
    }

    /**
     * Escuchar cambios en una ruta específica
     */
    onDataChange(path, callback) {
        if (!this.isConnected) {
            console.warn('⚠️ Firebase no está conectado');
            return null;
        }

        const dataRef = ref(this.database, path);
        
        const unsubscribe = onValue(dataRef, (snapshot) => {
            const data = snapshot.val();
            
            if (data) {
                console.log(`📊 Datos recibidos de ${path}:`, data);
                callback(data);
                
                // Emitir evento global
                EventBus.emit('firebase-data-received', {
                    path: path,
                    data: data,
                    timestamp: Date.now()
                });
            }
        }, (error) => {
            console.error(`❌ Error escuchando ${path}:`, error);
            EventBus.emit('firebase-error', error);
        });

        // Guardar listener para poder limpiarlo después
        this.dataListeners.set(path, unsubscribe);
        
        console.log(`👂 Escuchando cambios en: ${path}`);
        return unsubscribe;
    }

    /**
     * Escribir datos en Firebase
     */
    async writeData(path, data) {
        if (!this.isConnected) {
            console.warn('⚠️ Firebase no está conectado');
            return false;
        }

        try {
            const dataRef = ref(this.database, path);
            await set(dataRef, data);
            
            console.log(`✅ Datos escritos en ${path}:`, data);
            
            EventBus.emit('firebase-data-written', {
                path: path,
                data: data,
                timestamp: Date.now()
            });
            
            return true;
            
        } catch (error) {
            console.error(`❌ Error escribiendo en ${path}:`, error);
            EventBus.emit('firebase-error', error);
            return false;
        }
    }

    /**
     * Leer datos una sola vez
     */
    async readData(path) {
        if (!this.isConnected) {
            console.warn('⚠️ Firebase no está conectado');
            return null;
        }

        try {
            const dataRef = ref(this.database, path);
            const snapshot = await get(dataRef);
            const data = snapshot.val();
            
            console.log(`📖 Datos leídos de ${path}:`, data);
            return data;
            
        } catch (error) {
            console.error(`❌ Error leyendo ${path}:`, error);
            return null;
        }
    }

    /**
     * Detener escucha de una ruta específica
     */
    stopListening(path) {
        const unsubscribe = this.dataListeners.get(path);
        if (unsubscribe) {
            unsubscribe();
            this.dataListeners.delete(path);
            console.log(`🔇 Detenida escucha de: ${path}`);
        }
    }

    /**
     * Obtener estado de la conexión
     */
    getConnectionState() {
        return {
            isConnected: this.isConnected,
            hasAuth: !!this.auth,
            hasDatabase: !!this.database,
            activeListeners: this.dataListeners.size,
            config: {
                projectId: this.config?.projectId,
                authDomain: this.config?.authDomain
            }
        };
    }

    /**
     * Configurar rutas de escucha principales
     */
    setupMainListeners() {
        console.log('🎧 Configurando listeners principales...');
        
        // Listener principal para gráficos
        this.onDataChange('CLAVE_STREAM_FB/STREAM_LIVE/GRAFICOS', (data) => {
            EventBus.emit('graphics-data-updated', data);
        });
        
        
        console.log('✅ Listeners principales configurados');
    }

    /**
     * Funciones de conveniencia para rutas específicas
     */
    
    // Actualizar visibilidad de elemento
    async updateVisibility(elementType, visible) {
        const fieldMap = {
            'invitado': 'Mostrar_Invitado',
            'tema': 'Mostrar_Tema', 
            'publicidad': 'Mostrar_Publicidad',
            'logo': 'Mostrar_Logo'
        };
        
        const fieldName = fieldMap[elementType];
        if (!fieldName) {
            console.warn(`⚠️ Tipo de elemento desconocido: ${elementType}`);
            return false;
        }
        
        const path = `CLAVE_STREAM_FB/STREAM_LIVE/GRAFICOS/${fieldName}`;
        return await this.writeData(path, visible);
    }
    
    // Actualizar contenido de texto
    async updateContent(contentType, value) {
        const fieldMap = {
            'invitado': 'Invitado',
            'rol': 'Rol',
            'tema': 'Tema'
        };
        
        const fieldName = fieldMap[contentType];
        if (!fieldName) {
            console.warn(`⚠️ Tipo de contenido desconocido: ${contentType}`);
            return false;
        }
        
        const path = `CLAVE_STREAM_FB/STREAM_LIVE/GRAFICOS/${fieldName}`;
        return await this.writeData(path, value);
    }
    
    // Actualizar URL de imagen
    async updateImageUrl(imageType, url) {
        const fieldMap = {
            'logo': 'urlLogo',
            'publicidad': 'urlImagenPublicidad'
        };
        
        const fieldName = fieldMap[imageType];
        if (!fieldName) {
            console.warn(`⚠️ Tipo de imagen desconocido: ${imageType}`);
            return false;
        }
        
        const path = `CLAVE_STREAM_FB/STREAM_LIVE/GRAFICOS/${fieldName}`;
        return await this.writeData(path, url);
    }
}

// ===== INSTANCIA GLOBAL =====
export let firebaseClient = null;

/**
 * Inicializar cliente Firebase con configuración
 */
export async function initializeFirebaseClient(config) {
    if (firebaseClient) {
        console.warn('⚠️ Cliente Firebase ya inicializado');
        return firebaseClient;
    }
    
    firebaseClient = new FirebaseClient(config);
    await firebaseClient.connect();
    
    // Configurar listeners principales
    firebaseClient.setupMainListeners();
    
    return firebaseClient;
}

/**
 * Obtener cliente Firebase actual
 */
export function getFirebaseClient() {
    return firebaseClient;
}

/**
 * Funciones de conveniencia para acceso rápido
 */
export const FirebaseUtils = {
    /**
     * Escribir datos rápidamente
     */
    write: async (path, data) => {
        if (!firebaseClient) {
            console.warn('⚠️ Cliente Firebase no inicializado');
            return false;
        }
        return await firebaseClient.writeData(path, data);
    },
    
    /**
     * Escuchar cambios rápidamente
     */
    listen: (path, callback) => {
        if (!firebaseClient) {
            console.warn('⚠️ Cliente Firebase no inicializado');
            return null;
        }
        return firebaseClient.onDataChange(path, callback);
    },
    
    /**
     * Actualizar visibilidad rápidamente
     */
    setVisibility: async (element, visible) => {
        if (!firebaseClient) return false;
        return await firebaseClient.updateVisibility(element, visible);
    },
    
    /**
     * Estado de conexión
     */
    status: () => {
        if (!firebaseClient) return { connected: false };
        return firebaseClient.getConnectionState();
    }
};

console.log('📡 Firebase Client module loaded');