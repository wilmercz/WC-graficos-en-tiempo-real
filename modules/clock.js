// 🕐 modules/clock.js
// Responsabilidad: Gestionar el reloj bajo el logo (como en TV) - ✅ MEJORADO PARA MOSTRAR_HORA

import { EventBus } from '../utils/event-bus.js';

export class Clock {
    constructor() {
        this.element = null;
        this.isVisible = false;
        this.updateInterval = null;
        this.lastUpdate = null;
        
        // ✅ MEJORADO: Configuración más robusta
        this.config = {
            position: {
                //left: 'var(--logo-left, 45px)',
                left: 'calc(var(--logo-left, 45px) - 5px)',
                bottom: 'calc(var(--logo-bottom, 33px) - 25px)'
            },
            style: {
                //background: 'rgba(0, 0, 0, 0.7)',
                background: 'transparent',
                color: 'white',
                padding: '2px 8px',
                borderRadius: '4px',
                fontSize: '16px',
                fontFamily: "'Verdana', monospace",
                fontWeight: 'bold',
                zIndex: '999',
                transition: 'opacity 0.3s ease',
                pointerEvents: 'none', // ✅ NUEVO: No interferir con clicks
                userSelect: 'none'     // ✅ NUEVO: No seleccionable
            },
            format: '24h', // ✅ NUEVO: Formato configurable
            updateFrequency: 30000 // ✅ NUEVO: Frecuencia configurable (30s)
        };
        
        // ✅ NUEVO: Estado interno mejorado
        this.state = {
            isInitialized: false,
            lastVisibilityChange: null,
            totalShowTime: 0,
            showCount: 0
        };
    }

    // ===== MÉTODOS PÚBLICOS =====
    
    /**
     * Inicializar el reloj - ✅ MEJORADO
     */
    init() {
        if (this.state.isInitialized) {
            console.log('🕐 Clock ya inicializado - saltando...');
            return;
        }
        
        console.log('🕐 Inicializando Clock module...');
        
        this.createElement();
        this.startUpdating();
        this.setupEventListeners();
        
        this.state.isInitialized = true;
        
        console.log('✅ Clock module initialized');
        
        // ✅ NUEVO: Emitir evento de inicialización
        EventBus.emit('clock-initialized');
    }

    /**
     * ✅ NUEVO: Configurar event listeners
     */
    setupEventListeners() {
        // Escuchar cambios de visibilidad desde Firebase
        EventBus.on('firebase-data-processed', (data) => {
            this.handleFirebaseData(data);
        });
        
        // Escuchar comandos de debug
        EventBus.on('debug-clock-show', () => {
            console.log('🕐 DEBUG: Forzando mostrar reloj');
            this.show();
        });
        
        EventBus.on('debug-clock-hide', () => {
            console.log('🕐 DEBUG: Forzando ocultar reloj');
            this.hide();
        });
    }

    /**
     * ✅ NUEVO: Manejar datos de Firebase
     */
    handleFirebaseData(data) {
        if (!data.visibility) return;
        
        const shouldShowClock = data.visibility.horaAlAire;
        const logoVisible = data.visibility.logoAlAire;
        
        console.log('🕐 Datos Firebase - Hora:', shouldShowClock, 'Logo:', logoVisible);
        
        // La lógica de visibilidad se maneja en main.js
        // Este método es solo para logging y estadísticas
        if (shouldShowClock !== this.isVisible) {
            console.log(`🕐 Cambio detectado: ${this.isVisible} → ${shouldShowClock}`);
        }
    }

    /**
     * Mostrar el reloj - ✅ MEJORADO
     */
    show() {
        if (!this.element) {
            console.log('🕐 Elemento no existe - creando...');
            this.createElement();
        }
        
        // ✅ NUEVO: Solo actuar si hay cambio real
        if (this.isVisible) {
            console.log('🕐 Reloj ya visible - sin cambios');
            return;
        }
        
        this.isVisible = true;
        this.state.lastVisibilityChange = Date.now();
        this.state.showCount++;
        
        // Mostrar y actualizar inmediatamente
        this.element.style.opacity = '1';
        this.updateTime();
        
        console.log(`🕐 Clock mostrado (show #${this.state.showCount})`);
        
        // ✅ NUEVO: Emitir evento
        EventBus.emit('clock-shown', {
            timestamp: this.state.lastVisibilityChange,
            showCount: this.state.showCount
        });
    }

    /**
     * Ocultar el reloj - ✅ MEJORADO
     */
    hide() {
        if (!this.isVisible) {
            console.log('🕐 Reloj ya oculto - sin cambios');
            return;
        }
        
        if (this.element) {
            this.element.style.opacity = '0';
        }
        
        // ✅ NUEVO: Calcular tiempo total mostrado
        if (this.state.lastVisibilityChange) {
            const showDuration = Date.now() - this.state.lastVisibilityChange;
            this.state.totalShowTime += showDuration;
            console.log(`🕐 Reloj estuvo visible ${(showDuration / 1000).toFixed(1)}s`);
        }
        
        this.isVisible = false;
        this.state.lastVisibilityChange = Date.now();
        
        console.log('🕐 Clock ocultado');
        
        // ✅ NUEVO: Emitir evento
        EventBus.emit('clock-hidden', {
            timestamp: this.state.lastVisibilityChange,
            showDuration: this.state.lastVisibilityChange ? Date.now() - this.state.lastVisibilityChange : 0
        });
    }

    /**
     * Destruir el reloj - ✅ MEJORADO
     */
    destroy() {
        console.log('🕐 Destruyendo Clock module...');
        
        this.stopUpdating();
        
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
        
        // ✅ NUEVO: Limpiar event listeners
        EventBus.off('firebase-data-processed');
        EventBus.off('debug-clock-show');
        EventBus.off('debug-clock-hide');
        
        // ✅ NUEVO: Reset completo del estado
        this.element = null;
        this.isVisible = false;
        this.state.isInitialized = false;
        
        console.log('✅ Clock module destruido');
        
        // ✅ NUEVO: Emitir evento
        EventBus.emit('clock-destroyed');
    }

    /**
     * Configurar posición del reloj - ✅ MEJORADO
     */
    setPosition(left, bottom) {
        console.log(`🕐 Cambiando posición: left=${left}, bottom=${bottom}`);
        
        this.config.position.left = left;
        this.config.position.bottom = bottom;
        
        if (this.element) {
            this.element.style.left = left;
            this.element.style.bottom = bottom;
            console.log('✅ Posición actualizada en elemento');
        }
        
        // ✅ NUEVO: Emitir evento de cambio de posición
        EventBus.emit('clock-position-changed', {
            left: left,
            bottom: bottom
        });
    }

    // ===== MÉTODOS PRIVADOS =====

    /**
     * Crear elemento DOM del reloj - ✅ MEJORADO
     */
    createElement() {
        console.log('🕐 Creando elemento DOM del reloj...');
        
        // Verificar si ya existe y removerlo
        let existing = document.getElementById('stream-clock');
        if (existing) {
            console.log('🕐 Elemento existente encontrado - removiendo...');
            existing.remove();
        }

        // Crear nuevo elemento
        this.element = document.createElement('div');
        this.element.id = 'stream-clock';
        
        // ✅ MEJORADO: Aplicar estilos más robustos
        const styles = {
            position: 'absolute',
            left: this.config.position.left,
            bottom: this.config.position.bottom,
            opacity: '0', // Inicialmente oculto
            ...this.config.style
        };
        
        Object.assign(this.element.style, styles);

        // ✅ NUEVO: Agregar atributos para debug
        this.element.setAttribute('data-module', 'clock');
        this.element.setAttribute('data-version', '2.0');
        this.element.title = 'Reloj del stream - Controlado por Firebase';

        // Agregar al DOM
        document.body.appendChild(this.element);
        
        console.log('✅ Elemento del reloj creado y agregado al DOM');
        
        // ✅ NUEVO: Emitir evento
        EventBus.emit('clock-element-created', {
            element: this.element,
            id: this.element.id
        });
    }

    /**
     * Actualizar la hora mostrada - ✅ MEJORADO
     */
    updateTime() {
        if (!this.element) {
            console.warn('⚠️ No se puede actualizar - elemento no existe');
            return;
        }

        const now = new Date();
        let timeString;
        
        // ✅ NUEVO: Soporte para múltiples formatos
        if (this.config.format === '12h') {
            const hours = now.getHours();
            const minutes = now.getMinutes().toString().padStart(2, '0');
            const ampm = hours >= 12 ? 'PM' : 'AM';
            const displayHours = hours % 12 || 12;
            timeString = `${displayHours}:${minutes} ${ampm}`;
        } else {
            // Formato 24h (por defecto)
            const hours = now.getHours().toString().padStart(2, '0');
            const minutes = now.getMinutes().toString().padStart(2, '0');
            timeString = `${hours}:${minutes}`;
        }
        
        // ✅ NUEVO: Solo actualizar si cambió el contenido
        if (this.element.textContent !== timeString) {
            this.element.textContent = timeString;
            this.lastUpdate = now;
            
            // ✅ NUEVO: Log solo cada minuto para no saturar
            const shouldLog = !this.lastLoggedMinute || 
                            this.lastLoggedMinute !== now.getMinutes();
            
            if (shouldLog) {
                console.log(`🕐 Hora actualizada: ${timeString}`);
                this.lastLoggedMinute = now.getMinutes();
                
                // ✅ NUEVO: Emitir evento de actualización
                EventBus.emit('clock-time-updated', {
                    time: timeString,
                    timestamp: now.getTime(),
                    format: this.config.format
                });
            }
        }
    }

    /**
     * Iniciar actualización automática - ✅ MEJORADO
     */
    startUpdating() {
        if (this.updateInterval) {
            console.log('🕐 Actualización ya activa - limpiando anterior...');
            this.stopUpdating();
        }
        
        // Actualizar inmediatamente
        this.updateTime();
        
        // ✅ MEJORADO: Usar frecuencia configurable
        this.updateInterval = setInterval(() => {
            if (this.isVisible) {
                this.updateTime();
            }
        }, this.config.updateFrequency);
        
        console.log(`🕐 Actualización automática iniciada (cada ${this.config.updateFrequency/1000}s)`);
        
        // ✅ NUEVO: Emitir evento
        EventBus.emit('clock-updating-started', {
            frequency: this.config.updateFrequency
        });
    }

    /**
     * Detener actualización automática - ✅ MEJORADO
     */
    stopUpdating() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
            console.log('🕐 Actualización automática detenida');
            
            // ✅ NUEVO: Emitir evento
            EventBus.emit('clock-updating-stopped');
        }
    }

    // ===== MÉTODOS DE CONFIGURACIÓN =====

    /**
     * Cambiar formato del reloj - ✅ MEJORADO
     */
    setFormat(format = '24h') {
        if (format !== '12h' && format !== '24h') {
            console.warn(`⚠️ Formato inválido: ${format}. Usando 24h por defecto.`);
            format = '24h';
        }
        
        const oldFormat = this.config.format;
        this.config.format = format;
        
        // Actualizar inmediatamente si está visible
        if (this.isVisible) {
            this.updateTime();
        }
        
        console.log(`🕐 Formato cambiado: ${oldFormat} → ${format}`);
        
        // ✅ NUEVO: Emitir evento
        EventBus.emit('clock-format-changed', {
            oldFormat: oldFormat,
            newFormat: format
        });
    }

    /**
     * Cambiar frecuencia de actualización - ✅ NUEVO
     */
    setUpdateFrequency(frequency = 30000) {
        if (frequency < 1000) {
            console.warn('⚠️ Frecuencia muy baja - mínimo 1000ms');
            frequency = 1000;
        }
        
        const oldFrequency = this.config.updateFrequency;
        this.config.updateFrequency = frequency;
        
        // Reiniciar actualización si está activa
        if (this.updateInterval) {
            this.startUpdating();
        }
        
        console.log(`🕐 Frecuencia actualización: ${oldFrequency}ms → ${frequency}ms`);
        
        EventBus.emit('clock-frequency-changed', {
            oldFrequency: oldFrequency,
            newFrequency: frequency
        });
    }

    /**
     * Cambiar estilos del reloj - ✅ MEJORADO
     */
    setStyle(newStyles) {
        if (!newStyles || typeof newStyles !== 'object') {
            console.warn('⚠️ Estilos inválidos proporcionados');
            return;
        }
        
        console.log('🕐 Actualizando estilos:', newStyles);
        
        Object.assign(this.config.style, newStyles);
        
        if (this.element) {
            Object.assign(this.element.style, newStyles);
            console.log('✅ Estilos aplicados al elemento');
        }
        
        // ✅ NUEVO: Emitir evento
        EventBus.emit('clock-style-changed', {
            newStyles: newStyles
        });
    }

    // ===== MÉTODOS DE ESTADO =====

    /**
     * Verificar si el reloj está visible
     */
    isShown() {
        return this.isVisible;
    }

    /**
     * Obtener estado completo del reloj - ✅ MEJORADO
     */
    getState() {
        return {
            // Estado básico
            isVisible: this.isVisible,
            isInitialized: this.state.isInitialized,
            hasElement: !!this.element,
            isUpdating: !!this.updateInterval,
            
            // Contenido actual
            currentTime: this.element ? this.element.textContent : null,
            lastUpdate: this.lastUpdate,
            
            // Configuración
            format: this.config.format,
            updateFrequency: this.config.updateFrequency,
            position: { ...this.config.position },
            
            // ✅ NUEVO: Estadísticas
            statistics: {
                showCount: this.state.showCount,
                totalShowTime: this.state.totalShowTime,
                averageShowTime: this.state.showCount > 0 ? 
                    Math.round(this.state.totalShowTime / this.state.showCount) : 0,
                lastVisibilityChange: this.state.lastVisibilityChange
            }
        };
    }

    /**
     * ✅ NUEVO: Obtener estadísticas detalladas
     */
    getStatistics() {
        return {
            showCount: this.state.showCount,
            totalShowTimeMs: this.state.totalShowTime,
            totalShowTimeFormatted: this.formatDuration(this.state.totalShowTime),
            averageShowTime: this.state.showCount > 0 ? 
                Math.round(this.state.totalShowTime / this.state.showCount) : 0,
            lastShown: this.state.lastVisibilityChange ? 
                new Date(this.state.lastVisibilityChange).toLocaleString() : 'Nunca',
            currentlyVisible: this.isVisible
        };
    }

    /**
     * ✅ NUEVO: Formatear duración en milisegundos a texto legible
     */
    formatDuration(ms) {
        if (!ms) return '0s';
        
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        
        if (hours > 0) {
            return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
        } else if (minutes > 0) {
            return `${minutes}m ${seconds % 60}s`;
        } else {
            return `${seconds}s`;
        }
    }

    /**
     * ✅ NUEVO: Reset de estadísticas
     */
    resetStatistics() {
        console.log('🕐 Reseteando estadísticas del reloj...');
        
        const oldStats = { ...this.state };
        
        this.state.showCount = 0;
        this.state.totalShowTime = 0;
        this.state.lastVisibilityChange = null;
        
        console.log('✅ Estadísticas reseteadas');
        
        EventBus.emit('clock-statistics-reset', {
            oldStats: oldStats
        });
    }

    /**
     * ✅ NUEVO: Método de debug completo
     */
    debug() {
        console.group('🕐 DEBUG CLOCK MODULE');
        console.log('Estado:', this.getState());
        console.log('Estadísticas:', this.getStatistics());
        console.log('Configuración:', this.config);
        
        if (this.element) {
            console.log('Elemento DOM:', this.element);
            console.log('Estilos computados:', window.getComputedStyle(this.element));
        }
        
        console.groupEnd();
    }
}

// ===== INSTANCIA GLOBAL (para compatibilidad) =====
export const clockInstance = new Clock();

// ===== FUNCIONES DE CONVENIENCIA - ✅ MEJORADAS =====
export const ClockUtils = {
    /**
     * Mostrar reloj rápidamente
     */
    show() {
        clockInstance.show();
    },

    /**
     * Ocultar reloj rápidamente
     */
    hide() {
        clockInstance.hide();
    },

    /**
     * Toggle visibilidad
     */
    toggle() {
        if (clockInstance.isVisible) {
            clockInstance.hide();
        } else {
            clockInstance.show();
        }
    },

    /**
     * Inicializar con configuración personalizada - ✅ MEJORADO
     */
    init(config = {}) {
        if (config.position) {
            clockInstance.setPosition(config.position.left, config.position.bottom);
        }
        if (config.style) {
            clockInstance.setStyle(config.style);
        }
        if (config.format) {
            clockInstance.setFormat(config.format);
        }
        if (config.updateFrequency) {
            clockInstance.setUpdateFrequency(config.updateFrequency);
        }
        
        clockInstance.init();
    },

    /**
     * Estado del reloj
     */
    status() {
        return clockInstance.getState();
    },

    /**
     * ✅ NUEVO: Estadísticas
     */
    stats() {
        return clockInstance.getStatistics();
    },

    /**
     * ✅ NUEVO: Debug
     */
    debug() {
        return clockInstance.debug();
    },

    /**
     * ✅ NUEVO: Reset
     */
    reset() {
        clockInstance.resetStatistics();
    },

    /**
     * ✅ NUEVO: Forzar actualización
     */
    forceUpdate() {
        clockInstance.updateTime();
    }
};

// ✅ NUEVO: Hacer disponible globalmente para debug
window.ClockDebug = {
    show: () => clockInstance.show(),
    hide: () => clockInstance.hide(),
    toggle: () => ClockUtils.toggle(),
    debug: () => clockInstance.debug(),
    stats: () => clockInstance.getStatistics(),
    reset: () => clockInstance.resetStatistics(),
    status: () => clockInstance.getState()
};

console.log('🕐 Clock module loaded - v2.0 (Mostrar_Hora compatible)');
console.log('💡 Debug disponible: window.ClockDebug.debug()');
