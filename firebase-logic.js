import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getDatabase, ref, onValue, set } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-database.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
import { firebaseConfig } from './firebase-config.js';
import { slideIn, slideOut, fadeIn, fadeOut, slideInLeft, slideOutLeft, slideInTop, slideOutTop } from './animations.js';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

// 🆕 CONFIGURACIÓN AVANZADA GLOBAL
let configAvanzada = {
    layout: null,
    logo: null,
    textoPrincipal: null,
    textoSecundario: null,
    tema: null,
    publicidad: null,
    timing: null,
    automatizacion: null,
    animaciones: null,
    coloresAvanzados: null
};

// 🆕 SISTEMA DE POSICIONES PREDEFINIDAS (como en Android)
const POSICIONES_PREDEFINIDAS = {
    TOP_LEFT: { x: 50, y: 50 },
    TOP_CENTER: { x: 960, y: 50 },
    TOP_RIGHT: { x: 1870, y: 50 },
    MIDDLE_LEFT: { x: 50, y: 540 },
    MIDDLE_CENTER: { x: 960, y: 540 },
    MIDDLE_RIGHT: { x: 1870, y: 540 },
    BOTTOM_LEFT: { x: 50, y: 1030 },
    BOTTOM_CENTER: { x: 960, y: 1030 },
    BOTTOM_RIGHT: { x: 1870, y: 1030 }
};

// 🆕 CONFIGURACIÓN POR DEFECTO (valores de respaldo)
const CONFIG_DEFECTO = {
    logo: {
        posicion: POSICIONES_PREDEFINIDAS.BOTTOM_LEFT,
        tamaño: { width: 55, height: 55 },
        forma: 'circular',
        fondo: null,
        animacion: {
            entrada: 'fadeIn',
            salida: 'fadeOut',
            duracion: 300
        }
    },
    textoPrincipal: {
        posicion: { x: 180, y: 976 },
        colores: {
            fondo: '#FFFFFF',
            texto: '#000000'
        },
        animacion: {
            entrada: 'slideInLeft',
            salida: 'slideOutLeft',
            duracion: 600
        }
    },
    textoSecundario: {
        posicion: { x: 180, y: 1000 },
        colores: {
            fondo: '#FFFFFF',
            texto: '#000000'
        },
        animacion: {
            entrada: 'slideInLeft',
            salida: 'slideOutLeft',
            duracion: 600
        }
    },
    tema: {
        posicion: { x: 180, y: 976 },
        colores: {
            fondo: '#FFFFFF',
            texto: '#000000'
        },
        animacion: {
            entrada: 'slideInLeft',
            salida: 'slideOutLeft',
            duracion: 600
        }
    },
    publicidad: {
        posicion: { x: 6, y: 1010 },
        animacion: {
            entrada: 'slideInBottom',
            salida: 'slideOutBottom',
            duracion: 500
        }
    },
    automatizacion: {
        duracionNombreRol: 45,
        duracionTema: 45,
        duracionPublicidad: 30,
        duracionLogoPrincipal: 60,
        duracionLogosAliados: 45,
        modoAutomatico: true,
        habilitarOcultamientoAutomatico: true,
        habilitarRotacionLogos: false,
        cicloContinuoLogos: true
    }
};

// Variables globales para automatización
let currentConfig = null;
let automaticTimers = {};
let logoRotationTimer = null;
let currentLogoIndex = 0;
let logosAliados = [];
let logoPrincipalUrl = '';


// 🔧 CORRECCIÓN: Mover estas declaraciones AL PRINCIPIO del archivo firebase-logic.js

// 🚀 MOVER ESTO AL PRINCIPIO (después de las importaciones, línea ~10)
// ====== CONFIGURACIÓN GLOBAL DE ANIMACIONES ======

// Mapeo de tipos de animación
const TIPOS_ANIMACION = {
    'SLIDE_IN_LEFT': 'slideInLeft',
    'SLIDE_IN_RIGHT': 'slideInRight', 
    'SLIDE_IN_TOP': 'slideInTop',
    'SLIDE_IN_BOTTOM': 'slideInBottom',
    'FADE_IN': 'fadeIn',
    'SLIDE_OUT_LEFT': 'slideOutLeft',
    'SLIDE_OUT_RIGHT': 'slideOutRight',
    'SLIDE_OUT_TOP': 'slideOutTop', 
    'SLIDE_OUT_BOTTOM': 'slideOutBottom',
    'FADE_OUT': 'fadeOut',
    // 🆕 NUEVOS EFECTOS (opcional pero recomendado)
    'WIPE_IN_RIGHT': 'wipeInRight',
    'WIPE_OUT_LEFT': 'wipeOutLeft',
    'WIPE_IN_TOP': 'wipeInTop',
    'WIPE_OUT_BOTTOM': 'wipeOutBottom'
};

// Mapeo de easing
const TIPOS_EASING = {
    'EASE': 'ease',
    'EASE_IN': 'ease-in',
    'EASE_OUT': 'ease-out',
    'EASE_IN_OUT': 'ease-in-out',
    'LINEAR': 'linear',
    'BOUNCE': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    'ELASTIC': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
};

// 🔧 INICIALIZACIÓN GLOBAL - MOVER AL PRINCIPIO
let animacionConfig = {
    invitadoRol: {
        delay: 100,
        duracion: 600,
        easing: 'EASE_IN_OUT',
        entrada: 'SLIDE_IN_RIGHT',
        salida: 'SLIDE_OUT_LEFT'
    },
    tema: {
        delay: 100,
        duracion: 500,
        easing: 'EASE_IN_OUT',
        entrada: 'SLIDE_IN_LEFT',
        salida: 'SLIDE_OUT_TOP'
    },
    logo: {
        delay: 0,
        duracion: 300,
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
};

// 🌐 EXPONER GLOBALMENTE DESDE EL PRINCIPIO
window.animacionConfig = animacionConfig;
window.TIPOS_ANIMACION = TIPOS_ANIMACION;
window.TIPOS_EASING = TIPOS_EASING;



// 🔥 AUTENTICACIÓN Y INICIALIZACIÓN
signInAnonymously(auth)
    .then(() => {
        console.log("✅ Autenticación anónima exitosa");
        initializeDataListeners();
    })
    .catch((error) => {
        console.error("❌ Error de autenticación:", error);
        const statusEl = document.getElementById('status');
        if (statusEl) statusEl.innerText = 'Error de autenticación: ' + error.message;
    });

// 🆕 FUNCIÓN PRINCIPAL - Usa las rutas que funcionan
function initializeDataListeners() {
    console.log("🔄 Inicializando listeners con rutas correctas...");
    
    // Cargar configuración automática por defecto
    loadDefaultAutomaticConfig();

    // 🎯 RUTA PRINCIPAL QUE FUNCIONA (del primer código)
    const graficoRef = ref(database, 'CLAVE_STREAM_FB/STREAM_LIVE/GRAFICOS');
    onValue(graficoRef, (snapshot) => {
        const data = snapshot.val();
        console.log('📊 Datos recibidos desde Firebase:', data);
        
        if (data) {
            procesarDatosBasicos(data);
        }
    });

    // 🆕 Listener opcional para perfiles avanzados (si existe)
    const activeProfileRef = ref(database, 'CLAVE_STREAM_FB/STREAM_LIVE/GRAFICOS/activeProfile');
    onValue(activeProfileRef, (snapshot) => {
        const activeProfile = snapshot.val();
        if (activeProfile) {
            console.log(`📋 Perfil avanzado detectado: ${activeProfile}`);
            cargarConfiguracionAvanzada(activeProfile);
        }
    });
}

// 🆕 PROCESAR DATOS BÁSICOS (usando estructura que funciona)
function procesarDatosBasicos(data) {
    console.log("🔄 Procesando datos con estructura correcta...");
    
    // ✅ LEER COLORES (estructura del primer código que funciona)
    const coloresBasicos = {
        colorFondo1: data.colorFondo1 || '#FFFFFF',
        colorLetra1: data.colorLetra1 || '#000000',
        colorFondo2: data.colorFondo2 || '#FFFFFF',
        colorLetra2: data.colorLetra2 || '#000000',
        colorFondo3: data.colorFondo3 || '#FFFFFF',
        colorLetra3: data.colorLetra3 || '#000000'
    };

    // ✅ LEER CONTENIDO DE TEXTO (estructura que funciona)
    const contenidos = {
        invitado: (data.Invitado || 'Sin Invitado').replace(/^"|"$/g, ''),
        rol: (data.Rol || '-').replace(/^"|"$/g, ''),
        tema: (data.Tema || '-').replace(/^"|"$/g, '')
    };

    // ✅ LEER VISIBILIDAD (estructura que funciona)
    const visibilidad = {
        temaAlAire: convertirBoolean(data.Mostrar_Tema),
        graficoAlAire: convertirBoolean(data.Mostrar_Invitado),
        logoAlAire: convertirBoolean(data.Mostrar_Logo),
        publicidadAlAire: convertirBoolean(data.Mostrar_Publicidad)
    };

    // ✅ LEER URLs (estructura que funciona)
    const urls = {
        logoUrl: (data.urlLogo || '').trim().replace(/^"|"$/g, ''),
        publicidadUrl: (data.urlImagenPublicidad || '').trim().replace(/^"|"$/g, '')
    };


    console.log('📄 Contenidos procesados:', contenidos);
    console.log('👁️ Visibilidad procesada:', visibilidad);
    console.log('🖼️ URLs procesadas:', urls);

    // 🎯 APLICAR CONTENIDOS A ELEMENTOS
    const invitadoEl = document.getElementById('invitado');
    const rolEl = document.getElementById('rol');
    const temaEl = document.getElementById('tema');
    
    if (invitadoEl) invitadoEl.innerText = contenidos.invitado;
    if (rolEl) rolEl.innerText = contenidos.rol;
    if (temaEl) temaEl.innerText = contenidos.tema;

    // 🎨 APLICAR COLORES CON SISTEMA AVANZADO
    aplicarColoresElementos(coloresBasicos);

    // 🖼️ APLICAR IMÁGENES (mantener funcionamiento original)
    aplicarImagenes(urls);


    // 🆕 CONFIGURAR LOGOS ALIADOS (sin interferir con el logo principal)
    //configurarLogosAliados(data);
    leerParametrosLogosAliados(data);


    console.log("🔄 Procesando datos con estructura correcta...");
    
    // 🔍 DEBUG CRÍTICO - AÑADIR ESTAS LÍNEAS
    console.log('🚨 DEBUG CRÍTICO - DATOS FIREBASE RAW:');
    console.log('animacion_invitadoRol_entrada:', data.animacion_invitadoRol_entrada);
    console.log('animacion_invitadoRol_salida:', data.animacion_invitadoRol_salida);
    console.log('Tipo entrada:', typeof data.animacion_invitadoRol_entrada);
    console.log('Tipo salida:', typeof data.animacion_invitadoRol_salida);
    
    // ... resto del código existente hasta:
    
    // 🆕 LEER PARÁMETROS DE ANIMACIÓN DESDE FIREBASE
    console.log('📊 Datos completos de Firebase para animaciones:', data);
    
    // 🔍 DEBUG ANTES DE LEER
    console.log('🔍 ANTES de leerParametrosAnimacionFirebase:');
    console.log('Config actual:', window.animacionConfig?.invitadoRol);
    
    leerParametrosAnimacionFirebase(data);
    
    // 🔍 DEBUG DESPUÉS DE LEER
    console.log('🔍 DESPUÉS de leerParametrosAnimacionFirebase:');
    console.log('Config actualizada:', window.animacionConfig?.invitadoRol);
    

    // 👁️ MANEJAR VISIBILIDAD CON AUTOMATIZACIÓN AVANZADA
    //manejarVisibilidadElementos(visibilidad);

    // 👁️ MANEJAR VISIBILIDAD CON ANIMACIONES FIREBASE
    manejarVisibilidadElementosConFirebase(visibilidad);
}

// 🆕 CARGAR CONFIGURACIÓN AVANZADA (opcional, para futuro)
async function cargarConfiguracionAvanzada(nombrePerfil) {
    console.log(`🔧 Cargando configuración avanzada del perfil: ${nombrePerfil}`);
    
    const perfilRef = ref(database, `CLAVE_STREAM_FB/PERFILES_AVANZADOS/${nombrePerfil}`);
    
    onValue(perfilRef, (snapshot) => {
        const perfilData = snapshot.val();
        if (perfilData && perfilData.configuracionAvanzada) {
            console.log('🎛️ Configuración avanzada encontrada:', perfilData.configuracionAvanzada);
            configAvanzada = parsearConfiguracionAvanzada(perfilData.configuracionAvanzada);
            aplicarConfiguracionAvanzada();
        } else {
            console.log('⚠️ No se encontró configuración avanzada, usando valores por defecto');
            configAvanzada = CONFIG_DEFECTO;
        }
    });
}

// 🆕 CARGAR CONFIGURACIÓN AUTOMÁTICA POR DEFECTO
function loadDefaultAutomaticConfig() {
    currentConfig = CONFIG_DEFECTO.automatizacion;
    window.currentConfig = currentConfig;
    console.log("⚙️ Configuración automática por defecto cargada:", currentConfig);
}

// 🆕 PROCESAR LOGOS ALIADOS (desde ruta principal - estructura real de Firebase)
function procesarLogosAliados(logosData) {
    if (!logosData || !Array.isArray(logosData)) {
        console.log("⚠️ No hay logos aliados configurados");
        return [];
    }
    
    const logosValidos = logosData
        .filter(logo => logo && logo.url && logo.activo !== false)
        .map((logo, index) => ({
            nombre: logo.nombre || logo.id || `Logo Aliado ${index + 1}`,
            url: logo.url.trim().replace(/^"|"$/g, ''),
            activo: logo.activo !== false,
            orden: typeof logo.orden === 'number' ? logo.orden : index,
            id: logo.id || `logo_${index}`
        }))
        .sort((a, b) => a.orden - b.orden);
    
    console.log(`🤝 ${logosValidos.length} logos aliados procesados:`, logosValidos.map(l => `${l.nombre} (${l.url.substring(0, 50)}...)`));
    return logosValidos;
}

// 🆕 CONFIGURAR LOGOS DESDE RUTA PRINCIPAL
function configurarLogosDesdeRutaPrincipal(logosConfig) {
    console.log("🔄 Configurando logos desde ruta principal:", logosConfig);
    
    // Guardar configuración global
    logoPrincipalUrl = logosConfig.logoPrincipal;
    logosAliados = logosConfig.aliados;
    
    // Actualizar configuración automática
    if (currentConfig) {
        currentConfig.habilitarRotacionLogos = logosConfig.habilitarRotacion;
        currentConfig.duracionLogoPrincipal = logosConfig.duracionPrincipal;
        currentConfig.duracionLogosAliados = logosConfig.duracionAliados;
    }
    
    // Actualizar variables globales para debug
    window.logoPrincipalUrl = logoPrincipalUrl;
    window.logosAliados = logosAliados;
    window.currentConfig = currentConfig;
    
    // Log de estado
    if (logosConfig.habilitarRotacion) {
        console.log("✅ Rotación de logos habilitada");
        console.log(`🏛️ Logo principal: ${logoPrincipalUrl ? 'Configurado' : 'No configurado'}`);
        console.log(`🤝 Logos aliados: ${logosAliados.length} disponibles`);
    } else {
        console.log("⏸️ Rotación de logos deshabilitada");
    }
}

// 🆕 PARSEAR CONFIGURACIÓN AVANZADA (para futuro)
function parsearConfiguracionAvanzada(data) {
    console.log("🔍 Parseando configuración avanzada...");
    
    const config = {
        layout: data.lowerThirdConfig?.LAYOUT || {
            canvas_virtual: { width: 1920, height: 1080 },
            safe_margins: true
        },
        logo: parsearConfigLogo(data.lowerThirdConfig?.LOGO),
        textoPrincipal: parsearConfigTexto(data.lowerThirdConfig?.TEXTO_PRINCIPAL, 'textoPrincipal'),
        textoSecundario: parsearConfigTexto(data.lowerThirdConfig?.TEXTO_SECUNDARIO, 'textoSecundario'),
        tema: parsearConfigTexto(data.lowerThirdConfig?.TEMA, 'tema'),
        publicidad: parsearConfigPublicidad(data.lowerThirdConfig?.PUBLICIDAD),
        automatizacion: data.automatizacion || CONFIG_DEFECTO.automatizacion,
        animaciones: data.ANIMACIONES || {},
        coloresAvanzados: data.sistemaColoresAvanzado || {}
    };

    console.log("✅ Configuración avanzada parseada:", config);
    return config;
}

// 🆕 PARSERS PARA CONFIGURACIÓN AVANZADA (para futuro)
function parsearConfigLogo(logoData) {
    if (!logoData) return CONFIG_DEFECTO.logo;
    
    return {
        modo: logoData.modo || 'simple',
        mostrar: logoData.mostrar !== false,
        simple: {
            url: logoData.simple?.url || '',
            posicion: parsearPosicion(logoData.simple?.posicion, 'BOTTOM_LEFT'),
            tamaño: logoData.simple?.tamaño || CONFIG_DEFECTO.logo.tamaño,
            forma: logoData.simple?.forma || 'circular',
            fondo: parsearFondoLogo(logoData.simple?.fondo),
            animacion: parsearAnimacion(logoData.simple?.animacion, CONFIG_DEFECTO.logo.animacion)
        },
        logosAliados: {
            habilitado: logoData.logosAliados?.habilitado || false,
            logos: logoData.logosAliados?.logos || []
        }
    };
}

function parsearConfigTexto(textoData, tipoTexto) {
    const defecto = CONFIG_DEFECTO[tipoTexto] || CONFIG_DEFECTO.textoPrincipal;
    if (!textoData) return defecto;
    
    return {
        contenido: textoData.contenido || '',
        mostrar: textoData.mostrar !== false,
        posicion: parsearPosicion(textoData.posicion, null, defecto.posicion),
        tipografia: textoData.tipografia || {
            familia: 'Arial',
            tamaño: 18,
            peso: 400
        },
        fondo: parsearFondoTexto(textoData.fondo, defecto.colores.fondo),
        texto: parsearEstiloTexto(textoData.texto, defecto.colores.texto),
        animacion: parsearAnimacion(textoData.animacion, defecto.animacion)
    };
}

function parsearConfigPublicidad(pubData) {
    if (!pubData) return CONFIG_DEFECTO.publicidad;
    
    return {
        mostrar: pubData.mostrar !== false,
        url: pubData.url || '',
        posicion: parsearPosicion(pubData.posicion, null, CONFIG_DEFECTO.publicidad.posicion),
        tamaño: pubData.tamaño || { width: 'auto', height: 70 },
        animacion: parsearAnimacion(pubData.animacion, CONFIG_DEFECTO.publicidad.animacion)
    };
}

function parsearPosicion(posicionData, posicionPredefinida, defecto) {
    if (posicionData && typeof posicionData === 'object' && posicionData.x !== undefined && posicionData.y !== undefined) {
        return { x: posicionData.x, y: posicionData.y };
    }
    if (typeof posicionData === 'string' && POSICIONES_PREDEFINIDAS[posicionData]) {
        return POSICIONES_PREDEFINIDAS[posicionData];
    }
    if (posicionPredefinida && POSICIONES_PREDEFINIDAS[posicionPredefinida]) {
        return POSICIONES_PREDEFINIDAS[posicionPredefinida];
    }
    return defecto || { x: 0, y: 0 };
}

function parsearFondoLogo(fondoData) {
    if (!fondoData || !fondoData.mostrar) return null;
    return {
        color: fondoData.color || '#1066FF',
        opacidad: fondoData.opacidad || 0.8,
        padding: fondoData.padding || 10,
        mostrar: true
    };
}

function parsearFondoTexto(fondoData, colorDefecto) {
    return {
        color: fondoData?.color || colorDefecto,
        opacidad: fondoData?.opacidad || 1.0,
        padding: fondoData?.padding || { top: 7, right: 30, bottom: 7, left: 30 },
        borderRadius: fondoData?.border_radius || '0px'
    };
}

function parsearEstiloTexto(textoData, colorDefecto) {
    return {
        color: textoData?.color || colorDefecto,
        sombra: textoData?.sombra || {
            mostrar: false,
            color: '#000000',
            blur: 2,
            offset: { x: 1, y: 1 }
        }
    };
}

function parsearAnimacion(animData, defecto) {
    return {
        entrada: animData?.entrada || defecto.entrada,
        salida: animData?.salida || defecto.salida,
        duracion: animData?.duracion || defecto.duracion,
        delay: animData?.delay || 0,
        easing: animData?.easing || 'ease-in-out'
    };
}

// 🆕 APLICAR CONFIGURACIÓN AVANZADA
function aplicarConfiguracionAvanzada() {
    console.log("🎛️ Aplicando configuración avanzada a elementos...");
    
    if (!configAvanzada) {
        console.log("⚠️ No hay configuración avanzada, usando básica");
        return;
    }

    aplicarConfigLogo();
    aplicarConfigTextos();
    aplicarConfigPublicidad();
    configurarAutomatizacion();
}

function aplicarConfigLogo() {
    const logoConfig = configAvanzada.logo;
    if (!logoConfig) return;
    
    const logoElement = document.getElementById('logo');
    if (!logoElement) return;
    
    console.log("🏷️ Aplicando configuración avanzada de logo:", logoConfig);
    
    logoElement.style.left = logoConfig.simple.posicion.x + 'px';
    logoElement.style.bottom = logoConfig.simple.posicion.y + 'px';
    logoElement.style.width = logoConfig.simple.tamaño.width + 'px';
    logoElement.style.height = logoConfig.simple.tamaño.height + 'px';
    
    if (logoConfig.simple.forma === 'circular') {
        logoElement.style.borderRadius = '50%';
    } else {
        logoElement.style.borderRadius = '15%';
    }
    
    if (logoConfig.simple.fondo) {
        logoElement.style.backgroundColor = logoConfig.simple.fondo.color;
        logoElement.style.opacity = logoConfig.simple.fondo.opacidad;
        logoElement.style.padding = logoConfig.simple.fondo.padding + 'px';
    } else {
        logoElement.style.backgroundColor = 'transparent';
        logoElement.style.padding = '0px';
    }
}

function aplicarConfigTextos() {
    console.log("📝 Aplicando configuración avanzada de textos...");
    
    aplicarConfigTextoElemento('textoPrincipal', 'grafico-invitado-rol', 'invitado');
    aplicarConfigTextoElemento('textoSecundario', 'grafico-invitado-rol', 'rol');
    aplicarConfigTextoElemento('tema', 'grafico-tema', 'tema');
}

function aplicarConfigTextoElemento(tipoConfig, elementoId, contenidoId) {
    const config = configAvanzada[tipoConfig];
    if (!config) return;
    
    const elemento = document.getElementById(elementoId);
    const contenido = document.getElementById(contenidoId);
    
    if (!elemento || !contenido) return;
    
    elemento.style.left = config.posicion.x + 'px';
    elemento.style.bottom = config.posicion.y + 'px';
    
    if (config.tipografia) {
        contenido.style.fontFamily = config.tipografia.familia || 'Arial';
        contenido.style.fontSize = (config.tipografia.tamaño || 18) + 'px';
        contenido.style.fontWeight = config.tipografia.peso || 400;
    }
    
    if (config.fondo) {
        elemento.style.backgroundColor = config.fondo.color;
        elemento.style.opacity = config.fondo.opacidad || 1;
        
        if (config.fondo.padding) {
            const p = config.fondo.padding;
            elemento.style.padding = `${p.top}px ${p.right}px ${p.bottom}px ${p.left}px`;
        }
        
        if (config.fondo.borderRadius) {
            elemento.style.borderRadius = config.fondo.borderRadius;
        }
    }
    
    if (config.texto) {
        contenido.style.color = config.texto.color;
        
        if (config.texto.sombra && config.texto.sombra.mostrar) {
            const s = config.texto.sombra;
            contenido.style.textShadow = `${s.offset.x}px ${s.offset.y}px ${s.blur}px ${s.color}`;
        }
    }
}

function aplicarConfigPublicidad() {
    const pubConfig = configAvanzada.publicidad;
    if (!pubConfig) return;
    
    const pubElement = document.getElementById('grafico-publicidad');
    const pubImg = document.getElementById('publicidad-img');
    
    if (!pubElement || !pubImg) return;
    
    pubElement.style.left = pubConfig.posicion.x + 'px';
    pubElement.style.bottom = pubConfig.posicion.y + 'px';
    
    if (pubConfig.tamaño.width !== 'auto') {
        pubImg.style.width = pubConfig.tamaño.width + 'px';
    }
    if (pubConfig.tamaño.height !== 'auto') {
        pubImg.style.height = pubConfig.tamaño.height + 'px';
    }
}

function configurarAutomatizacion() {
    const autoConfig = configAvanzada.automatizacion || CONFIG_DEFECTO.automatizacion;
    currentConfig = autoConfig;
    window.currentConfig = currentConfig;
    
    if (autoConfig.habilitarRotacionLogos && configAvanzada.logo?.logosAliados?.habilitado) {
        configurarRotacionLogos();
    }
}

function configurarRotacionLogos() {
    const logosConfig = configAvanzada.logo?.logosAliados;
    if (!logosConfig || !logosConfig.habilitado) return;
    
    logosAliados = logosConfig.logos
        .filter(logo => logo.activo)
        .sort((a, b) => (a.orden || 0) - (b.orden || 0));
    
    logoPrincipalUrl = configAvanzada.logo?.simple?.url || '';
    
    window.logosAliados = logosAliados;
    window.logoPrincipalUrl = logoPrincipalUrl;
}

// 🎨 APLICAR COLORES A ELEMENTOS - MAPEO CORREGIDO
function aplicarColoresElementos(colores) {
    console.log("🎨 Aplicando colores a elementos:", colores);
    
    const coloresFinales = configAvanzada.coloresAvanzados ? 
        { ...colores, ...configAvanzada.coloresAvanzados } : colores;
    
    // 🎯 APLICAR COLORES AL CONTENEDOR UNIFICADO INVITADO/ROL
    const contenedorInvitadoRol = document.getElementById('grafico-invitado-rol');
    if (contenedorInvitadoRol) {
        // 🔧 FONDO DEL CONTENEDOR = colorFondo1
        if (coloresFinales.colorFondo1) {
            contenedorInvitadoRol.style.setProperty('background-color', coloresFinales.colorFondo1, 'important');
            console.log(`✅ Fondo contenedor aplicado: ${coloresFinales.colorFondo1}`);
        }
        
        // 🔧 COLOR DEL TÍTULO (H1) = colorLetra1  
        const titulo = contenedorInvitadoRol.querySelector('#invitado');
        if (titulo && coloresFinales.colorLetra1) {
            titulo.style.setProperty('color', coloresFinales.colorLetra1, 'important');
            console.log(`✅ Color título aplicado: ${coloresFinales.colorLetra1}`);
        }
        
        // 🔧 COLOR DEL SUBTÍTULO (H2) = colorLetra2
        const subtitulo = contenedorInvitadoRol.querySelector('#rol');
        if (subtitulo && coloresFinales.colorLetra2) {
            subtitulo.style.setProperty('color', coloresFinales.colorLetra2, 'important');
            console.log(`✅ Color subtítulo aplicado: ${coloresFinales.colorLetra2}`);
        }
        
        console.log('✅ INVITADO/ROL UNIFICADO: Todos los colores aplicados');
    } else {
        console.warn('❌ No se encontró el contenedor #grafico-invitado-rol');
    }
    
    // 🎯 APLICAR COLORES AL TEMA (sin cambios)
    const temaElement = document.getElementById('tema');
    if (temaElement && coloresFinales.colorFondo3 && coloresFinales.colorLetra3) {
        temaElement.style.setProperty('background-color', coloresFinales.colorFondo3, 'important');
        temaElement.style.setProperty('color', coloresFinales.colorLetra3, 'important');
        console.log(`✅ TEMA: Fondo=${coloresFinales.colorFondo3} / Texto=${coloresFinales.colorLetra3}`);
    }
}

// 🖼️ APLICAR IMÁGENES
function aplicarImagenes(urls) {
    console.log("🖼️ Aplicando URLs de imágenes:", urls);
    
    if (urls.logoUrl) {
        const logo = document.getElementById('logo');
        if (logo) {
            logo.src = urls.logoUrl;
            console.log('✅ Logo cargado:', urls.logoUrl);
        }
    }
    
    if (urls.publicidadUrl) {
        const pubImg = document.getElementById('publicidad-img');
        if (pubImg) {
            pubImg.src = urls.publicidadUrl;
            console.log('✅ Publicidad cargada:', urls.publicidadUrl);
        }
    }
}

// 👁️ MANEJAR VISIBILIDAD CON AUTOMATIZACIÓN AVANZADA
function manejarVisibilidadElementos(visibilidad) {
    console.log("👁️ Flags desde DB:", visibilidad);

    const refs = {
        logo: {
            visible: !!visibilidad.logoAlAire,
            element: document.getElementById('logo'),
            currentlyVisible: document.getElementById('logo')?.style.display !== 'none'
        },
        tema: {
            visible: !!visibilidad.temaAlAire,
            element: document.getElementById('grafico-tema'),
            h1: document.querySelector('#grafico-tema h1'),
            h2: document.querySelector('#grafico-tema h2'),
            currentlyVisible: document.getElementById('grafico-tema')?.style.display !== 'none'
        },
        invitadoRol: {
            visible: !!visibilidad.graficoAlAire,
            element: document.getElementById('grafico-invitado-rol'),
            h1: document.querySelector('#grafico-invitado-rol h1'),
            h2: document.querySelector('#grafico-invitado-rol h2'),
            h3: document.querySelector('#grafico-invitado-rol h3'),
            currentlyVisible: document.getElementById('grafico-invitado-rol')?.style.display !== 'none'
        },
        publicidad: {
            visible: !!visibilidad.publicidadAlAire,
            element: document.getElementById('grafico-publicidad'),
            currentlyVisible: document.getElementById('grafico-publicidad')?.style.display !== 'none'
        }
    };

    // 🆕 SOLO PROCESAR SI HAY CAMBIO DE ESTADO
    Object.entries(refs).forEach(([tipo, cfg]) => {
        if (!cfg.element) return;

        // 🔍 VERIFICAR SI REALMENTE HAY CAMBIO
        const needsChange = cfg.visible !== cfg.currentlyVisible;
        
        if (!needsChange) {
            console.log(`⏭️ ${tipo}: Sin cambios (ya está ${cfg.visible ? 'visible' : 'oculto'})`);
            return;
        }

        console.log(`🔄 ${tipo}: Cambiando de ${cfg.currentlyVisible ? 'visible' : 'oculto'} a ${cfg.visible ? 'visible' : 'oculto'}`);

        if (cfg.visible) {
            // Mostrar con animación
            mostrarElementoConAnimacion(tipo, cfg);

            // Iniciar timer automático
            if (currentConfig?.modoAutomatico && currentConfig?.habilitarOcultamientoAutomatico) {
                cancelAutomaticTimer(tipo);
                iniciarTemporizadorAutomatico(tipo);
            }
        } else {
            // Ocultar con animación
            ocultarElementoConAnimacion(tipo, cfg);
            cancelAutomaticTimer(tipo);
        }
    });

    // 🔄 ROTACIÓN DE LOGOS
    configurarRotacionEnVisibilidad(visibilidad);
}

function procesarVisibilidadElemento(nombre, config) {
    if (!config.element) return;
    
    console.log(`👁️ Procesando visibilidad de ${nombre}:`, config.visible);
    
    if (config.visible) {
        mostrarElementoConAnimacion(nombre, config);
        
        if (currentConfig?.modoAutomatico && currentConfig?.habilitarOcultamientoAutomatico) {
            iniciarTemporizadorAutomatico(nombre);
        }
    } else {
        ocultarElementoConAnimacion(nombre, config);
        cancelAutomaticTimer(nombre);
    }
}

function mostrarElementoConAnimacion(nombre, config) {
    const animConfig = obtenerConfigAnimacion(nombre);
    
    console.log(`🎬 Mostrando ${nombre} con animación:`, animConfig);
    
    switch (nombre) {
        case 'tema':
            if (config.h1) {
                LowerThirdsTema(config.element, config.h1, true);
            }
            break;
            
        case 'invitadoRol':
            if (config.h1 && config.h2) {
                LowerThirdsInvitado(config.element, config.h1, config.h2, true);
            }
            break;
            
        default:
            const animFunc = obtenerFuncionAnimacion(animConfig.entrada);
            updateVisibility(config.element, true, animFunc);
            break;
    }
}

function ocultarElementoConAnimacion(nombre, config) {
    const animConfig = obtenerConfigAnimacion(nombre);
    
    console.log(`🎬 Ocultando ${nombre} con animación:`, animConfig);
    
    switch (nombre) {
        case 'tema':
            if (config.h1) {
                LowerThirdsTema(config.element, config.h1, false);
            }
            break;
            
        case 'invitadoRol':
            if (config.h1 && config.h2) {
                LowerThirdsInvitado(config.element, config.h1, config.h2, false);
            }
            break;
            
        default:
            const animFunc = obtenerFuncionAnimacion(animConfig.salida);
            updateVisibility(config.element, false, null, animFunc);
            break;
    }
}

function obtenerConfigAnimacion(nombreElemento) {
    if (configAvanzada.animaciones && configAvanzada.animaciones[nombreElemento]) {
        return configAvanzada.animaciones[nombreElemento];
    }
    
    const defaults = {
        logo: CONFIG_DEFECTO.logo.animacion,
        invitadoRol: CONFIG_DEFECTO.textoPrincipal.animacion,
        tema: CONFIG_DEFECTO.tema.animacion,
        publicidad: CONFIG_DEFECTO.publicidad.animacion
    };
    
    return defaults[nombreElemento] || { entrada: 'fadeIn', salida: 'fadeOut', duracion: 300 };
}

function obtenerFuncionAnimacion(nombreAnimacion) {
    const animaciones = {
        'fadeIn': fadeIn,
        'fadeOut': fadeOut,
        'slideInLeft': slideInLeft,
        'slideOutLeft': slideOutLeft,
        'slideInTop': slideInTop,
        'slideOutTop': slideOutTop,
        'slideInBottom': slideIn,
        'slideOutBottom': slideOut
    };
    
    return animaciones[nombreAnimacion] || fadeIn;
}

// ✅ Reemplaza estas funciones por las siguientes
function cancelAutomaticTimer(tipo) {
  if (window._autoTimers?.[tipo]) {
    clearTimeout(window._autoTimers[tipo]);
    delete window._autoTimers[tipo];
    console.log(`❌ Temporizador cancelado para ${tipo}`);
  }
}

function ocultarConAnimacionYLuegoFirebase(tipo) {
  console.log(`🤖 Ocultando automáticamente: ${tipo}`);

  const id = (tipo === 'tema')
    ? 'grafico-tema'
    : (tipo === 'publicidad')
      ? 'grafico-publicidad'
      : 'grafico-invitado-rol';

  const el = document.getElementById(id);
  if (!el) return;

  const animCfg = window.animacionConfig?.[tipo] || window.animacionConfig?.invitadoRol || {};
  const total = (Number(animCfg.delay) || 0) + (Number(animCfg.duracion) || 600) + 50;

  aplicarAnimacionDinamica(el, tipo, false);

  let done = false;
  const finish = () => {
    if (done) return;
    done = true;
    el.style.display = 'none';

    // 🟢 Persistimos en Firebase DESPUÉS de la animación
    const fbType = (tipo === 'tema') ? 'tema' : (tipo === 'publicidad' ? 'publicidad' : 'invitadoRol');
    actualizarVisibilidadEnFirebase(fbType, false)
      .then(() => console.log(`✅ Firebase actualizado (auto): ${fbType}=false`))
      .catch(err => console.error('❌ Error actualizando Firebase (auto):', err));
  };

  el.addEventListener('transitionend', finish, { once: true });
  setTimeout(finish, total); // Fallback por si el evento no dispara
}


function iniciarTemporizadorAutomatico(tipo) {
  const ms = Number(window.currentConfig?.duracionOcultamiento?.[tipo]) || 45000; // 45s si no hay config
  console.log(`⏱️ Iniciando temporizador automático para ${tipo}: ${Math.round(ms / 1000)}s`);

  cancelAutomaticTimer(tipo);
  window._autoTimers = window._autoTimers || {};
  window._autoTimers[tipo] = setTimeout(() => {
    ocultarConAnimacionYLuegoFirebase(tipo);
  }, ms);
}


function convertirBoolean(valor) {
    if (valor === "true") return true;
    if (valor === "false") return false;
    return valor;
}

// 🤖 FUNCIONES DE AUTOMATIZACIÓN
function startAutomaticTimer(elementType, duration) {
    if (!currentConfig || !currentConfig.modoAutomatico || !currentConfig.habilitarOcultamientoAutomatico) {
        console.log(`⏸️ Modo automático deshabilitado para ${elementType}`);
        return;
    }
    
    if (automaticTimers[elementType]) {
        clearTimeout(automaticTimers[elementType]);
        console.log(`🔄 Cancelando temporizador previo para ${elementType}`);
    }
    
    automaticTimers[elementType] = setTimeout(() => {
        hideElementAutomatically(elementType);
    }, duration * 1000);
    
    window.automaticTimers = automaticTimers;
    console.log(`⏱️ Temporizador iniciado para ${elementType}: ${duration}s`);
}



// 🔄 ROTACIÓN DE LOGOS
function startLogoRotation() {
    if (!currentConfig || !currentConfig.habilitarRotacionLogos) {
        console.log('⏸️ Rotación de logos deshabilitada');
        return;
    }
    
    if (logosAliados.length === 0 && !logoPrincipalUrl) {
        console.log('⚠️ No hay logos para rotar');
        return;
    }
    
    console.log('🔄 Iniciando rotación de logos');
    currentLogoIndex = 0;
    rotateToNextLogo();
}

function rotateToNextLogo() {
    if (!currentConfig || !currentConfig.habilitarRotacionLogos) {
        console.log('🛑 Rotación de logos detenida');
        return;
    }
    
    const logo = document.getElementById('logo');
    if (!logo) {
        console.error('❌ Elemento logo no encontrado');
        return;
    }
    
    let nextDuration;
    let nextUrl;
    let logoName;
    
    if (currentLogoIndex === 0) {
        nextUrl = logoPrincipalUrl;
        nextDuration = currentConfig.duracionLogoPrincipal * 1000;
        logoName = 'Logo Principal';
        console.log('🏛️ Mostrando logo principal');
    } else {
        const logoAliado = logosAliados[currentLogoIndex - 1];
        if (logoAliado) {
            nextUrl = logoAliado.url || '';
            nextDuration = currentConfig.duracionLogosAliados * 1000;
            logoName = logoAliado.nombre;
            console.log(`🤝 Mostrando logo aliado: ${logoAliado.nombre}`);
        } else {
            console.error('❌ Logo aliado no encontrado');
            moveToNextLogo();
            rotateToNextLogo();
            return;
        }
    }
    
    if (nextUrl) {
        updateVisibility(logo, false, null, fadeOut);
        
        setTimeout(() => {
            logo.src = nextUrl;
            logo.alt = logoName;
            updateVisibility(logo, true, fadeIn);
        }, 300);
    } else {
        console.warn('⚠️ URL del logo vacía');
        moveToNextLogo();
        setTimeout(() => rotateToNextLogo(), 100);
        return;
    }
    
    logoRotationTimer = setTimeout(() => {
        moveToNextLogo();
        rotateToNextLogo();
    }, nextDuration);
    
    window.logoRotationTimer = logoRotationTimer;
}

function moveToNextLogo() {
    currentLogoIndex++;
    
    if (currentLogoIndex > logosAliados.length) {
        if (currentConfig.cicloContinuoLogos) {
            currentLogoIndex = 0;
            console.log('🔄 Reiniciando ciclo de logos');
        } else {
            stopLogoRotation();
            console.log('🏁 Ciclo de logos completado');
        }
    }
}

function stopLogoRotation() {
    if (logoRotationTimer) {
        clearTimeout(logoRotationTimer);
        logoRotationTimer = null;
        window.logoRotationTimer = logoRotationTimer;
        console.log('🛑 Rotación de logos detenida');
    }
}

// 🎬 FUNCIONES DE ANIMACIÓN
function updateVisibility(element, isVisible, animationFunctionIn = null, animationFunctionOut = null) {
    if (isVisible) {
        element.style.display = 'block';
        if (animationFunctionIn) {
            animationFunctionIn(element);
        }
    } else {
        if (animationFunctionOut) {
            animationFunctionOut(element);
            setTimeout(() => { 
                element.style.display = 'none';
            }, 700);
        } else {
            element.style.display = 'none';
        }
    }
    console.log(`Actualizando visibilidad de ${element.id}:`, isVisible);
}
// 🔧 FUNCIONES CORREGIDAS SIN CÍRCULO H3

// ✅ REEMPLAZAR ESTA FUNCIÓN COMPLETA:
function LowerThirdsInvitado(graficoInvitadoRol, graficoInvitadoRolH1, graficoInvitadoRolH2, isVisible) {
    if (isVisible) {
        updateVisibility(graficoInvitadoRol, true);

        setTimeout(() => {
            updateVisibility(graficoInvitadoRolH1, true, slideInLeft);
        }, 100);

        setTimeout(() => {
            updateVisibility(graficoInvitadoRolH2, true, slideInLeft);
        }, 200);

    } else {
        setTimeout(() => {
            updateVisibility(graficoInvitadoRolH2, false, null, slideOutLeft);
        }, 0);

        setTimeout(() => {
            updateVisibility(graficoInvitadoRolH1, false, null, slideOutLeft);
        }, 100);

        setTimeout(() => {
            updateVisibility(graficoInvitadoRol, false);
        }, 1100);
    }
}


function LowerThirdsTema(graficoTema, graficoTemaH1, isVisible) {
    if (isVisible) {
        updateVisibility(graficoTema, true);

        setTimeout(() => {
            updateVisibility(graficoTemaH1, true, slideInLeft);
        }, 100);
        
    } else {
        setTimeout(() => {
            updateVisibility(graficoTemaH1, false, null, slideOutTop);
        }, 100);

        setTimeout(() => {
            updateVisibility(graficoTema, false);
        }, 600);
    }
}

// 🧪 FUNCIONES DE DEBUG
function logAutomaticStatus() {
    console.group('🤖 Estado del Sistema Automático');
    console.log('Configuración:', currentConfig);
    console.log('Configuración avanzada:', configAvanzada);
    console.log('Temporizadores activos:', Object.keys(automaticTimers));
    console.log('Rotación de logos:', logoRotationTimer ? 'Activa' : 'Inactiva');
    console.log('Logos disponibles:', logosAliados.length);
    console.groupEnd();
}

function testAutomaticSystem() {
    console.log('🧪 Iniciando test del sistema automático...');
    
    setTimeout(() => {
        if (currentConfig) {
            console.log('✅ Configuración cargada correctamente');
            console.log('✅ Configuración avanzada:', configAvanzada);
            startAutomaticTimer('invitadoRol', 5);
        } else {
            console.error('❌ No se pudo cargar la configuración');
        }
    }, 2000);
    
    console.log('✅ Test completado');
}

// 🆕 DEBUG ESPECÍFICO PARA LOGOS ALIADOS
function debugLogosAliados() {
    console.group('🔍 DEBUG LOGOS ALIADOS');
    console.log('Logo principal URL:', logoPrincipalUrl || 'No configurado');
    console.log('Logos aliados disponibles:', logosAliados.length);
    
    if (logosAliados.length > 0) {
        console.log('Lista detallada de logos aliados:');
        logosAliados.forEach((logo, index) => {
            console.log(`  ${index + 1}. ${logo.nombre}`);
            console.log(`     URL: ${logo.url}`);
            console.log(`     Activo: ${logo.activo}`);
            console.log(`     Orden: ${logo.orden}`);
        });
    }
    
    console.log('Rotación habilitada:', currentConfig?.habilitarRotacionLogos || false);
    console.log('Duración logo principal:', currentConfig?.duracionLogoPrincipal || 'No configurado');
    console.log('Duración logos aliados:', currentConfig?.duracionLogosAliados || 'No configurado');
    console.log('Timer activo:', logoRotationTimer ? 'SÍ' : 'NO');
    console.log('Índice actual:', currentLogoIndex);
    
    // Test rápido si hay logos
    if (logosAliados.length > 0 && logoPrincipalUrl) {
        console.log('✅ Todo listo para rotación automática');
        console.log('💡 Para probar manualmente: startLogoRotation()');
    } else {
        console.log('❌ Faltan configuraciones para rotación');
        if (!logoPrincipalUrl) console.log('   - Falta logo principal');
        if (logosAliados.length === 0) console.log('   - Faltan logos aliados');
    }
    
    console.groupEnd();
}

// 🆕 TEST MANUAL DE ROTACIÓN DE LOGOS
function testRotacionLogos() {
    console.log('🧪 Iniciando test manual de rotación de logos...');
    
    if (!logoPrincipalUrl && logosAliados.length === 0) {
        console.error('❌ No hay logos configurados para probar');
        return;
    }
    
    // Habilitar rotación temporalmente para test
    const originalConfig = currentConfig?.habilitarRotacionLogos;
    if (currentConfig) {
        currentConfig.habilitarRotacionLogos = true;
        currentConfig.duracionLogoPrincipal = 3; // 3 segundos para test
        currentConfig.duracionLogosAliados = 3;  // 3 segundos para test
    }
    
    console.log('⚡ Iniciando rotación rápida para test (3 segundos por logo)');
    startLogoRotation();
    
    // Restaurar configuración original después del test
    setTimeout(() => {
        if (currentConfig && originalConfig !== undefined) {
            currentConfig.habilitarRotacionLogos = originalConfig;
        }
        console.log('✅ Test completado, configuración restaurada');
    }, 15000); // 15 segundos de test
}







// 🆕 CONFIGURACIÓN DE LOGOS ALIADOS (solo lectura, sin funcionalidad)
let logoConfig = {
    habilitado: false,
    duraciones: {
        principal: 60,
        aliados: 45
    },
    cicloContinuo: true,
    animaciones: {},
    colores: {}
};

// 🆕 PASO 1: SOLO LEER parámetros de logos aliados (sin ejecutar funcionalidad)
function leerParametrosLogosAliados(data) {
    console.log("📖 PASO 1: Leyendo parámetros de logos aliados...");
    
    // 🆕 VERIFICAR SI HAY PARÁMETROS DE ROTACIÓN EN LOS DATOS
    const habilitadoRaw = data.logosAliados_config_habilitado;
    console.log("🔍 Parámetro rotación raw:", habilitadoRaw, typeof habilitadoRaw);
    
    // Leer configuración básica
    const habilitado = convertirBoolean(habilitadoRaw);
    const duracionPrincipal = data.duracionLogoPrincipal || 60;
    const duracionAliados = data.duracionLogosAliados || 45;
    const cicloContinuo = convertirBoolean(data.cicloContinuoLogos);
    
    // Leer lista de logos aliados
    const listaAliados = data.logosAliados_config_lista || [];
    
    // ALMACENAR configuración
    logoConfig = {
        habilitado: habilitado,
        duraciones: {
            principal: duracionPrincipal,
            aliados: duracionAliados
        },
        cicloContinuo: cicloContinuo,
        animaciones: {
            entradaPrincipal: data.animaciones_entradaLogo || 'FADE_IN',
            salidaPrincipal: data.animacion_logo_salida || 'FADE_OUT',
            entradaAliados: data.animacion_logo_entrada || 'FADE_IN',
            duracionPrincipal: data.animaciones_duracionEntrada || 500,
            duracionAliados: data.animacion_logo_duracion || 500
        },
        colores: {
            fondoLogos: data.colorFondoLogos || null
        }
    };
    
    // Procesar lista de logos aliados
    logosAliados = procesarListaLogosAliados(listaAliados);
    
    // Obtener URL del logo principal
    const logoElement = document.getElementById('logo');
    logoPrincipalUrl = logoElement ? logoElement.src : '';
    
    // 🆕 ACTIVAR ROTACIÓN SI ESTÁ HABILITADA Y HAY LOGOS
    if (habilitado && (logosAliados.length > 0 || logoPrincipalUrl)) {
        console.log("✅ ROTACIÓN HABILITADA - Activando funcionalidad");
        
        // Actualizar configuración automática para permitir rotación
        if (currentConfig) {
            currentConfig.habilitarRotacionLogos = true;
            currentConfig.duracionLogoPrincipal = duracionPrincipal;
            currentConfig.duracionLogosAliados = duracionAliados;
        }
    } else {
        console.log("❌ ROTACIÓN DESHABILITADA:", {
            habilitado: habilitado,
            logosAliados: logosAliados.length,
            logoPrincipal: !!logoPrincipalUrl
        });
    }
    
    // Variables globales para debug
    window.logoConfig = logoConfig;
    window.logosAliados = logosAliados;
    window.logoPrincipalUrl = logoPrincipalUrl;
    window.currentConfig = currentConfig;
    
    // LOG detallado
    console.log("📋 CONFIGURACIÓN FINAL:");
    console.log(`   ✅ Habilitado: ${habilitado}`);
    console.log(`   ⏱️ Duración principal: ${duracionPrincipal}s`);
    console.log(`   ⏱️ Duración aliados: ${duracionAliados}s`);
    console.log(`   🔄 Ciclo continuo: ${cicloContinuo}`);
    console.log(`   🏛️ Logo principal: ${logoPrincipalUrl ? 'SÍ' : 'NO'}`);
    console.log(`   🤝 Logos aliados: ${logosAliados.length}`);
}

// 🆕 PROCESAR lista de logos aliados
function procesarListaLogosAliados(lista) {
    if (!lista || !Array.isArray(lista)) {
        console.log("📋 No hay lista de logos aliados");
        return [];
    }
    
    const logosValidos = lista
        .filter(logo => logo && logo.url && logo.activo !== false)
        .map((logo, index) => ({
            nombre: logo.nombre || logo.id || `Logo Aliado ${index + 1}`,
            url: logo.url.trim().replace(/^"|"$/g, ''),
            activo: logo.activo !== false,
            orden: typeof logo.orden === 'number' ? logo.orden : index,
            id: logo.id || `logo_${index}`
        }))
        .sort((a, b) => a.orden - b.orden);
    
    console.log(`📋 ${logosValidos.length} logos aliados válidos procesados`);
    return logosValidos;
}




// 🆕 PASO 2.2: Rotación más robusta que no se cancela
function iniciarRotacionRobusta() {
    if (!logoConfig.habilitado) {
        console.log('⏸️ Rotación deshabilitada');
        return;
    }
    
    if (!logoPrincipalUrl || logosAliados.length === 0) {
        console.log('⚠️ No hay logos para rotar');
        return;
    }
    
    // Cancelar cualquier rotación previa
    if (logoRotationTimer) {
        clearTimeout(logoRotationTimer);
        logoRotationTimer = null;
    }
    
    console.log('🔄 Iniciando rotación ROBUSTA...');
    
    // Iniciar inmediatamente el primer cambio (para testing)
    currentLogoIndex = 0;
    // producción: respeta la duración del logo principal
    setTimeout(() => {
    console.log(`⏰ Han pasado ${logoConfig.duraciones.principal}s, rotando al primer logo aliado...`);
    rotarAlSiguienteLogo();
    }, (logoConfig.duraciones.principal || 3) * 1000);
}

// Exponer función global
window.iniciarRotacionRobusta = iniciarRotacionRobusta;

// 🆕 PASO 2.1: Corrección para evitar interferencia del sistema automático
function configurarRotacionEnVisibilidad(visibilidad) {
    console.log("🔍 Evaluando rotación:", {
        logoVisible: visibilidad.logoAlAire,
        rotacionHabilitada: logoConfig.habilitado,
        logosDisponibles: logosAliados.length,
        logoPrincipal: !!logoPrincipalUrl
    });

    if (visibilidad.logoAlAire && logoConfig.habilitado) {
        console.log('🔄 Logo visible + rotación habilitada - iniciando rotación automática');
        
        // Cancelar temporizadores automáticos del sistema original
        if (window.automaticTimers && window.automaticTimers['logo']) {
            clearTimeout(window.automaticTimers['logo']);
            delete window.automaticTimers['logo'];
            console.log('⏹️ Temporizador automático original cancelado');
        }
        
        // Iniciar rotación
        iniciarRotacionRobusta();
    } else {
        console.log('⏸️ Rotación no iniciada - Detalles:', {
            logoVisible: visibilidad.logoAlAire,
            rotacionHabilitada: logoConfig.habilitado,
            motivoRechazo: !visibilidad.logoAlAire ? 'Logo no visible' : 
                         !logoConfig.habilitado ? 'Rotación deshabilitada' : 'Otro'
        });
        
        // Detener rotación si estaba activa
        detenerRotacion();
    }
}


function rotarAlSiguienteLogo() {
    currentLogoIndex++;
    
    // Si pasamos todos los logos aliados, volver al principal
    if (currentLogoIndex > logosAliados.length) {
        if (logoConfig.cicloContinuo) {
            currentLogoIndex = 0; // Volver al logo principal
            console.log('🔄 Ciclo completado, volviendo al logo principal');
        } else {
            console.log('🏁 Rotación terminada (ciclo continuo deshabilitado)');
            return;
        }
    }
    
    const logo = document.getElementById('logo');
    if (!logo) {
        console.error('❌ Elemento logo no encontrado');
        return;
    }
    
    let nextUrl;
    let logoName;
    let nextDuration;
    
    if (currentLogoIndex === 0) {
        // Mostrar logo principal
        nextUrl = logoPrincipalUrl;
        logoName = 'Logo Principal';
        nextDuration = logoConfig.duraciones.principal * 1000;
    } else {
        // Mostrar logo aliado
        const logoAliado = logosAliados[currentLogoIndex - 1];
        if (!logoAliado) {
            console.error(`❌ Logo aliado ${currentLogoIndex - 1} no encontrado`);
            return;
        }
        nextUrl = logoAliado.url;
        logoName = logoAliado.nombre || logoAliado.id || `Logo Aliado ${currentLogoIndex}`;
        nextDuration = logoConfig.duraciones.aliados * 1000;
    }
    
    console.log(`🔄 Cambiando a: ${logoName}`);
    
    // USAR FUNCIONES QUE YA FUNCIONAN
    updateVisibility(logo, false, null, fadeOut);
    
    setTimeout(() => {
        logo.src = nextUrl;
        logo.alt = logoName;
        updateVisibility(logo, true, fadeIn);
        console.log(`✅ Logo cambiado a: ${logoName}`);
        
        // Programar siguiente rotación
        logoRotationTimer = setTimeout(() => {
            rotarAlSiguienteLogo();
        }, nextDuration);
        
        window.logoRotationTimer = logoRotationTimer;
        
    }, 700); // Esperar a que termine fadeOut
}

function detenerRotacion() {
    if (logoRotationTimer) {
        clearTimeout(logoRotationTimer);
        logoRotationTimer = null;
        window.logoRotationTimer = null;
        console.log('🛑 Rotación detenida');
    }
}


// 🆕 FUNCIÓN PARA ACTUALIZAR FIREBASE CUANDO SE OCULTA AUTOMÁTICAMENTE
async function actualizarVisibilidadEnFirebase(elementType, visible) {
    try {
        const database = getDatabase();
        let fieldName;
        
        switch (elementType) {
            case 'invitadoRol':
                fieldName = 'Mostrar_Invitado';
                break;
            case 'tema':
                fieldName = 'Mostrar_Tema';
                break;
            case 'publicidad':
                fieldName = 'Mostrar_Publicidad';
                break;
            case 'logo':
                fieldName = 'Mostrar_Logo';
                break;
            default:
                console.warn(`⚠️ Tipo de elemento desconocido: ${elementType}`);
                return;
        }
        
        // 🆕 ENVIAR BOOLEAN, NO STRING
        const fieldRef = ref(database, `CLAVE_STREAM_FB/STREAM_LIVE/GRAFICOS/${fieldName}`);
        await set(fieldRef, visible); // ← Cambio: quitar .toString()
        
        console.log(`✅ Firebase actualizado: ${fieldName} = ${visible} (${typeof visible})`);
        
    } catch (error) {
        console.error(`❌ Error actualizando Firebase para ${elementType}:`, error);
    }
}

// 🔧 MODIFICAR LA FUNCIÓN hideElementAutomatically EXISTENTE
function hideElementAutomatically(elementType) {
    console.log(`🤖 Ocultando automáticamente: ${elementType}`);
    
    try {
        switch (elementType) {
            case 'invitadoRol':
                const graficoInvitadoRol = document.getElementById('grafico-invitado-rol');
                const graficoInvitadoRolH3 = document.querySelector('#grafico-invitado-rol h3');
                const graficoInvitadoRolH1 = document.querySelector('#grafico-invitado-rol h1');
                const graficoInvitadoRolH2 = document.querySelector('#grafico-invitado-rol h2');
                
                if (graficoInvitadoRol && graficoInvitadoRolH1 && graficoInvitadoRolH2) {
                        LowerThirdsInvitado(graficoInvitadoRol, graficoInvitadoRolH1, graficoInvitadoRolH2, false);
                    // 🆕 SINCRONIZAR CON FIREBASE
                        actualizarVisibilidadEnFirebase('invitadoRol', false);
                 }
                break;
                
            case 'tema':
                const graficoTema = document.getElementById('grafico-tema');
                const graficoTemaH1 = document.querySelector('#grafico-tema h1');
                const graficoTemaH2 = document.querySelector('#grafico-tema h2');
                
                if (graficoTema && graficoTemaH1) {
                    LowerThirdsTema(graficoTema, graficoTemaH1, false);
                                
                    // 🆕 SINCRONIZAR CON FIREBASE
                    actualizarVisibilidadEnFirebase('tema', false);
                }
                break;
                
            case 'publicidad':
                const graficoPublicidad = document.getElementById('grafico-publicidad');
                if (graficoPublicidad) {
                    updateVisibility(graficoPublicidad, false, null, fadeOut);
                    
                    // 🆕 SINCRONIZAR CON FIREBASE
                    actualizarVisibilidadEnFirebase('publicidad', false);
                }
                break;
                
            case 'logo':
                const logo = document.getElementById('logo');
                if (logo) {
                    updateVisibility(logo, false, null, fadeOut);
                    
                    // 🆕 SINCRONIZAR CON FIREBASE
                    actualizarVisibilidadEnFirebase('logo', false);
                }
                break;
        }
    } catch (error) {
        console.error(`❌ Error ocultando elemento ${elementType}:`, error);
    }
    
    delete automaticTimers[elementType];
    window.automaticTimers = automaticTimers;
}

// 🆕 FUNCIÓN OPCIONAL: Para mostrar también (si necesitas sincronizar cuando se muestra)
function mostrarElementoYSincronizar(elementType) {
    console.log(`📱 Mostrando y sincronizando: ${elementType}`);
    
    // Aquí iría la lógica de mostrar el elemento visualmente
    // (ya existe en tu código actual)
    
    // Sincronizar con Firebase
    actualizarVisibilidadEnFirebase(elementType, true);
}

// 🆕 EXPONER FUNCIONES GLOBALMENTE PARA DEBUG
window.actualizarVisibilidadEnFirebase = actualizarVisibilidadEnFirebase;
window.mostrarElementoYSincronizar = mostrarElementoYSincronizar;
manejarVisibilidadElementos(visibilidad);


window.debugLogosBasico = function() {
    console.log("🔍 DEBUG BÁSICO - LECTURA DE PARÁMETROS:");
    console.log("=".repeat(50));
    
    const logo = document.getElementById('logo');
    console.log("🏛️ LOGO PRINCIPAL:");
    console.log(`   Elemento: ${logo ? 'Encontrado ✅' : 'No encontrado ❌'}`);
    if (logo) {
        console.log(`   URL actual: ${logo.src}`);
        console.log(`   Visible: ${logo.style.display !== 'none' ? 'SÍ ✅' : 'NO ❌'}`);
    }
    console.log(`   URL almacenada: ${logoPrincipalUrl || 'No configurado'}`);
    
    console.log("\n📋 CONFIGURACIÓN LEÍDA:");
    console.log(`   Sistema habilitado: ${logoConfig.habilitado ? 'SÍ ✅' : 'NO ❌'}`);
    console.log(`   Duración principal: ${logoConfig.duraciones.principal}s`);
    console.log(`   Duración aliados: ${logoConfig.duraciones.aliados}s`);
    console.log(`   Ciclo continuo: ${logoConfig.cicloContinuo ? 'SÍ' : 'NO'}`);
    
    console.log("\n🤝 LOGOS ALIADOS:");
    console.log(`   Cantidad: ${logosAliados.length}`);
    if (logosAliados.length > 0) {
        logosAliados.forEach((logo, index) => {
            console.log(`   ${index + 1}. ${logo.nombre} (${logo.url.substring(0, 40)}...)`);
        });
    }
    
    console.log("\n🎬 ANIMACIONES:");
    console.log(`   Principal: ${logoConfig.animaciones.entradaPrincipal} -> ${logoConfig.animaciones.salidaPrincipal}`);
    console.log(`   Aliados: ${logoConfig.animaciones.entradaAliados}`);
    
    console.log("\n🔄 ROTACIÓN:");
    console.log(`   Timer activo: ${logoRotationTimer ? 'SÍ ✅' : 'NO ❌'}`);
    console.log(`   Índice actual: ${currentLogoIndex}`);
    
    console.log("\n💡 COMANDOS DISPONIBLES:");
    console.log("   iniciarRotacionBasica() // Iniciar rotación");
    console.log("   detenerRotacion()       // Detener rotación");
};



// 🌐 VARIABLES GLOBALES PARA DEBUG
window.testAutomaticSystem = testAutomaticSystem;
window.logAutomaticStatus = logAutomaticStatus;
window.debugLogosAliados = debugLogosAliados;
window.testRotacionLogos = testRotacionLogos;
window.startLogoRotation = startLogoRotation;
window.stopLogoRotation = stopLogoRotation;
window.automaticTimers = automaticTimers;
window.currentConfig = currentConfig;
window.configAvanzada = configAvanzada;
window.logoRotationTimer = logoRotationTimer;
window.logosAliados = logosAliados;
window.POSICIONES_PREDEFINIDAS = POSICIONES_PREDEFINIDAS;
window.CONFIG_DEFECTO = CONFIG_DEFECTO;







// 🔥 ====== SISTEMA DE ANIMACIONES DESDE FIREBASE ======

    // 🆕 LEER PARÁMETROS DE ANIMACIÓN DESDE FIREBASE
    console.log('📊 Datos completos de Firebase para animaciones:', data);
    leerParametrosAnimacionFirebase(data);

// Función para leer parámetros de animación desde Firebase
function leerParametrosAnimacionFirebase(data) {
    console.group('🔥 LEYENDO PARÁMETROS DE ANIMACIÓN DESDE FIREBASE');
    
    // 🔍 DEBUG DETALLADO
    console.log('🔍 Datos que llegan a leerParametros:', data);
    console.log('🔍 Campos específicos:');
    console.log('  - animacion_invitadoRol_entrada:', data.animacion_invitadoRol_entrada);
    console.log('  - animacion_invitadoRol_salida:', data.animacion_invitadoRol_salida);
    console.log('  - animacion_invitadoRol_duracion:', data.animacion_invitadoRol_duracion);
    console.log('  - animacion_invitadoRol_delay:', data.animacion_invitadoRol_delay);
    
    const invitadoRolParams = {
        delay: parseInt(data.animacion_invitadoRol_delay) || 100,
        duracion: parseInt(data.animacion_invitadoRol_duracion) || 600,
        easing: data.animacion_invitadoRol_easing || 'EASE_IN_OUT',
        entrada: data.animacion_invitadoRol_entrada || 'SLIDE_IN_RIGHT',
        salida: data.animacion_invitadoRol_salida || 'SLIDE_OUT_LEFT'
    };

    animacionConfig.invitadoRol = invitadoRolParams;

        // 🆕 ===== tema =====
    const temaParams = {
        delay: parseInt(data.animacion_tema_delay) || animacionConfig.tema.delay,
        duracion: parseInt(data.animacion_tema_duracion) || animacionConfig.tema.duracion,
        easing: data.animacion_tema_easing || animacionConfig.tema.easing,
        entrada: data.animacion_tema_entrada || animacionConfig.tema.entrada,
        salida: data.animacion_tema_salida || animacionConfig.tema.salida
    };
    animacionConfig.tema = temaParams;

    // 🆕 ===== publicidad =====
    const publicidadParams = {
        delay: parseInt(data.animacion_publicidad_delay) || animacionConfig.publicidad.delay,
        duracion: parseInt(data.animacion_publicidad_duracion) || animacionConfig.publicidad.duracion,
        easing: data.animacion_publicidad_easing || animacionConfig.publicidad.easing,
        entrada: data.animacion_publicidad_entrada || animacionConfig.publicidad.entrada,
        salida: data.animacion_publicidad_salida || animacionConfig.publicidad.salida
    };
    animacionConfig.publicidad = publicidadParams;


    window.animacionConfig = animacionConfig;
    
    console.log('🎬 CONFIGURACIÓN FINAL GUARDADA:', animacionConfig.invitadoRol);
    console.groupEnd();
    
    return animacionConfig;
}


// Función para aplicar animación dinámica
function aplicarAnimacionDinamica(elemento, tipoElemento, mostrar) {
    if (!elemento || !animacionConfig[tipoElemento]) {
        console.error(`❌ Elemento o configuración no encontrada para: ${tipoElemento}`);
        return;
    }
    
    const config = animacionConfig[tipoElemento];
    const animacion = mostrar ? config.entrada : config.salida;
    const duracion = config.duracion;
    const delay = config.delay;
    const easing = TIPOS_EASING[config.easing] || 'ease-in-out';
    
    console.log(`🎬 Aplicando animación dinámica: ${tipoElemento}`, {
        animacion: animacion,
        duracion: duracion + 'ms',
        delay: delay + 'ms',
        easing: easing,
        mostrar: mostrar
    });
    
    if (mostrar) {
        elemento.style.display = 'flex';
    }
    
    elemento.style.transition = `
        opacity ${duracion}ms ${easing} ${delay}ms,
        transform ${duracion}ms ${easing} ${delay}ms
    `;
    
    setTimeout(() => {
        aplicarAnimacionPorTipo(elemento, animacion, mostrar, duracion);
    }, 16);
}

// Función para aplicar animación por tipo
function aplicarAnimacionPorTipo(elemento, tipoAnimacion, mostrar, duracion) {
    // Limpiar clases anteriores
    elemento.classList.remove(
        'anim-slide-in-left', 'anim-slide-out-left',
        'anim-slide-in-right', 'anim-slide-out-right', 
        'anim-slide-in-top', 'anim-slide-out-top',
        'anim-slide-in-bottom', 'anim-slide-out-bottom',
        'anim-fade-in', 'anim-fade-out'
    );
    
    elemento.offsetHeight; // Forzar reflow
    
    switch (tipoAnimacion) {
        case 'SLIDE_IN_LEFT':
            elemento.style.transform = mostrar ? 'translateX(0)' : 'translateX(-100%)';
            elemento.style.opacity = mostrar ? '1' : '0';
            break;
            
        case 'SLIDE_IN_RIGHT':
            elemento.style.transform = mostrar ? 'translateX(0)' : 'translateX(100%)';
            elemento.style.opacity = mostrar ? '1' : '0';
            break;
            
        case 'SLIDE_OUT_LEFT':
            elemento.style.transform = mostrar ? 'translateX(0)' : 'translateX(-100%)';
            elemento.style.opacity = mostrar ? '1' : '0';
            break;
            
        case 'SLIDE_OUT_RIGHT':
            elemento.style.transform = mostrar ? 'translateX(0)' : 'translateX(100%)';
            elemento.style.opacity = mostrar ? '1' : '0';
            break;
            
        case 'FADE_IN':
        case 'FADE_OUT':
            elemento.style.opacity = mostrar ? '1' : '0';
            break;
        case 'WIPE_IN_RIGHT':
            console.log(`🎭 WIPE_IN_RIGHT - mostrar: ${mostrar}, duración: ${duracion}ms`);
            
            // 🔧 CONFIGURAR TRANSICIÓN ANTES DE APLICAR CAMBIOS
            const easing = window.TIPOS_EASING?.[window.animacionConfig?.invitadoRol?.easing] || 'ease-in-out';
            const delay = window.animacionConfig?.invitadoRol?.delay || 100;
            
            elemento.style.transition = `clip-path ${duracion}ms ${easing} ${delay}ms, opacity ${duracion}ms ${easing} ${delay}ms`;
            elemento.style.opacity = '1';
            
            if (mostrar) {
                // Estado inicial: oculto
                elemento.style.clipPath = 'inset(0 100% 0 0)';
                
                // Forzar reflow para que el navegador aplique el estado inicial
                elemento.offsetHeight;
                
                // Después de un frame, aplicar estado final
                setTimeout(() => {
                    elemento.style.clipPath = 'inset(0 0% 0 0)';
                    console.log('🟢 WIPE_IN_RIGHT: Revelando...');
                }, 16);
            } else {
                // Ocultar inmediatamente
                elemento.style.clipPath = 'inset(0 100% 0 0)';
                console.log('🔴 WIPE_IN_RIGHT: Ocultando...');
            }
            break;
            
        case 'WIPE_OUT_LEFT':
            console.log(`🎭 WIPE_OUT_LEFT - mostrar: ${mostrar}, duración: ${duracion}ms`);
            
            // 🔧 CONFIGURAR TRANSICIÓN
            const easingOut = window.TIPOS_EASING?.[window.animacionConfig?.invitadoRol?.easing] || 'ease-in-out';
            const delayOut = window.animacionConfig?.invitadoRol?.delay || 100;
            
            elemento.style.transition = `clip-path ${duracion}ms ${easingOut} ${delayOut}ms, opacity ${duracion}ms ${easingOut} ${delayOut}ms`;
            elemento.style.opacity = '1';
            
            if (mostrar) {
                // Para salida, cuando se "muestra" significa volver al estado visible
                elemento.style.clipPath = 'inset(0 0% 0 0)';
                console.log('🟢 WIPE_OUT_LEFT: Visible...');
            } else {
                // Estado inicial visible
                elemento.style.clipPath = 'inset(0 0% 0 0)';
                
                // Forzar reflow
                elemento.offsetHeight;
                
                // Después de un frame, aplicar salida hacia la izquierda
                setTimeout(() => {
                    elemento.style.clipPath = 'inset(0 100% 0 0)';
                    console.log('🔴 WIPE_OUT_LEFT: Saliendo hacia izquierda...');
                }, 16);
            }
            break;
            case 'WIPE_IN_TOP': {
            console.log(`🎭 WIPE_IN_TOP - mostrar: ${mostrar}, duración: ${duracion}ms`);
            const easingTop = window.TIPOS_EASING?.[window.animacionConfig?.publicidad?.easing] || 'ease-in-out';
            const delayTop = window.animacionConfig?.publicidad?.delay ?? 0;

            elemento.style.transition = `clip-path ${duracion}ms ${easingTop} ${delayTop}ms, opacity ${duracion}ms ${easingTop} ${delayTop}ms`;
            elemento.style.opacity = '1';

            if (mostrar) {
                // 👆 Revela hacia ARRIBA (de abajo→arriba)
                elemento.style.clipPath = 'inset(100% 0 0 0)'; // todo oculto desde arriba
                elemento.offsetHeight; // reflow
                setTimeout(() => {
                elemento.style.clipPath = 'inset(0 0 0 0)';  // totalmente visible
                console.log('🟢 WIPE_IN_TOP: Revelando hacia arriba');
                }, 16);
            } else {
                // si te pasan "mostrar=false" en entrada, lo dejas oculto
                elemento.style.clipPath = 'inset(100% 0 0 0)';
            }
            break;
            }

            case 'WIPE_OUT_BOTTOM': {
            console.log(`🎭 WIPE_OUT_BOTTOM - mostrar: ${mostrar}, duración: ${duracion}ms`);
            const easingBot = window.TIPOS_EASING?.[window.animacionConfig?.publicidad?.easing] || 'ease-in-out';
            const delayBot = window.animacionConfig?.publicidad?.delay ?? 0;

            elemento.style.transition = `clip-path ${duracion}ms ${easingBot} ${delayBot}ms, opacity ${duracion}ms ${easingBot} ${delayBot}ms`;
            elemento.style.opacity = '1';

            if (mostrar) {
                // En salida, si "mostrar" llega true, mantenlo visible
                elemento.style.clipPath = 'inset(0 0 0 0)';
            } else {
                // 👇 Oculta hacia ABAJO (de arriba→abajo)
                elemento.style.clipPath = 'inset(0 0 100% 0)';
                console.log('🔴 WIPE_OUT_BOTTOM: Saliendo hacia abajo');
            }
            break;
            }
        default:
            console.warn(`⚠️ Tipo de animación no reconocido: ${tipoAnimacion}`);
            elemento.style.opacity = mostrar ? '1' : '0';
    }
    
    if (!mostrar) {
        setTimeout(() => {
            elemento.style.display = 'none';
        }, duracion + 50);
    }
}

// Función LowerThirds actualizada para usar Firebase
function LowerThirdsInvitadoFirebase(graficoInvitadoRol, graficoInvitadoRolH1, graficoInvitadoRolH2, isVisible) {
    if (!graficoInvitadoRol) {
        console.error('❌ Elemento graficoInvitadoRol no encontrado');
        return;
    }

    console.log(`🔥 LowerThirdsInvitadoFirebase: ${isVisible ? 'MOSTRAR' : 'OCULTAR'}`);
    console.log('📊 Usando configuración Firebase:', animacionConfig.invitadoRol);

    aplicarAnimacionDinamica(graficoInvitadoRol, 'invitadoRol', isVisible);
}

// Nueva función para manejar visibilidad con animaciones Firebase
// ✅ Reemplaza toda tu función por esta versión
function manejarVisibilidadElementosConFirebase(visibilidad) {
  console.log("👁️ Flags desde DB (con animaciones Firebase):", visibilidad);

  const refs = {
    invitadoRol: {
      el: document.getElementById('grafico-invitado-rol'),
      visible: !!visibilidad.graficoAlAire
    },
    tema: {
      el: document.getElementById('grafico-tema'),
      visible: !!visibilidad.temaAlAire
    },
    publicidad: {
      el: document.getElementById('grafico-publicidad'),
      visible: !!visibilidad.publicidadAlAire
    }
  };

  Object.entries(refs).forEach(([tipo, cfg]) => {
    const el = cfg.el;
    if (!el) return;

    const isVisible = el.style.display !== 'none';
    if (cfg.visible === isVisible) {
      console.log(`⏭️ ${tipo}: Sin cambios (${isVisible ? 'visible' : 'oculto'})`);
      return;
    }

    console.log(`🔄 ${tipo}: ${isVisible ? 'visible' : 'oculto'} → ${cfg.visible ? 'visible' : 'oculto'}`);

    if (cfg.visible) {
      el.style.display = (tipo === 'invitadoRol') ? 'flex' : 'block';
      aplicarAnimacionDinamica(el, tipo, true);

      if (window.currentConfig?.modoAutomatico && window.currentConfig?.habilitarOcultamientoAutomatico) {
        cancelAutomaticTimer(tipo);
        iniciarTemporizadorAutomatico(tipo);
      }
    } else {
      // 🔸 Animar salida y ocultar SOLO al final
      const animCfg = window.animacionConfig?.[tipo] || window.animacionConfig?.invitadoRol || {};
      const total = (Number(animCfg.delay) || 0) + (Number(animCfg.duracion) || 600) + 50;

      aplicarAnimacionDinamica(el, tipo, false);

      let fin = false;
      const onEnd = () => {
        if (fin) return;
        fin = true;
        el.style.display = 'none';
        el.removeEventListener('transitionend', onEnd);
        console.log(`✅ TRANSICIÓN FIN (${tipo})`);
      };

      el.addEventListener('transitionend', onEnd, { once: true });
      setTimeout(onEnd, total); // Fallback
      cancelAutomaticTimer(tipo);
    }
  });
}


function debugWipeTiming() {
    console.group('🔍 DEBUG WIPE TIMING');
    
    const elemento = document.getElementById('grafico-invitado-rol');
    const config = window.animacionConfig?.invitadoRol;
    
    if (!elemento) {
        console.error('❌ Elemento no encontrado');
        console.groupEnd();
        return;
    }
    
    if (!config) {
        console.error('❌ Configuración no encontrada');
        console.groupEnd();
        return;
    }
    
    console.log('📊 Configuración actual:', config);
    console.log('🎨 Estilos CSS actuales:', {
        transition: elemento.style.transition,
        clipPath: elemento.style.clipPath,
        opacity: elemento.style.opacity,
        display: elemento.style.display
    });
    
    // Verificar valores computed
    const computed = window.getComputedStyle(elemento);
    console.log('🖥️ Valores computados:', {
        transition: computed.transition,
        clipPath: computed.clipPath,
        transitionDuration: computed.transitionDuration,
        transitionDelay: computed.transitionDelay
    });
    
    console.groupEnd();
}

// 🔧 SOLUCIÓN 4: Test manual de WIPE con timing correcto

function testWipeConTiming() {
    console.clear();
    console.log('🧪 TEST WIPE CON TIMING CORRECTO');
    console.log('='.repeat(40));
    
    const elemento = document.getElementById('grafico-invitado-rol');
    if (!elemento) {
        console.error('❌ Elemento no encontrado');
        return;
    }
    
    // Configuración de test
    const duracion = 600;
    const delay = 100;
    const easing = 'ease-in-out';
    
    console.log(`⚙️ Configuración: ${duracion}ms duración, ${delay}ms delay, ${easing}`);
    
    // Preparar elemento
    elemento.style.display = 'flex';
    elemento.style.opacity = '1';
    elemento.style.transition = `clip-path ${duracion}ms ${easing} ${delay}ms`;
    
    // Estado inicial
    elemento.style.clipPath = 'inset(0 100% 0 0)';
    console.log('🔴 Estado inicial: Oculto');
    
    // Forzar reflow
    elemento.offsetHeight;
    
    // Test entrada después de 1 segundo
    setTimeout(() => {
        console.log('🟢 Iniciando WIPE_IN_RIGHT...');
        elemento.style.clipPath = 'inset(0 0% 0 0)';
    }, 1000);
    
    // Test salida después de 3 segundos
    setTimeout(() => {
        console.log('🔴 Iniciando WIPE_OUT_LEFT...');
        elemento.style.clipPath = 'inset(0 0 0 100%)';
    }, 3000);
    
    // Estado final después de 5 segundos
    setTimeout(() => {
        console.log('✅ Test completado');
        debugWipeTiming();
    }, 5000);
}

// 🌐 EXPONER FUNCIONES
window.debugWipeTiming = debugWipeTiming;
window.testWipeConTiming = testWipeConTiming;

console.log('🔧 CORRECCIONES WIPE TIMING CARGADAS');
console.log('📋 Comandos de test:');
console.log('   - testWipeConTiming()    // Test manual con timing');
console.log('   - debugWipeTiming()      // Ver configuración actual');
