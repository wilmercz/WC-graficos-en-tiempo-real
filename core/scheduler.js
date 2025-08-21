// ⏰ core/scheduler.js
// Responsabilidad: UN SOLO temporizador que gestiona TODO

import { EventBus } from '../utils/event-bus.js';

export class GlobalScheduler {
    constructor() {
        this.isActive = false;
        this.timer = null;
        this.interval = 1000; // 1 segundo
        this.tasks = new Map();
        this.stats = {
            cycles: 0,
            startTime: null,
            lastAction: null
        };
        
        // Estado de elementos gestionados
        this.elements = {
            logo: {
                visible: false,
                startTime: null,
                rotationIndex: 0,
                lastChange: null,
                duration: 60000 // ms
            },
            lowerThird: {
                visible: false,
                startTime: null,
                type: null, // 'invitado' | 'tema'
                duration: 25000 // ms
            },
            publicidad: {
                visible: false,
                startTime: null,
                duration: 25000 // ms
            },
            // ✅ NUEVO: Estado específico del reloj
            clock: {
                enabled: true,
                visible: false,
                startTime: null,
                lastUpdate: null,
                shouldBeVisible: false, // Estado deseado según Firebase
                logoDependent: false,   // Si depende del logo o es independiente
                updateFrequency: 30000  // Frecuencia de actualización
            }
        };
    }

    // ===== MÉTODOS PRINCIPALES =====

    /**
     * Iniciar el scheduler global
     */
    start() {
        if (this.isActive) {
            console.warn('⚠️ Scheduler ya está activo');
            return false;
        }

        console.log('🚀 Iniciando Global Scheduler...');
        
        // Detener cualquier temporizador existente del sistema viejo
        this.cleanupOldTimers();
        
        this.isActive = true;
        this.stats.startTime = Date.now();
        this.stats.cycles = 0;
        
        // Iniciar ciclo principal
        this.runCycle();
        
        // Emitir evento
        EventBus.emit('scheduler-started');
        
        console.log('✅ Global Scheduler iniciado');
        return true;
    }

    /**
     * Detener el scheduler
     */
    stop() {
        if (!this.isActive) {
            console.warn('⚠️ Scheduler no está activo');
            return false;
        }

        console.log('🛑 Deteniendo Global Scheduler...');
        
        this.isActive = false;
        
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
        }
        
        // Limpiar todas las tareas
        this.tasks.clear();
        
        // Emitir evento
        EventBus.emit('scheduler-stopped');
        
        console.log('✅ Global Scheduler detenido');
        return true;
    }

    /**
     * Ciclo principal del scheduler
     */
    runCycle() {
        if (!this.isActive) return;

        this.stats.cycles++;
        const now = Date.now();

        // Ejecutar tareas programadas
        this.executeTasks(now);
        
        // Gestionar elementos automáticamente
        this.manageElements(now);
        
        // Debug cada 30 ciclos (30 segundos)
        if (this.stats.cycles % 30 === 0) {
            this.logStatus();
        }

        // Programar siguiente ciclo
        this.timer = setTimeout(() => this.runCycle(), this.interval);
    }

    // ===== GESTIÓN DE TAREAS =====

    /**
     * Agregar tarea al scheduler
     */
    addTask(name, callback, options = {}) {
        const task = {
            name,
            callback,
            interval: options.interval || 1000,
            lastExecution: 0,
            enabled: true,
            executeOnce: options.once || false,
            condition: options.condition || (() => true)
        };

        this.tasks.set(name, task);
        console.log(`➕ Tarea agregada: ${name}`);
        
        return task;
    }

    /**
     * Remover tarea del scheduler
     */
    removeTask(name) {
        const removed = this.tasks.delete(name);
        if (removed) {
            console.log(`➖ Tarea removida: ${name}`);
        }
        return removed;
    }

    /**
     * Ejecutar tareas programadas
     */
    executeTasks(now) {
        for (const [name, task] of this.tasks) {
            if (!task.enabled) continue;
            
            // Verificar si es hora de ejecutar
            if (now - task.lastExecution >= task.interval) {
                // Verificar condición
                if (task.condition()) {
                    try {
                        task.callback(now);
                        task.lastExecution = now;
                        
                        // Si es de una sola ejecución, remover
                        if (task.executeOnce) {
                            this.removeTask(name);
                        }
                    } catch (error) {
                        console.error(`❌ Error ejecutando tarea ${name}:`, error);
                    }
                }
            }
        }
    }

    // ===== GESTIÓN DE ELEMENTOS =====

    /**
     * Gestionar elementos automáticamente
     */
    manageElements(now) {
        // Obtener datos actuales de Firebase
        const data = window.lastFirebaseData;
        if (!data) return;

        this.manageLogo(now, data);
        this.manageLowerThirds(now, data);
        this.managePublicidad(now, data);
        this.manageClock(now, data);
    }

    /**
     * Gestionar logo y su rotación
     */
    manageLogo(now, data) {
        const logo = this.elements.logo;
        const shouldBeVisible = data.logoAlAire;

        // Cambio de visibilidad
        if (shouldBeVisible !== logo.visible) {
            logo.visible = shouldBeVisible;
            logo.startTime = shouldBeVisible ? now : null;
            logo.lastChange = now;
            
            EventBus.emit('logo-visibility-changed', {
                visible: shouldBeVisible,
                timestamp: now
            });
        }

        // Rotación de logos (si está visible y habilitada)
        //if (logo.visible && window.logoConfig?.habilitado) {
        //     this.handleLogoRotation(now, logo);
        //}
        // Rotación de logos (si está visible y habilitada)
        const rotacionHabilitada = (window.logoConfig?.habilitado ?? window.logoConfig?.enabled) === true;
        if (logo.visible && rotacionHabilitada) {
        this.handleLogoRotation(now, logo);
        }
    }

    /**
     * Gestionar rotación de logos
     */
    handleLogoRotation(now, logo) {
        const config = window.currentConfig;
        const logos = window.logosAliados || [];
        
        if (logos.length === 0) return;

        // Determinar duración según tipo actual
        let duration;
        if (logo.rotationIndex === 0) {
            duration = (config?.duracionLogoPrincipal || 60) * 1000;
        } else {
            duration = (config?.duracionLogosAliados || 45) * 1000;
        }

        // Verificar si es hora de rotar
        if (now - logo.lastChange >= duration) {
            logo.rotationIndex++;
            if (logo.rotationIndex > logos.length) {
                logo.rotationIndex = 0; // Volver al principal
            }
            
            logo.lastChange = now;
            
            // Emitir evento de rotación
            EventBus.emit('logo-rotate', {
                index: logo.rotationIndex,
                isMainLogo: logo.rotationIndex === 0,
                timestamp: now
            });
        }
    }

    /**
     * Gestionar lower thirds (invitado/tema)
     */
    manageLowerThirds(now, data) {
        const lt = this.elements.lowerThird;
        const config = window.currentConfig;
        
        // Determinar qué debe estar visible
        let shouldShow = null;
        let type = null;
        let duration = 25000; // por defecto
        
        if (data.graficoAlAire) {
            shouldShow = true;
            type = 'invitado';
            duration = (config?.duracionNombreRol || 25) * 1000;
        } else if (data.temaAlAire) {
            shouldShow = true;
            type = 'tema';
            duration = (config?.duracionTema || 25) * 1000;
        } else {
            shouldShow = false;
        }

        // Cambio de estado
        if (shouldShow !== lt.visible || type !== lt.type) {
            lt.visible = shouldShow;
            lt.type = type;
            lt.startTime = shouldShow ? now : null;
            lt.duration = duration;
            
            EventBus.emit('lower-third-changed', {
                visible: shouldShow,
                type: type,
                duration: duration,
                timestamp: now
            });
        }

        // Auto-ocultar si ha pasado el tiempo
        if (lt.visible && lt.startTime && config?.modoAutomatico) {
            if (now - lt.startTime >= lt.duration) {
                EventBus.emit('lower-third-auto-hide', {
                    type: lt.type,
                    timestamp: now
                });
                
                // Resetear estado
                lt.visible = false;
                lt.startTime = null;
                lt.type = null;
            }
        }
    }

    /**
     * Gestionar publicidad
     */
    managePublicidad(now, data) {
        const pub = this.elements.publicidad;
        const config = window.currentConfig;
        const shouldBeVisible = data.publicidadAlAire;

        // Cambio de visibilidad
        if (shouldBeVisible !== pub.visible) {
            pub.visible = shouldBeVisible;
            pub.startTime = shouldBeVisible ? now : null;
            pub.duration = (config?.duracionPublicidad || 25) * 1000;
            
            EventBus.emit('publicidad-changed', {
                visible: shouldBeVisible,
                duration: pub.duration,
                timestamp: now
            });
        }

        // Auto-ocultar
        if (pub.visible && pub.startTime && config?.modoAutomatico) {
            if (now - pub.startTime >= pub.duration) {
                EventBus.emit('publicidad-auto-hide', {
                    timestamp: now
                });
                
                pub.visible = false;
                pub.startTime = null;
            }
        }
    }

    /**
     * Gestionar reloj
     */
    manageClock(now, data) {
        const clock = this.elements.clock;
        
        if (!clock.enabled) return;
        
        // ✅ LÓGICA PRINCIPAL: Determinar si el reloj debe estar visible
        const horaHabilitada = data.horaAlAire || false;
        const logoVisible = data.logoAlAire || false;
        
        // Determinar estado deseado del reloj
        let shouldShowClock = false;
        let clockMode = 'disabled';
        
        if (horaHabilitada) {
            if (logoVisible) {
                // Caso 1: Logo visible + Hora habilitada = Reloj junto al logo
                shouldShowClock = true;
                clockMode = 'with-logo';
            } else {
                // Caso 2: Logo oculto + Hora habilitada = Reloj independiente
                shouldShowClock = true;
                clockMode = 'independent';
            }
        } else {
            // Caso 3: Hora deshabilitada = Reloj oculto (sin importar el logo)
            shouldShowClock = false;
            clockMode = 'disabled';
        }
        
        // ✅ DETECTAR CAMBIOS DE ESTADO
        const stateChanged = shouldShowClock !== clock.shouldBeVisible ||
                            (clockMode === 'with-logo') !== clock.logoDependent;
        
        if (stateChanged) {
            console.log(`🕐 SCHEDULER: Cambio en reloj detectado`);
            console.log(`   horaHabilitada: ${horaHabilitada}`);
            console.log(`   logoVisible: ${logoVisible}`);
            console.log(`   shouldShowClock: ${clock.shouldBeVisible} → ${shouldShowClock}`);
            console.log(`   clockMode: ${clockMode}`);
            
            // Actualizar estado interno
            clock.shouldBeVisible = shouldShowClock;
            clock.logoDependent = (clockMode === 'with-logo');
            
            if (shouldShowClock) {
                clock.startTime = now;
                
                // ✅ EMITIR EVENTO DE MOSTRAR RELOJ
                EventBus.emit('clock-visibility-changed', {
                    visible: true,
                    mode: clockMode,
                    logoDependent: clock.logoDependent,
                    timestamp: now
                });
                
                console.log(`🕐 SCHEDULER: Reloj activado (${clockMode})`);
                
            } else {
                // ✅ EMITIR EVENTO DE OCULTAR RELOJ
                EventBus.emit('clock-visibility-changed', {
                    visible: false,
                    mode: clockMode,
                    logoDependent: false,
                    timestamp: now
                });
                
                console.log(`🕐 SCHEDULER: Reloj desactivado`);
                
                clock.startTime = null;
            }
            
            // Actualizar estado visible (para logging)
            clock.visible = shouldShowClock;
        }
        
        // ✅ ACTUALIZACIÓN PERIÓDICA DEL RELOJ
        if (clock.visible && (!clock.lastUpdate || now - clock.lastUpdate >= clock.updateFrequency)) {
            clock.lastUpdate = now;
            
            EventBus.emit('clock-update', {
                timestamp: now,
                time: new Date(now),
                mode: clockMode
            });
            
            // Log solo cada minuto para evitar spam
            if (this.stats.cycles % 60 === 0) {
                console.log(`🕐 SCHEDULER: Reloj actualizado (${clockMode})`);
            }
        }
    }

    // ===== UTILIDADES =====

    /**
     * Limpiar temporizadores del sistema viejo
     */
    cleanupOldTimers() {
        // Limpiar todos los sistemas anteriores
        if (window.logoRotationTimer) {
            clearTimeout(window.logoRotationTimer);
            window.logoRotationTimer = null;
        }
        
        if (window.automaticTimers) {
            Object.values(window.automaticTimers).forEach(clearTimeout);
            window.automaticTimers = {};
        }
        
        if (window._autoTimers) {
            Object.values(window._autoTimers).forEach(clearTimeout);
            window._autoTimers = {};
        }
        
        console.log('🧹 Temporizadores del sistema viejo limpiados');
    }

    /**
     * Habilitar/deshabilitar reloj
     */
    enableClock(enabled = true) {
        this.elements.clock.enabled = enabled;
        console.log(`🕐 Reloj ${enabled ? 'habilitado' : 'deshabilitado'}`);
    }

    /**
     * Obtener estado completo
     */
    getState() {
        return {
            isActive: this.isActive,
            stats: { ...this.stats },
            elements: { ...this.elements },
            tasksCount: this.tasks.size,
            uptime: this.stats.startTime ? Date.now() - this.stats.startTime : 0
        };
    }

    /**
     * Log de estado (debug)
     */
    logStatus() {
        if (this.stats.cycles % 60 === 0) { // Cada minuto
            console.log(`⏰ Scheduler - Ciclo ${this.stats.cycles}, Tareas: ${this.tasks.size}`);
            
            // Log de elementos activos
            const activeElements = Object.entries(this.elements)
                .filter(([key, element]) => element.visible || element.enabled)
                .map(([key]) => key);
            
            if (activeElements.length > 0) {
                console.log(`📊 Elementos activos: ${activeElements.join(', ')}`);
            }
        }
    }
}

// ===== INSTANCIA GLOBAL =====
export const scheduler = new GlobalScheduler();

// ===== FUNCIONES DE CONVENIENCIA =====
export const SchedulerUtils = {
    start: () => scheduler.start(),
    stop: () => scheduler.stop(),
    status: () => scheduler.getState(),
    enableClock: (enabled) => scheduler.enableClock(enabled),
    addTask: (name, callback, options) => scheduler.addTask(name, callback, options)
};

console.log('⏰ Global Scheduler module loaded');