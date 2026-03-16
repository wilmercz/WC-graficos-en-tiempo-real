// 📺 modules/lower-thirds.js
// Responsabilidad: Gestión de gráficos (invitado, tema, publicidad)

import { EventBus } from '../utils/event-bus.js';

export class LowerThirds {
    constructor() {
        this.elements = {
            invitado: {
                container: null,
                h1: null,
                h2: null,
                isVisible: false
            },
            tema: {
                container: null,
                h1: null,
                isVisible: false
            },
            lugar: {                        // ✅ AGREGAR BLOQUE LUGAR
                container: null,
                h1: null,
                isVisible: false
            },
            publicidad: {
                container: null,
                img: null,
                video: null,
                isVisible: false
            }
        };
        
        this.animations = {
            duration: 600,
            delay: 200,
            easing: 'ease-in-out'
        };
    }

    /**
     * Inicializar el módulo
     */
    init() {
        this.findElements();
        this.setupEventListeners();
        console.log('📺 Lower Thirds module initialized');
    }

    /**
     * Encontrar elementos DOM
     */
    findElements() {
        // Elementos de invitado/rol
        this.elements.invitado.container = document.getElementById('grafico-invitado-rol');
        if (this.elements.invitado.container) {
            this.elements.invitado.h1 = this.elements.invitado.container.querySelector('h1');
            this.elements.invitado.h2 = this.elements.invitado.container.querySelector('h2');
        }

        // Elementos de tema
        this.elements.tema.container = document.getElementById('grafico-tema');
        if (this.elements.tema.container) {
            this.elements.tema.h1 = this.elements.tema.container.querySelector('h1');
        }

        this.elements.lugar.container = document.getElementById('grafico-lugar');
        if (this.elements.lugar.container) {
            this.elements.lugar.h1 = this.elements.lugar.container.querySelector('h1');
        }

        // Elementos de publicidad
        this.elements.publicidad.container = document.getElementById('grafico-publicidad');
        if (this.elements.publicidad.container) {
            this.elements.publicidad.img = this.elements.publicidad.container.querySelector('img');
            this.elements.publicidad.video = this.elements.publicidad.container.querySelector('video');

            // ✅ AJUSTES DE POSICIÓN Y Z-INDEX PARA PUBLICIDAD
            const adContainer = this.elements.publicidad.container;
            // Se asume que el body o un wrapper es el contenedor relativo
            adContainer.style.position = 'absolute';
            adContainer.style.left = '0px';
            adContainer.style.bottom = '0px';
            adContainer.style.zIndex = '1001';
        }

        console.log('📺 Lower thirds elements found:', {
            invitado: !!this.elements.invitado.container,
            tema: !!this.elements.tema.container,
            lugar: !!this.elements.lugar.container,
            publicidad: !!this.elements.publicidad.container
        });
    }

    /**
     * Configurar event listeners
     */
    setupEventListeners() {
        // Escuchar eventos del scheduler
        EventBus.on('lower-third-changed', (data) => {
            this.handleVisibilityChange(data);
        });

        EventBus.on('lower-third-auto-hide', (data) => {
            this.autoHide(data.type);
        });

        EventBus.on('publicidad-changed', (data) => {
            this.handlePublicidadChange(data);
        });

        EventBus.on('publicidad-auto-hide', () => {
            this.hidePublicidad();
        });

        // Escuchar eventos de debug
        EventBus.on('debug-visibility-change', (data) => {
            this.handleDebugVisibilityChange(data);
        });
    }


    // ===== MÉTODOS PRINCIPALES =====

    /**
     * Mostrar invitado/rol
     */
    showInvitado(data = null) {
        const element = this.elements.invitado;
        if (!element.container) {
            console.warn('⚠️ Contenedor de invitado no encontrado');
            return;
        }

        // Actualizar contenido si se proporciona
        if (data) {
            this.updateInvitadoContent(data);
        }

        // Aplicar animación de entrada
        //LO DESACTIVO PARA VER QUE PASA, CON ESTO HABIA DOBLE ANIMACION
        //this.animateIn(element, 'invitado');
        
        element.isVisible = true;
        console.log('👤 Invitado mostrado');
        
        EventBus.emit('lower-third-shown', { type: 'invitado' });
    }

    /**
     * Ocultar invitado/rol
    */ 
    hideInvitado() {
        const element = this.elements.invitado;
        if (!element.container || !element.isVisible) return;

        // Aplicar animación de salida
        //this.animateOut(element, 'invitado');
        
        element.isVisible = false;
        console.log('👤 Invitado ocultado');
        
        EventBus.emit('lower-third-hidden', { type: 'invitado' });
    }

    /**
     * Mostrar tema
    */ 
    showTema(data = null) {
        const element = this.elements.tema;
        if (!element.container) {
            console.warn('⚠️ Contenedor de tema no encontrado');
            return;
        }

        // Actualizar contenido si se proporciona
        if (data) {
            this.updateTemaContent(data);
        }

        // Aplicar animación de entrada
        //DESACTIVO POR QUE SE GENERA DOBLE ANIMACION 2025-08-20
        //this.animateIn(element, 'tema');
        
        element.isVisible = true;
        console.log('📋 Tema mostrado');
        
        EventBus.emit('lower-third-shown', { type: 'tema' });
    }

    /**
     * Ocultar tema
     */
    hideTema() {
        const element = this.elements.tema;
        if (!element.container || !element.isVisible) return;

        // Aplicar animación de salida
        //this.animateOut(element, 'tema');
        
        element.isVisible = false;
        console.log('📋 Tema ocultado');
        
        EventBus.emit('lower-third-hidden', { type: 'tema' });
    }

    /**
     * Mostrar publicidad
     */
    showPublicidad(data = null) {
        const element = this.elements.publicidad;
        if (!element.container) {
            console.warn('⚠️ Contenedor de publicidad no encontrado');
            return;
        }

        // Actualizar contenido si se proporciona
        if (data && data.url) {
            this.updatePublicidadContent(data);
        }

        // ✅ LOGICA DE REINICIO DE VIDEO
        if (element.video) {
            element.video.currentTime = 0;
            element.video.play().catch(err => console.warn('⚠️ Error al reproducir video:', err));
        }

        // Aplicar animación de entrada
        //this.animateIn(element, 'publicidad');
        
        element.isVisible = true;
        console.log('📺 Publicidad mostrada');
        
        EventBus.emit('lower-third-shown', { type: 'publicidad' });
    }

    /**
     * Ocultar publicidad
     */
    hidePublicidad() {
        const element = this.elements.publicidad;
        if (!element.container || !element.isVisible) return;

        // ✅ PAUSAR VIDEO AL OCULTAR (Para evitar consumo en fondo)
        if (element.video) {
            element.video.pause();
        }

        // Aplicar animación de salida
        //this.animateOut(element, 'publicidad');
        
        element.isVisible = false;
        console.log('📺 Publicidad ocultada');
        
        EventBus.emit('lower-third-hidden', { type: 'publicidad' });
    }
    

    /**
     * Ocultar todos los elementos
     */
    /*
    hideAll() {
        this.hideInvitado();
        this.hideTema();
        this.hidePublicidad();
        console.log('📺 Todos los lower thirds ocultados');
    }
    */

    // ===== MÉTODOS DE CONTENIDO =====

    /**
     * Actualizar contenido de invitado
     */
    updateInvitadoContent(data) {
        const element = this.elements.invitado;
        
        if (element.h1 && data.invitado) {
            element.h1.textContent = data.invitado;
        }
        
        if (element.h2 && data.rol) {
            element.h2.textContent = data.rol;
        }
        
        console.log('👤 Contenido de invitado actualizado:', data);
    }

    /**
     * Actualizar contenido de tema
     */
    updateTemaContent(data) {
        const element = this.elements.tema;
        
        if (element.h1 && data.tema) {
            element.h1.textContent = data.tema;
        }
        
        console.log('📋 Contenido de tema actualizado:', data);
    }

    /**
     * Actualizar contenido de tema
     */
    updateLugarContent(data) {
        const element = this.elements.lugar;
        
        if (element.h1 && data.lugar) {
            element.h1.textContent = data.lugar;
        }
        
        console.log('📋 Contenido de tema actualizado:', data);
    }

    /**
     * Actualizar contenido de publicidad
     */
    updatePublicidadContent(data) {
        const element = this.elements.publicidad;
        
        if (element.img && data.url) {
            element.img.src = data.url;
            element.img.alt = data.alt || 'Publicidad';
        }
        
        console.log('📺 Contenido de publicidad actualizado:', data);
    }

    // ===== MÉTODOS DE ANIMACIÓN =====

    /**
     * Aplicar animación de entrada
     */
    animateIn(element, type) {
        const container = element.container;
        if (!container) return;

        // Configurar display
        if (type === 'invitado') {
            container.style.display = 'flex';
        } else {
            container.style.display = 'block';
        }

        // Obtener configuración de animación
        const animConfig = this.getAnimationConfig(type);
        
        // Aplicar animación usando el sistema existente
        if (window.aplicarAnimacionDinamica) {
            const animType = type === 'invitado' ? 'invitadoRol' : type;
            window.aplicarAnimacionDinamica(container, animType, true);
        } else {
            // Fallback simple
            container.style.opacity = '0';
            container.style.transform = 'translateX(-100%)';
            container.style.transition = `opacity ${animConfig.duration}ms ${animConfig.easing}, transform ${animConfig.duration}ms ${animConfig.easing}`;
            
            setTimeout(() => {
                container.style.opacity = '1';
                container.style.transform = 'translateX(0)';
            }, animConfig.delay);
        }
    }

    /**
     * Aplicar animación de salida
     */
    animateOut(element, type) {
        const container = element.container;
        if (!container) return;

        // Obtener configuración de animación
        const animConfig = this.getAnimationConfig(type);
        
        // Aplicar animación usando el sistema existente
        if (window.aplicarAnimacionDinamica) {
            const animType = type === 'invitado' ? 'invitadoRol' : type;
            window.aplicarAnimacionDinamica(container, animType, false);
        } else {
            // Fallback simple
            container.style.transition = `opacity ${animConfig.duration}ms ${animConfig.easing}, transform ${animConfig.duration}ms ${animConfig.easing}`;
            container.style.opacity = '0';
            container.style.transform = 'translateX(-100%)';
        }

        // Ocultar después de la animación
       // setTimeout(() => {
        //    container.style.display = 'none';
        //}, animConfig.duration + animConfig.delay + 50);
    }

    /**
     * Obtener configuración de animación
     */
    getAnimationConfig(type) {
        const configs = {
            invitado: window.animacionConfig?.invitadoRol || this.animations,
            tema: window.animacionConfig?.tema || this.animations,
            publicidad: window.animacionConfig?.publicidad || this.animations,
            lugar: window.animacionConfig?.lugar || this.animations
        };
        
        return configs[type] || this.animations;
    }

    // ===== MANEJADORES DE EVENTOS =====

    /**
     * Manejar cambio de visibilidad desde scheduler
     */
    handleVisibilityChange(data) {
        if (data.visible) {
            if (data.type === 'invitado') {
                this.showInvitado();
            } else if (data.type === 'tema') {
                this.showTema();
            } else if (data.type === 'lugar') {
                this.showLugar();
            }
        } else {
            if (data.type === 'invitado') {
                this.hideInvitado();
            } else if (data.type === 'tema') {
                this.hideTema();
            } else if (data.type === 'lugar') {
                this.hideLugar();
            }
        }
    }

    /**
     * Manejar cambio de publicidad desde scheduler
     */
    handlePublicidadChange(data) {
        if (data.visible) {
            this.showPublicidad();
        } else {
            this.hidePublicidad();
        }
    }

    /**
     * Manejar cambios de visibilidad desde debug
     */
    handleDebugVisibilityChange(data) {
        // Actualizar contenido desde datos globales
        const globalData = window.lastFirebaseData || {};
        
        if (data.graficoAlAire) {
            const contenido = {
                invitado: this.getTextContent('invitado') || 'DEBUG INVITADO',
                rol: this.getTextContent('rol') || 'DEBUG ROL'
            };
            this.showInvitado(contenido);
        } else {
            this.hideInvitado();
        }

        if (data.temaAlAire) {
            const contenido = {
                tema: this.getTextContent('tema') || 'DEBUG TEMA'
            };
            this.showTema(contenido);
        } else {
            this.hideTema();
        }

        if (data.publicidadAlAire) {
            this.showPublicidad();
        } else {
            this.hidePublicidad();
        }
    }

    /**
     * Auto-ocultar elemento
     */
    autoHide(type) {
        console.log(`⏰ Auto-ocultando ${type}`);
        
        if (type === 'invitado') {
            this.hideInvitado();
        } else if (type === 'tema') {
            this.hideTema();
        }
        
        // Actualizar Firebase
        if (window.actualizarVisibilidadEnFirebase) {
            const firebaseType = type === 'invitado' ? 'invitadoRol' : type;
            window.actualizarVisibilidadEnFirebase(firebaseType, false);
        }
    }

    // ===== MÉTODOS DE UTILIDAD =====

    /**
     * Obtener contenido de texto actual
     */
    getTextContent(type) {
        const selectors = {
            invitado: '#grafico-invitado-rol h1',
            rol: '#grafico-invitado-rol h2',
            tema: '#grafico-tema h1'
        };
        
        const element = document.querySelector(selectors[type]);
        return element ? element.textContent : null;
    }

    /**
     * Verificar si un elemento está visible
     */
    isVisible(type) {
        return this.elements[type]?.isVisible || false;
    }

    /**
     * Obtener estado de todos los elementos
     */
    getState() {
        return {
            invitado: {
                isVisible: this.elements.invitado.isVisible,
                hasContent: !!this.getTextContent('invitado')
            },
            tema: {
                isVisible: this.elements.tema.isVisible,
                hasContent: !!this.getTextContent('tema')
            },
            publicidad: {
                isVisible: this.elements.publicidad.isVisible,
                hasContent: !!(this.elements.publicidad.img?.src)
            }
        };
    }

    /**
     * Configurar animaciones personalizadas
     */
    setAnimationConfig(config) {
        Object.assign(this.animations, config);
        console.log('📺 Configuración de animaciones actualizada:', this.animations);
    }

    /**
     * Destruir el módulo
     */
    destroy() {
        this.hideAll();
        
        // Remover event listeners
        EventBus.off('lower-third-changed');
        EventBus.off('lower-third-auto-hide');
        EventBus.off('publicidad-changed');
        EventBus.off('publicidad-auto-hide');
        EventBus.off('debug-visibility-change');
        
        console.log('📺 Lower Thirds module destroyed');
    }
}

// ===== INSTANCIA GLOBAL =====
export const lowerThirds = new LowerThirds();

// ===== FUNCIONES DE CONVENIENCIA =====
export const LowerThirdsUtils = {
    show: (type, data) => {
        switch (type) {
            case 'invitado':
                lowerThirds.showInvitado(data);
                break;
            case 'tema':
                lowerThirds.showTema(data);
                break;
            case 'lugar':              // ✅ AGREGAR ESTE CASO
                lowerThirds.showLugar(data);
                break;
            case 'publicidad':
                lowerThirds.showPublicidad(data);
                break;
        }
    },
    
    hide: (type) => {
        switch (type) {
            case 'invitado':
                lowerThirds.hideInvitado();
                break;
            case 'tema':
                lowerThirds.hideTema();
                break;
            case 'lugar':              
                lowerThirds.hideLugar();
                break;
            case 'publicidad':
                lowerThirds.hidePublicidad();
                break;
            case 'all':
                lowerThirds.hideAll();
                break;
        }
    },
    
    status: () => lowerThirds.getState(),
    
    update: (type, data) => {
        switch (type) {
            case 'invitado':
                lowerThirds.updateInvitadoContent(data);
                break;
            case 'tema':
                lowerThirds.updateTemaContent(data);
                break;
            case 'lugar':              
                lowerThirds.updateLugarContent(data);
                break;
            case 'publicidad':
                lowerThirds.updatePublicidadContent(data);
                break;
        }
    }
};

console.log('📺 Lower Thirds module loaded');
