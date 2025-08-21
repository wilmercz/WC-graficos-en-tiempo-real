// 📡 utils/event-bus.js
// Responsabilidad: Comunicación entre módulos sin dependencias directas

export class EventBus {
    constructor() {
        this.events = new Map();
        this.debugMode = false;
    }

    /**
     * Suscribirse a un evento
     */
    static on(eventName, callback) {
        if (!this.instance) {
            this.instance = new EventBus();
        }
        
        if (!this.instance.events.has(eventName)) {
            this.instance.events.set(eventName, []);
        }
        
        this.instance.events.get(eventName).push(callback);
        
        if (this.instance.debugMode) {
            console.log(`📡 Suscrito a evento: ${eventName}`);
        }
    }

    /**
     * Emitir un evento
     */
    static emit(eventName, data) {
        if (!this.instance) {
            this.instance = new EventBus();
        }
        
        const callbacks = this.instance.events.get(eventName);
        if (!callbacks) return;

        if (this.instance.debugMode) {
            console.log(`📡 Emitiendo evento: ${eventName}`, data);
        }

        callbacks.forEach(callback => {
            try {
                callback(data);
            } catch (error) {
                console.error(`❌ Error en callback de ${eventName}:`, error);
            }
        });
    }

    /**
     * Desuscribirse de un evento
     */
    static off(eventName, callback) {
        if (!this.instance) return;
        
        const callbacks = this.instance.events.get(eventName);
        if (!callbacks) return;

        const index = callbacks.indexOf(callback);
        if (index > -1) {
            callbacks.splice(index, 1);
        }
    }

    /**
     * Habilitar/deshabilitar debug
     */
    static setDebug(enabled) {
        if (!this.instance) {
            this.instance = new EventBus();
        }
        this.instance.debugMode = enabled;
    }

    /**
     * Obtener estadísticas del event bus
     */
    static getStats() {
        if (!this.instance) {
            return { totalEvents: 0, events: [] };
        }
        
        const events = Array.from(this.instance.events.keys());
        const totalListeners = Array.from(this.instance.events.values())
            .reduce((total, callbacks) => total + callbacks.length, 0);
            
        return {
            totalEvents: events.length,
            totalListeners: totalListeners,
            events: events
        };
    }

    /**
     * Limpiar todos los eventos
     */
    static clear() {
        if (this.instance) {
            this.instance.events.clear();
            console.log('📡 Event Bus limpiado');
        }
    }
}

console.log('📡 Event Bus module loaded');