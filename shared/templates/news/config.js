// 📺 shared/templates/news/config.js
// Configuración base para instancias de NOTICIAS

export const newsTemplateConfig = {
    // 🎯 IDENTIFICACIÓN BASE
    category: 'noticias',
    theme: 'news',
    
    // 📦 ELEMENTOS HABILITADOS PARA NOTICIAS
    allowedElements: {
        logo: true,
        invitado: true,        // Gráfico Invitado/Rol
        tema: true,            // Gráfico Tema
        publicidad: true,      // Gráfico Publicidad
        clock: true,           // Reloj del stream
        // Elementos específicos de noticias
        breakingNews: false,   // Para futuras expansiones
        ticker: false          // Para futuras expansiones
    },
    
    // ⏰ CONFIGURACIÓN DE TIEMPOS PARA NOTICIAS
    timing: {
        autoHide: true,
        defaultDurations: {
            logo: 60,          // Logo principal 60 segundos
            invitado: 45,      // Invitado/Rol 45 segundos
            tema: 45,          // Tema 45 segundos
            publicidad: 30,    // Publicidad 30 segundos
            logosAliados: 45   // Logos aliados 45 segundos
        }
    },
    
    // 🎬 ANIMACIONES PARA NOTICIAS
    animations: {
        preset: 'news-smooth',
        customConfig: {
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
        }
    },
    
    // 🎨 COLORES POR DEFECTO PARA NOTICIAS
    defaultColors: {
        // Colores para Invitado/Rol
        fondo1: '#1066DC',      // Azul corporativo para invitado
        letra1: '#FFFFFF',      // Blanco para texto invitado
        fondo2: '#1066FF',      // Azul claro para rol
        letra2: '#FFFFFF',      // Blanco para texto rol
        
        // Colores para Tema
        fondo3: '#103264',      // Azul oscuro para tema
        letra3: '#E1FFFF',      // Azul claro para texto tema
        
        // Colores adicionales
        fondoLogos: 'transparent',
        accentColor: '#FFD700'   // Dorado para acentos
    },
    
    // 🔐 SEGURIDAD PARA NOTICIAS
    security: {
        allowedDomains: ['wilmercz.github.io'],
        sessionTimeout: 7200000,    // 2 horas para noticias
        maxConnections: 3
    },
    
    // 📊 LOGGING PARA NOTICIAS
    debug: {
        enabled: false,           // Deshabilitado en producción
        logLevel: 'info',
        logToConsole: true,
        logToFile: false,
        modules: {
            firebase: true,
            animations: true,
            scheduler: true
        }
    },
    
    // 📋 CAMPOS ESPECÍFICOS DE FIREBASE PARA NOTICIAS
    firebaseFields: {
        // Campos de visibilidad
        visibility: [
            'Mostrar_Logo',
            'Mostrar_Invitado', 
            'Mostrar_Tema',
            'Mostrar_Publicidad',
            'Mostrar_Hora'
        ],
        
        // Campos de contenido
        content: [
            'Invitado',           // Nombre del invitado
            'Rol',                // Rol/cargo del invitado
            'Tema'                // Tema del segmento
        ],
        
        // Campos de imágenes
        images: [
            'urlLogo',            // URL del logo principal
            'urlImagenPublicidad' // URL de la imagen publicitaria
        ],
        
        // Campos de colores
        colors: [
            'colorFondo1',        // Color fondo invitado
            'colorLetra1',        // Color texto invitado
            'colorFondo2',        // Color fondo rol
            'colorLetra2',        // Color texto rol
            'colorFondo3',        // Color fondo tema
            'colorLetra3',        // Color texto tema
            'colorFondoLogos'     // Color fondo logos
        ],
        
        // Campos de tiempo/duración
        timing: [
            'duracionNombreRol',  // Duración invitado/rol
            'duracionTema',       // Duración tema
            'duracionPublicidad', // Duración publicidad
            'duracionLogoPrincipal',
            'duracionLogosAliados',
            'modoAutomatico',
            'habilitarOcultamientoAutomatico'
        ],
        
        // Campos de animaciones
        animations: [
            'animacion_invitadoRol_entrada',
            'animacion_invitadoRol_salida',
            'animacion_invitadoRol_duracion',
            'animacion_invitadoRol_delay',
            'animacion_invitadoRol_easing',
            'animacion_tema_entrada',
            'animacion_tema_salida',
            'animacion_tema_duracion',
            'animacion_tema_delay',
            'animacion_tema_easing',
            'animacion_logo_entrada',
            'animacion_logo_salida',
            'animacion_logo_duracion',
            'animacion_logo_delay',
            'animacion_logo_easing',
            'animacion_publicidad_entrada',
            'animacion_publicidad_salida',
            'animacion_publicidad_duracion',
            'animacion_publicidad_delay',
            'animacion_publicidad_easing'
        ],
        
        // Campos de logos aliados
        logos: [
            'logosAliados_config_habilitado',
            'logosAliados_config_lista',
            'cicloContinuoLogos'
        ]
    },
    
    // 🎯 VALIDACIONES ESPECÍFICAS PARA NOTICIAS
    validations: {
        required: [
            'Invitado',           // Al menos debe tener invitado
            'Rol'                 // Al menos debe tener rol
        ],
        optional: [
            'Tema',
            'urlLogo',
            'urlImagenPublicidad'
        ],
        contentLimits: {
            invitadoMaxLength: 50,
            rolMaxLength: 30,
            temaMaxLength: 80
        }
    }
};

// 🔧 FUNCIÓN PARA CREAR CONFIGURACIÓN DE INSTANCIA ESPECÍFICA
export function createNewsInstanceConfig(teamId, customOverrides = {}) {
    const instanceId = `${teamId}-noticias`;
    const firebasePath = `CLAVE_STREAM_FB/${teamId.toUpperCase()}/NOTICIAS/STREAM_LIVE/GRAFICOS`;
    
    return {
        // Heredar configuración base
        ...newsTemplateConfig,
        
        // Configuración específica de instancia
        instanceId: instanceId,
        instanceName: `${teamId.charAt(0).toUpperCase() + teamId.slice(1)} - Noticias`,
        teamName: teamId,
        
        // Firebase específico
        firebasePath: firebasePath,
        backupPath: `CLAVE_STREAM_FB/${teamId.toUpperCase()}/NOTICIAS/BACKUP`,
        
        // CSS personalizado
        customCSS: `/instances/${teamId}/noticias/styles.css`,
        
        // Sobrescribir con personalizaciones
        ...customOverrides,
        
        // Meta información
        meta: {
            created: new Date().toISOString(),
            template: 'news',
            version: '2.0.0'
        }
    };
}

console.log('📺 News Template Config loaded');