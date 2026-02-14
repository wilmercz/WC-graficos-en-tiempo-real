// 🎭 main.js - Sistema Modular v2.0 CORREGIDO - SOLO UNA RUTA
// Responsabilidad: Orquestar todos los módulos del sistema de gráficos

import { EventBus } from './utils/event-bus.js';
import { FirebaseClient, initializeFirebaseClient } from './core/firebase-client.js';
import { dataProcessor } from './core/data-processor.js';
import { scheduler } from './core/scheduler.js';
import { lowerThirds } from './modules/lower-thirds.js';
import { logoManager } from './modules/logo-manager.js';
import { animationEngine } from './modules/animations.js';
import { clockInstance } from './modules/clock.js';
import { debugTools } from './utils/debug-tools.js';
import { SequenceManager } from './modules/sequence-manager.js'; // ✅ IMPORTACIÓN FALTANTE

class StreamGraphicsApp {
    constructor() {
        this.isInitialized = false;
        this.initStartTime = null;
        this.modules = {
            firebaseClient: null,
            dataProcessor: null,
            scheduler: null,
            lowerThirds: null,
            logoManager: null,
            animations: null,
            clock: null,
            debug: null,
            sequenceManager: null // ✅ NUEVO: Gestor de secuencias
        };
        this.performance = {
            initTime: 0,
            lastDataProcessTime: 0,
            totalDataProcessed: 0
        };
    }

    /**
     * 🛡️ Helper para detectar si estamos en modo MONITOR (Solo ver, no tocar)
     */
    isMonitorMode() {
        return new URLSearchParams(window.location.search).has('monitor');
    }

    /**
     * Verificar elementos DOM críticos
     */
    validateCriticalElements() {
        console.log('🔍 Verificando elementos DOM críticos...');
        
        const criticalElements = {
            logo: document.getElementById('logo'),
            invitadoContainer: document.getElementById('grafico-invitado-rol'),
            invitadoH1: document.querySelector('#grafico-invitado-rol h1'),
            invitadoH2: document.querySelector('#grafico-invitado-rol h2'),
            temaContainer: document.getElementById('grafico-tema'),
            temaH1: document.querySelector('#grafico-tema h1'),
            publicidadContainer: document.getElementById('grafico-publicidad'),
            publicidadImg: document.querySelector('#grafico-publicidad img')
        };

        const missing = [];
        Object.entries(criticalElements).forEach(([name, element]) => {
            if (element) {
                console.log(`✅ ${name}: Encontrado`);
            } else {
                console.error(`❌ ${name}: NO ENCONTRADO`);
                missing.push(name);
            }
        });

        if (missing.length > 0) {
            throw new Error(`Elementos DOM críticos faltantes: ${missing.join(', ')}`);
        }

        console.log('✅ Todos los elementos DOM críticos encontrados');
        return criticalElements;
    }

    /**
     * Configuración Firebase integrada
     */
    getFirebaseConfig() {
        return {
            apiKey: "AIzaSyD0lkEDKhia76E6ef3uU0B1lOH8CyklCnc",
            authDomain: "arki-service-autoridades.firebaseapp.com",
            databaseURL: "https://arki-service-autoridades.firebaseio.com",
            projectId: "arki-service-autoridades",
            storageBucket: "arki-service-autoridades.appspot.com",
            messagingSenderId: "829954736380",
            appId: "1:829954736380:web:c4badfee0e0db02dd69779"
        };
    }

    /**
     * Inicializar aplicación completa
     */
    async init() {
        try {
            this.initStartTime = performance.now();
            console.log('🚀 Iniciando Stream Graphics App v2.0...');
            
            // 1. Validar elementos DOM críticos
            this.validateCriticalElements();
            
            // 1.5 Crear elementos dinámicos (Portada)
            this.createCoverElement();
            
            // 2. Configurar Event Bus
            this.setupEventBus();
            
            // 3. Conectar Firebase
            await this.connectFirebase();
            
            // 3.5 Resetear estado remoto (Safety Reset)
            await this.resetRemoteState();
            
            // 4. Inicializar módulos
            this.initializeModules();
            
            // 5. Configurar comunicación entre módulos
            this.setupModuleCommunication();
            
            // 5.5 Activar Listeners de Firebase (AHORA ES SEGURO)
            this.setupSingleFirebaseListener();
            
            // 6. Iniciar scheduler global
            this.startGlobalScheduler();
            
            // 7. Configurar compatibilidad con sistema anterior
            this.setupLegacyCompatibility();
            
            // 8. Configurar herramientas de debug
            this.setupDebugTools();
            
            // 9. Finalizar inicialización
            this.finishInitialization();
            
        } catch (error) {
            console.error('❌ Error crítico inicializando aplicación:', error);
            this.handleInitializationError(error);
            throw error;
        }
    }

    /**
     * 🛡️ Crear elemento de portada dinámicamente
     */
    createCoverElement() {
        if (!document.getElementById('cover-overlay')) {
            const cover = document.createElement('div');
            cover.id = 'cover-overlay';
            
            // 🎥 Elemento de Video (Fondo)
            const video = document.createElement('video');
            video.id = 'cover-video';
            video.loop = true;
            video.muted = false; // 🔊 INTENTO 1: Audio activado por defecto (CameraFi)
            video.playsInline = true;
            
            // ✅ FIX: Atributos explícitos para asegurar compatibilidad
            // video.setAttribute('muted', ''); // 🔊 Comentado para permitir audio
            video.setAttribute('playsinline', '');
            video.setAttribute('loop', '');
            
            const img = document.createElement('img');
            img.id = 'cover-logo';
            img.alt = 'Logo Portada';
            
            cover.appendChild(video); // Primero el video (fondo)
            cover.appendChild(img);
            document.body.appendChild(cover);
            console.log('🛡️ Elemento de portada creado dinámicamente');
        }
    }

    /**
     * Configurar Event Bus
     */
    setupEventBus() {
        console.log('📡 Configurando Event Bus...');
        EventBus.setDebug(true);
        console.log('✅ Event Bus configurado');
    }

    /**
     * Conectar con Firebase
     */
    async connectFirebase() {
        console.log('🔥 Conectando con Firebase...');
        
        const firebaseConfig = this.getFirebaseConfig();
        console.log('🔥 Usando configuración Firebase:', firebaseConfig);
        
        this.modules.firebaseClient = await initializeFirebaseClient(firebaseConfig);
        
        console.log('✅ Firebase conectado');
    }

    /**
     * 🧹 Resetear estado remoto al inicio (Safety Reset)
     * Garantiza que al cargar la página no aparezcan gráficos viejos
     */
    async resetRemoteState() {
        // 1. Protección: No resetear si es monitor (solo visualizador)
        if (this.isMonitorMode()) return;

        // 2. Protección: Permitir omitir reset con ?noreset=true (útil si necesitas refrescar en vivo sin apagar todo)
        if (new URLSearchParams(window.location.search).has('noreset')) {
            console.log('🛡️ Safety Reset omitido por parámetro ?noreset');
            return;
        }

        console.log('🧹 Ejecutando Safety Reset de estado remoto...');
        
        try {
            // Campos a apagar obligatoriamente al inicio
            const resetFields = {
                'Mostrar_Invitado': false,
                'Mostrar_Tema': false,
                'Mostrar_Lugar': false,
                'Mostrar_Publicidad': false,
                'mostrar_secuencia_invitado_tema': false
            };

            const promises = Object.entries(resetFields).map(([field, value]) => {
                const path = `CLAVE_STREAM_FB/STREAM_LIVE/GRAFICOS/${field}`;
                return this.modules.firebaseClient.writeData(path, value);
            });

            await Promise.all(promises);
            console.log('✅ Safety Reset completado: Gráficos apagados en Firebase');
        } catch (error) {
            console.warn('⚠️ Error en Safety Reset:', error);
        }
    }

    /**
     * ⭐ CONFIGURAR SOLO UNA RUTA FIREBASE (como sistema viejo)
     */
    setupSingleFirebaseListener() {
        const UNICA_RUTA = 'CLAVE_STREAM_FB/STREAM_LIVE/GRAFICOS';
        console.log('🔗 Configurando listener ÚNICA RUTA:', UNICA_RUTA);
        
        this.modules.firebaseClient.onDataChange(UNICA_RUTA, (rawData) => {
            this.procesarDatosFirebase(rawData);
        });
        
        console.log('✅ Listener configurado para ruta única');
    }

    /**
     * ⚡ PROCESAMIENTO CORREGIDO DE DATOS FIREBASE
     */
    procesarDatosFirebase(rawData) {
        console.log('📊 Datos RAW recibidos de Firebase:', rawData);
        
        // 🛡️ PROTECCIÓN CONTRA DATOS NULOS O MÓDULOS NO CARGADOS
        if (!rawData || !this.modules.dataProcessor) {
            console.warn('⚠️ Datos nulos o DataProcessor no listo. Ignorando actualización.');
            return;
        }
        
        // ✅ DETECTAR ACTIVACIÓN DE SECUENCIA DESDE FIREBASE
        // Si el campo 'mostrar_secuencia_invitado_tema' está en TRUE y no estamos corriendo, iniciamos.
        if (rawData.mostrar_secuencia_invitado_tema === true) {
            // 🛡️ PROTECCIÓN MULTI-INSTANCIA:
            // Solo la instancia MAESTRA (sin ?monitor=true) ejecuta la lógica.
            if (!this.isMonitorMode()) {
                if (this.modules.sequenceManager && !this.modules.sequenceManager.isActive) {
                    console.log('🎬 Trigger de secuencia detectado: INICIANDO (Modo Maestro)');
                    this.modules.sequenceManager.startGuestAdSequence();
                }
            } else {
                console.log('👀 Modo Monitor: Ignorando ejecución de secuencia local');
            }
        } else {
            // Si el usuario apaga el interruptor manualmente (o viene false), detenemos si está activa
            if (this.modules.sequenceManager && this.modules.sequenceManager.isActive) {
                console.log('🛑 Trigger de secuencia apagado en Firebase: DETENIENDO');
                this.modules.sequenceManager.stopSequence();
            }
        }

        // 📝 LOG DETALLADO DE URLs
        if (rawData.urlLogo) {
            console.log('🖼️ URL Logo encontrada en Firebase:', rawData.urlLogo);
        }
        if (rawData.urlImagenPublicidad) {
            console.log('🖼️ URL Publicidad encontrada en Firebase:', rawData.urlImagenPublicidad);
        }
        
    
        
        // Usar el data processor
        const processedData = this.modules.dataProcessor.process(rawData);
        if (!processedData) return;
        
        // ✅ LÓGICA DE SECUENCIA DE PUBLICIDAD (ROTACIÓN)
        // Si está activa en Firebase, iniciamos el manager y forzamos visibilidad
        if (processedData.visibility.secuenciaPublicidad) {
            if (this.modules.sequenceManager && !this.modules.sequenceManager.isAdRotationActive) {
                this.modules.sequenceManager.startAdRotation();
            }
            // Forzar visibilidad para que el sistema de renderizado lo muestre
            processedData.visibility.publicidadAlAire = true;
        } else {
            if (this.modules.sequenceManager && this.modules.sequenceManager.isAdRotationActive) {
                this.modules.sequenceManager.stopAdRotation();
            }
        }

        console.log('📊 Datos PROCESADOS:', processedData);
        
        // ⚠️ CRÍTICO: Actualizar AMBOS formatos para compatibilidad
        // 1. Formato nuevo (para módulos)
        window.lastProcessedFirebaseData = processedData;
        
        // 2. Formato viejo (para scheduler y funciones legacy)
        window.lastFirebaseData = {
            // ✅ Mapear visibilidad (ESTOS SON LOS CAMPOS REALES)
            logoAlAire: processedData.visibility.logoAlAire,
            graficoAlAire: processedData.visibility.graficoAlAire,
            temaAlAire: processedData.visibility.temaAlAire,
            publicidadAlAire: processedData.visibility.publicidadAlAire,
            horaAlAire: processedData.visibility.horaAlAire,
            portadaAlAire: processedData.visibility.portadaAlAire,
            portadaVideoAlAire: processedData.visibility.portadaVideoAlAire,

            // ✅ Campos originales para compatibilidad total
            Mostrar_Logo: rawData.Mostrar_Logo,
            Mostrar_Invitado: rawData.Mostrar_Invitado,
            Mostrar_Tema: rawData.Mostrar_Tema,
            Mostrar_Publicidad: rawData.Mostrar_Publicidad,
            Mostrar_Hora: rawData.Mostrar_Hora,
            Mostrar_Portada: rawData.Mostrar_Portada,
            Mostar_PortadaVideo: rawData.Mostar_PortadaVideo,
            // ✅ Mapear contenido
            Invitado: processedData.content.invitado,
            Rol: processedData.content.rol,
            Tema: processedData.content.tema,
            Lugar: processedData.content.lugar || rawData.Lugar || 'Sin Lugar',
            
            // ✅ Mapear URLs
            urlLogo: processedData.images.logoUrl,
            urlImagenPublicidad: processedData.images.publicidadUrl,
            
            // ✅ Mapear colores
            colorFondo1: processedData.colors.fondo1,
            colorLetra1: processedData.colors.letra1,
            colorFondo2: processedData.colors.fondo2,
            colorLetra2: processedData.colors.letra2,
            colorFondo3: processedData.colors.fondo3,
            colorLetra3: processedData.colors.letra3,
            colorFondoLogos: processedData.colors.fondoLogos,
            
            // ✅ Mapear duraciones (CRÍTICO para scheduler)
            duracionNombreRol: processedData.timing.duracionNombreRol,
            duracionTema: processedData.timing.duracionTema,
            duracionPublicidad: processedData.timing.duracionPublicidad,
            duracionLogoPrincipal: processedData.timing.duracionLogoPrincipal,
            duracionLogosAliados: processedData.timing.duracionLogosAliados,
            
            // ✅ Mapear configuración automática
            modoAutomatico: processedData.timing.modoAutomatico,
            habilitarOcultamientoAutomatico: processedData.timing.habilitarOcultamientoAutomatico,
            
            // ✅ Mapear animaciones
            animaciones: processedData.animations,
            
            // ✅ TODOS LOS CAMPOS ORIGINALES (para máxima compatibilidad)
            ...rawData
        };
        
        // 📝 LOG DE CONFIRMACIÓN
        console.log('✅ window.lastFirebaseData actualizado:', {
            logoAlAire: window.lastFirebaseData.logoAlAire,
            graficoAlAire: window.lastFirebaseData.graficoAlAire,
            temaAlAire: window.lastFirebaseData.temaAlAire,
            publicidadAlAire: window.lastFirebaseData.publicidadAlAire
        });
        
        // 1️⃣ PRIMERO: Actualizar configuraciones de módulos (Logos, Colores, Textos)
        // Esto asegura que window.logosAliados y logoManager.config estén listos ANTES de intentar rotar
        this.processDataForModules(processedData);

        // 2️⃣ SEGUNDO: Aplicar visibilidad (Ahora sí verá la lista de aliados cargada)
        this.triggerVisibilityChangeImmediate(processedData.visibility);
        
        // Emitir evento para módulos
        EventBus.emit('firebase-data-processed', processedData);
    }

    /**
     * ⚡ TRIGGER INMEDIATO DE VISIBILIDAD
     */
    triggerVisibilityChangeImmediate(visibility) {
        console.log('⚡ Aplicando cambios de visibilidad inmediatamente:', visibility);
        
        // Actualizar configuración global para scheduler
        this.updateGlobalConfig(window.lastFirebaseData);
        
        // Aplicar visibilidad INMEDIATAMENTE (no esperar al scheduler)
        this.applyVisibilityChangesNow(visibility);
    }

    /**
     * ⚡ APLICAR VISIBILIDAD INMEDIATA
     */
    applyVisibilityChangesNow(visibility) {
        console.log('🎬 Ejecutando cambios de visibilidad:', visibility);
    
        // 🔻 RESTO DE ELEMENTOS (invitadoRol, tema, publicidad) - LÓGICA CORREGIDA
        const elementosLowerThird = [
            { tipo: 'lugar', visible: visibility.lugarAlAire, id: 'grafico-lugar' }, // ✅ PRIMERO: Lugar (fondo)
            { tipo: 'invitadoRol', visible: visibility.graficoAlAire, id: 'grafico-invitado-rol' }, // ✅ SEGUNDO: Invitado (encima)
            { tipo: 'tema', visible: visibility.temaAlAire, id: 'grafico-tema' },
            { tipo: 'lugar', visible: visibility.lugarAlAire, id: 'grafico-lugar' },
            { tipo: 'publicidad', visible: visibility.publicidadAlAire, id: 'grafico-publicidad' }
        ];
        
        elementosLowerThird.forEach(({ tipo, visible, id }) => {
            const el = document.getElementById(id);
            if (!el) return;
            
            const isVisible = el.style.display !== 'none';
            if (visible === isVisible) {
                console.log(`⭐ ${tipo}: Sin cambios (${isVisible ? 'visible' : 'oculto'})`);
                return;
            }
            
            console.log(`🔄 ${tipo}: ${isVisible ? 'visible' : 'oculto'} → ${visible ? 'visible' : 'oculto'}`);
            
            if (visible) {
                // ======= MOSTRAR ELEMENTO =======
                el.style.display = (tipo === 'invitadoRol' || tipo === 'lugar') ? 'flex' : 'block';
                
                // ✅ Aplicar animación de entrada con configuración Firebase
                this.modules.animations.applyDynamicAnimationFromOldSystem(el, tipo, true);
                
                // Sincronizar fondo del logo para lower thirds
                /*
                if (tipo === 'invitadoRol' || tipo === 'tema') {
                    const animCfg = window.animacionConfig?.[tipo] || {};
                    const delay = Number(animCfg.delay) || 100;
                    this.animarFondoLogo(true, 400, delay);
                }*/
                
                // ⏰ Iniciar timer automático si está habilitado
                if (window.currentConfig?.modoAutomatico) {
                    // CORRECCIÓN: Mapeo correcto de la propiedad de duración para incluir invitadoRol
                    let durationKey;
                    if (tipo === 'invitado' || tipo === 'invitadoRol') {
                        durationKey = 'duracionNombreRol';
                    } else {
                        durationKey = `duracion${tipo.charAt(0).toUpperCase() + tipo.slice(1)}`;
                    }
                    
                    // ✅ FIX: No iniciar timer global para publicidad si la rotación está activa
                    // Dejamos que el SequenceManager maneje el ocultamiento al finalizar la lista
                    if (tipo === 'publicidad' && this.modules.sequenceManager?.isAdRotationActive) {
                        console.log('⏳ Timer automático omitido para publicidad (Rotación activa)');
                    } else {
                        this.startAutoHideTimer(tipo, window.currentConfig[durationKey]);
                    }
                }
                
            } else {
                // ======= OCULTAR ELEMENTO - USAR LÓGICA DEL SISTEMA VIEJO =======
                console.log(`🔴 Ocultando ${tipo} con animación Firebase`);
                
                // ✅ APLICAR ANIMACIÓN DE SALIDA CON CONFIGURACIÓN FIREBASE
                this.modules.animations.applyDynamicAnimationFromOldSystem(el, tipo, false);
                
                // Sincronizar fondo del logo para lower thirds
                const mostrarFondoLogo = visibility.graficoAlAire || visibility.temaAlAire;
                if ((tipo === 'invitadoRol' || tipo === 'tema') && !mostrarFondoLogo) {
                    const animCfg = window.animacionConfig?.[tipo] || {};
                    const delay = Number(animCfg.delay) || 0;
                    this.animarFondoLogo(false, 400, delay);
                }
                
                // ⏰ Cancelar timer automático
                this.cancelAutoHideTimer(tipo);
            }
        });
        
        // 🖼️ LOGO
        const logoCurrentlyVisible = this.modules.logoManager.isVisible;

        if (visibility.logoAlAire) {
            // ⭐ Solo mostrar si no estaba visible
            if (!logoCurrentlyVisible) {
                console.log('🖼️ Mostrando logo por primera vez');
                this.modules.logoManager.show();
            } else {
                console.log('🖼️ Logo ya visible - preservando estado');
            }
            
            // ⭐ Verificar rotación sin resetear
            if (this.modules.logoManager.config.enabled && this.modules.logoManager.config.aliados.length > 0) {
                const rotationStarted = this.modules.logoManager.startRotation();
                if (rotationStarted && !logoCurrentlyVisible) {
                    console.log('🔄 Rotación iniciada');
                } else if (rotationStarted && logoCurrentlyVisible) {
                    console.log('🔄 Rotación preservada');
                }
            }
            
            this.modules.clock.show();
        } else {
            if (logoCurrentlyVisible) {
                console.log('🖼️ Ocultando logo');  
                this.modules.logoManager.hide();
                this.modules.clock.hide();
            }
        }
        
        if (visibility.horaAlAire) {
            this.modules.clock.show();
        } else {
            this.modules.clock.hide();
        }

        // 🛡️ PORTADA DE EMERGENCIA
        const coverOverlay = document.getElementById('cover-overlay');
        const coverVideo = document.getElementById('cover-video');
        const coverLogo = document.getElementById('cover-logo');

        if (coverOverlay) {
            const showVideo = visibility.portadaVideoAlAire;
            const showStatic = visibility.portadaAlAire;

            if (showVideo || showStatic) {
                if (!coverOverlay.classList.contains('visible')) {
                    console.log('🛡️ Activando PORTADA');
                    coverOverlay.classList.add('visible');
                }

                // Lógica: Video tiene prioridad visual o reemplaza al logo estático
                if (showVideo && coverVideo) {
                    if (coverVideo.style.display !== 'block') {
                        coverVideo.style.display = 'block';
                        
                        // 🔊 AUTOPLAY INTELIGENTE:
                        // 1. Intentar reproducir CON audio (Funciona en CameraFi)
                    }

                    // Ocultamos el logo estático si mostramos video a pantalla completa
                    if (coverLogo) coverLogo.style.display = 'none';

                    // 🔊 AUTOPLAY INTELIGENTE: Reactivar si está pausado
                    if (coverVideo.paused) {
                        coverVideo.currentTime = 0; // Reiniciar video
                        coverVideo.muted = false;
                        coverVideo.play().catch(e => {
                            console.warn('⚠️ Autoplay con audio bloqueado. Activando modo silencio (fallback)...', e);
                            // 2. Si falla, silenciar y reproducir (Funciona en Chrome/Web)
                            coverVideo.muted = true;
                            coverVideo.play().catch(e2 => console.error('❌ Falló incluso silenciado:', e2));
                        });

                        // Ocultamos el logo estático si mostramos video a pantalla completa
                        if (coverLogo) coverLogo.style.display = 'none';
                    }
                } else {
                    // Modo estático (Color + Logo)
                    if (coverVideo) {
                        coverVideo.style.display = 'none';
                        coverVideo.pause();
                    }
                    if (coverLogo) coverLogo.style.display = 'block';
                }
            } else {
                if (coverOverlay.classList.contains('visible')) {
                    console.log('🛡️ Desactivando PORTADA');
                    coverOverlay.classList.remove('visible');
                    // Pausar video al ocultar
                    if (coverVideo) {
                        setTimeout(() => coverVideo.pause(), 800); // Esperar transición
                    }
                }
            }
        }

        /* LO DESACTIVO 2025-08-20, porque la linea: this.modules.animations.applyDynamicAnimationFromOldSystem(el, tipo, false);
            la linea anterior comentada ya aplica animacion por eso lo desactvo este bloque, porqu evitar duplicidad
        // 👤 INVITADO/ROL
        if (visibility.graficoAlAire) {
            console.log('👤 Mostrando invitado inmediatamente');
            const contenido = {
                invitado: window.lastFirebaseData.Invitado || 'Sin Invitado',
                rol: window.lastFirebaseData.Rol || 'Sin Rol'
            };
            this.modules.lowerThirds.showInvitado(contenido);
            
            // ⏰ Iniciar timer automático si está habilitado
            if (window.lastFirebaseData.modoAutomatico) {
                this.startAutoHideTimer('invitado', window.lastFirebaseData.duracionNombreRol);
            }
        } else {
            console.log('👤 Ocultando invitado inmediatamente');
            this.modules.lowerThirds.hideInvitado();
        }
        
        // 📋 TEMA
        if (visibility.temaAlAire) {
            console.log('📋 Mostrando tema inmediatamente');
            const contenido = {
                tema: window.lastFirebaseData.Tema || 'Sin Tema'
            };
            this.modules.lowerThirds.showTema(contenido);
            
            // ⏰ Iniciar timer automático si está habilitado
            if (window.lastFirebaseData.modoAutomatico) {
                this.startAutoHideTimer('tema', window.lastFirebaseData.duracionTema);
            }
        } else {
            console.log('📋 Ocultando tema inmediatamente');
            this.modules.lowerThirds.hideTema();
        }
        
        
        // 📺 PUBLICIDAD
        if (visibility.publicidadAlAire) {
            console.log('📺 Mostrando publicidad inmediatamente');
            const contenido = {
                url: window.lastFirebaseData.urlImagenPublicidad,
                alt: 'Publicidad'
            };
            this.modules.lowerThirds.showPublicidad(contenido);
            
            // ⏰ Iniciar timer automático si está habilitado
            if (window.lastFirebaseData.modoAutomatico) {
                this.startAutoHideTimer('publicidad', window.lastFirebaseData.duracionPublicidad);
            }
        } else {
            console.log('📺 Ocultando publicidad inmediatamente');
            this.modules.lowerThirds.hidePublicidad();
        }
          */  
    }

    /**
     * Procesar datos para módulos
     */
    processDataForModules(data) {
        console.log('📊 Procesando datos para módulos...', data);
        
        // Actualizar contenido de textos
        console.log('📝 Actualizando contenido:', data.content);
        this.modules.lowerThirds.updateInvitadoContent(data.content);
        this.modules.lowerThirds.updateTemaContent(data.content);
        this.modules.lowerThirds.updateLugarContent(data.content);
        
        // 🖼️ APLICAR IMÁGENES SIN ELIMINAR LAS EXISTENTES
        console.log('🖼️ Aplicando imágenes:', data.images);
        this.applyImagesPreservingExisting(data.images);
        
        // Aplicar colores
        console.log('🎨 Aplicando colores:', data.colors);
        this.applyColors(data.colors);
        
        // Configurar animaciones
        console.log('🎬 Configurando animaciones:', data.animations);
        this.updateAnimationConfig(data.animations);
        
        // Configurar logos aliados
        console.log('🖼️ Configurando logos aliados:', data.logos);
        this.updateLogoConfig(data.logos);
    }

    /**
     * 🔧 APLICAR IMÁGENES PRESERVANDO LAS EXISTENTES
     */
    applyImagesPreservingExisting(images) {
        // Logo principal - PRESERVAR IMAGEN EXISTENTE SI NO HAY URL
        if (images.logoUrl) {
    const logoElement = document.getElementById('logo');
    if (logoElement) {
        // ⭐ NUEVA VERIFICACIÓN: No cambiar si hay rotación activa
        const isRotating = this.modules.logoManager.isRotating;
        const currentIndex = this.modules.logoManager.config.currentIndex;
        const isCurrentlyOnMainLogo = currentIndex === 0;
        
        if (logoElement.src !== images.logoUrl) {
            // ⭐ Solo cambiar imagen si:
            // 1. No hay rotación activa, O
            // 2. Estamos actualmente en el logo principal
            if (!isRotating || isCurrentlyOnMainLogo) {
                logoElement.src = images.logoUrl;
                console.log('✅ Logo aplicado:', images.logoUrl);
            } else {
                console.log('🔄 Rotación activa en aliado - NO cambiando imagen del DOM');
                console.log(`   Current index: ${currentIndex}, isRotating: ${isRotating}`);
            }
        } else {
            console.log('ℹ️ Logo ya está actualizado');
        }
        
        // ⭐ SIEMPRE actualizar la configuración (para cuando rote de vuelta)
        this.modules.logoManager.setMainLogo(images.logoUrl, 'Logo Principal');
    }
} else {
    console.log('ℹ️ No hay URL de logo nueva - manteniendo existente');
}

        // Publicidad - PRESERVAR IMAGEN EXISTENTE SI NO HAY URL
        if (images.publicidadUrl) {
            const pubElement = document.getElementById('publicidad-img');
            
            // 🛡️ Si la rotación está activa, IGNORAR la imagen estática de Firebase
            if (this.modules.sequenceManager && this.modules.sequenceManager.isAdRotationActive) {
                console.log('🔄 Rotación de publicidad activa - Ignorando imagen estática de Firebase');
                return; 
            }

            if (pubElement) {
                // ✅ Solo cambiar si hay una URL válida y es diferente a la actual
                if (pubElement.src !== images.publicidadUrl) {
                    pubElement.src = images.publicidadUrl;
                    console.log('✅ Publicidad aplicada:', images.publicidadUrl);
                } else {
                    console.log('ℹ️ Publicidad ya está actualizada');
                }
                
                // Actualizar contenido en módulo
                this.modules.lowerThirds.updatePublicidadContent({
                    url: images.publicidadUrl,
                    alt: 'Publicidad'
                });
            }
        } else {
            console.log('ℹ️ No hay URL de publicidad nueva - manteniendo existente');
        }

        // 🛡️ Logo Portada
        if (images.portadaLogoUrl) {
            const coverLogo = document.getElementById('cover-logo');
            if (coverLogo && coverLogo.src !== images.portadaLogoUrl) {
                coverLogo.src = images.portadaLogoUrl;
                console.log('✅ Logo de portada actualizado');
            }
        }

        // 🎥 Video Portada
        if (images.portadaVideoUrl) {
            const coverVideo = document.getElementById('cover-video');
            if (coverVideo && coverVideo.src !== images.portadaVideoUrl) {
                coverVideo.src = images.portadaVideoUrl;
                console.log('✅ Video de portada actualizado');
            }
        }
    }

    /**
     * Aplicar colores a elementos
     */
    applyColors(colors) {
        console.log('🎨 Aplicando colores:', colors);
        
        // Aplicar colores al contenedor invitado/rol
        const contenedorInvitadoRol = document.getElementById('grafico-invitado-rol');
        if (contenedorInvitadoRol) {
            // Fondo del contenedor

            if (colors.fondo1) {
                const base = colors.fondo1;
                const dark = darkenColor(base, 0.14);   // oscurecido arriba/abajo
                const light = lightenColor(base, 0.10); // brillo superior sutil

                // Limpia shorthand por si algo pisa el fondo
                contenedorInvitadoRol.style.removeProperty('background');

                // Capa base
                contenedorInvitadoRol.style.setProperty('background-color', base, 'important');

                // Capa PRO: brillo arriba + centro limpio + sombra abajo
                contenedorInvitadoRol.style.setProperty(
                    'background-image',
                    `
                    linear-gradient(180deg,
                        rgba(255,255,255,0.18) 0%,
                        ${light} 12%,
                        ${base} 45%,
                        ${base} 55%,
                        ${dark} 100%
                    )
                    `,
                    'important'
                );

                contenedorInvitadoRol.style.setProperty('background-repeat', 'no-repeat', 'important');
                contenedorInvitadoRol.style.setProperty('background-size', '100% 100%', 'important');
            }



            // Color del título (H1)
            const titulo = contenedorInvitadoRol.querySelector('h1');
            if (titulo && colors.letra1) {
                titulo.style.setProperty('color', colors.letra1, 'important');
            }
            
            // Color del subtítulo (H2)
            const subtitulo = contenedorInvitadoRol.querySelector('h2');
            if (subtitulo && colors.letra2) {
                subtitulo.style.setProperty('color', colors.letra2, 'important');
            }
        }
        
        // Aplicar colores al tema
        const temaContainer = document.getElementById('grafico-tema');  // ← CONTAINER, no H1
        const temaH1 = temaContainer?.querySelector('h1');

        /*if (temaContainer && colors.fondo3) {
            // Aplicar fondo al CONTAINER
            temaContainer.style.setProperty('background-color', colors.fondo3, 'important');
            temaContainer.style.setProperty('border-radius', '5px');
        }*/

        if (temaContainer && colors.fondo2) {
    const base = colors.fondo2;
    const dark = darkenColor(base, 0.14);
    const light = lightenColor(base, 0.10);

    temaContainer.style.removeProperty('background');

    temaContainer.style.setProperty('background-color', base, 'important');
    temaContainer.style.setProperty(
        'background-image',
        `
        linear-gradient(180deg,
            rgba(255,255,255,0.18) 0%,
            ${light} 12%,
            ${base} 45%,
            ${base} 55%,
            ${dark} 100%
        )
        `,
        'important'
    );

    temaContainer.style.setProperty('background-repeat', 'no-repeat', 'important');
    temaContainer.style.setProperty('background-size', '100% 100%', 'important');
    temaContainer.style.setProperty('border-radius', '5px');
}



        if (temaH1 && colors.letra1) {
            // Solo COLOR al texto (sin fondo)
            temaH1.style.setProperty('color', colors.letra1, 'important');
        }

        // ✅ Aplicar colores al LUGAR (Nuevo)
        const lugarContainer = document.getElementById('grafico-lugar');
        const lugarH1 = lugarContainer?.querySelector('h1');
        if (lugarH1 && colors.fondo1 && colors.letra3) {
            lugarH1.style.setProperty('background-color', colors.fondo3, 'important');
            lugarH1.style.setProperty('color', colors.letra3, 'important');
        }

/* CODIGO ANTERIOR
        const temaElement = document.getElementById('grafico-tema');
        if (temaElement && colors.fondo3 && colors.letra3) {
            temaElement.style.setProperty('background-color', colors.fondo3, 'important');
            temaElement.style.setProperty('color', colors.letra3, 'important');
        }*/
        
        // Configurar color de fondo para logos
        if (colors.fondoLogos) {
            window.logoConfig = window.logoConfig || {};
            window.logoConfig.colores = window.logoConfig.colores || {};
            window.logoConfig.colores.fondoLogos = colors.fondoLogos;
        }

        // 🛡️ Aplicar color dinámico a la PORTADA
        const coverOverlay = document.getElementById('cover-overlay');
        if (coverOverlay && colors.portadaFondo) {
            const base = colors.portadaFondo;
            // Oscurecer el color base un 40% para el borde exterior (simulando el efecto original)
            const dark = darkenColor(base, 0.40); 
            
            coverOverlay.style.background = `radial-gradient(circle at center, ${base} 0%, ${dark} 100%)`;
        }
    }




    
    /**
     * Actualizar configuración de animaciones
     */
    updateAnimationConfig(animations) {
        console.log('🎬 Actualizando configuración de animaciones');
        
        if (animations && Object.keys(animations).length > 0) {
            // Actualizar configuración global
            window.animacionConfig = animations;
            
            // Actualizar duraciones en el engine de animaciones
            const durations = {};
            Object.entries(animations).forEach(([key, config]) => {
                if (config.duracion) {
                    durations[key] = config.duracion;
                }
            });
            
            this.modules.animations.setDefaultDurations(durations);
        }
    }

    /**
     * Actualizar configuración de logos
     */
    updateLogoConfig(logos) {
        console.log('🖼️ Actualizando configuración de logos');
        
        if (logos) {
            // ⭐ CORRECCIÓN: Solo cambiar rotación si realmente cambió
            const currentlyEnabled = this.modules.logoManager.config.enabled;
            if (currentlyEnabled !== logos.habilitado) {
                console.log(`🔄 Cambiando rotación: ${currentlyEnabled} → ${logos.habilitado}`);
                this.modules.logoManager.enableRotation(logos.habilitado);
            } else {
                console.log('📌 Rotación sin cambios - preservando estado');
            }
            
            // Actualizar configuración sin resetear
            this.modules.logoManager.updateConfig({
                enabled: logos.habilitado,
                continuousCycle: logos.cicloContinuo
            });
            
            // ⭐ CORRECCIÓN: Solo actualizar logos aliados si cambió la lista
            if (logos.lista && Array.isArray(logos.lista)) {
                const currentAliados = this.modules.logoManager.config.aliados || [];
                const newAliados = logos.lista;
                
                // Comparar si cambió la configuración
                const hasChanged = !this.arraysEqual(
                    currentAliados.map(a => a.url),
                    newAliados.map(a => a.url)
                );
                
                if (hasChanged || currentAliados.length === 0) {
                    console.log('🔄 Lista de logos cambió - actualizando');
                    this.modules.logoManager.config.aliados = [];
                    logos.lista.forEach(logo => this.modules.logoManager.addAliadoLogo(logo));

                    // ⭐ Precarga simple solo si cambió
                    this.modules.logoManager.config.aliados.forEach(l => {
                        const img = new Image();
                        img.src = l.url;
                    });
                } else {
                    console.log('📌 Lista de logos sin cambios - preservando');
                }
            }
            
            // Actualizar variables globales para compatibilidad
            window.logoConfig = this.modules.logoManager.config;
            window.logosAliados = this.modules.logoManager.config.aliados;
            
            console.log('🖼️ Estado final logo config:', {
                enabled: window.logoConfig.enabled,
                aliados: window.logosAliados?.length || 0,
                preservedState: true  // ⭐ Indicador de que se preservó el estado
            });
        }
    }

    /**
     * Inicializar módulos
     */
    initializeModules() {
        console.log('📦 Inicializando módulos...');
        
        // Data Processor
        this.modules.dataProcessor = dataProcessor;
        
        // Animation Engine
        this.modules.animations = animationEngine;
        this.modules.animations.init();
        
        // Lower Thirds
        this.modules.lowerThirds = lowerThirds;
        this.modules.lowerThirds.init();
        
        // Logo Manager
        this.modules.logoManager = logoManager;
        this.modules.logoManager.init();
        
        // Clock
        this.modules.clock = clockInstance;
        this.modules.clock.init();
        
        // Scheduler
        this.modules.scheduler = scheduler;
        
        // Debug Tools
        this.modules.debug = debugTools;
        
        // ✅ Sequence Manager (Instanciado aquí mismo para simplificar)
        this.modules.sequenceManager = new SequenceManager(this);

        console.log('✅ Módulos inicializados');
    }

    /**
     * Configurar comunicación entre módulos
     */
    setupModuleCommunication() {
        console.log('🔗 Configurando comunicación entre módulos...');
        
        // Firebase Data → Procesamiento
        EventBus.on('firebase-data-processed', (data) => {
            console.log('📊 Datos procesados para módulos...', data);
        });

        // Scheduler → Logo Manager
        EventBus.on('logo-visibility-changed', (data) => {
            if (data.visible) {
                this.modules.logoManager.show();
                this.modules.clock.show();
            } else {
                this.modules.logoManager.hide();
                this.modules.clock.hide();
            }
        });

        EventBus.on('logo-rotate', (data) => {
            this.modules.logoManager.rotateTo(data.index);
        });

        /* === desactivado 2025-08-20: lower-third-changed ===
        // Scheduler → Lower Thirds
        EventBus.on('lower-third-changed', (data) => {
            if (data.visible) {
                if (data.type === 'invitado') {
                    lowerThirds.hideTema();
                    lowerThirds.showInvitado();
                    //this.modules.lowerThirds.showInvitado();
                } else if (data.type === 'tema') {
                    //this.modules.lowerThirds.showTema();
                    lowerThirds.hideInvitado();
                    lowerThirds.showTema();
                }
            } else {
                lowerThirds.hideAll();
                //if (data.type === 'invitado') {
                //    this.modules.lowerThirds.hideInvitado();
                //} else if (data.type === 'tema') {
                 //   this.modules.lowerThirds.hideTema();
                //}
            }
        });
        === fin === */

        /* === desactivado 2025-08-20: lower-third-auto-hide ===
        EventBus.on('lower-third-auto-hide', (data) => {
            this.modules.lowerThirds.autoHide(data.type);
        });
         === fin === */

        /* === desactivado 2025-08-20: publicidad-changed ===
        // Scheduler → Publicidad
        EventBus.on('publicidad-changed', (data) => {
            if (data.visible) {
                this.modules.lowerThirds.showPublicidad();
            } else {
                this.modules.lowerThirds.hidePublicidad();
            }
        });
        === fin === */

        
        /* === desactivado 2025-08-20: publicidad-auto-hide ===
        EventBus.on('publicidad-auto-hide', () => {
            this.modules.lowerThirds.hidePublicidad();
        });
        === fin === */

        // Clock updates
        EventBus.on('clock-update', (data) => {
            // El reloj se actualiza automáticamente
        });

        console.log('✅ Comunicación entre módulos configurada');
    }

    /**
     * Iniciar scheduler global
     */
    startGlobalScheduler() {
        console.log('⏰ Iniciando scheduler global...');
        
        // Habilitar reloj
        this.modules.scheduler.enableClock(true);
        
        // Agregar tareas personalizadas
        this.modules.scheduler.addTask('heartbeat', () => {
            console.log('🔄 Ejecutando tarea: heartbeat');
        }, { interval: 60000 });
        
        this.modules.scheduler.addTask('sync-check', () => {
            console.log('🔄 Ejecutando tarea: sync-check');
        }, { interval: 30000 });
        
        // Iniciar scheduler
        const started = this.modules.scheduler.start();
        
        if (!started) {
            throw new Error('No se pudo iniciar el scheduler global');
        }
        
        console.log('✅ Scheduler global iniciado');
    }

    /**
     * Configurar compatibilidad con sistema anterior
     */
    setupLegacyCompatibility() {
        console.log('🔄 Configurando compatibilidad con sistema anterior...');
        
        // Funciones globales para compatibilidad
        window.StreamModules = this.modules;
        window.StreamApp = this;
        
        // Variables globales que el sistema viejo espera
        window.currentConfig = {
            duracionNombreRol: 45,
            duracionTema: 45,
            duracionPublicidad: 30,
            duracionLogoPrincipal: 60,
            duracionLogosAliados: 45,
            modoAutomatico: true,
            habilitarOcultamientoAutomatico: true,
            habilitarRotacionLogos: false
        };
        
        window.logoConfig = {
            habilitado: false,
            duraciones: {
                principal: 60,
                aliados: 45
            },
            cicloContinuo: true,
            colores: {}
        };
        
        window.animacionConfig = {
            invitadoRol: {
                delay: 200,
                duracion: 600,
                easing: 'EASE_IN_OUT',
                entrada: 'SLIDE_IN_RIGHT',
                salida: 'SLIDE_OUT_LEFT'
            },
            tema: {
                delay: 200,
                duracion: 600,
                easing: 'EASE_IN_OUT',
                entrada: 'SLIDE_IN_LEFT',
                salida: 'SLIDE_OUT_TOP'
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
            },
            lugar: {
                delay: 200,
                duracion: 600,
                easing: 'EASE_IN_OUT',
                entrada: 'WIPE_IN_RIGHT',
                salida: 'WIPE_OUT_LEFT'
            }
        };
        
        // Función de aplicar animación dinámica para compatibilidad
        window.aplicarAnimacionDinamica = (element, type, show, config) => {
            console.log(`🌍 GLOBAL aplicarAnimacionDinamica: ${type} - ${show ? 'mostrar' : 'ocultar'}`);
            return animationEngine.applyDynamicAnimationFromOldSystem(element, type, show, config);
        };
        
        // ✅ AGREGADO: Función global para actualizar visibilidad (necesaria para lower-thirds.js via scheduler)
        window.actualizarVisibilidadEnFirebase = (fieldName, value) => {
            this.updateFirebaseVisibility(fieldName, value);
        };

        console.log('✅ Compatibilidad configurada');
    }

    /**
     * Configurar herramientas de debug
     */
    setupDebugTools() {
        console.log('🔧 Configurando herramientas de debug...');
        
        this.modules.debug.enable(true);
        
        // Configurar StreamDebug global mejorado
        window.StreamDebug = {
            // ⚡ Funciones de testing inmediato
            test: {
                mostrarInvitado: () => {
                    console.log('🧪 TEST: Mostrando invitado...');
                    const testVisibility = { graficoAlAire: true, temaAlAire: false, logoAlAire: false, publicidadAlAire: false };
                    this.applyVisibilityChangesNow(testVisibility);
                },
                mostrarTema: () => {
                    console.log('🧪 TEST: Mostrando tema...');
                    const testVisibility = { graficoAlAire: false, temaAlAire: true, logoAlAire: false, publicidadAlAire: false };
                    this.applyVisibilityChangesNow(testVisibility);
                },
                mostrarLogo: () => {
                    console.log('🧪 TEST: Mostrando logo...');
                    const testVisibility = { graficoAlAire: false, temaAlAire: false, logoAlAire: true, publicidadAlAire: false };
                    this.applyVisibilityChangesNow(testVisibility);
                },
                mostrarPublicidad: () => {
                    console.log('🧪 TEST: Mostrando publicidad...');
                    const testVisibility = { graficoAlAire: false, temaAlAire: false, logoAlAire: false, publicidadAlAire: true };
                    this.applyVisibilityChangesNow(testVisibility);
                },
                ocultarTodo: () => {
                    console.log('🧪 TEST: Ocultando todo...');
                    const testVisibility = { graficoAlAire: false, temaAlAire: false, logoAlAire: false, publicidadAlAire: false };
                    this.applyVisibilityChangesNow(testVisibility);
                }
            },
            
            // 📊 Estado del sistema
            status: () => {
                return {
                    lastFirebaseData: window.lastFirebaseData,
                    currentConfig: window.currentConfig,
                    modules: window.StreamModules,
                    autoHideTimers: Object.keys(window.autoHideTimers || {}),
                    scheduler: window.StreamModules.scheduler.getState(),
                    performance: this.performance
                };
            },
            
            // 🔧 Funciones originales
            debug: () => this.modules.debug.debugCompleto(),
            estado: () => this.modules.debug.estadoSistema(),
            temporizadores: () => this.modules.debug.investigarTemporizadores(),
            limpiar: () => this.modules.debug.limpiarEstilos(),
            
            // 🔧 Ayuda
            help: () => {
                console.log('🔧 COMANDOS DE DEBUG DISPONIBLES:');
                console.log('   StreamDebug.test.mostrarInvitado() - Mostrar invitado');
                console.log('   StreamDebug.test.mostrarTema() - Mostrar tema');
                console.log('   StreamDebug.test.mostrarLogo() - Mostrar logo + rotar');
                console.log('   StreamDebug.test.mostrarPublicidad() - Mostrar publicidad');
                console.log('   StreamDebug.test.ocultarTodo() - Ocultar todo');
                console.log('   StreamDebug.status() - Ver estado completo');
                console.log('   StreamDebug.debug() - Análisis completo');
                console.log('   --- SECUENCIAS ---');
                console.log('   StreamDebug.secuencia.iniciar() - Iniciar secuencia Invitado+Publicidad');
                console.log('   StreamDebug.secuencia.agregarAd(url) - Agregar publicidad a la playlist');
            }
        };
        
        console.log('✅ Debug tools configurado');
        console.log('   💡 Usa: window.StreamDebug.help() para ver comandos');
    }

    // ✅ EXTENSIÓN DEBUG PARA SECUENCIAS
    setupSequenceDebug() {
        if (!window.StreamDebug) return;
        window.StreamDebug.secuencia = {
            iniciar: () => this.modules.sequenceManager.startGuestAdSequence(),
            detener: () => this.modules.sequenceManager.stopSequence(),
            agregarAd: (url) => this.modules.sequenceManager.addAdToPlaylist(url),
            verPlaylist: () => console.log(this.modules.sequenceManager.adPlaylist)
        };
    }

    /**
     * Finalizar inicialización
     */
    finishInitialization() {
        this.isInitialized = true;
        this.performance.initTime = performance.now() - this.initStartTime;
        
        // Configurar debug de secuencias
        this.setupSequenceDebug();

        // Emitir evento de inicialización completa
        EventBus.emit('app-initialized');
        
        console.log(`✅ Stream Graphics App iniciada en ${this.performance.initTime.toFixed(0)}ms`);
    }

    /**
     * Manejar errores de inicialización
     */
    handleInitializationError(error) {
        EventBus.emit('app-initialization-error', error);
        
        // Mostrar error en pantalla si es necesario
        const statusElement = document.getElementById('status');
        if (statusElement) {
            statusElement.innerHTML = `
                <div style="color: red; background: rgba(255,0,0,0.1); padding: 10px; border-radius: 5px;">
                    ❌ Error de inicialización: ${error.message}
                </div>
            `;
        }
    }

    /**
     * ⏰ TIMER AUTOMÁTICO CORREGIDO
     */
    startAutoHideTimer(elementType, duration) {
        // 🛡️ PROTECCIÓN: Los monitores NO deben gestionar tiempos ni escribir en Firebase
        if (this.isMonitorMode()) return;

        // Inicializar contenedor de timers si no existe
        if (!window.autoHideTimers) {
            window.autoHideTimers = {};
        }
        
        // Limpiar timer previo si existe
        if (window.autoHideTimers[elementType]) {
            clearTimeout(window.autoHideTimers[elementType]);
        }
        
        if (!duration || duration <= 0) return;
        
        console.log(`⏰ Iniciando timer auto-hide para ${elementType}: ${duration}s`);
        
        window.autoHideTimers[elementType] = setTimeout(() => {
            console.log(`⏰ Auto-ocultando ${elementType} después de ${duration}s`);
            
            // ✅ USAR LA MISMA LÓGICA QUE EL SISTEMA VIEJO
            const elementMap = {
                'invitadoRol': 'grafico-invitado-rol',
                'invitado': 'grafico-invitado-rol', // ✅ AGREGADO: Compatibilidad por seguridad
                'tema': 'grafico-tema', 
                'publicidad': 'grafico-publicidad',
                'lugar': 'grafico-lugar'
            };
            
            const el = document.getElementById(elementMap[elementType]);
            if (!el) return;
            
            // ✅ APLICAR ANIMACIÓN DE SALIDA CON CONFIGURACIÓN FIREBASE
            this.modules.animations.applyDynamicAnimationFromOldSystem(el, elementType, false);
            
            // ✅ ACTUALIZAR FIREBASE DESPUÉS DE LA ANIMACIÓN (como sistema viejo)
            const animCfg = window.animacionConfig?.[elementType] || {};
            const totalTime = (Number(animCfg.delay) || 0) + (Number(animCfg.duracion) || 600) + 100;
            
            setTimeout(() => {
                this.updateFirebaseVisibility(elementType, false);
            }, totalTime);
            
            delete window.autoHideTimers[elementType];
        }, duration * 1000);
    }

    /**
     * ⏰ CANCELAR TIMER AUTOMÁTICO
     */
    cancelAutoHideTimer(elementType) {
        if (window.autoHideTimers?.[elementType]) {
            clearTimeout(window.autoHideTimers[elementType]);
            delete window.autoHideTimers[elementType];
            console.log(`⌛ Timer cancelado para ${elementType}`);
        }
    }

    /**
     * 🔄 ACTUALIZAR FIREBASE (cuando se oculta automáticamente)
     */
    async updateFirebaseVisibility(fieldName, value) {
        try {
            if (this.modules.firebaseClient) {
                // ✅ MAPEO DE CAMPOS: Convertir nombre interno a nombre de campo Firebase
                const fieldMap = {
                    'invitadoRol': 'Mostrar_Invitado',
                    'invitado': 'Mostrar_Invitado',
                    'tema': 'Mostrar_Tema',
                    'publicidad': 'Mostrar_Publicidad',
                    'lugar': 'Mostrar_Lugar',
                    'logo': 'Mostrar_Logo'
                };

                const firebaseField = fieldMap[fieldName] || fieldName;
                const path = `CLAVE_STREAM_FB/STREAM_LIVE/GRAFICOS/${firebaseField}`;
                await this.modules.firebaseClient.writeData(path, value);
                console.log(`✅ Firebase actualizado: ${firebaseField} (${fieldName}) = ${value}`);
            }
        } catch (error) {
            console.error('❌ Error actualizando Firebase:', error);
        }
    }

    /**
     * ⚙️ ACTUALIZAR CONFIGURACIÓN GLOBAL
     */
    updateGlobalConfig(data) {
        // Actualizar window.currentConfig para compatibilidad
        window.currentConfig = {
            duracionNombreRol: data.duracionNombreRol || 45,
            duracionTema: data.duracionTema || 45,
            duracionPublicidad: data.duracionPublicidad || 30,
            duracionLogoPrincipal: data.duracionLogoPrincipal || 60,
            duracionLogosAliados: data.duracionLogosAliados || 45,
            modoAutomatico: data.modoAutomatico !== false,
            habilitarOcultamientoAutomatico: data.habilitarOcultamientoAutomatico !== false,
            habilitarRotacionLogos: data.habilitarRotacionLogos || false
        };
        
        // Actualizar configuración de animaciones
        if (data.animaciones) {
            window.animacionConfig = data.animaciones;
        }
        
        console.log('⚙️ Configuración global actualizada:', window.currentConfig);
    }

    /**
     * Obtener estado de la aplicación
     */
    getStatus() {
        return {
            isInitialized: this.isInitialized,
            initTime: this.performance.initTime,
            modules: Object.keys(this.modules).reduce((acc, key) => {
                acc[key] = {
                    loaded: !!this.modules[key],
                    type: this.modules[key]?.constructor?.name
                };
                return acc;
            }, {}),
            scheduler: this.modules.scheduler?.getState(),
            firebase: this.modules.firebaseClient?.getConnectionState()
        };
    }

    /**
     * Reiniciar aplicación
     */
    async restart() {
        console.log('🔄 Reiniciando aplicación...');
        
        try {
            // Detener scheduler
            this.modules.scheduler?.stop();
            
            // Limpiar módulos
            Object.values(this.modules).forEach(module => {
                if (module && typeof module.destroy === 'function') {
                    module.destroy();
                }
            });
            
            // Limpiar timers automáticos
            if (window.autoHideTimers) {
                Object.values(window.autoHideTimers).forEach(timer => clearTimeout(timer));
                window.autoHideTimers = {};
            }
            
            // Reinicializar
            this.isInitialized = false;
            await this.init();
            
            console.log('✅ Aplicación reiniciada exitosamente');
            
        } catch (error) {
            console.error('❌ Error reiniciando aplicación:', error);
            throw error;
        }
    }

    /**
     * Comparar si dos arrays son iguales
     */
    arraysEqual(arr1, arr2) {
        if (!arr1 || !arr2) return false;
        if (arr1.length !== arr2.length) return false;
        return arr1.every((val, index) => val === arr2[index]);
    }

    /**
     * 🎨 FUNCIÓN PARA ANIMAR FONDO DEL LOGO
     */
    animarFondoLogo(mostrar, duracion = 400, delay = 0) {
        const logo = document.getElementById('logo');
        if (!logo) {
            console.warn('⚠️ Elemento logo no encontrado para animar fondo');
            return;
        }

        const colorFondo = window.logoConfig?.colores?.fondoLogos;
        
        // ✅ CONDICIÓN MEJORADA: Detecta 'transparent' como "sin fondo"
        const esTransparenteOVacio = !colorFondo || 
                                    colorFondo === 'null' || 
                                    colorFondo.trim() === '' ||
                                    colorFondo.toLowerCase() === 'transparent' ||
                                    colorFondo === 'rgba(0,0,0,0)' ||
                                    colorFondo === 'rgba(0, 0, 0, 0)';
        
        if (esTransparenteOVacio) {
            console.log('ℹ️ Sin color de fondo real configurado → No animar');
            return;
        }

        console.log(`🎭 Animando fondo logo: ${mostrar ? 'MOSTRAR' : 'OCULTAR'} (${colorFondo})`);
        
        // Configurar transición
        logo.style.transition = `background-color ${duracion}ms ease-in-out ${delay}ms, padding ${duracion}ms ease-in-out ${delay}ms`;
        
        if (mostrar) {
            setTimeout(() => {
                logo.style.backgroundColor = colorFondo;
                logo.style.padding = '8px';
                console.log(`✅ Fondo logo VISIBLE: ${colorFondo}`);
            }, delay);
        } else {
            setTimeout(() => {
                logo.style.backgroundColor = 'transparent';
                logo.style.padding = '0px';
                console.log('✅ Fondo logo OCULTO');
            }, delay);
        }
    }
}

// ===== INICIALIZACIÓN AUTOMÁTICA =====
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🌟 DOM listo - Inicializando Stream Graphics App...');
    
    try {
        const app = new StreamGraphicsApp();
        
        // Hacer disponible globalmente
        window.StreamGraphicsApp = app;
        
        // Configurar listeners para errores no manejados
        EventBus.on('app-initialized', () => {
            console.log('🎉 Aplicación inicializada exitosamente');
        });
        
        EventBus.on('app-initialization-error', (error) => {
            console.error('💥 Error de inicialización:', error);
        });
        
        // Inicializar
        await app.init();
        
        // Mostrar panel de debug en desarrollo
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            console.log('🔧 Panel de debug mostrado automáticamente (desarrollo)');
        }
        
    } catch (error) {
        console.error('💥 Error fatal inicializando aplicación:', error);
        
        // Mostrar error en pantalla
        document.body.innerHTML += `
            <div style="position: fixed; top: 10px; right: 10px; background: rgba(255,0,0,0.9); color: white; padding: 15px; border-radius: 5px; font-family: monospace; z-index: 9999; max-width: 400px;">
                <h3>❌ Error Crítico</h3>
                <p><strong>Mensaje:</strong> ${error.message}</p>
                <p><strong>Archivo:</strong> main.js</p>
                <p><small>Revisa la consola para más detalles</small></p>
                <button onclick="location.reload()" style="background: white; color: red; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer; margin-top: 10px;">
                    🔄 Recargar Página
                </button>
            </div>
        `;
    }
});

console.log('🎭 Main application module loaded');

// ===== ACTIVACIÓN AUTOMÁTICA DE ANIMACIONES ENHANCED =====
document.addEventListener('DOMContentLoaded', () => {
    // Esperar a que todo esté cargado
    setTimeout(() => {
        console.log('🎨 Activando animaciones Enhanced automáticamente...');
        
        // 1. CONFIGURACIÓN FIJA DE ANIMACIONES ENHANCED
        window.animacionConfig = window.animacionConfig || {};
        window.animacionConfig.logo = {
            entrada: 'LOGO_FLIP_3D',
            salida: 'LOGO_FLIP_3D',
            duracion: 600,
            delay: 0,
            easing: 'EASE_IN_OUT'
        };

        // 2. PROTEGER CONFIGURACIÓN CONTRA SOBRESCRITURA
        Object.defineProperty(window.animacionConfig, 'logo', {
            value: {
                entrada: 'LOGO_FLIP_3D',
                salida: 'LOGO_FLIP_3D', 
                duracion: 600,
                delay: 0,
                easing: 'EASE_IN_OUT'
            },
            writable: false,
            configurable: false
        });

        // 3. FORZAR MÉTODOS ENHANCED
        if (window.StreamModules?.logoManager) {
            const logoManager = window.StreamModules.logoManager;
            
            // Backup de métodos originales
            logoManager._originalAnimateIn = logoManager.animateIn;
            logoManager._originalAnimateOut = logoManager.animateOut;
            logoManager._originalChangeLogo = logoManager.changeLogo;
            
            // Reemplazar con versiones Enhanced
            logoManager.animateIn = function() {
                if (this.animateInEnhanced) {
                    this.animateInEnhanced();
                } else {
                    this._originalAnimateIn();
                }
            };
            
            logoManager.animateOut = function() {
                if (this.animateOutEnhanced) {
                    this.animateOutEnhanced();
                } else {
                    this._originalAnimateOut();
                }
            };
            
            logoManager.changeLogo = function(targetLogo, nextDuration = null) {
                if (this.changeLogoEnhanced) {
                    this.changeLogoEnhanced(targetLogo, nextDuration);
                } else {
                    this._originalChangeLogo(targetLogo, nextDuration);
                }
            };

            // 4. TIMING MEJORADO PARA CHANGELOGO
            logoManager.changeLogoEnhanced = function(targetLogo, nextDuration = null) {
                if (!this.element) return;

                // 🛡️ PROTECCIÓN RED LENTA (ENHANCED)
                // No iniciar animación hasta que la imagen esté en memoria
                const preloader = new Image();
                preloader.src = targetLogo.url;

                const runAnimation = () => {
                    const realDuration = 600;
                    
                    // Aplicar animación de salida
                    this.animateOutEnhanced();

                    // Timing optimizado
                    setTimeout(() => {
                        this.element.src = targetLogo.url;
                        this.element.alt = targetLogo.alt;

                        // Entrada después de cambiar
                        setTimeout(() => {
                            this.animateInEnhanced();
                        }, 100);
                    }, realDuration + 200);
                };

                if (preloader.complete) {
                    runAnimation();
                } else {
                    console.log('⏳ (Enhanced) Esperando imagen:', targetLogo.name);
                    preloader.onload = runAnimation;
                    // Si falla, no hacemos nada para no dejar el hueco vacío
                }
            };
            
            console.log('✅ Animaciones Enhanced activadas permanentemente');
        }
        
    }, 3000); // Esperar 3 segundos para que todo esté cargado
});

// ===== FUNCIONES GLOBALES PARA CAMBIAR ANIMACIONES =====
window.changeLogoAnimation = function(type) {
    const configs = {
        'flip': 'LOGO_FLIP_3D',      // Corporativo elegante
        'zoom': 'LOGO_ZOOM_ROTATE',  // Dinámico deportivo  
        'cube': 'LOGO_CUBE',         // Dramático impactante
        'spin': 'LOGO_SLIDE_SPIN',   // Energético divertido
        'bounce': 'LOGO_BOUNCE',     // Juguetón rebote
        'liquid': 'LOGO_LIQUID'      // Artístico fluido
    };
    
    const animationType = configs[type];
    if (!animationType) {
        console.warn('❌ Tipos disponibles: flip, zoom, cube, spin, bounce, liquid');
        return;
    }
    
    // Aplicar nueva configuración
    window.animacionConfig.logo.entrada = animationType;
    window.animacionConfig.logo.salida = animationType;
    
    console.log(`🎨 Animación cambiada a: ${type.toUpperCase()} (${animationType})`);
    
    // Probar inmediatamente
    if (window.StreamModules?.logoManager) {
        setTimeout(() => {
            window.StreamModules.logoManager.rotateNext();
        }, 500);
    }
};

console.log('🎨 Sistema de animaciones Enhanced cargado permanentemente');

// ===== FUNCIONES DE UTILIDAD PARA COLORES (FALTANTES) =====
function darkenColor(hex, percent) {
    if (!hex) return '#000000';
    
    // Asegurar formato #RRGGBB
    hex = hex.replace(/^\s*#|\s*$/g, '');
    if (hex.length === 3) {
        hex = hex.replace(/(.)/g, '$1$1');
    }
    
    let r = parseInt(hex.substr(0, 2), 16);
    let g = parseInt(hex.substr(2, 2), 16);
    let b = parseInt(hex.substr(4, 2), 16);

    if (isNaN(r) || isNaN(g) || isNaN(b)) return '#000000';

    r = Math.floor(r * (1 - percent));
    g = Math.floor(g * (1 - percent));
    b = Math.floor(b * (1 - percent));

    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

function lightenColor(hex, percent) {
    if (!hex) return '#ffffff';
    
    hex = hex.replace(/^\s*#|\s*$/g, '');
    if (hex.length === 3) {
        hex = hex.replace(/(.)/g, '$1$1');
    }

    let r = parseInt(hex.substr(0, 2), 16);
    let g = parseInt(hex.substr(2, 2), 16);
    let b = parseInt(hex.substr(4, 2), 16);

    if (isNaN(r) || isNaN(g) || isNaN(b)) return '#ffffff';

    r = Math.floor(r + (255 - r) * percent);
    g = Math.floor(g + (255 - g) * percent);
    b = Math.floor(b + (255 - b) * percent);

    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}
