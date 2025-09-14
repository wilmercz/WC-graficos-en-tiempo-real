// 📺 instances/equipo1/noticias/config.js
// Configuración específica: Equipo1 - Noticias

import { createNewsInstanceConfig } from '../../../shared/templates/news/config.js';

// 🎯 CONFIGURACIÓN PERSONALIZADA PARA EQUIPO1
const customConfig = {
    // 🎨 COLORES ESPECÍFICOS DEL EQUIPO1
    defaultColors: {
        // Colores corporativos del Equipo1
        fondo1: '#1066DC',      // Azul corporativo principal
        letra1: '#FFFFFF',      // Blanco para contraste
        fondo2: '#1066FF',      // Azul claro para rol
        letra2: '#FFFFFF',      // Blanco
        fondo3: '#103264',      // Azul oscuro para tema
        letra3: '#E1FFFF',      // Azul claro para texto tema
        fondoLogos: 'rgba(16, 102, 220, 0.1)', // Fondo sutil para logos
        accentColor: '#FFD700'   // Dorado para acentos especiales
    },
    
    // ⏰ TIEMPOS ESPECÍFICOS PARA EQUIPO1
    timing: {
        autoHide: true,
        defaultDurations: {
            logo: 60,           // 1 minuto logo principal
            invitado: 50,       // 50 segundos invitado (más tiempo)
            tema: 40,           // 40 segundos tema
            publicidad: 25,     // 25 segundos publicidad
            logosAliados: 45    // 45 segundos logos aliados
        }
    },
    
    // 🎬 ANIMACIONES PERSONALIZADAS PARA EQUIPO1
    animations: {
        preset: 'equipo1-smooth',
        customConfig: {
            invitadoRol: {
                delay: 150,         // Delay más suave
                duracion: 700,      // Animación más lenta y elegante
                easing: 'EASE_IN_OUT',
                entrada: 'WIPE_IN_RIGHT',
                salida: 'WIPE_OUT_LEFT'
            },
            tema: {
                delay: 200,
                duracion: 650,
                easing: 'EASE_IN_OUT',
                entrada: 'WIPE_IN_LEFT',
                salida: 'WIPE_OUT_TOP'
            },
            logo: {
                delay: 0,
                duracion: 500,      // Logo con transición más suave
                easing: 'EASE_IN_OUT',
                entrada: 'FADE_IN',
                salida: 'FADE_OUT'
            },
            publicidad: {
                delay: 100,
                duracion: 450,
                easing: 'EASE_IN_OUT',
                entrada: 'SLIDE_IN_BOTTOM',
                salida: 'SLIDE_OUT_BOTTOM'
            }
        }
    },
    
    // 🔐 CONFIGURACIÓN DE SEGURIDAD PARA EQUIPO1
    security: {
        allowedDomains: [
            'wilmercz.github.io',
            'localhost',
            '127.0.0.1'
        ],
        sessionTimeout: 7200000,    // 2 horas
        maxConnections: 3,
        allowDebug: true            // Permitir debug para este equipo
    },
    
    // 📊 CONFIGURACIÓN DE LOGGING PARA EQUIPO1
    debug: {
        enabled: true,              // Habilitado para pruebas
        logLevel: 'info',
        logToConsole: true,
        logToFile: false,
        modules: {
            firebase: true,
            animations: true,
            scheduler: true,
            lowerThirds: true
        }
    },
    
    // 🎯 VALIDACIONES ESPECÍFICAS PARA EQUIPO1
    validations: {
        required: [
            'Invitado',
            'Rol'
        ],
        optional: [
            'Tema',
            'urlLogo',
            'urlImagenPublicidad'
        ],
        contentLimits: {
            invitadoMaxLength: 45,  // Límite más estricto
            rolMaxLength: 25,
            temaMaxLength: 70
        }
    },
    
    // 🎪 CONFIGURACIÓN ESPECÍFICA DE LOGOS PARA EQUIPO1
    logoConfig: {
        enabled: true,              // Equipo1 tiene rotación de logos
        mainDuration: 60,           // 60 segundos logo principal
        aliadoDuration: 45,         // 45 segundos logos aliados
        continuousCycle: true,
        autoRotation: true,
        // Lista específica de logos aliados para Equipo1
        logosAliados: [
            {
                id: 'logo_aliado_1',
                nombre: 'Patrocinador Principal',
                url: 'https://example.com/logo1.png',
                activo: true,
                orden: 1
            },
            {
                id: 'logo_aliado_2', 
                nombre: 'Socio Estratégico',
                url: 'https://example.com/logo2.png',
                activo: true,
                orden: 2
            }
        ]
    }
};

// 🔧 CREAR CONFIGURACIÓN FINAL PARA EQUIPO1 NOTICIAS
export const instanceConfig = createNewsInstanceConfig('equipo1', customConfig);

// 🎯 INFORMACIÓN ADICIONAL DE LA INSTANCIA
instanceConfig.meta = {
    ...instanceConfig.meta,
    teamInfo: {
        fullName: 'Equipo Uno Producciones',
        contact: 'equipo1@example.com',
        timezone: 'America/Guayaquil',
        language: 'es-EC'
    },
    deployment: {
        environment: 'production',
        lastUpdate: new Date().toISOString(),
        version: '2.0.0',
        build: 'equipo1-noticias-001'
    }
};

// 🔍 VALIDACIÓN DE CONFIGURACIÓN
console.log('📺 Configuración Equipo1-Noticias cargada:');
console.log(`   🎯 Instancia: ${instanceConfig.instanceId}`);
console.log(`   🔥 Firebase: ${instanceConfig.firebasePath}`);
console.log(`   🎨 Tema: ${instanceConfig.theme}`);
console.log(`   📦 Elementos: ${Object.keys(instanceConfig.allowedElements).filter(k => instanceConfig.allowedElements[k]).join(', ')}`);

export default instanceConfig;