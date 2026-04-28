// 🎬 modules/animations.js
// Responsabilidad: TODAS las animaciones del sistema

import { EventBus } from '../utils/event-bus.js';

export class AnimationEngine {
    constructor() {
        this.isInitialized = false;
        this.defaultDurations = {
            fadeIn: 300,
            fadeOut: 300,
            slideIn: 600,
            slideOut: 600,
            wipeIn: 600,
            wipeOut: 600
        };
        
        this.easingTypes = {
            'EASE': 'ease',
            'EASE_IN': 'ease-in',
            'EASE_OUT': 'ease-out',
            'EASE_IN_OUT': 'ease-in-out',
            'LINEAR': 'linear',
            'BOUNCE': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
            'ELASTIC': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
        };
        
        this.animationQueue = new Map();
        this.activeAnimations = new Set();
    }

    /**
     * Inicializar el motor de animaciones
     */
    init() {
        if (this.isInitialized) {
            console.warn('⚠️ Animation Engine ya está inicializado');
            return;
        }
        
        this.setupEventListeners();
        this.isInitialized = true;
        
        console.log('🎬 Animation Engine initialized');
    }

    /**
     * Configurar event listeners
     */
    setupEventListeners() {
        // Escuchar solicitudes de animación
        EventBus.on('animate-element', (data) => {
            this.animateElement(data.element, data.type, data.show, data.config);
        });
        
        EventBus.on('animate-logo-change', (data) => {
            this.animateLogoChange(data.element, data.newSrc, data.config);
        });
    }

    // ===== ANIMACIONES DINÁMICAS =====

    /**
 * NUEVA función principal que usa el sistema viejo
 */
    applyDynamicAnimation(element, elementType, show, config = {}) {
        console.log(`🔄 REDIRIGIENDO A SISTEMA VIEJO: ${elementType}`);
        return this.applyDynamicAnimationFromOldSystem(element, elementType, show, config);
    }
        

    // ============================================================================
    // NUEVO MÉTODO: Animación de entrada con estado inicial correcto
    // ============================================================================

    /**
     * Aplicar animación de entrada (show = true) con estado inicial animable
     */
    applyShowAnimation(element, elementType, animationType, animConfig) {
        // PASO 1: Preparar elemento y establecer display
        this.prepareElementForShow(element, elementType);
        
        // PASO 2: Establecer estado inicial SIN transición
        element.style.transition = 'none'; // ✅ CRÍTICO: Sin transición para estado inicial
        this.setInitialState(element, animationType);
        
        // PASO 3: Forzar reflow para que el navegador registre el estado inicial
        element.offsetHeight; // ✅ CRÍTICO: Fuerza un reflow
        
        // PASO 4: HACER VISIBLE cuando esté en posición inicial
        element.style.visibility = 'visible';
       // element.style.opacity = '1'; // Resetear para que se pueda animar
        

        // PASO 4: Configurar transición y aplicar estado final
        requestAnimationFrame(() => {
            // Configurar transición
            this.setupTransition(element, animConfig);
            
            // Esperar otro frame antes de aplicar estado final
            requestAnimationFrame(() => {
                this.setFinalState(element, animationType, true);
                
                console.log(`✅ Animación iniciada: ${animationType}`);
            });
        });
        
        // PASO 5: Cleanup después de la animación
        const totalDuration = animConfig.delay + animConfig.duracion + 50;
        setTimeout(() => {
            this.cleanupAnimation(element, true);
        }, totalDuration);
    }

    /**
     * Aplicar animación de salida (show = false)
     */
    applyHideAnimation(element, elementType, animationType, animConfig) {
        // Configurar transición
        this.setupTransition(element, animConfig);
        
        // Aplicar estado final después del delay
        setTimeout(() => {
            this.setFinalState(element, animationType, false);
        }, animConfig.delay + 16);
        
        // Cleanup después de la animación
        const totalDuration = animConfig.delay + animConfig.duracion + 50;
        setTimeout(() => {
            this.cleanupAnimation(element, false);
        }, totalDuration);
    }

    // ============================================================================
    // NUEVOS MÉTODOS: Estados inicial y final específicos por tipo
    // ============================================================================

    /**
     * Establecer estado inicial para animación de entrada
     */
    setInitialState(element, animationType) {
    console.log(`🎭 Estableciendo estado inicial: ${animationType}`);
    
    switch (animationType) {
        // === FADE ANIMATIONS ===
        case 'FADE_IN':
            element.style.opacity = '0';
            element.style.transform = 'none';
            element.style.clipPath = 'none'; // ✅ AGREGAR
            break;

        // === SLIDE ANIMATIONS (solo transform, NO clip-path) ===
        case 'SLIDE_IN_LEFT':
            element.style.opacity = '1';
            element.style.transform = 'translateX(100%)';
            element.style.clipPath = 'none'; // ✅ LIMPIAR clip-path
            break;
            
        case 'SLIDE_IN_RIGHT':
            element.style.opacity = '1';
            element.style.transform = 'translateX(-100%)';
            element.style.clipPath = 'none'; // ✅ LIMPIAR clip-path
            break;
            
        case 'SLIDE_IN_TOP':
            element.style.opacity = '1';
            element.style.transform = 'translateY(100%)';
            element.style.clipPath = 'none'; // ✅ LIMPIAR clip-path
            break;
            
        case 'SLIDE_IN_BOTTOM':
            element.style.opacity = '1';
            element.style.transform = 'translateY(-100%)';
            element.style.clipPath = 'none'; // ✅ LIMPIAR clip-path
            break;

        // === WIPE ANIMATIONS (solo clip-path, NO transform) ===
        case 'WIPE_IN_RIGHT':
            // ✅ CORRECCIÓN: Solo clip-path, NO transform
            element.style.opacity = '1';
            element.style.transform = 'none'; // ✅ LIMPIAR transform
            element.style.clipPath = 'inset(0 100% 0 0)'; // Oculto por la derecha
            break;
            
        case 'WIPE_IN_LEFT':
            element.style.opacity = '1';
            element.style.transform = 'none'; // ✅ LIMPIAR transform
            element.style.clipPath = 'inset(0 0 0 100%)'; // Oculto por la izquierda
            break;
            
        case 'WIPE_IN_TOP':
            element.style.opacity = '1';
            element.style.transform = 'none'; // ✅ LIMPIAR transform
            element.style.clipPath = 'inset(100% 0 0 0)'; // Oculto por arriba
            break;
            
        case 'WIPE_IN_BOTTOM':
            element.style.opacity = '1';
            element.style.transform = 'none'; // ✅ LIMPIAR transform
            element.style.clipPath = 'inset(0 0 100% 0)'; // Oculto por abajo
            break;

        default:
            console.warn(`⚠️ Estado inicial no definido para: ${animationType}`);
            element.style.opacity = '0';
            element.style.transform = 'none';
            element.style.clipPath = 'none';
    }
}

/**
 * Establecer estado final de la animación
 */
setFinalState(element, animationType, show) {
    console.log(`🎯 Aplicando estado final: ${animationType}, show: ${show}`);
    
    if (show) {
        // Estados finales para animaciones de entrada (visible)
        switch (animationType) {
            case 'FADE_IN':
                element.style.opacity = '1';
                element.style.transform = 'none';
                element.style.clipPath = 'none';
                break;

            // === SLIDE ANIMATIONS ===
            case 'SLIDE_IN_LEFT':
            case 'SLIDE_IN_RIGHT':
            case 'SLIDE_IN_TOP':
            case 'SLIDE_IN_BOTTOM':
                element.style.opacity = '1';
                element.style.transform = 'translate(0, 0)';
                element.style.clipPath = 'none'; // ✅ MANTENER limpio
                break;

            // === WIPE ANIMATIONS ===
            case 'WIPE_IN_RIGHT':
            case 'WIPE_IN_LEFT':
            case 'WIPE_IN_TOP':
            case 'WIPE_IN_BOTTOM':
                // ✅ CORRECCIÓN: Solo clip-path, NO transform
                element.style.opacity = '1';
                element.style.transform = 'none'; // ✅ NO tocar transform
                element.style.clipPath = 'inset(0 0% 0 0%)'; // Completamente visible
                break;

            default:
                element.style.opacity = '1';
                element.style.transform = 'none';
                element.style.clipPath = 'none';
        }
    } else {
        // Estados finales para animaciones de salida (oculto)
        this.applySalidaAnimation(element, animationType);
    }
}

/**
 * ✅ NUEVA FUNCIÓN: Aplicar animaciones de salida específicas
 */
applySalidaAnimation(element, animationType) {
    switch (animationType) {
        case 'WIPE_OUT_LEFT':
            element.style.opacity = '1';
            element.style.transform = 'none';
            element.style.clipPath = 'inset(0 100% 0 0)'; // Sale por la izquierda
            break;
            
        case 'WIPE_OUT_RIGHT':
            element.style.opacity = '1';
            element.style.transform = 'none';
            element.style.clipPath = 'inset(0 0 0 100%)'; // Sale por la derecha
            break;
            
        case 'WIPE_OUT_TOP':
            element.style.opacity = '1';
            element.style.transform = 'none';
            element.style.clipPath = 'inset(100% 0 0 0)'; // Sale por arriba
            break;
            
        case 'WIPE_OUT_BOTTOM':
            element.style.opacity = '1';
            element.style.transform = 'none';
            element.style.clipPath = 'inset(0 0 100% 0)'; // Sale por abajo
            break;
            
        case 'SLIDE_OUT_LEFT':
            element.style.opacity = '0';
            element.style.transform = 'translateX(-100%)';
            element.style.clipPath = 'none';
            break;
            
        case 'SLIDE_OUT_RIGHT':
            element.style.opacity = '0';
            element.style.transform = 'translateX(100%)';
            element.style.clipPath = 'none';
            break;
            
        case 'FADE_OUT':
            element.style.opacity = '0';
            element.style.transform = 'none';
            element.style.clipPath = 'none';
            break;
            
        default:
            element.style.opacity = '0';
            element.style.transform = 'none';
            element.style.clipPath = 'none';
    }
}

    /**
     * Obtener configuración de animación
     */
    getAnimationConfig(elementType, customConfig = {}) {
        // Configuración desde Firebase/global
        const globalConfig = window.animacionConfig?.[elementType] || {};
        
        // Configuración por defecto
        let defaultConfig = {
            delay: 200,
            duracion: 600,
            easing: 'EASE_IN_OUT',
            entrada: 'FADE_IN',
            salida: 'FADE_OUT'
        };
        
        // ✅ Fallback específico: Siempre forzar deslizamiento para Redes Sociales
        if (elementType === 'redes') {
            defaultConfig.entrada = 'SLIDE_IN_RIGHT';
            defaultConfig.salida = 'SLIDE_OUT_RIGHT';
            defaultConfig.delay = 100;
        }
        
        // Merge de configuraciones
        return {
            ...defaultConfig,
            ...globalConfig,
            ...customConfig
        };
    }


    

    /**
     * Preparar elemento para mostrar
     */
    prepareElementForShow(element, elementType) {
        // Configurar display apropiado
        if (elementType === 'invitadoRol') {
            element.style.display = 'flex';
        } else {
            element.style.display = 'block';
        }
        
        // ✅ CRÍTICO: Asegurar que el elemento esté en el DOM y visible
        //element.style.visibility = 'visible';

        // ✅ CRÍTICO: Mantener invisible hasta estar en posición inicial
        element.style.visibility = 'hidden'; // Cambio de 'visible' a 'hidden'
        element.style.opacity = '0';         // Doble protección contra flash
        

        // Resetear propiedades que podrían interferir
        element.style.willChange = 'opacity, transform, clip-path';
        
        console.log(`📦 Elemento preparado para ${elementType}:`, {
            display: element.style.display,
            visibility: element.style.visibility
        });
    }

    /**
     * Configurar transición CSS
     */
    setupTransition(element, config) {
        const easing = this.easingTypes[config.easing] || 'ease-in-out';
        const duration = config.duracion + 'ms';
        const delay = config.delay + 'ms';
        
        // ✅ TRANSICIÓN MÁS ESPECÍFICA Y ROBUSTA
        element.style.transition = [
            `opacity ${duration} ${easing} ${delay}`,
            `transform ${duration} ${easing} ${delay}`,
            `clip-path ${duration} ${easing} ${delay}`
        ].join(', ');
        
        // ✅ OPTIMIZACIÓN: Preparar para animación GPU
        element.style.backfaceVisibility = 'hidden';
        element.style.perspective = '1000px';
        element.style.willChange = 'opacity, transform, clip-path';

        console.log(`⚙️ Transición configurada: ${duration} ${easing} (delay: ${delay})`);
}

/**
 * Aplicar animación dinámica (COPIADO DEL SISTEMA VIEJO QUE FUNCIONA)
 */
applyDynamicAnimationFromOldSystem(elemento, tipoElemento, mostrar, config = {}) {
    console.log(`🔥 USANDO SISTEMA VIEJO: ${tipoElemento} - ${mostrar ? 'MOSTRAR' : 'OCULTAR'}`);
    
    // 🛡️ ESCUDO ANTI-COLISIÓN (Sistema Viejo): Registrar estado actual
    elemento.dataset.oldAnimState = mostrar ? 'showing' : 'hiding';

    // Obtener configuración (prioridad: parámetro > Firebase > defecto)
    const animConfig = config.animaciones || window.animacionConfig?.[tipoElemento] || this.getAnimationConfig(tipoElemento);
    
    if (!elemento || !animConfig) {
        console.error(`❌ Elemento o configuración no encontrada para: ${tipoElemento}`);
        return;
    }
    
    const animacion = mostrar ? animConfig.entrada : animConfig.salida;
    const duracion = animConfig.duracion || 600;
    const delay = Number(animConfig.delay) || (tipoElemento === 'logo' ? 0 : 100);
    const easing = this.easingTypes[animConfig.easing] || 'ease-in-out';
    
    console.log(`🎬 Aplicando animación dinámica SISTEMA VIEJO:`, {
        elemento: elemento.id,
        tipo: tipoElemento,
        animacion: animacion,
        duracion: duracion + 'ms',
        delay: delay + 'ms',
        easing: easing,
        mostrar: mostrar
    });
    
    // 1. PREPARAR ELEMENTO
    if (mostrar) {
        elemento.style.display = (tipoElemento === 'invitadoRol' || tipoElemento === 'lugar') ? 'flex' : 'block';
        elemento.style.visibility = 'visible'; // ✅ FIX: Asegurar visibilidad contra conflictos del sistema nuevo
        elemento.style.opacity = '0'; // ✅ FIX: Forzar opacidad para evitar que se quede invisible
        // 🔧 CRÍTICO: Limpiar transiciones previas antes de aplicar nuevas
        elemento.style.transition = 'none';
        
        // ✅ FIX CRÍTICO: Pre-establecer estado inicial para evitar "flash" visual
        // Esto asegura que el elemento esté recortado/movido ANTES de hacerse visible
        if (animacion.includes('WIPE')) {
             if (animacion === 'WIPE_IN_RIGHT') elemento.style.clipPath = 'inset(0 100% 0 0)';
             else if (animacion === 'WIPE_IN_LEFT') elemento.style.clipPath = 'inset(0 0 0 100%)';
             else if (animacion === 'WIPE_IN_TOP') elemento.style.clipPath = 'inset(100% 0 0 0)';
             else if (animacion === 'WIPE_IN_BOTTOM') elemento.style.clipPath = 'inset(0 0 100% 0)';
        } else if (animacion.includes('SLIDE')) {
             if (animacion === 'SLIDE_IN_RIGHT') elemento.style.transform = 'translateX(100%)';
             else if (animacion === 'SLIDE_IN_LEFT') elemento.style.transform = 'translateX(-100%)';
             else if (animacion === 'SLIDE_IN_TOP') elemento.style.transform = 'translateY(-100%)';
             else if (animacion === 'SLIDE_IN_BOTTOM') elemento.style.transform = 'translateY(100%)';
        }

        elemento.offsetHeight; // Forzar reflow para limpiar transiciones
    }
    
    // 2. CONFIGURAR TRANSICIÓN BASE
    elemento.style.transition = `
        opacity ${duracion}ms ${easing} ${delay}ms,
        transform ${duracion}ms ${easing} ${delay}ms,
        clip-path ${duracion}ms ${easing} ${delay}ms
    `;

    elemento.style.backfaceVisibility = 'hidden';
    elemento.style.perspective = '1000px';

    
    // 3. APLICAR ANIMACIÓN ESPECÍFICA (16ms después para asegurar que se aplique la transición)
    setTimeout(() => {
        this.aplicarAnimacionPorTipoCorregido(elemento, animacion, mostrar, duracion, delay, easing);
    }, 50); // ✅ FIX: Aumentar delay (16->50ms) para asegurar que el navegador registre el estado inicial
    
    // 4. CLEANUP después de la animación
    if (!mostrar) {
        // 🔧 VARIABLE CORREGIDA: totalTime en lugar de total
        const totalTime = delay + duracion + 100; // Agregamos más tiempo de buffer
        
        let done = false;
        const finish = () => {
            if (done) return;
            done = true;
            
            // 🛡️ VERIFICAR ESCUDO ANTES DE APAGAR
            if (elemento.dataset.oldAnimState === 'showing') {
                console.log(`🛡️ [ESCUDO ACTIVADO - OLD] Evitando apagar el elemento [${tipoElemento}] porque la rotación ordenó mostrarlo de nuevo.`);
                return; // 🛑 Abortar el apagado
            }

            elemento.style.display = 'none';
            elemento.style.visibility = 'hidden'; // ✅ FIX: Forzar ocultamiento visual
            elemento.removeEventListener('transitionend', finish);
            // 🔧 CRÍTICO: Limpiar todas las propiedades de transición al finalizar
            elemento.style.transition = '';
            elemento.style.backfaceVisibility = '';
            elemento.style.perspective = '';
            console.log(`✅ TRANSICIÓN FIN CORREGIDA (${tipoElemento})`);
        };

        // ✅ CORRECCIÓN: Mejorar el evento de transición con más especificidad
        elemento.addEventListener('transitionend', finish, { once: true });
        // 🔧 VARIABLE CORREGIDA: totalTime en lugar de total
        setTimeout(finish, totalTime); // Fallback por si el evento no dispara
    }
}


// ✅ CORRECCIÓN 2: Función de aplicación de animación por tipo corregida
aplicarAnimacionPorTipoCorregido(elemento, tipoAnimacion, mostrar, duracion, delay = 0, easing = 'ease-in-out') {
    console.log(`🎭 ANIMACIÓN CORREGIDA: ${tipoAnimacion} - mostrar: ${mostrar}`);
    
    // ✅ CORRECCIÓN: Limpiar propiedades conflictivas de manera más completa
    elemento.classList.remove(
        'anim-slide-in-left', 'anim-slide-out-left',
        'anim-slide-in-right', 'anim-slide-out-right', 
        'anim-slide-in-top', 'anim-slide-out-top',
        'anim-slide-in-bottom', 'anim-slide-out-bottom',
        'anim-fade-in', 'anim-fade-out'
    );
    
    // 🔧 CRÍTICO: Limpiar también las propiedades CSS inline que puedan interferir
    if (mostrar) {
        elemento.style.clipPath = '';
        elemento.style.transform = '';
        elemento.style.opacity = '';
        elemento.style.visibility = 'visible'; // ✅ FIX: Asegurar visibilidad
    }
    
    // ✅ CORRECCIÓN: Forzar reflow de manera más explícita
    elemento.offsetHeight;
    const computed = window.getComputedStyle(elemento);
    computed.opacity; // Forzar recálculo de estilos computados
    
    switch (tipoAnimacion) {
        // ✅ CORRECCIÓN: SLIDE ANIMATIONS con manejo mejorado
        case 'SLIDE_IN_LEFT':
        case 'SLIDE_OUT_LEFT':
            if (mostrar) {
                // Estado inicial para entrada
                elemento.style.transform = 'translateX(-100%)';
                elemento.style.opacity = '1';
                elemento.style.clipPath = 'none';
                elemento.offsetHeight; // Forzar aplicación del estado inicial
                // Aplicar estado final después de un frame
                requestAnimationFrame(() => {
                    elemento.style.transform = 'translateX(0)';
                });
            } else {
                // Estado final para salida
                elemento.style.transform = 'translateX(-100%)';
                elemento.style.opacity = '0';
                elemento.style.clipPath = 'none';
            }
            break;
            
        case 'SLIDE_IN_RIGHT':
        case 'SLIDE_OUT_RIGHT':
            if (mostrar) {
                elemento.style.transform = 'translateX(100%)';
                elemento.style.opacity = '1';
                elemento.style.clipPath = 'none';
                elemento.offsetHeight;
                requestAnimationFrame(() => {
                    elemento.style.transform = 'translateX(0)';
                });
            } else {
                elemento.style.transform = 'translateX(100%)';
                elemento.style.opacity = '0';
                elemento.style.clipPath = 'none';
            }
            break;
            
        case 'SLIDE_IN_TOP':
        case 'SLIDE_OUT_TOP':
            if (mostrar) {
                elemento.style.transform = 'translateY(-100%)';
                elemento.style.opacity = '1';
                elemento.style.clipPath = 'none';
                elemento.offsetHeight;
                requestAnimationFrame(() => {
                    elemento.style.transform = 'translateY(0)';
                });
            } else {
                elemento.style.transform = 'translateY(-100%)';
                elemento.style.opacity = '0';
                elemento.style.clipPath = 'none';
            }
            break;
            
        case 'SLIDE_IN_BOTTOM':
        case 'SLIDE_OUT_BOTTOM':
            if (mostrar) {
                elemento.style.transform = 'translateY(100%)';
                elemento.style.opacity = '1';
                elemento.style.clipPath = 'none';
                elemento.offsetHeight;
                requestAnimationFrame(() => {
                    elemento.style.transform = 'translateY(0)';
                });
            } else {
                elemento.style.transform = 'translateY(100%)';
                elemento.style.opacity = '0';
                elemento.style.clipPath = 'none';
            }
            break;
            
        // ✅ CORRECCIÓN: FADE ANIMATIONS mejoradas
        case 'FADE_IN':
        case 'FADE_OUT':
            elemento.style.transform = 'none';
            elemento.style.clipPath = 'none';
            if (mostrar) {
                elemento.style.opacity = '0';
                elemento.offsetHeight;
                requestAnimationFrame(() => {
                    elemento.style.opacity = '1';
                });
            } else {
                elemento.style.opacity = '0';
            }
            break;
            
        // ✅ CORRECCIÓN: WIPE ANIMATIONS con manejo exacto del sistema viejo
        case 'WIPE_IN_RIGHT':
            console.log(`🎭 WIPE_IN_RIGHT CORREGIDA - mostrar: ${mostrar}, duración: ${duracion}ms`);
            
            // 🔧 CONFIGURAR TRANSICIÓN ESPECÍFICA PARA WIPE (copiado exactamente del sistema viejo)
            elemento.style.transition = `clip-path ${duracion}ms ${easing} ${delay}ms, opacity ${duracion}ms ${easing} ${delay}ms`;
            elemento.style.opacity = '1'; // ✅ FIX: Asegurar opacidad
            elemento.style.transform = 'none'; // ✅ NO usar transform con WIPE
            
            if (mostrar) {
                // Estado inicial: oculto por la derecha
                elemento.style.clipPath = 'inset(0 100% 0 0)';
                
                // 🔧 CRÍTICO: Forzar reflow AQUÍ (exactamente como sistema viejo)
                elemento.offsetHeight;
                
                // Después de un frame, revelar
                setTimeout(() => {
                    elemento.style.clipPath = 'inset(0 0% 0 0)';
                    console.log('🟢 WIPE_IN_RIGHT CORREGIDA: Revelando...');
                }, 50); // ✅ FIX: Delay aumentado
            } else {
                // Ocultar inmediatamente
                elemento.style.clipPath = 'inset(0 100% 0 0)';
                console.log('🔴 WIPE_IN_RIGHT CORREGIDA: Ocultando...');
            }
            break;
            
        case 'WIPE_OUT_LEFT':
            console.log(`🎭 WIPE_OUT_LEFT CORREGIDA - mostrar: ${mostrar}, duración: ${duracion}ms`);
            
            elemento.style.transition = `clip-path ${duracion}ms ${easing} ${delay}ms, opacity ${duracion}ms ${easing} ${delay}ms`;
            elemento.style.opacity = '1';
            elemento.style.transform = 'none';
            
            if (mostrar) {
                // Para salida, cuando se "muestra" significa volver al estado visible
                elemento.style.clipPath = 'inset(0 0% 0 0)';
                console.log('🟢 WIPE_OUT_LEFT CORREGIDA: Visible...');
            } else {
                // Estado inicial visible, luego salir hacia la izquierda
                elemento.style.clipPath = 'inset(0 0% 0 0)';
                elemento.offsetHeight; // Reflow
                
                setTimeout(() => {
                    elemento.style.clipPath = 'inset(0 100% 0 0)';
                    console.log('🔴 WIPE_OUT_LEFT CORREGIDA: Saliendo hacia izquierda...');
                }, 16);
            }
            break;
            
        case 'WIPE_IN_TOP':
            console.log(`🎭 WIPE_IN_TOP CORREGIDA - mostrar: ${mostrar}`);
            elemento.style.transition = `clip-path ${duracion}ms ${easing} ${delay}ms`;
            elemento.style.opacity = '1';
            elemento.style.transform = 'none';
            
            if (mostrar) {
                elemento.style.clipPath = 'inset(100% 0 0 0)'; // Oculto por arriba
                elemento.offsetHeight;
                setTimeout(() => {
                    elemento.style.clipPath = 'inset(0 0 0 0)';
                    console.log('🟢 WIPE_IN_TOP CORREGIDA: Revelando...');
                }, 16);
            } else {
                elemento.style.clipPath = 'inset(100% 0 0 0)';
                console.log('🔴 WIPE_IN_TOP CORREGIDA: Ocultando...');
            }
            break;
            
        case 'WIPE_OUT_BOTTOM':
            console.log(`🎭 WIPE_OUT_BOTTOM CORREGIDA - mostrar: ${mostrar}`);
            elemento.style.transition = `clip-path ${duracion}ms ${easing} ${delay}ms`;
            elemento.style.opacity = '1';
            elemento.style.transform = 'none';
            
            if (mostrar) {
                elemento.style.clipPath = 'inset(0 0 0 0)';
                console.log('🟢 WIPE_OUT_BOTTOM CORREGIDA: Visible...');
            } else {
                // 🔧 CORRECCIÓN: Salir hacia abajo
                elemento.style.clipPath = 'inset(0 0 100% 0)';
                console.log('🔴 WIPE_OUT_BOTTOM CORREGIDA: Saliendo hacia abajo...');
            }
            break;
        case 'WIPE_IN_BOTTOM':
            console.log(`🎭 WIPE_IN_BOTTOM CORREGIDA - mostrar: ${mostrar}`);
            elemento.style.transition = `clip-path ${duracion}ms ${easing} ${delay}ms`;
            elemento.style.opacity = '1';
            elemento.style.transform = 'none';
            
            if (mostrar) {
                elemento.style.clipPath = 'inset(0 0 100% 0)'; // Oculto por abajo
                elemento.offsetHeight;
                setTimeout(() => {
                    elemento.style.clipPath = 'inset(0 0 0 0)';
                    console.log('🟢 WIPE_IN_BOTTOM CORREGIDA: Revelando desde abajo...');
                }, 16);
            } else {
                elemento.style.clipPath = 'inset(0 0 100% 0)';
                console.log('🔴 WIPE_IN_BOTTOM CORREGIDA: Ocultando...');
            }
            break;

        case 'WIPE_IN_LEFT':
            console.log(`🎭 WIPE_IN_LEFT CORREGIDA - mostrar: ${mostrar}`);
            elemento.style.transition = `clip-path ${duracion}ms ${easing} ${delay}ms`;
            elemento.style.opacity = '1';
            elemento.style.transform = 'none';
            
            if (mostrar) {
                elemento.style.clipPath = 'inset(0 0 0 100%)'; // Oculto por la izquierda
                elemento.offsetHeight;
                setTimeout(() => {
                    elemento.style.clipPath = 'inset(0 0 0 0)';
                    console.log('🟢 WIPE_IN_LEFT CORREGIDA: Revelando desde izquierda...');
                }, 16);
            } else {
                elemento.style.clipPath = 'inset(0 0 0 100%)';
                console.log('🔴 WIPE_IN_LEFT CORREGIDA: Ocultando...');
            }
            break;

        case 'WIPE_OUT_RIGHT':
            console.log(`🎭 WIPE_OUT_RIGHT CORREGIDA - mostrar: ${mostrar}`);
            elemento.style.transition = `clip-path ${duracion}ms ${easing} ${delay}ms`;
            elemento.style.opacity = '1';
            elemento.style.transform = 'none';
            
            if (mostrar) {
                elemento.style.clipPath = 'inset(0 0 0 0)';
                console.log('🟢 WIPE_OUT_RIGHT CORREGIDA: Visible...');
            } else {
                elemento.style.clipPath = 'inset(0 0 0 0)';
                elemento.offsetHeight;
                setTimeout(() => {
                    elemento.style.clipPath = 'inset(0 0 0 100%)'; // Sale hacia la derecha
                    console.log('🔴 WIPE_OUT_RIGHT CORREGIDA: Saliendo hacia derecha...');
                }, 16);
            }
            break;

        case 'WIPE_OUT_TOP':
            console.log(`🎭 WIPE_OUT_TOP CORREGIDA - mostrar: ${mostrar}`);
            elemento.style.transition = `clip-path ${duracion}ms ${easing} ${delay}ms`;
            elemento.style.opacity = '1';
            elemento.style.transform = 'none';
            
            if (mostrar) {
                elemento.style.clipPath = 'inset(0 0 0 0)';
                console.log('🟢 WIPE_OUT_TOP CORREGIDA: Visible...');
            } else {
                elemento.style.clipPath = 'inset(0 0 0 0)';
                elemento.offsetHeight;
                setTimeout(() => {
                    elemento.style.clipPath = 'inset(100% 0 0 0)'; // Sale hacia arriba
                    console.log('🔴 WIPE_OUT_TOP CORREGIDA: Saliendo hacia arriba...');
                }, 16);
            }
            break;    
            
        case 'ZOOM_IN':
        case 'ZOOM_OUT':
            console.log(`🎭 ZOOM CORREGIDA - mostrar: ${mostrar}`);
            elemento.style.transition = `transform ${duracion}ms ${easing} ${delay}ms, opacity ${duracion}ms ${easing} ${delay}ms`;
            
            if (mostrar) {
                elemento.style.transform = 'scale(0)';
                elemento.style.opacity = '0';
                elemento.offsetHeight; // Reflow
                requestAnimationFrame(() => {
                    elemento.style.transform = 'scale(1)';
                    elemento.style.opacity = '1';
                });
            } else {
                elemento.style.transform = 'scale(0)';
                elemento.style.opacity = '0';
            }
            break;
            
        default:
            console.warn(`⚠️ Tipo de animación no reconocido: ${tipoAnimacion}`);
            elemento.style.opacity = mostrar ? '1' : '0';
            elemento.style.transform = 'none';
            elemento.style.clipPath = 'none';
    }
}

// ==============================



    /**
     * Aplicar animación por tipo
     */
    applyAnimationByType(element, animationType, show, config) {
        switch (animationType) {
            // === FADE ANIMATIONS ===
            case 'FADE_IN':
            case 'FADE_OUT':
                this.applyFadeAnimation(element, show);
                break;

            // === SLIDE ANIMATIONS ===
            case 'SLIDE_IN_LEFT':
            case 'SLIDE_OUT_LEFT':
                this.applySlideAnimation(element, 'left', show);
                break;
                
            case 'SLIDE_IN_RIGHT':
            case 'SLIDE_OUT_RIGHT':
                this.applySlideAnimation(element, 'right', show);
                break;
                
            case 'SLIDE_IN_TOP':
            case 'SLIDE_OUT_TOP':
                this.applySlideAnimation(element, 'top', show);
                break;
                
            case 'SLIDE_IN_BOTTOM':
            case 'SLIDE_OUT_BOTTOM':
                this.applySlideAnimation(element, 'bottom', show);
                break;

            // === WIPE ANIMATIONS ===
            case 'WIPE_IN_RIGHT':
            case 'WIPE_OUT_LEFT':
                this.applyWipeAnimation(element, 'horizontal', show, config);
                break;
                
            case 'WIPE_IN_TOP':
            case 'WIPE_OUT_BOTTOM':
                this.applyWipeAnimation(element, 'vertical', show, config);
                break;

            default:
                console.warn(`⚠️ Tipo de animación no reconocido: ${animationType}`);
                this.applyFadeAnimation(element, show);
        }
    }

    // ===== TIPOS DE ANIMACIÓN ===

    /**
     * Aplicar animación de fade
     */
    applyFadeAnimation(element, show) {
        element.style.opacity = show ? '1' : '0';
        element.style.transform = 'none';
    }

    /**
     * Aplicar animación de slide
     */
    applySlideAnimation(element, direction, show) {
        element.style.opacity = show ? '1' : '0';
        
        let transform = '';
        if (direction === 'left') {
            transform = show ? 'translateX(0)' : 'translateX(-100%)';
        } else if (direction === 'right') {
            transform = show ? 'translateX(0)' : 'translateX(100%)';
        } else if (direction === 'top') {
            transform = show ? 'translateY(0)' : 'translateY(-100%)';
        } else if (direction === 'bottom') {
            transform = show ? 'translateY(0)' : 'translateY(100%)';
        }
        
        element.style.transform = transform;
    }

    /**
     * Aplicar animación de wipe
     */
    applyWipeAnimation(element, direction, show, config) {
        element.style.opacity = '1';
        
        let clipPath = '';
        if (direction === 'horizontal') {
            if (show) {
                // WIPE_IN_RIGHT: Revela de izquierda a derecha
                clipPath = 'inset(0 0% 0 0)';
            } else {
                // WIPE_OUT_LEFT: Oculta hacia la izquierda
                clipPath = 'inset(0 100% 0 0)';
            }
        } else if (direction === 'vertical') {
            if (show) {
                // WIPE_IN_TOP: Revela de abajo hacia arriba
                clipPath = 'inset(0 0 0 0)';
            } else {
                // WIPE_OUT_BOTTOM: Oculta hacia abajo
                clipPath = 'inset(0 0 100% 0)';
            }
        }
        
        element.style.clipPath = clipPath;
        
        console.log(`🎭 WIPE ${direction} - show: ${show}, clipPath: ${clipPath}`);
    }

    /**
     * Cleanup después de animación
     */
    cleanupAnimation(element, show) {
        // Si se está ocultando, establecer display: none
        if (!show) {
            element.style.display = 'none';
            element.style.visibility = 'hidden';
        }
        
        // ✅ LIMPIEZA: Remover propiedades temporales
        element.style.willChange = 'auto';
        element.style.backfaceVisibility = '';
        element.style.perspective = '';
        element.style.transition = '';
        
        // Limpiar clases de animación si existen
        const animationClasses = [
            'fade-in', 'fade-out',
            'slide-in', 'slide-out',
            'slide-in-left', 'slide-out-left',
            'slide-in-right', 'slide-out-right',
            'slide-in-top', 'slide-out-top',
            'slide-in-bottom', 'slide-out-bottom',
            'anim-slide-in-left', 'anim-slide-out-left',
            'anim-slide-in-right', 'anim-slide-out-right',
            'anim-slide-in-top', 'anim-slide-out-top',
            'anim-slide-in-bottom', 'anim-slide-out-bottom',
            'anim-fade-in', 'anim-fade-out'
        ];
        
        animationClasses.forEach(cls => {
            element.classList.remove(cls);
        });
        
        console.log(`🧹 Cleanup completado para elemento (show: ${show})`);
    }

    // ===== ANIMACIONES ESPECIALES =====

    /**
     * Animación especial para cambio de logo
     */
    animateLogoChange(logoElement, newSrc, config = {}) {
        if (!logoElement || !newSrc) return;

        const animConfig = this.getAnimationConfig('logo', config);
        
        console.log('🔄 Animando cambio de logo');
        
        // Fase 1: Ocultar logo actual
        this.applyDynamicAnimation(logoElement, 'logo', false, animConfig);
        
        // Fase 2: Cambiar imagen y mostrar
        const changeDelay = animConfig.delay + animConfig.duracion + 50;
        setTimeout(() => {
            logoElement.src = newSrc;
            this.applyDynamicAnimation(logoElement, 'logo', true, animConfig);
        }, changeDelay);
    }

    /**
     * Animación de lower third secuencial
     */
    animateSequentialLowerThird(containerElement, h1Element, h2Element, show, config = {}) {
        if (!containerElement) return;

        const animConfig = this.getAnimationConfig('invitadoRol', config);
        
        if (show) {
            // Mostrar contenedor primero
            containerElement.style.display = 'flex';
            
            // Animar elementos secuencialmente
            if (h1Element) {
                setTimeout(() => {
                    this.applyDynamicAnimation(h1Element, 'invitadoRol', true, animConfig);
                }, 100);
            }
            
            if (h2Element) {
                setTimeout(() => {
                    this.applyDynamicAnimation(h2Element, 'invitadoRol', true, animConfig);
                }, 200);
            }
        } else {
            // Ocultar elementos secuencialmente
            if (h2Element) {
                this.applyDynamicAnimation(h2Element, 'invitadoRol', false, animConfig);
            }
            
            if (h1Element) {
                setTimeout(() => {
                    this.applyDynamicAnimation(h1Element, 'invitadoRol', false, animConfig);
                }, 100);
            }
            
            // Ocultar contenedor al final
            setTimeout(() => {
                containerElement.style.display = 'none';
            }, animConfig.duracion + animConfig.delay + 200);
        }
    }

    // ===== FUNCIONES DE COMPATIBILIDAD ===

    /**
     * Funciones de compatibilidad con sistema anterior
     */
    fadeIn(element) {
        this.applyDynamicAnimation(element, 'generic', true, { 
            entrada: 'FADE_IN', 
            duracion: this.defaultDurations.fadeIn 
        });
    }

    fadeOut(element) {
        this.applyDynamicAnimation(element, 'generic', false, { 
            salida: 'FADE_OUT', 
            duracion: this.defaultDurations.fadeOut 
        });
    }

    slideInLeft(element) {
        this.applyDynamicAnimation(element, 'generic', true, { 
            entrada: 'SLIDE_IN_LEFT', 
            duracion: this.defaultDurations.slideIn 
        });
    }

    slideOutLeft(element) {
        this.applyDynamicAnimation(element, 'generic', false, { 
            salida: 'SLIDE_OUT_LEFT', 
            duracion: this.defaultDurations.slideOut 
        });
    }

    slideInTop(element) {
        this.applyDynamicAnimation(element, 'generic', true, { 
            entrada: 'SLIDE_IN_TOP', 
            duracion: this.defaultDurations.slideIn 
        });
    }

    slideOutTop(element) {
        this.applyDynamicAnimation(element, 'generic', false, { 
            salida: 'SLIDE_OUT_TOP', 
            duracion: this.defaultDurations.slideOut 
        });
    }

    // ===== UTILIDADES =====

    /**
     * Configurar duraciones por defecto
     */
    setDefaultDurations(durations) {
        Object.assign(this.defaultDurations, durations);
        console.log('🎬 Duraciones por defecto actualizadas:', this.defaultDurations);
    }

    /**
     * Agregar tipo de easing personalizado
     */
    addCustomEasing(name, value) {
        this.easingTypes[name] = value;
        console.log(`🎬 Easing personalizado agregado: ${name} = ${value}`);
    }

    /**
     * Verificar si hay animaciones activas
     */
    hasActiveAnimations() {
        return this.activeAnimations.size > 0;
    }

    /**
     * Detener todas las animaciones
     */
    stopAllAnimations() {
        this.activeAnimations.clear();
        this.animationQueue.clear();
        console.log('🛑 Todas las animaciones detenidas');
    }

    /**
     * Obtener estadísticas
     */
    getStats() {
        return {
            isInitialized: this.isInitialized,
            activeAnimations: this.activeAnimations.size,
            queuedAnimations: this.animationQueue.size,
            availableEasings: Object.keys(this.easingTypes),
            defaultDurations: this.defaultDurations
        };
    }

    /**
     * Destruir el motor de animaciones
     */
    destroy() {
        this.stopAllAnimations();
        
        EventBus.off('animate-element');
        EventBus.off('animate-logo-change');
        
        this.isInitialized = false;
        console.log('🎬 Animation Engine destroyed');
    }
}

// ===== INSTANCIA GLOBAL =====
export const animationEngine = new AnimationEngine();

// ===== FUNCIONES GLOBALES DE COMPATIBILIDAD =====
// Para mantener compatibilidad con el sistema anterior
export const ANIM = {
    fadeIn: (element) => animationEngine.fadeIn(element),
    fadeOut: (element) => animationEngine.fadeOut(element),
    slideIn: (element) => animationEngine.slideInLeft(element),
    slideOut: (element) => animationEngine.slideOutLeft(element),
    slideInLeft: (element) => animationEngine.slideInLeft(element),
    slideOutLeft: (element) => animationEngine.slideOutLeft(element),
    slideInTop: (element) => animationEngine.slideInTop(element),
    slideOutTop: (element) => animationEngine.slideOutTop(element)
};

// ===== FUNCIONES DE CONVENIENCIA =====
export const AnimationUtils = {
    // Función principal (reemplaza aplicarAnimacionDinamica)
    apply: (element, type, show, config) => {
        return animationEngine.applyDynamicAnimation(element, type, show, config);
    },
    
    // Animaciones simples
    fadeIn: (element) => animationEngine.fadeIn(element),
    fadeOut: (element) => animationEngine.fadeOut(element),
    
    // Estado
    stats: () => animationEngine.getStats(),
    stopAll: () => animationEngine.stopAllAnimations(),
    
    // Configuración
    setDurations: (durations) => animationEngine.setDefaultDurations(durations),
    addEasing: (name, value) => animationEngine.addCustomEasing(name, value)
};

// ===== HACER DISPONIBLE GLOBALMENTE =====
// Para compatibilidad con el sistema existente
window.ANIM = ANIM;
window.aplicarAnimacionDinamica = (element, type, show, config) => {
    return animationEngine.applyDynamicAnimation(element, type, show, config);
};


console.log('🎬 Animation Engine module loaded');

// 🎨 Enhanced Logo Animations - Extensión para AnimationEngine
// Agregar DESPUÉS de: console.log('🎬 Animation Engine module loaded');

// Agregar nuevos tipos de animación al engine existente
const ENHANCED_LOGO_ANIMATIONS = {
    // 🔄 FLIP 3D - Recomendado #1
    'LOGO_FLIP_3D_IN': {
        prepare: (element) => {
            element.style.transformStyle = 'preserve-3d';
            element.style.backfaceVisibility = 'hidden';
            element.style.transform = 'rotateY(-180deg)';
            element.style.opacity = '1';
        },
        animate: (element) => {
            element.style.transform = 'rotateY(0deg)';
        },
        cleanup: (element) => {
            element.style.transformStyle = '';
            element.style.backfaceVisibility = '';
        }
    },
    
    'LOGO_FLIP_3D_OUT': {
        prepare: (element) => {
            element.style.transformStyle = 'preserve-3d';
            element.style.backfaceVisibility = 'hidden';
        },
        animate: (element) => {
            element.style.transform = 'rotateY(180deg)';
            element.style.opacity = '1';
        }
    },

    // ⚡ ZOOM + ROTATE - Recomendado #2
    'LOGO_ZOOM_ROTATE_IN': {
        prepare: (element) => {
            element.style.transform = 'scale(0) rotate(-360deg)';
            element.style.opacity = '1';
        },
        animate: (element) => {
            element.style.transform = 'scale(1) rotate(0deg)';
        }
    },
    
    'LOGO_ZOOM_ROTATE_OUT': {
        animate: (element) => {
            element.style.transform = 'scale(0) rotate(360deg)';
            element.style.opacity = '1';
        }
    },

    // 🎲 CUBE ROTATE - Recomendado #3
    'LOGO_CUBE_IN': {
        prepare: (element) => {
            element.style.transformStyle = 'preserve-3d';
            element.style.transform = 'rotateX(-90deg) rotateY(-90deg)';
            element.style.opacity = '1';
        },
        animate: (element) => {
            element.style.transform = 'rotateX(0deg) rotateY(0deg)';
        },
        cleanup: (element) => {
            element.style.transformStyle = '';
        }
    },
    
    'LOGO_CUBE_OUT': {
        prepare: (element) => {
            element.style.transformStyle = 'preserve-3d';
        },
        animate: (element) => {
            element.style.transform = 'rotateX(90deg) rotateY(90deg)';
            element.style.opacity = '1';
        }
    },

    // 🌪️ SLIDE + SPIN
    'LOGO_SLIDE_SPIN_IN': {
        prepare: (element) => {
            element.style.transform = 'translateX(-200%) rotate(-720deg)';
            element.style.opacity = '1';
        },
        animate: (element) => {
            element.style.transform = 'translateX(0%) rotate(0deg)';
        }
    },
    
    'LOGO_SLIDE_SPIN_OUT': {
        animate: (element) => {
            element.style.transform = 'translateX(200%) rotate(720deg)';
            element.style.opacity = '1';
        }
    },

    // 🎾 BOUNCE ELASTIC
    'LOGO_BOUNCE_IN': {
        prepare: (element) => {
            element.style.transform = 'scale(0)';
            element.style.opacity = '1';
        },
        animate: (element) => {
            element.style.animation = 'logoBouncyIn 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards';
        },
        cleanup: (element) => {
            element.style.animation = '';
            element.style.transform = 'scale(1)';
        }
    },
    
    'LOGO_BOUNCE_OUT': {
        animate: (element) => {
            element.style.animation = 'logoBouncyOut 0.6s cubic-bezier(0.55, 0.085, 0.68, 0.53) forwards';
        },
        cleanup: (element) => {
            element.style.animation = '';
        }
    },

    // 💧 LIQUID MORPH
    'LOGO_LIQUID_IN': {
        prepare: (element) => {
            element.style.transform = 'scale(0.3)';
            element.style.filter = 'blur(3px)';
            element.style.borderRadius = '50%';
            element.style.opacity = '1';
        },
        animate: (element) => {
            element.style.animation = 'logoLiquidIn 1s cubic-bezier(0.23, 1, 0.32, 1) forwards';
        },
        cleanup: (element) => {
            element.style.animation = '';
            element.style.filter = '';
            element.style.transform = 'scale(1)';
        }
    }
};

// 🔧 Extensión del AnimationEngine existente
AnimationEngine.prototype.applyEnhancedLogoAnimation = function(element, animationType, show, config = {}) {
    if (!element) return;
    
    console.log(`🎨 Aplicando animación mejorada: ${animationType} (${show ? 'IN' : 'OUT'})`);
    
    // 🛡️ ESCUDO ANTI-COLISIÓN: Registramos qué estamos haciendo actualmente con este elemento
    element.dataset.enhancedState = show ? 'showing' : 'hiding';
    
    const animConfig = this.getAnimationConfig('logo', config);
    const duration = animConfig.duracion || 600;
    const delay = animConfig.delay || 0;
    const easing = this.easingTypes[animConfig.easing] || 'ease-in-out';
    
    // Construir nombre completo de animación
    const fullAnimationType = show ? 
        `${animationType}_IN` : 
        `${animationType}_OUT`;
    
    const animation = ENHANCED_LOGO_ANIMATIONS[fullAnimationType];
    
    if (!animation) {
        console.warn(`❌ Animación no encontrada: ${fullAnimationType}`);
        // Fallback a animación básica
        return this.applyDynamicAnimationFromOldSystem(element, 'logo', show, config);
    }
    
    // Configurar transición
    element.style.transition = `all ${duration}ms ${easing} ${delay}ms`;
    
    // Preparar estado inicial
    if (animation.prepare) {
        animation.prepare(element);
    }
    
    // Ejecutar animación después del delay
    setTimeout(() => {
        if (animation.animate) {
            animation.animate(element);
        }
    }, delay + 16);
    
    // Cleanup después de completar
    if (animation.cleanup) {
        setTimeout(() => {
            // 🛡️ Limpiar solo si la animación no ha sido interrumpida por otra
            if (element.dataset.enhancedState === (show ? 'showing' : 'hiding')) {
                animation.cleanup(element);
            }
        }, duration + delay + 100);
    }
    
    // Para animaciones de salida, ocultar elemento al final
    if (!show) {
        setTimeout(() => {
            // 🛡️ Evitar apagar el logo si la animación de entrada ya comenzó
            if (element.dataset.enhancedState === 'hiding') {
                element.style.display = 'none';
                console.log(`✅ [SIN COLISIÓN] Apagado normal completado para logo.`);
            } else {
                console.log('🛡️ [ESCUDO ACTIVADO - ENHANCED] Evitando apagar el logo porque la nueva rotación (IN) ya comenzó.');
            }
        }, duration + delay + 150);
    } else {
        element.style.display = 'block';
    }
};

// 🚀 Configuraciones predefinidas recomendadas
const RECOMMENDED_LOGO_CONFIGS = {
    // Para logos de marca corporativa
    corporate: {
        entrada: 'LOGO_FLIP_3D',
        salida: 'LOGO_FLIP_3D',
        duracion: 600,
        delay: 0,
        easing: 'EASE_IN_OUT'
    },
    
    // Para logos más dinámicos/deportivos
    dynamic: {
        entrada: 'LOGO_ZOOM_ROTATE',
        salida: 'LOGO_ZOOM_ROTATE',
        duracion: 500,
        delay: 0,
        easing: 'BOUNCE'
    },
    
    // Para efectos dramáticos
    dramatic: {
        entrada: 'LOGO_CUBE',
        salida: 'LOGO_CUBE',
        duracion: 800,
        delay: 100,
        easing: 'EASE_IN_OUT'
    },
    
    // Para logos más creativos/artísticos
    creative: {
        entrada: 'LOGO_LIQUID',
        salida: 'LOGO_BOUNCE',
        duracion: 1000,
        delay: 0,
        easing: 'ELASTIC'
    }
};

// 📝 Función helper para aplicar configuración recomendada
function applyRecommendedLogoConfig(type = 'corporate') {
    const config = RECOMMENDED_LOGO_CONFIGS[type];
    if (!config) {
        console.warn(`❌ Configuración no encontrada: ${type}`);
        return;
    }
    
    // Actualizar configuración global
    window.animacionConfig = window.animacionConfig || {};
    window.animacionConfig.logo = {
        ...window.animacionConfig.logo,
        ...config
    };
    
    console.log(`✅ Configuración de logo aplicada: ${type}`, config);
}

// 🔧 Hacer disponibles las funciones globalmente
window.EnhancedLogoAnimations = {
    apply: applyRecommendedLogoConfig,
    configs: RECOMMENDED_LOGO_CONFIGS,
    animations: ENHANCED_LOGO_ANIMATIONS
};

console.log('🎨 Enhanced Logo Animations loaded');