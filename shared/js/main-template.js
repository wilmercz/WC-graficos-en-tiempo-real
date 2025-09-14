// 🚀 shared/js/main-template.js - Motor Principal Configurable
// Responsabilidad: Motor principal que se adapta según configuración de instancia

import { EventBus } from './utils/event-bus.js';
import { FirebaseClient, initializeFirebaseClient } from './core/firebase-client.js';
import { dataProcessor } from './core/data-processor.js';
import { scheduler } from './core/scheduler.js';
import { lowerThirds } from './modules/lower-thirds.js';
import { logoManager } from './modules/logo-manager.js';
import { animationEngine } from './modules/animations.js';
import { clockInstance } from './modules/clock.js';
import { debugTools } from './utils/debug-tools.js';

export class StreamGraphicsApp {
    constructor(instanceConfig) {
        this.config = instanceConfig;
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
            debug: null
        };
        this.performance = {
            initTime: 0,
            lastDataProcessTime: 0,
            totalDataProcessed: 0
        };
        
        console.log(`🎯 Iniciando instancia: ${this.config.instanceName}`);
        console.log(`📍 Firebase Path: ${this.config.firebasePath}`);
        console.log(`🎨 Tema: ${this.config.theme}`);
    }

    /**
     * Obtener configuración Firebase
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
            console.log(`🚀 Iniciando ${this.config.instanceName}...`);
            
            // 1. Validar elementos DOM según configuración
            this.validateCriticalElements();
            
            // 2. Configurar Event Bus
            this.setupEventBus();
            
            // 3. Conectar Firebase
            await this.connectFirebase();
            
            // 4. Inicializar módulos según configuración
            this.initializeModules();
            
            // 5. Configurar comunicación entre módulos
            this.setupModuleCommunication();
            
            // 6. Iniciar scheduler global
            this.startGlobalScheduler();
            
            // 7. Configurar debug si está habilitado
            if (this.config.debug.enabled) {
                this.setupDebugTools();
            }
            
            // 8. Aplicar tema personalizado
            this.applyTheme();
            
            // 9. Finalizar inicialización
            this.finishInitialization();
            
        } catch (error) {
            console.error('❌ Error crítico inicializando aplicación:', error);
            this.handleInitializationError(error);
            throw error;
        }
    }

    /**
     * Validar elementos DOM según configuración de instancia
     */
    validateCriticalElements() {
        console.log('🔍 Verificando elementos DOM para:', this.config.category);
        
        const elements = {};
        
        // Elementos comunes
        if (this.config.allowedElements.logo) {
            elements.logo = document.getElementById('logo');
        }
        
        // Elementos específicos por categoría
        if (this.config.category === 'noticias') {
            if (this.config.allowedElements.invitado) {
                elements.invitadoContainer = document.getElementById('grafico-invitado-rol');
                elements.invitadoH1 = document.querySelector('#grafico-invitado-rol h1');
                elements.invitadoH2 = document.querySelector('#grafico-invitado-rol h2');
            }
            if (this.config.allowedElements.tema) {
                elements.temaContainer = document.getElementById('grafico-tema');
                elements.temaH1 = document.querySelector('#grafico-tema h1');
            }
            if (this.config.allowedElements.publicidad) {
                elements.publicidadContainer = document.getElementById('grafico-publicidad');
                elements.publicidadImg = document.querySelector('#grafico-publicidad img');
            }
        }
        
        if (this.config.category === 'futbol') {
            if (this.config.allowedElements.marcador) {
                elements.marcadorContainer = document.getElementById('grafico-marcador');
            }
            if (this.config.allowedElements.equipos) {
                elements.equiposContainer = document.getElementById('grafico-equipos');
            }
            if (this.config.allowedElements.jugador) {
                elements.jugadorContainer = document.getElementById('grafico-jugador');
            }
            if (this.config.allowedElements.estadisticas) {
                elements.estadisticasContainer = document.getElementById('grafico-estadisticas');
            }
        }

        const missing = [];
        Object.entries(elements).forEach(([name, element]) => {
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
        return elements;
    }

    /**
     * Conectar con Firebase usando path específico de instancia
     */
    async connectFirebase() {
        console.log('🔥 Conectando con Firebase...');
        console.log(`📍 Path específico: ${this.config.firebasePath}`);
        
        const firebaseConfig = this.getFirebaseConfig();
        this.modules.firebaseClient = await initializeFirebaseClient(firebaseConfig);
        
        console.log('✅ Firebase conectado');
        
        // Configurar listener específico para esta instancia
        this.setupInstanceFirebaseListener();
    }

    /**
     * Configurar listener Firebase específico de instancia
     */
    setupInstanceFirebaseListener() {
        console.log('🔗 Configurando listener específico:', this.config.firebasePath);
        
        this.modules.firebaseClient.onDataChange(this.config.firebasePath, (rawData) => {
            console.log(`📊 [${this.config.instanceId}] Datos recibidos:`, rawData);
            this.procesarDatosFirebase(rawData);
        });
        
        console.log('✅ Listener Firebase configurado para instancia');
    }

    /**
     * Procesar datos Firebase específicos según categoría
     */
    procesarDatosFirebase(rawData) {
        console.log(`📊 Procesando datos para ${this.config.category}:`, rawData);
        
        // Procesar según el tipo de instancia
        let processedData;
        
        if (this.config.category === 'noticias') {
            processedData = this.processNewsData(rawData);
        } else if (this.config.category === 'futbol') {
            processedData = this.processSportsData(rawData);
        } else {
            processedData = this.processGenericData(rawData);
        }
        
        if (!processedData) return;
        
        // Actualizar variables globales para compatibilidad
        window.lastFirebaseData = processedData;
        window.lastProcessedFirebaseData = processedData;
        
        // Aplicar cambios inmediatamente
        this.applyDataChanges(processedData);
        
        // Emitir evento para módulos
        EventBus.emit('firebase-data-processed', processedData);
    }

    /**
     * Procesar datos específicos de noticias
     */
    processNewsData(rawData) {
        return {
            // Visibilidad
            logoAlAire: this.convertBoolean(rawData.Mostrar_Logo),
            graficoAlAire: this.convertBoolean(rawData.Mostrar_Invitado),
            temaAlAire: this.convertBoolean(rawData.Mostrar_Tema),
            publicidadAlAire: this.convertBoolean(rawData.Mostrar_Publicidad),
            horaAlAire: this.convertBoolean(rawData.Mostrar_Hora),
            
            // Contenido
            Invitado: rawData.Invitado || 'Sin Invitado',
            Rol: rawData.Rol || 'Sin Rol',
            Tema: rawData.Tema || 'Sin Tema',
            
            // URLs
            urlLogo: rawData.urlLogo || '',
            urlImagenPublicidad: rawData.urlImagenPublicidad || '',
            
            // Colores
            colorFondo1: rawData.colorFondo1 || '#1066DC',
            colorLetra1: rawData.colorLetra1 || '#FFFFFF',
            colorFondo2: rawData.colorFondo2 || '#1066FF',
            colorLetra2: rawData.colorLetra2 || '#FFFFFF',
            colorFondo3: rawData.colorFondo3 || '#103264',
            colorLetra3: rawData.colorLetra3 || '#E1FFFF',
            
            // Duraciones
            duracionNombreRol: parseInt(rawData.duracionNombreRol) || 45,
            duracionTema: parseInt(rawData.duracionTema) || 45,
            duracionPublicidad: parseInt(rawData.duracionPublicidad) || 30,
            
            // Configuración automática
            modoAutomatico: this.convertBoolean(rawData.modoAutomatico, true),
            
            // Categoría
            category: 'noticias'
        };
    }

    /**
     * Procesar datos específicos de fútbol
     */
    processSportsData(rawData) {
        return {
            // Visibilidad específica de fútbol
            logoAlAire: this.convertBoolean(rawData.Mostrar_Logo),
            marcadorAlAire: this.convertBoolean(rawData.Mostrar_Marcador),
            equiposAlAire: this.convertBoolean(rawData.Mostrar_Equipos),
            jugadorAlAire: this.convertBoolean(rawData.Mostrar_Jugador),
            estadisticasAlAire: this.convertBoolean(rawData.Mostrar_Estadisticas),
            horaAlAire: this.convertBoolean(rawData.Mostrar_Hora),
            
            // Datos del partido
            Equipo_Local: rawData.Equipo_Local || 'Equipo Local',
            Equipo_Visitante: rawData.Equipo_Visitante || 'Equipo Visitante',
            Goles_Local: parseInt(rawData.Goles_Local) || 0,
            Goles_Visitante: parseInt(rawData.Goles_Visitante) || 0,
            Tiempo_Partido: rawData.Tiempo_Partido || '00:00',
            Minuto_Partido: parseInt(rawData.Minuto_Partido) || 0,
            Estado_Partido: rawData.Estado_Partido || 'PROXIMO',
            
            // Jugador destacado
            Jugador_Destacado: rawData.Jugador_Destacado || 'Jugador',
            Posicion_Jugador: rawData.Posicion_Jugador || 'Posición',
            Equipo_Jugador: rawData.Equipo_Jugador || 'Equipo',
            
            // URLs específicas
            urlLogo: rawData.urlLogo || '',
            urlLogo_Local: rawData.urlLogo_Local || '',
            urlLogo_Visitante: rawData.urlLogo_Visitante || '',
            urlFoto_Jugador: rawData.urlFoto_Jugador || '',
            
            // Colores del tema deportivo
            colorEquipo_Local: rawData.colorEquipo_Local || '#FF0000',
            colorEquipo_Visitante: rawData.colorEquipo_Visitante || '#0000FF',
            colorFondo_Marcador: rawData.colorFondo_Marcador || '#000000',
            colorTexto_Marcador: rawData.colorTexto_Marcador || '#FFFFFF',
            
            // Duraciones específicas
            duracionMarcador: parseInt(rawData.duracionMarcador) || 60,
            duracionJugador: parseInt(rawData.duracionJugador) || 45,
            duracionEstadisticas: parseInt(rawData.duracionEstadisticas) || 30,
            
            // Configuración automática
            modoAutomatico: this.convertBoolean(rawData.modoAutomatico, true),
            
            // Categoría
            category: 'futbol'
        };
    }

    /**
     * Aplicar cambios de datos según categoría
     */
    applyDataChanges(data) {
        console.log(`🎬 Aplicando cambios para ${data.category}:`, data);
        
        // Actualizar configuración global
        this.updateGlobalConfig(data);
        
        if (data.category === 'noticias') {
            this.applyNewsChanges(data);
        } else if (data.category === 'futbol') {
            this.applySportsChanges(data);
        }
        
        // Elementos comunes (logo, reloj)
        this.applyCommonElements(data);
    }

    /**
     * Aplicar cambios específicos de noticias
     */
    applyNewsChanges(data) {
        // Invitado/Rol
        if (data.graficoAlAire) {
            const contenido = {
                invitado: data.Invitado,
                rol: data.Rol
            };
            this.showElement('invitado', contenido);
        } else {
            this.hideElement('invitado');
        }
        
        // Tema
        if (data.temaAlAire) {
            const contenido = {
                tema: data.Tema
            };
            this.showElement('tema', contenido);
        } else {
            this.hideElement('tema');
        }
        
        // Publicidad
        if (data.publicidadAlAire) {
            const contenido = {
                url: data.urlImagenPublicidad,
                alt: 'Publicidad'
            };
            this.showElement('publicidad', contenido);
        } else {
            this.hideElement('publicidad');
        }
        
        // Aplicar colores específicos de noticias
        this.applyNewsColors(data);
    }

    /**
     * Aplicar cambios específicos de fútbol
     */
    applySportsChanges(data) {
        // Marcador
        if (data.marcadorAlAire) {
            const contenido = {
                equipoLocal: data.Equipo_Local,
                equipoVisitante: data.Equipo_Visitante,
                golesLocal: data.Goles_Local,
                golesVisitante: data.Goles_Visitante,
                tiempo: data.Tiempo_Partido,
                minuto: data.Minuto_Partido,
                estado: data.Estado_Partido
            };
            this.showElement('marcador', contenido);
        } else {
            this.hideElement('marcador');
        }
        
        // Jugador destacado
        if (data.jugadorAlAire) {
            const contenido = {
                nombre: data.Jugador_Destacado,
                posicion: data.Posicion_Jugador,
                equipo: data.Equipo_Jugador,
                foto: data.urlFoto_Jugador
            };
            this.showElement('jugador', contenido);
        } else {
            this.hideElement('jugador');
        }
        
        // Estadísticas
        if (data.estadisticasAlAire) {
            this.showElement('estadisticas');
        } else {
            this.hideElement('estadisticas');
        }
        
        // Aplicar colores específicos de deportes
        this.applySportsColors(data);
    }

    /**
     * Mostrar elemento con contenido específico
     */
    showElement(elementType, contenido = null) {
        const elementMap = {
            'invitado': 'grafico-invitado-rol',
            'tema': 'grafico-tema',
            'publicidad': 'grafico-publicidad',
            'marcador': 'grafico-marcador',
            'jugador': 'grafico-jugador',
            'estadisticas': 'grafico-estadisticas'
        };
        
        const elementId = elementMap[elementType];
        const element = document.getElementById(elementId);
        
        if (!element) {
            console.warn(`⚠️ Elemento no encontrado: ${elementId}`);
            return;
        }
        
        // Actualizar contenido si se proporciona
        if (contenido) {
            this.updateElementContent(elementType, element, contenido);
        }
        
        // Aplicar animación de entrada
        const animationType = this.getAnimationType(elementType);
        this.modules.animations.applyDynamicAnimationFromOldSystem(element, animationType, true);
        
        console.log(`✅ Elemento mostrado: ${elementType}`);
    }

    /**
     * Ocultar elemento
     */
    hideElement(elementType) {
        const elementMap = {
            'invitado': 'grafico-invitado-rol',
            'tema': 'grafico-tema',
            'publicidad': 'grafico-publicidad',
            'marcador': 'grafico-marcador',
            'jugador': 'grafico-jugador',
            'estadisticas': 'grafico-estadisticas'
        };
        
        const elementId = elementMap[elementType];
        const element = document.getElementById(elementId);
        
        if (!element) return;
        
        // Aplicar animación de salida
        const animationType = this.getAnimationType(elementType);
        this.modules.animations.applyDynamicAnimationFromOldSystem(element, animationType, false);
        
        console.log(`🔴 Elemento ocultado: ${elementType}`);
    }

    /**
     * Actualizar contenido de elemento
     */
    updateElementContent(elementType, element, contenido) {
        if (elementType === 'invitado') {
            const h1 = element.querySelector('h1');
            const h2 = element.querySelector('h2');
            if (h1) h1.textContent = contenido.invitado;
            if (h2) h2.textContent = contenido.rol;
        }
        
        if (elementType === 'tema') {
            const h1 = element.querySelector('h1');
            if (h1) h1.textContent = contenido.tema;
        }
        
        if (elementType === 'publicidad') {
            const img = element.querySelector('img');
            if (img && contenido.url) {
                img.src = contenido.url;
                img.alt = contenido.alt;
            }
        }
        
        if (elementType === 'marcador') {
            // Actualizar marcador de fútbol
            this.updateMarcadorContent(element, contenido);
        }
        
        if (elementType === 'jugador') {
            // Actualizar información de jugador
            this.updateJugadorContent(element, contenido);
        }
    }

    /**
     * Obtener tipo de animación según configuración
     */
    getAnimationType(elementType) {
        const mapping = {
            'invitado': 'invitadoRol',
            'tema': 'tema',
            'publicidad': 'publicidad',
            'marcador': 'marcador',
            'jugador': 'jugador',
            'estadisticas': 'estadisticas'
        };
        
        return mapping[elementType] || elementType;
    }

    /**
     * Aplicar tema visual
     */
    applyTheme() {
        if (this.config.customCSS) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = this.config.customCSS;
            document.head.appendChild(link);
            console.log(`🎨 Tema personalizado aplicado: ${this.config.customCSS}`);
        }
    }

    /**
     * Configurar debug específico de instancia
     */
    setupDebugTools() {
        this.modules.debug.enable(true);
        
        // Debug específico de instancia
        window[`Debug_${this.config.instanceId}`] = {
            config: this.config,
            status: () => this.getStatus(),
            firebase: () => window.lastFirebaseData,
            modules: this.modules,
            test: {
                showAll: () => this.testShowAll(),
                hideAll: () => this.testHideAll()
            }
        };
        
        console.log(`🔧 Debug configurado: window.Debug_${this.config.instanceId}`);
    }

    // Utilidades
    convertBoolean(value, defaultValue = false) {
        if (value === "true" || value === true) return true;
        if (value === "false" || value === false) return false;
        return defaultValue;
    }

    updateGlobalConfig(data) {
        window.currentConfig = {
            duracionNombreRol: data.duracionNombreRol || 45,
            duracionTema: data.duracionTema || 45,
            duracionPublicidad: data.duracionPublicidad || 30,
            modoAutomatico: data.modoAutomatico !== false,
            category: data.category
        };
    }

    // Métodos de inicialización restantes (simplificados para brevedad)
    setupEventBus() {
        EventBus.setDebug(this.config.debug.enabled);
    }

    initializeModules() {
        this.modules.dataProcessor = dataProcessor;
        this.modules.animations = animationEngine;
        this.modules.animations.init();
        this.modules.lowerThirds = lowerThirds;
        this.modules.lowerThirds.init();
        this.modules.logoManager = logoManager;
        this.modules.logoManager.init();
        this.modules.clock = clockInstance;
        this.modules.clock.init();
        this.modules.scheduler = scheduler;
        this.modules.debug = debugTools;
    }

    setupModuleCommunication() {
        // Configuración básica de comunicación entre módulos
        EventBus.on('firebase-data-processed', (data) => {
            console.log(`📊 [${this.config.instanceId}] Datos procesados`);
        });
    }

    startGlobalScheduler() {
        this.modules.scheduler.enableClock(this.config.allowedElements.clock);
        this.modules.scheduler.start();
    }

    finishInitialization() {
        this.isInitialized = true;
        this.performance.initTime = performance.now() - this.initStartTime;
        
        EventBus.emit('app-initialized');
        console.log(`✅ ${this.config.instanceName} iniciada en ${this.performance.initTime.toFixed(0)}ms`);
    }

    handleInitializationError(error) {
        EventBus.emit('app-initialization-error', error);
        console.error(`💥 Error en ${this.config.instanceName}:`, error);
    }

    getStatus() {
        return {
            instanceId: this.config.instanceId,
            instanceName: this.config.instanceName,
            category: this.config.category,
            isInitialized: this.isInitialized,
            firebasePath: this.config.firebasePath,
            initTime: this.performance.initTime,
            modules: Object.keys(this.modules).reduce((acc, key) => {
                acc[key] = !!this.modules[key];
                return acc;
            }, {})
        };
    }
}

// Hacer disponible globalmente
window.StreamGraphicsApp = StreamGraphicsApp;