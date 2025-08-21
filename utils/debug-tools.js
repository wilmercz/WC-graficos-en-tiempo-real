// 🔧 utils/debug-tools.js
// Responsabilidad: Herramientas de debugging y diagnóstico

import { EventBus } from './event-bus.js';

export class DebugTools {
    constructor() {
        this.isEnabled = false;
        this.logs = [];
        this.maxLogs = 100;
    }

    /**
     * Habilitar/deshabilitar debug
     */
    enable(enabled = true) {
        this.isEnabled = enabled;
        console.log(`🔧 Debug tools ${enabled ? 'habilitado' : 'deshabilitado'}`);
        
        if (enabled) {
            this.setupGlobalDebugFunctions();
        }
    }

    /**
     * Configurar funciones globales de debug
     */
    setupGlobalDebugFunctions() {
        // Hacer herramientas disponibles globalmente
        window.StreamDebug = {
            // Funciones principales de visibilidad
            mostrarInvitado: () => this.forzarMostrarInvitado(),
            ocultarInvitado: () => this.forzarOcultarInvitado(),
            mostrarTema: () => this.forzarMostrarTema(),
            ocultarTema: () => this.forzarOcultarTema(),
            mostrarLogo: () => this.forzarMostrarLogo(),
            ocultarLogo: () => this.forzarOcultarLogo(),
            mostrarPublicidad: () => this.forzarMostrarPublicidad(),
            ocultarPublicidad: () => this.forzarOcultarPublicidad(),
            
            // ✅ NUEVAS FUNCIONES PARA RELOJ
            mostrarReloj: () => this.forzarMostrarReloj(),
            ocultarReloj: () => this.forzarOcultarReloj(),
            mostrarLogoConReloj: () => this.forzarMostrarLogoConReloj(),
            mostrarRelojIndependiente: () => this.forzarMostrarRelojIndependiente(),
            
            // ✅ FUNCIONES DE TESTING COMBINADO
            testCombinaciones: () => this.testCombinacionesCompletas(),
            testSecuenciaReloj: () => this.testSecuenciaReloj(),
            
            // Debug y análisis
            debug: () => this.debugCompleto(),
            estado: () => this.estadoSistema(),
            temporizadores: () => this.investigarTemporizadores(),
            debugReloj: () => this.debugRelojCompleto(), // ✅ NUEVO
            
            // Utilidades
            limpiar: () => this.limpiarEstilos(),
            ayuda: () => this.mostrarAyuda()
        };

        window.LogoDebug = {
            debug: () => this.debugLogos(),
            rotar: () => this.forzarRotacion(),
            estado: () => this.estadoLogos(),
            detener: () => this.detenerRotacion()
        };

        // ✅ NUEVO: Debug específico para reloj
        window.RelojDebug = {
            debug: () => this.debugRelojCompleto(),
            estado: () => this.estadoReloj(),
            mostrar: () => this.forzarMostrarReloj(),
            ocultar: () => this.forzarOcultarReloj(),
            conLogo: () => this.forzarMostrarLogoConReloj(),
            independiente: () => this.forzarMostrarRelojIndependiente(),
            testCompleto: () => this.testSecuenciaReloj(),
            help: () => {
                console.log('🕐 COMANDOS RELOJ DEBUG:');
                console.log('  RelojDebug.mostrar() - Mostrar reloj solo');
                console.log('  RelojDebug.conLogo() - Logo + reloj');
                console.log('  RelojDebug.independiente() - Reloj sin logo');
                console.log('  RelojDebug.testCompleto() - Test todas las combinaciones');
                console.log('  RelojDebug.debug() - Estado completo del reloj');
            }
        };

        console.log('🔧 Funciones debug disponibles:');
        console.log('   StreamDebug.debug() - Análisis completo');
        console.log('   StreamDebug.mostrarReloj() - Mostrar reloj');
        console.log('   StreamDebug.testCombinaciones() - Test completo');
        console.log('   RelojDebug.help() - Ayuda específica del reloj');
    }


    // ===== FUNCIONES DE FORZADO =====

    /**
     * Forzar mostrar invitado
     */
    forzarMostrarInvitado() {
        console.log('🚀 FORZANDO MOSTRAR INVITADO...');
        
        const datosTest = {
            graficoAlAire: true,
            temaAlAire: false, 
            logoAlAire: false,
            publicidadAlAire: false
        };
        
        this.aplicarVisibilidad(datosTest);
    }

    /**
     * Forzar ocultar invitado
     */
    forzarOcultarInvitado() {
        console.log('🚀 FORZANDO OCULTAR INVITADO...');
        
        const datosTest = {
            graficoAlAire: false,
            temaAlAire: false, 
            logoAlAire: false,
            publicidadAlAire: false
        };
        
        this.aplicarVisibilidad(datosTest);
    }

    /**
     * Forzar mostrar tema
     */
    forzarMostrarTema() {
        console.log('🚀 FORZANDO MOSTRAR TEMA...');
        
        const datosTest = {
            graficoAlAire: false,
            temaAlAire: true, 
            logoAlAire: false,
            publicidadAlAire: false
        };
        
        this.aplicarVisibilidad(datosTest);
    }

    /**
     * Forzar ocultar tema
     */
    forzarOcultarTema() {
        console.log('🚀 FORZANDO OCULTAR TEMA...');
        
        const datosTest = {
            graficoAlAire: false,
            temaAlAire: false, 
            logoAlAire: false,
            publicidadAlAire: false
        };
        
        this.aplicarVisibilidad(datosTest);
    }

    /**
     * Forzar mostrar logo
     */
    forzarMostrarLogo() {
        console.log('🚀 FORZANDO MOSTRAR LOGO...');
        
        const datosTest = {
            graficoAlAire: false,
            temaAlAire: false, 
            logoAlAire: true,
            publicidadAlAire: false
        };
        
        this.aplicarVisibilidad(datosTest);
    }

    /**
     * Forzar ocultar logo
     */
    forzarOcultarLogo() {
        console.log('🚀 FORZANDO OCULTAR LOGO...');
        
        const datosTest = {
            graficoAlAire: false,
            temaAlAire: false, 
            logoAlAire: false,
            publicidadAlAire: false
        };
        
        this.aplicarVisibilidad(datosTest);
    }

    /**
     * Aplicar cambios de visibilidad
     */
    aplicarVisibilidad(datos) {
        // Actualizar estado global
        window.lastFirebaseData = datos;
        
        // Emitir evento para que el scheduler lo procese
        EventBus.emit('debug-visibility-change', datos);
        
        // Si hay función de manejo de visibilidad disponible
        if (typeof window.manejarVisibilidadElementosConFirebase === 'function') {
            window.manejarVisibilidadElementosConFirebase(datos);
        }
    }

    // ===== FUNCIONES DE ANÁLISIS =====

    /**
     * Debug completo del sistema
     */
    debugCompleto() {
        console.group('🔍 DEBUG COMPLETO DEL SISTEMA');
        
        this.debugElementos();
        this.debugConfiguracion();
        this.debugTemporizadores();
        this.debugScheduler();
        
        console.groupEnd();
    }

    /**
     * Debug de elementos visuales
     */
    debugElementos() {
        console.group('📦 ELEMENTOS VISUALES');
        
        const elementos = {
            logo: document.getElementById('logo'),
            invitado: document.getElementById('grafico-invitado-rol'),
            tema: document.getElementById('grafico-tema'),
            publicidad: document.getElementById('grafico-publicidad'),
            reloj: document.getElementById('stream-clock')
        };
        
        Object.entries(elementos).forEach(([nombre, elemento]) => {
            if (elemento) {
                const visible = elemento.style.display !== 'none';
                const styles = window.getComputedStyle(elemento);
                
                console.log(`${nombre}: ${visible ? '👁️ VISIBLE' : '🚫 OCULTO'}`);
                console.log(`   Display: ${styles.display}`);
                console.log(`   Opacity: ${styles.opacity}`);
                console.log(`   Transform: ${styles.transform}`);
                
                if (nombre === 'invitado') {
                    const h1 = elemento.querySelector('h1');
                    const h2 = elemento.querySelector('h2');
                    if (h1) console.log(`   H1: ${h1.textContent}`);
                    if (h2) console.log(`   H2: ${h2.textContent}`);
                }
            } else {
                console.log(`${nombre}: ❌ NO ENCONTRADO`);
            }
        });
        
        console.groupEnd();
    }

    /**
     * Debug de configuración
     */
    debugConfiguracion() {
        console.group('⚙️ CONFIGURACIÓN');
        
        console.log('currentConfig:', window.currentConfig);
        console.log('logoConfig:', window.logoConfig);
        console.log('animacionConfig:', window.animacionConfig);
        console.log('lastFirebaseData:', window.lastFirebaseData);
        
        console.groupEnd();
    }

    /**
     * Debug de temporizadores
     */
    debugTemporizadores() {
        console.group('⏰ TEMPORIZADORES');
        
        const temporizadores = {
            logoRotationTimer: {
                existe: !!window.logoRotationTimer,
                valor: window.logoRotationTimer
            },
            automaticTimers: {
                existe: !!(window.automaticTimers && Object.keys(window.automaticTimers).length > 0),
                elementos: window.automaticTimers ? Object.keys(window.automaticTimers) : []
            },
            _autoTimers: {
                existe: !!(window._autoTimers && Object.keys(window._autoTimers).length > 0),
                elementos: window._autoTimers ? Object.keys(window._autoTimers) : []
            }
        };
        
        console.table(temporizadores);
        
        let totalActivos = 0;
        Object.entries(temporizadores).forEach(([nombre, info]) => {
            if (info.existe) {
                totalActivos++;
                console.log(`✅ ${nombre}: ACTIVO`);
            } else {
                console.log(`❌ ${nombre}: INACTIVO`);
            }
        });
        
        console.log(`📈 TOTAL TEMPORIZADORES ACTIVOS: ${totalActivos}`);
        
        if (totalActivos > 1) {
            console.error('🚨 PROBLEMA: Múltiples temporizadores activos');
        }
        
        console.groupEnd();
    }

    /**
     * Debug del scheduler global
     */
    debugScheduler() {
        console.group('📊 SCHEDULER GLOBAL');
        
        if (window.StreamGraphicsApp) {
            console.log('Aplicación:', window.StreamGraphicsApp.getStatus());
        }
        
        if (window.StreamModules?.scheduler) {
            console.log('Scheduler:', window.StreamModules.scheduler.getState());
        }
        
        console.groupEnd();
    }

    /**
     * Investigar temporizadores específicamente
     */
    investigarTemporizadores() {
        console.group('🔍 INVESTIGACIÓN DE TEMPORIZADORES');
        
        const temporizadores = {
            logoRotationTimer: !!window.logoRotationTimer,
            automaticTimers: !!(window.automaticTimers && Object.keys(window.automaticTimers).length > 0),
            _autoTimers: !!(window._autoTimers && Object.keys(window._autoTimers).length > 0),
            secuenciaTimers: !!(window.secuenciaAutomatica?.timers && Object.keys(window.secuenciaAutomatica.timers).length > 0)
        };
        
        console.table(temporizadores);
        
        const totalActivos = Object.values(temporizadores).filter(Boolean).length;
        console.log(`📈 TOTAL: ${totalActivos} temporizadores activos`);
        
        if (totalActivos > 1) {
            console.error('🚨 PROBLEMA CONFIRMADO: Múltiples temporizadores');
        }
        
        console.groupEnd();
        return totalActivos;
    }

    // ===== FUNCIONES DE LOGOS =====

    /**
     * Debug específico de logos
     */
    debugLogos() {
        console.group('🖼️ DEBUG DE LOGOS');
        
        console.log('logoConfig:', window.logoConfig);
        console.log('logosAliados:', window.logosAliados);
        console.log('logoPrincipalUrl:', window.logoPrincipalUrl);
        console.log('currentLogoIndex:', window.currentLogoIndex);
        
        const logoEl = document.getElementById('logo');
        if (logoEl) {
            console.log('Logo actual:', logoEl.src);
            console.log('Alt actual:', logoEl.alt);
        }
        
        console.groupEnd();
    }

    /**
     * Forzar rotación de logo
     */
    forzarRotacion() {
        console.log('🔄 Forzando rotación de logo...');
        EventBus.emit('debug-force-logo-rotation');
    }

    /**
     * Estado de logos
     */
    estadoLogos() {
        return {
            config: window.logoConfig,
            aliados: window.logosAliados?.length || 0,
            principal: !!window.logoPrincipalUrl,
            rotacionActiva: !!window.logoRotationTimer
        };
    }

    /**
     * Detener rotación
     */
    detenerRotacion() {
        if (window.logoRotationTimer) {
            clearTimeout(window.logoRotationTimer);
            window.logoRotationTimer = null;
            console.log('🛑 Rotación detenida');
        }
    }

    // ===== UTILIDADES =====

    /**
     * Limpiar estilos de debug
     */
    limpiarEstilos() {
        const elementos = ['grafico-invitado-rol', 'grafico-tema', 'grafico-publicidad', 'logo'];
        
        elementos.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.style.display = 'none';
                el.style.background = '';
                el.style.opacity = '';
                el.style.transform = '';
                el.style.clipPath = '';
            }
        });
        
        console.log('🧹 Estilos limpiados');
    }

    /**
     * Mostrar ayuda
     */
    mostrarAyuda() {
        console.log('🔧 COMANDOS DISPONIBLES:');
        console.log('   StreamDebug.mostrarInvitado() - Mostrar invitado');
        console.log('   StreamDebug.mostrarTema() - Mostrar tema');  
        console.log('   StreamDebug.mostrarLogo() - Mostrar logo');
        console.log('   StreamDebug.debug() - Análisis completo');
        console.log('   StreamDebug.temporizadores() - Ver temporizadores');
        console.log('   StreamDebug.limpiar() - Limpiar estilos');
        console.log('   LogoDebug.debug() - Estado de logos');
        console.log('   LogoDebug.rotar() - Forzar rotación');
    }

    /**
     * Estado general del sistema
     */
    estadoSistema() {
        return {
            scheduler: window.StreamModules?.scheduler?.getState(),
            config: window.currentConfig,
            datos: window.lastFirebaseData,
            temporizadores: this.investigarTemporizadores()
        };
    }

    /**
     * Log personalizado con timestamp
     */
    log(message, type = 'info') {
        const timestamp = new Date().toLocaleTimeString();
        const logEntry = {
            timestamp,
            message,
            type
        };
        
        this.logs.push(logEntry);
        
        // Mantener solo los últimos logs
        if (this.logs.length > this.maxLogs) {
            this.logs.shift();
        }
        
        if (this.isEnabled) {
            console.log(`[${timestamp}] 🔧 ${message}`);
        }
    }

    /**
     * Obtener logs recientes
     */
    getLogs() {
        return this.logs;
    }
}

// ===== INSTANCIA GLOBAL =====
export const debugTools = new DebugTools();

// ===== AUTO-INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', () => {
    debugTools.enable(true);
    console.log('🔧 Debug tools initialized');
});

console.log('🔧 Debug tools module loaded');