// 🖼️ modules/logo-manager.js
// Responsabilidad: Gestión de logos (principal + rotación de aliados)

import { EventBus } from '../utils/event-bus.js';

export class LogoManager {
    constructor() {
        this.element = null;
        this.isVisible = false;
        this.isRotating = false;
        
        this.config = {
            enabled: false,
            mainLogo: {
                url: '',
                duration: 60000, // 60 segundos
                alt: 'Logo Principal'
            },
            aliados: [],
            aliaDuration: 45000, // 45 segundos
            currentIndex: 0,
            continuousCycle: true
        };
        
        this.rotation = {
            timer: null,
            lastChange: null,
            currentLogo: null,
            isAnimating: false
        };
        
        this.animations = {
            duration: 700,
            delay: 0,
            easing: 'ease-in-out'
        };
    }

    /**
     * Inicializar el manager de logos
     */
    init() {
        this.findElement();
        this.loadConfiguration();
        this.setupEventListeners();
        console.log('🖼️ Logo Manager initialized');
    }

    /**
     * Encontrar elemento del logo
     */
    findElement() {
        this.element = document.getElementById('logo');
        
        if (!this.element) {
            console.warn('⚠️ Elemento logo no encontrado');
            return;
        }
        
        // Guardar logo principal si existe
        if (this.element.src) {
            this.config.mainLogo.url = this.element.src;
            this.config.mainLogo.alt = this.element.alt || 'Logo Principal';
        }
        
        console.log('🖼️ Elemento logo encontrado');
    }

    /**
     * Cargar configuración desde variables globales
     */
    loadConfiguration() {
        if (window.animacionConfig?.logo) {
            this.animations.duration = window.animacionConfig.logo.duracion || 700;
            this.animations.delay = window.animacionConfig.logo.delay || 0;
            this.animations.easing = this.getEasingValue(window.animacionConfig.logo.easing);
        }

        // Cargar desde logoConfig global
        if (window.logoConfig) {
            //this.config.enabled = window.logoConfig.habilitado || false;
            this.config.enabled = (window.logoConfig.enabled ?? window.logoConfig.habilitado) || false;
            this.config.aliaDuration = (window.logoConfig.duraciones?.aliados || 45) * 1000;
            this.config.mainLogo.duration = (window.logoConfig.duraciones?.principal || 60) * 1000;
            this.config.continuousCycle = window.logoConfig.cicloContinuo !== false;
        }
        
        // Cargar logos aliados
        if (window.logosAliados && Array.isArray(window.logosAliados)) {
            this.config.aliados = window.logosAliados.map(logo => ({
                url: logo.url,
                name: logo.nombre || logo.id || 'Logo Aliado',
                alt: logo.nombre || 'Logo Aliado',
                active: logo.activo !== false,
                order: logo.orden || 0
            })).filter(logo => logo.active).sort((a, b) => a.order - b.order);
        }
        
        // Cargar logo principal desde global
        if (window.logoPrincipalUrl) {
            this.config.mainLogo.url = window.logoPrincipalUrl;
        }
        
        console.log('🖼️ Configuración cargada:', {
            enabled: this.config.enabled,
            mainLogo: !!this.config.mainLogo.url,
            aliados: this.config.aliados.length
        });
    }

    /**
     * Configurar event listeners
     */
    setupEventListeners() {
        // Escuchar eventos del scheduler
        EventBus.on('logo-visibility-changed', (data) => {
            this.handleVisibilityChange(data);
        });

        //EventBus.on('logo-rotate', (data) => {
        //    this.handleRotation(data);
        //});

        // Escuchar eventos de debug
        EventBus.on('debug-visibility-change', (data) => {
            this.handleDebugVisibilityChange(data);
        });

        EventBus.on('debug-force-logo-rotation', () => {
            this.forceRotation();
        });
    }

    // ===== MÉTODOS PRINCIPALES =====

    /**
     * Mostrar logo
     */
    show() {
        if (!this.element) {
            console.warn('⚠️ No se puede mostrar logo - elemento no encontrado');
            return;
        }

        // ⭐ AGREGAR ESTA LÍNEA:
        const wasVisible = this.isVisible;

        // ⭐ Solo configurar logo principal si NO está visible
        // (preservar el logo actual si ya está rotando)
        if (!this.isVisible) {
            if (!this.element.src && this.config.mainLogo.url) {
                this.element.src = this.config.mainLogo.url;
                this.element.alt = this.config.mainLogo.alt;
            }
            
            // ⭐ Solo resetear índice si no estaba visible antes
            if (!wasVisible) {
                this.config.currentIndex = 0;
            }
            
            // ⭐ Solo animar si no estaba visible
            this.animateIn();
        } else {
            console.log('🖼️ Logo ya visible - preservando estado actual');
        }
        
        this.isVisible = true;
        
        // ⭐ Solo actualizar lastChange si no estaba rotando
        if (!this.isRotating) {
            this.rotation.lastChange = Date.now();
        }
        
        console.log('🖼️ Logo mostrado (estado preservado)');
        EventBus.emit('logo-shown');
    }

    /**
     * Ocultar logo
     */
    hide() {
        if (!this.element || !this.isVisible) return;

        // Detener rotación si está activa
        this.stopRotation();

        // Aplicar animación de salida
        this.animateOut();
        
        this.isVisible = false;
        console.log('🖼️ Logo ocultado');
        EventBus.emit('logo-hidden');
    }

    /**
     * Iniciar rotación de logos
     */
    startRotation() {
        if (!this.config.enabled || this.config.aliados.length === 0) {
            console.log('⚠️ Rotación no disponible - deshabilitada o sin logos aliados');
            return false;
        }

        if (this.isRotating) {
            console.log('🔄 Rotación ya está activa - preservando estado actual');
            return true; // ⭐ Devolver true porque ya está activa
        }

        this.isRotating = true;
        
        // ⭐ NO resetear currentIndex - preservar el logo actual
        // Si no había rotación previa, empezar con el principal
        if (this.config.currentIndex === undefined || this.config.currentIndex === null) {
            this.config.currentIndex = 0;
            console.log('🔄 Iniciando rotación desde logo principal');
        } else {
            console.log(`🔄 Continuando rotación desde logo ${this.config.currentIndex}`);
        }
        
        // ⭐ Solo actualizar lastChange si no había rotación activa
        this.rotation.lastChange = Date.now();
        
        console.log(`🔄 Rotación de logos iniciada - índice actual: ${this.config.currentIndex}`);
        EventBus.emit('logo-rotation-started');
        
        return true;
    }

    /**
     * Detener rotación de logos
     */
    stopRotation() {
        if (this.rotation.timer) {
            clearTimeout(this.rotation.timer);
            this.rotation.timer = null;
        }
        
        this.isRotating = false;
        console.log('🛑 Rotación de logos detenida');
        EventBus.emit('logo-rotation-stopped');
    }

    /**
     * Rotar al siguiente logo
     */
    rotateNext() {
        if (!this.isVisible || !this.config.enabled) return;

        // Avanzar índice
        this.config.currentIndex++;
        
        // Verificar si completamos el ciclo
        if (this.config.currentIndex > this.config.aliados.length) {
            if (this.config.continuousCycle) {
                this.config.currentIndex = 0; // Volver al principal
            } else {
                this.stopRotation();
                return;
            }
        }

        // Ejecutar rotación
        this.rotateTo(this.config.currentIndex);
    }

    /**
     * Rotar a un logo específico
     */
    rotateTo(index) {
        if (!this.element || !this.isVisible) return;

        let targetLogo;
        let duration;

        // Determinar logo objetivo
        if (index === 0) {
            // Logo principal
            targetLogo = {
                url: this.config.mainLogo.url,
                alt: this.config.mainLogo.alt,
                name: 'Logo Principal'
            };
            duration = this.config.mainLogo.duration;
        } else {
            // Logo aliado
            const aliado = this.config.aliados[index - 1];
            if (!aliado) {
                console.warn('⚠️ Logo aliado no encontrado en índice:', index);
                return;
            }
            targetLogo = aliado;
            duration = this.config.aliaDuration;
        }

        if (!targetLogo.url) {
            console.warn('⚠️ URL de logo no encontrada');
            return;
        }

        // Ejecutar cambio con animación
        this.changeLogo(targetLogo, duration);
        
        this.config.currentIndex = index;
        this.rotation.lastChange = Date.now();
        this.rotation.currentLogo = targetLogo;
        
        console.log(`🔄 Logo cambiado a: ${targetLogo.name}`);
        EventBus.emit('logo-changed', {
            index: index,
            logo: targetLogo,
            isMainLogo: index === 0
        });
    }

    /**
     * Cambiar logo con animación
     */
    changeLogo(targetLogo, nextDuration = null) {
        if (!this.element) return;

        /* dtos obtenidos de firebase
        // Obtener duración real de animación desde configuración
        const realDuration = window.animacionConfig?.logo?.duracion || 700;
        const realDelay = window.animacionConfig?.logo?.delay || 0;
        */

        // 🔧 TIMING CORREGIDO: Más rápido y fluido
        const realDuration = 300;  // 🎯 FIJO: Era variable 700ms → 300ms fijo
        const realDelay = 0;       // Sin delay
        const changeBuffer = 50;   // 🎯 REDUCIDO: Era +100ms → +50ms

        // Aplicar animación de salida
        this.animateOut();

        /* DESACTIVADO 2025-08-21
        // Cambiar logo después de la animación de salida COMPLETA
        setTimeout(() => {
            this.element.src = targetLogo.url;
            this.element.alt = targetLogo.alt;

            // Aplicar animación de entrada después de un frame
            requestAnimationFrame(() => {
                this.animateIn();
            });
        }, realDuration + realDelay + 100); // Tiempo suficiente
        */

        // 🚀 CAMBIO PRINCIPAL: Tiempo mucho más corto
            setTimeout(() => {
                this.element.src = targetLogo.url;
                this.element.alt = targetLogo.alt;

                // 🎯 ENTRADA INMEDIATA: Sin requestAnimationFrame innecesario
                this.animateIn();
                
            }, realDuration + changeBuffer); // 🔥 350ms total (era 800ms)

        console.log(`🔄 Cambiando logo a: ${targetLogo.name}`);
        console.log(`🎬 URL: ${targetLogo.url}`);
        console.log(`⏱️ Timing: ${realDuration}ms + ${realDelay}ms`);

    }

    /**
     * Forzar rotación (para debug)
     */
    forceRotation() {
        console.log('🔄 Forzando rotación...');
        this.rotateNext();
    }

    // ===== MÉTODOS DE ANIMACIÓN =====

    /**
     * Aplicar animación de entrada
     
    animateIn() {
        if (!this.element) return;

        this.element.style.display = 'block';

        // Usar sistema de animación existente si está disponible
        if (window.aplicarAnimacionDinamica) {
            window.aplicarAnimacionDinamica(this.element, 'logo', true);
        } else {
            // Fallback simple
            this.element.style.opacity = '0';
            this.element.style.transition = `opacity ${this.animations.duration}ms ${this.animations.easing}`;
            
            setTimeout(() => {
                this.element.style.opacity = '1';
            }, this.animations.delay + 16);
        }
    }
    */

    animateIn() {
        if (!this.element) return;

        this.element.style.display = 'block';

        // 🎨 NUEVO: Intentar usar animación mejorada primero
        const animationType = window.animacionConfig?.logo?.entrada;
        const useEnhanced = animationType && animationType.startsWith('LOGO_') && 
                        window.StreamGraphicsApp?.modules?.animations?.applyEnhancedLogoAnimation;

        if (useEnhanced) {
            console.log('🎨 Usando animación mejorada para logo IN');
            window.StreamGraphicsApp.modules.animations.applyEnhancedLogoAnimation(
                this.element, 
                animationType, 
                true
            );
        } else {
            // Usar sistema de animación existente si está disponible
            if (window.aplicarAnimacionDinamica) {
                window.aplicarAnimacionDinamica(this.element, 'logo', true);
            } else {
                // Fallback simple
                this.element.style.opacity = '0';
                this.element.style.transition = `opacity ${this.animations.duration}ms ${this.animations.easing}`;
                
                setTimeout(() => {
                    this.element.style.opacity = '1';
                }, this.animations.delay + 16);
            }
        }
    }

    /**
     * Aplicar animación de salida
     
    animateOut() {
        if (!this.element) return;

        // Usar sistema de animación existente si está disponible
        if (window.aplicarAnimacionDinamica) {
            window.aplicarAnimacionDinamica(this.element, 'logo', false);
        } else {
            // Fallback simple
            this.element.style.transition = `opacity ${this.animations.duration}ms ${this.animations.easing}`;
            this.element.style.opacity = '0';
        }

        // No ocultar completamente para rotación
        if (!this.isVisible) {
            setTimeout(() => {
                this.element.style.display = 'none';
            }, this.animations.duration + this.animations.delay + 50);
        }
    }
    */

    animateOut() {
        if (!this.element) return;

        // 🎨 NUEVO: Intentar usar animación mejorada primero
        const animationType = window.animacionConfig?.logo?.salida;
        const useEnhanced = animationType && animationType.startsWith('LOGO_') && 
                        window.StreamGraphicsApp?.modules?.animations?.applyEnhancedLogoAnimation;

        if (useEnhanced) {
            console.log('🎨 Usando animación mejorada para logo OUT');
            window.StreamGraphicsApp.modules.animations.applyEnhancedLogoAnimation(
                this.element, 
                animationType, 
                false
            );
        } else {
            // Usar sistema de animación existente si está disponible
            if (window.aplicarAnimacionDinamica) {
                window.aplicarAnimacionDinamica(this.element, 'logo', false);
            } else {
                // Fallback simple
                this.element.style.transition = `opacity ${this.animations.duration}ms ${this.animations.easing}`;
                this.element.style.opacity = '0';
            }
        }

        // No ocultar completamente para rotación
        if (!this.isVisible) {
            setTimeout(() => {
                this.element.style.display = 'none';
            }, this.animations.duration + this.animations.delay + 50);
        }
    }

    // ===== MANEJADORES DE EVENTOS =====

    /**
     * Manejar cambio de visibilidad desde scheduler
     */
    handleVisibilityChange(data) {
        if (data.visible) {
            this.show();
        } else {
            this.hide();
        }
    }

    /**
     * Manejar rotación desde scheduler
     */
    handleRotation(data) {
        this.rotateTo(data.index);
    }

    /**
     * Manejar cambios desde debug
     */
    handleDebugVisibilityChange(data) {
        if (data.logoAlAire) {
            this.show();
        } else {
            this.hide();
        }
    }

    // ===== MÉTODOS DE CONFIGURACIÓN =====

    /**
     * Actualizar configuración
     */
    updateConfig(newConfig) {
        Object.assign(this.config, newConfig);
        console.log('🖼️ Configuración actualizada:', this.config);
    }

    /**
     * Agregar logo aliado
     */
    addAliadoLogo(logo) {
        const newLogo = {
            url: logo.url,
            name: logo.name || logo.nombre || 'Logo Aliado',
            alt: logo.alt || logo.name || 'Logo Aliado',
            active: logo.active !== false,
            order: logo.order || this.config.aliados.length
        };
        
        this.config.aliados.push(newLogo);
        this.config.aliados.sort((a, b) => a.order - b.order);
        
        console.log('🖼️ Logo aliado agregado:', newLogo.name);
    }

    /**
     * Remover logo aliado
     */
    removeAliadoLogo(index) {
        if (index >= 0 && index < this.config.aliados.length) {
            const removed = this.config.aliados.splice(index, 1)[0];
            console.log('🖼️ Logo aliado removido:', removed.name);
        }
    }

    /**
     * Configurar logo principal
     */
    setMainLogo(url, alt = 'Logo Principal') {
        this.config.mainLogo.url = url;
        this.config.mainLogo.alt = alt;
        
        if (this.element && this.config.currentIndex === 0) {
            this.element.src = url;
            this.element.alt = alt;
        }
        
        console.log('🖼️ Logo principal configurado:', alt);
    }

    /**
     * Habilitar/deshabilitar rotación
     */
    enableRotation(enabled = true) {
        this.config.enabled = enabled;
        
        if (!enabled && this.isRotating) {
            this.stopRotation();
        }
        
        console.log(`🖼️ Rotación ${enabled ? 'habilitada' : 'deshabilitada'}`);
    }

    // ===== MÉTODOS DE UTILIDAD =====

    /**
     * Obtener estado actual
     */
    getState() {
        return {
            isVisible: this.isVisible,
            isRotating: this.isRotating,
            currentIndex: this.config.currentIndex,
            currentLogo: this.rotation.currentLogo,
            config: {
                enabled: this.config.enabled,
                mainLogoUrl: this.config.mainLogo.url,
                aliadosCount: this.config.aliados.length,
                continuousCycle: this.config.continuousCycle
            },
            timeSinceLastChange: this.rotation.lastChange ? 
                Date.now() - this.rotation.lastChange : null
        };
    }

    /**
     * Obtener información de logos disponibles
     */
    getLogosInfo() {
        return {
            principal: {
                url: this.config.mainLogo.url,
                alt: this.config.mainLogo.alt,
                duration: this.config.mainLogo.duration
            },
            aliados: this.config.aliados.map((logo, index) => ({
                index: index + 1,
                name: logo.name,
                url: logo.url,
                active: logo.active
            })),
            total: 1 + this.config.aliados.length
        };
    }

    /**
     * Validar configuración
     */
    validateConfig() {
        const issues = [];
        
        if (!this.config.mainLogo.url) {
            issues.push('Logo principal sin URL');
        }
        
        if (this.config.enabled && this.config.aliados.length === 0) {
            issues.push('Rotación habilitada pero sin logos aliados');
        }
        
        this.config.aliados.forEach((logo, index) => {
            if (!logo.url) {
                issues.push(`Logo aliado ${index + 1} sin URL`);
            }
        });
        
        return {
            isValid: issues.length === 0,
            issues: issues
        };
    }

    /**
     * Destruir el manager
     */
    destroy() {
        this.stopRotation();
        this.hide();
        
        // Remover event listeners
        EventBus.off('logo-visibility-changed');
        EventBus.off('logo-rotate');
        EventBus.off('debug-visibility-change');
        EventBus.off('debug-force-logo-rotation');
        
        console.log('🖼️ Logo Manager destroyed');
    }

    /**
     * Función de debug para verificar estado
     */
    debugState() {
        console.group('🔍 DEBUG ESTADO LOGO');
        console.log('isVisible:', this.isVisible);
        console.log('isRotating:', this.isRotating);
        console.log('currentIndex:', this.config.currentIndex);
        console.log('enabled:', this.config.enabled);
        console.log('aliados count:', this.config.aliados.length);
        console.log('current logo:', this.rotation.currentLogo?.name || 'N/A');
        console.log('last change:', this.rotation.lastChange ? new Date(this.rotation.lastChange) : 'N/A');
        
        if (this.element) {
            console.log('elemento src:', this.element.src);
            console.log('elemento alt:', this.element.alt);
        }
        console.groupEnd();
    }
}

// ===== INSTANCIA GLOBAL =====
export const logoManager = new LogoManager();

// ===== FUNCIONES DE CONVENIENCIA =====
export const LogoUtils = {
    show: () => logoManager.show(),
    hide: () => logoManager.hide(),
    rotate: () => logoManager.rotateNext(),
    rotateTo: (index) => logoManager.rotateTo(index),
    startRotation: () => logoManager.startRotation(),
    stopRotation: () => logoManager.stopRotation(),
    status: () => logoManager.getState(),
    info: () => logoManager.getLogosInfo(),
    validate: () => logoManager.validateConfig()
};



console.log('🖼️ Logo Manager module loaded');


// 🎨 EXTENSIONES MEJORADAS PARA LOGO MANAGER
// Agregar DESPUÉS de: console.log('🖼️ Logo Manager module loaded');

// 🔄 Extensión del LogoManager para usar animaciones mejoradas
LogoManager.prototype.animateInEnhanced = function() {
    if (!this.element) return;
    
    this.element.style.display = 'block';
    
    // Obtener tipo de animación desde configuración
    const animationType = window.animacionConfig?.logo?.entrada || 'LOGO_FLIP_3D';
    
    // Usar animación mejorada si está disponible
    if (window.StreamGraphicsApp?.modules?.animations?.applyEnhancedLogoAnimation) {
        window.StreamGraphicsApp.modules.animations.applyEnhancedLogoAnimation(
            this.element, 
            animationType, 
            true
        );
    } else {
        // Fallback a animación original
        this.animateIn();
    }
};

LogoManager.prototype.animateOutEnhanced = function() {
    if (!this.element) return;
    
    // Obtener tipo de animación desde configuración
    const animationType = window.animacionConfig?.logo?.salida || 'LOGO_FLIP_3D';
    
    // Usar animación mejorada si está disponible
    if (window.StreamGraphicsApp?.modules?.animations?.applyEnhancedLogoAnimation) {
        window.StreamGraphicsApp.modules.animations.applyEnhancedLogoAnimation(
            this.element, 
            animationType, 
            false
        );
    } else {
        // Fallback a animación original
        this.animateOut();
    }
};

// 🎯 Modificar el método changeLogo para usar animaciones mejoradas
LogoManager.prototype.changeLogoEnhanced = function(targetLogo, nextDuration = null) {
    if (!this.element) return;

    const realDuration = window.animacionConfig?.logo?.duracion || 700;
    const realDelay = window.animacionConfig?.logo?.delay || 0;

    // Aplicar animación de salida mejorada
    this.animateOutEnhanced();

    // Cambiar logo después de la animación COMPLETA
    setTimeout(() => {
        this.element.src = targetLogo.url;
        this.element.alt = targetLogo.alt;

        // Aplicar animación de entrada mejorada después de un frame
        requestAnimationFrame(() => {
            this.animateInEnhanced();
        });
    }, realDuration + realDelay + 100);

    console.log(`🎨 Logo mejorado cambiando a: ${targetLogo.name}`);
};

console.log('🎨 Logo Manager Enhanced Extensions loaded');

// 🎨 EXTENSIONES MEJORADAS PARA LOGO MANAGER
LogoManager.prototype.animateInEnhanced = function() {
    if (!this.element) return;
    
    this.element.style.display = 'block';
    
    // Obtener tipo de animación desde configuración
    const animationType = window.animacionConfig?.logo?.entrada || 'LOGO_FLIP_3D';
    
    // Usar animación mejorada si está disponible
    if (window.StreamGraphicsApp?.modules?.animations?.applyEnhancedLogoAnimation) {
        window.StreamGraphicsApp.modules.animations.applyEnhancedLogoAnimation(
            this.element, 
            animationType, 
            true
        );
    } else {
        // Fallback a animación original
        this.animateIn();
    }
};

LogoManager.prototype.animateOutEnhanced = function() {
    if (!this.element) return;
    
    // Obtener tipo de animación desde configuración
    const animationType = window.animacionConfig?.logo?.salida || 'LOGO_FLIP_3D';
    
    // Usar animación mejorada si está disponible
    if (window.StreamGraphicsApp?.modules?.animations?.applyEnhancedLogoAnimation) {
        window.StreamGraphicsApp.modules.animations.applyEnhancedLogoAnimation(
            this.element, 
            animationType, 
            false
        );
    } else {
        // Fallback a animación original
        this.animateOut();
    }
};

LogoManager.prototype.changeLogoEnhanced = function(targetLogo, nextDuration = null) {
    if (!this.element) return;

    const realDuration = window.animacionConfig?.logo?.duracion || 700;
    const realDelay = window.animacionConfig?.logo?.delay || 0;

    // Aplicar animación de salida mejorada
    this.animateOutEnhanced();

    // Cambiar logo después de la animación COMPLETA
    setTimeout(() => {
        this.element.src = targetLogo.url;
        this.element.alt = targetLogo.alt;

        // Aplicar animación de entrada mejorada después de un frame
        requestAnimationFrame(() => {
            this.animateInEnhanced();
        });
    }, realDuration + realDelay + 100);

    console.log(`🎨 Logo mejorado cambiando a: ${targetLogo.name}`);
};

console.log('🎨 Logo Manager Enhanced Extensions loaded');