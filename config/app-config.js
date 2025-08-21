// ⚙️ config/app-config.js
// Responsabilidad: Configuración centralizada de toda la aplicación

import { firebaseConfig } from '../firebase-config.js';

export const AppConfig = {
    // ===== CONFIGURACIÓN FIREBASE =====
    firebase: firebaseConfig,
    
    // ===== CONFIGURACIÓN DEL SCHEDULER =====
    scheduler: {
        interval: 1000, // Ejecutar cada 1 segundo
        enableClock: true,
        debugMode: false, // Cambiar a true para desarrollo
        
        // Tareas predefinidas
        defaultTasks: [
            {
                name: 'heartbeat',
                interval: 30000, // 30 segundos
                enabled: true
            },
            {
                name: 'sync-check',
                interval: 5000, // 5 segundos
                enabled: true
            }
        ]
    },

    // ===== CONFIGURACIÓN DE ELEMENTOS =====
    elements: {
        // Configuración por defecto para elementos
        defaults: {
            logo: {
                duration: 60000, // 60 segundos
                position: {
                    left: '45px',
                    bottom: '33px'
                },
                size: {
                    width: '46px',
                    height: 'auto'
                }
            },
            lowerThird: {
                duration: 45000, // 45 segundos
                position: {
                    invitado: { left: '100px', bottom: '34px' },
                    tema: { left: '100px', bottom: '34px' }
                }
            },
            publicidad: {
                duration: 30000, // 30 segundos
                position: {
                    left: '120px',
                    bottom: '20px'
                }
            }
        },

        // Selectores DOM
        selectors: {
            logo: '#logo',
            invitadoContainer: '#grafico-invitado-rol',
            invitadoH1: '#grafico-invitado-rol h1',
            invitadoH2: '#grafico-invitado-rol h2',
            temaContainer: '#grafico-tema',
            temaH1: '#grafico-tema h1',
            publicidadContainer: '#grafico-publicidad',
            publicidadImg: '#publicidad-img',
            clock: '#stream-clock'
        }
    },

    // ===== CONFIGURACIÓN DE ANIMACIONES =====
    animations: {
        // Configuración por defecto de animaciones
        defaults: {
            invitadoRol: {
                delay: 200,
                duracion: 600,
                easing: 'EASE_IN_OUT',
                entrada: 'WIPE_IN_RIGHT',
                salida: 'WIPE_OUT_LEFT'
            },
            tema: {
                delay: 200,
                duracion: 600,
                easing: 'EASE_IN_OUT',
                entrada: 'WIPE_IN_LEFT',
                salida: 'WIPE_OUT_TOP'
            },
            logo: {
                delay: 0,
                duracion: 400,
                easing: 'EASE_IN_OUT',
                entrada: 'FADE_IN',
                salida: 'FADE_OUT'
            },
            publicidad: {
                delay: 0,
                duracion: 400,
                easing: 'EASE_IN_OUT',
                entrada: 'SLIDE_IN_BOTTOM',
                salida: 'SLIDE_OUT_BOTTOM'
            }
        },

        // Tipos de easing disponibles
        easingTypes: {
            'EASE': 'ease',
            'EASE_IN': 'ease-in',
            'EASE_OUT': 'ease-out',
            'EASE_IN_OUT': 'ease-in-out',
            'LINEAR': 'linear',
            'BOUNCE': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
            'ELASTIC': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
        }
    },

    // ===== CONFIGURACIÓN DE DATOS =====
    dataProcessing: {
        // Rutas de Firebase
        firebasePaths: {
            main: 'CLAVE_STREAM_FB/STREAM_LIVE/GRAFICOS'
        },

        // Mapeo de campos Firebase
        fieldMapping: {
            visibility: {
                logo: 'Mostrar_Logo',
                invitado: 'Mostrar_Invitado',
                tema: 'Mostrar_Tema',
                publicidad: 'Mostrar_Publicidad'
            },
            content: {
                invitado: 'Invitado',
                rol: 'Rol',
                tema: 'Tema'
            },
            images: {
                logo: 'urlLogo',
                publicidad: 'urlImagenPublicidad'
            },
            timing: {
                nombreRol: 'duracionNombreRol',
                tema: 'duracionTema',
                publicidad: 'duracionPublicidad',
                logoPrincipal: 'duracionLogoPrincipal',
                logosAliados: 'duracionLogosAliados'
            }
        },

        // Valores por defecto para datos faltantes
        defaultValues: {
            timing: {
                duracionNombreRol: 45,
                duracionTema: 45,
                duracionPublicidad: 30,
                duracionLogoPrincipal: 60,
                duracionLogosAliados: 45
            },
            colors: {
                fondo1: '#FFFFFF',
                letra1: '#000000',
                fondo2: '#FFFFFF',
                letra2: '#000000',
                fondo3: '#FFFFFF',
                letra3: '#000000'
            },
            content: {
                invitado: 'Sin Invitado',
                rol: 'Sin Rol',
                tema: 'Sin Tema'
            }
        }
    },

    // ===== CONFIGURACIÓN DE LOGOS =====
    logos: {
        // Configuración por defecto
        defaults: {
            enabled: false,
            mainDuration: 60, // segundos
            aliadoDuration: 45, // segundos
            continuousCycle: true,
            autoRotation: true
        },

        // Configuración de animaciones para logos
        animations: {
            changeAnimation: 'FADE_OUT',
            showAnimation: 'FADE_IN',
            duration: 400,
            delay: 0
        }
    },

    // ===== CONFIGURACIÓN DEL RELOJ =====
    clock: {
        enabled: true,
        format: '24h', // '24h' | '12h'
        updateInterval: 30000, // 30 segundos
        position: {
            left: 'var(--logo-left, 45px)',
            bottom: 'calc(var(--logo-bottom, 33px) - 25px)'
        },
        style: {
            background: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            padding: '2px 8px',
            borderRadius: '4px',
            fontSize: '12px',
            fontFamily: "'Courier New', monospace",
            zIndex: '999'
        }
    },

    // ===== CONFIGURACIÓN DE DEBUG =====
    debug: {
        enabled: true, // Habilitar en desarrollo
        maxLogs: 100,
        logLevel: 'info', // 'error' | 'warn' | 'info' | 'debug'
        showTimestamps: true,
        modules: {
            scheduler: true,
            firebase: true,
            animations: true,
            logos: true,
            lowerThirds: true
        }
    },

    // ===== CONFIGURACIÓN DE DESARROLLO =====
    development: {
        mockData: false, // Usar datos simulados
        bypassFirebase: false, // Saltar conexión Firebase
        enableHotReload: false, // Recarga automática
        debugPanel: true, // Mostrar panel de debug
        verboseLogging: true // Logging detallado
    },

    // ===== CONFIGURACIÓN DE COMPATIBILIDAD =====
    compatibility: {
        // Mantener variables globales para compatibilidad
        exposeGlobals: true,
        legacySupport: true,
        
        // Variables globales a mantener
        globalVariables: [
            'currentConfig',
            'logoConfig', 
            'animacionConfig',
            'lastFirebaseData',
            'logosAliados',
            'logoPrincipalUrl'
        ]
    },

    // ===== MÉTODOS DE CONFIGURACIÓN =====
    
    /**
     * Obtener configuración específica de un módulo
     */
    getModuleConfig(moduleName) {
        const configs = {
            scheduler: this.scheduler,
            animations: this.animations,
            logos: this.logos,
            clock: this.clock,
            debug: this.debug,
            elements: this.elements,
            dataProcessing: this.dataProcessing
        };
        
        return configs[moduleName] || {};
    },

    /**
     * Actualizar configuración en tiempo real
     */
    updateConfig(moduleName, newConfig) {
        if (this[moduleName]) {
            Object.assign(this[moduleName], newConfig);
            console.log(`⚙️ Configuración de ${moduleName} actualizada:`, newConfig);
            
            // Emitir evento de configuración actualizada
            if (window.EventBus) {
                window.EventBus.emit('config-updated', {
                    module: moduleName,
                    config: newConfig
                });
            }
        }
    },

    /**
     * Validar configuración
     */
    validate() {
        const issues = [];
        
        // Validar Firebase
        if (!this.firebase.apiKey) {
            issues.push('Firebase API Key faltante');
        }
        
        // Validar selectores DOM
        Object.entries(this.elements.selectors).forEach(([name, selector]) => {
            if (!selector) {
                issues.push(`Selector DOM faltante: ${name}`);
            }
        });
        
        // Validar rutas Firebase
        if (!this.dataProcessing.firebasePaths.main) {
            issues.push('Ruta principal de Firebase faltante');
        }
        
        return {
            isValid: issues.length === 0,
            issues: issues
        };
    },

    /**
     * Exportar configuración completa
     */
    export() {
        return {
            timestamp: new Date().toISOString(),
            version: '2.0.0',
            config: {
                scheduler: this.scheduler,
                elements: this.elements,
                animations: this.animations,
                logos: this.logos,
                clock: this.clock,
                debug: this.debug,
                dataProcessing: this.dataProcessing
            }
        };
    },

    /**
     * Inicializar con configuración personalizada
     */
    init(customConfig = {}) {
        // Merge configuración personalizada
        Object.keys(customConfig).forEach(key => {
            if (this[key] && typeof this[key] === 'object') {
                Object.assign(this[key], customConfig[key]);
            }
        });
        
        // Validar configuración final
        const validation = this.validate();
        if (!validation.isValid) {
            console.warn('⚠️ Problemas de configuración detectados:', validation.issues);
        }
        
        console.log('⚙️ App Config inicializada correctamente');
        return validation.isValid;
    }
};

// ===== EXPORTACIONES ADICIONALES =====

/**
 * Función de conveniencia para obtener configuración
 */
export function getConfig(path = null) {
    if (!path) return AppConfig;
    
    const keys = path.split('.');
    let result = AppConfig;
    
    for (const key of keys) {
        if (result && result[key] !== undefined) {
            result = result[key];
        } else {
            console.warn(`⚠️ Configuración no encontrada: ${path}`);
            return null;
        }
    }
    
    return result;
}

/**
 * Función de conveniencia para actualizar configuración
 */
export function updateConfig(path, value) {
    const keys = path.split('.');
    const lastKey = keys.pop();
    let target = AppConfig;
    
    for (const key of keys) {
        if (!target[key]) target[key] = {};
        target = target[key];
    }
    
    target[lastKey] = value;
    console.log(`⚙️ Configuración actualizada: ${path} = ${value}`);
}

console.log('⚙️ App Config module loaded');