// ⚽ instances/equipoA/futbol/config.js
// Configuración específica: EquipoA - Fútbol

import { createSportsInstanceConfig } from '../../../shared/templates/sports/config.js';

// 🎯 CONFIGURACIÓN PERSONALIZADA PARA EQUIPOA FÚTBOL
const customConfig = {
    // 🔗 Ruta personalizada de Firebase para datos de fútbol
    firebasePath: 'CLAVE_STREAM_FB/STREAM_LIVE/GRAFICOS_FUTBOL',

    // 🎨 COLORES ESPECÍFICOS DEL EQUIPOA DEPORTES
    defaultColors: {
        // Colores deportivos del EquipoA
        fondo_marcador: '#000000',      // Negro sólido para marcador
        texto_marcador: '#FFFFFF',      // Blanco para contraste máximo
        
        // Colores por defecto para equipos (se sobrescriben desde Firebase)
        equipo_local: '#FF0000',        // Rojo por defecto
        equipo_visitante: '#0000FF',    // Azul por defecto
        
        // Colores para jugador destacado
        fondo_jugador: '#1a1a1a',       // Gris muy oscuro
        texto_jugador: '#FFFFFF',       // Blanco
        acento_jugador: '#00FF41',      // Verde neón para destacar
        
        // Colores para estadísticas
        fondo_stats: '#2d2d2d',         // Gris carbón
        texto_stats: '#FFFFFF',         // Blanco
        border_stats: '#00FF41',        // Verde neón para bordes
        
        // Color general del EquipoA
        accentColor: '#00FF41',         // Verde neón característico
        primaryBrand: '#FF6B00'         // Naranja corporativo EquipoA
    },
    
    // ⏰ TIEMPOS ESPECÍFICOS PARA EQUIPOA FÚTBOL
    timing: {
        autoHide: true,
        defaultDurations: {
            logo: 45,               // 45 segundos logo (más dinámico)
            marcador: 90,           // 90 segundos marcador (tiempo importante)
            jugador: 60,            // 1 minuto jugador destacado
            estadisticas: 45,       // 45 segundos estadísticas
            equipos: 30,            // 30 segundos info equipos
            logoMarcador: 120       // 2 minutos cuando marcador está visible
        }
    },
    
    // 🎬 ANIMACIONES DEPORTIVAS PARA EQUIPOA
    animations: {
        preset: 'equipoA-sports-dynamic',
        customConfig: {
            marcador: {
                delay: 50,              // Entrada rápida
                duracion: 900,          // Animación contundente
                easing: 'BOUNCE',       // Efecto dinámico
                entrada: 'SLIDE_IN_TOP',
                salida: 'SLIDE_OUT_TOP'
            },
            jugador: {
                delay: 100,
                duracion: 800,
                easing: 'EASE_IN_OUT',
                entrada: 'SLIDE_IN_RIGHT',
                salida: 'SLIDE_OUT_RIGHT'
            },
            equipos: {
                delay: 75,
                duracion: 750,
                easing: 'EASE_IN_OUT',
                entrada: 'SLIDE_IN_LEFT',
                salida: 'SLIDE_OUT_LEFT'
            },
            estadisticas: {
                delay: 50,
                duracion: 600,
                easing: 'EASE_IN_OUT',
                entrada: 'FADE_IN',
                salida: 'FADE_OUT'
            },
            logo: {
                delay: 0,
                duracion: 500,
                easing: 'EASE_IN_OUT',
                entrada: 'FADE_IN',
                salida: 'FADE_OUT'
            }
        }
    },
    
    // 🔐 CONFIGURACIÓN DE SEGURIDAD PARA EQUIPOA
    security: {
        allowedDomains: [
            'wilmercz.github.io',
            'localhost',
            '127.0.0.1'
        ],
        sessionTimeout: 10800000,       // 3 horas para partidos largos
        maxConnections: 5,              // Más conexiones para equipo técnico
        allowDebug: true,
        allowRemoteControl: true        // Permitir control remoto durante partido
    },
    
    // 📊 CONFIGURACIÓN DE LOGGING PARA EQUIPOA DEPORTES
    debug: {
        enabled: true,
        logLevel: 'info',
        logToConsole: true,
        logToFile: false,
        modules: {
            firebase: true,
            animations: true,
            scheduler: true,
            matchEvents: true,          // Log específico de eventos del partido
            scoreboard: true            // Log específico del marcador
        }
    },
    
    // ⚽ CONFIGURACIÓN ESPECÍFICA DE FÚTBOL PARA EQUIPOA
    sportsSpecific: {
        // Estados válidos del partido con colores específicos
        stateColors: {
            'PROXIMO': '#666666',       // Gris
            'PRIMER_TIEMPO': '#00FF41', // Verde EquipoA
            'DESCANSO': '#FFD700',      // Amarillo
            'SEGUNDO_TIEMPO': '#00FF41',// Verde EquipoA
            'TIEMPO_EXTRA': '#FF8000',  // Naranja
            'PENALES': '#FF0000',       // Rojo
            'FINALIZADO': '#808080'     // Gris claro
        },
        
        // Configuración de partido específica
        matchConfig: {
            showMinuteCounter: true,
            showPossessionBar: true,
            autoUpdateScore: true,
            enableLiveStats: true,
            showTemperature: false,
            showAttendance: true
        },
        
        // Configuración de jugador destacado
        playerConfig: {
            showPlayerPhoto: true,
            showPlayerStats: true,
            showPlayerNumber: true,
            autoHideAfterGoal: true,
            highlightGoalScorer: true
        },
        
        // Configuración de estadísticas
        statsConfig: {
            showPossession: true,
            showShots: true,
            showCorners: true,
            showCards: true,
            showOffsides: false,
            animateChanges: true
        }
    },
    
    // 🎯 VALIDACIONES ESPECÍFICAS PARA EQUIPOA FÚTBOL
    validations: {
        required: [
            'Equipo_Local',
            'Equipo_Visitante',
            'Goles_Local',
            'Goles_Visitante'
        ],
        optional: [
            'Jugador_Destacado',
            'urlLogo_Local',
            'urlLogo_Visitante',
            'Nombre_Torneo',
            'Estadio'
        ],
        contentLimits: {
            equipoMaxLength: 18,        // Límite ajustado para pantalla
            jugadorMaxLength: 22,
            posicionMaxLength: 8,
            torneoMaxLength: 25,
            estadioMaxLength: 30
        },
        numericRanges: {
            golesMin: 0,
            golesMax: 15,               // Límite realista
            minutoMin: 0,
            minutoMax: 120,
            posesionMin: 0,
            posesionMax: 100,
            tirosMin: 0,
            tirosMax: 30
        }
    },
    
    // 🏟️ CONFIGURACIÓN ESPECÍFICA DEL EVENTO PARA EQUIPOA
    eventConfig: {
        // Información por defecto del evento
        defaultTournament: 'Liga Pro Ecuador',
        defaultStadium: 'Estadio a definir',
        defaultCity: 'Guayaquil',
        
        // Configuración de overlay de evento
        showTournamentLogo: true,
        showStadiumName: true,
        showDate: true,
        showWeather: false,
        
        // Sponsors específicos de EquipoA
        sponsors: [
            {
                name: 'Sponsor Principal EquipoA',
                logo: 'https://example.com/sponsor1.png',
                position: 'main'
            },
            {
                name: 'Sponsor Secundario',
                logo: 'https://example.com/sponsor2.png', 
                position: 'secondary'
            }
        ]
    },
    
    // 📱 CONFIGURACIÓN DE INTERFACE PARA EQUIPOA
    ui: {
        theme: 'equipoA-sports',
        accentColor: '#00FF41',
        showAdvancedControls: true,
        enableTouchControls: false,
        showFPS: false,
        enableFullscreen: true,
        
        // Configuración de marcador
        scoreboard: {
            fontSize: 'large',
            showTeamColors: true,
            showTeamLogos: true,
            animateScoreChanges: true,
            highlightLeadingTeam: true
        }
    }
};

// 🔧 CREAR CONFIGURACIÓN FINAL PARA EQUIPOA FÚTBOL
export const instanceConfig = createSportsInstanceConfig('equipoA', 'futbol', customConfig);

// 🎯 INFORMACIÓN ADICIONAL DE LA INSTANCIA DEPORTIVA
instanceConfig.meta = {
    ...instanceConfig.meta,
    teamInfo: {
        fullName: 'Equipo A Deportes',
        contact: 'deportes@equipoA.com',
        timezone: 'America/Guayaquil',
        language: 'es-EC',
        specialization: 'Fútbol Profesional'
    },
    deployment: {
        environment: 'production',
        lastUpdate: new Date().toISOString(),
        version: '2.0.0',
        build: 'equipoA-futbol-001',
        sport: 'futbol'
    },
    capabilities: {
        liveScoring: true,
        playerTracking: true,
        statisticsDisplay: true,
        multiCamera: false,
        instantReplay: false
    }
};

// 📊 DATOS DE PRUEBA ESPECÍFICOS PARA EQUIPOA
export const testMatchData = {
    // Visibilidad inicial
    Mostrar_Logo: true,
    Mostrar_Marcador: true,
    Mostrar_Equipos: false,
    Mostrar_Jugador: false,
    Mostrar_Estadisticas: false,
    
    // Datos del partido de prueba
    Equipo_Local: "Barcelona SC",
    Equipo_Visitante: "Liga de Quito",
    Goles_Local: 2,
    Goles_Visitante: 1,
    Tiempo_Partido: "67:30",
    Minuto_Partido: 67,
    Estado_Partido: "SEGUNDO_TIEMPO",
    Periodo_Actual: "2T",
    
    // Información del torneo
    Nombre_Torneo: "Liga Pro Ecuador 2024",
    Fecha_Partido: "15 Diciembre 2024",
    Estadio: "Estadio Monumental",
    Ciudad: "Guayaquil",
    
    // Jugador destacado
    Jugador_Destacado: "Michael Hoyos",
    Posicion_Jugador: "DEL",
    Equipo_Jugador: "Barcelona SC",
    Numero_Jugador: 7,
    Goles_Jugador: 1,
    
    // URLs de logos
    urlLogo_Local: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Barcelona_Sporting_Club_logo.svg/200px-Barcelona_Sporting_Club_logo.svg.png",
    urlLogo_Visitante: "https://upload.wikimedia.org/wikipedia/en/thumb/b/b3/LDU_Quito_logo.svg/200px-LDU_Quito_logo.svg.png",
    
    // Colores específicos del partido
    colorEquipo_Local: "#FFD700",      // Amarillo Barcelona
    colorEquipo_Visitante: "#FFFFFF",  // Blanco Liga
    
    // Estadísticas del partido
    Posesion_Local: 58,
    Posesion_Visitante: 42,
    Tiros_Local: 12,
    Tiros_Visitante: 8,
    Corners_Local: 6,
    Corners_Visitante: 3,
    Tarjetas_A_Local: 2,
    Tarjetas_A_Visitante: 1,
    Tarjetas_R_Local: 0,
    Tarjetas_R_Visitante: 1,
    
    // Configuración
    modoAutomatico: true,
    duracionMarcador: 90,
    duracionJugador: 60,
    duracionEstadisticas: 45
};

// 🔍 VALIDACIÓN DE CONFIGURACIÓN
console.log('⚽ Configuración EquipoA-Fútbol cargada:');
console.log(`   🎯 Instancia: ${instanceConfig.instanceId}`);
console.log(`   🔥 Firebase: ${instanceConfig.firebasePath}`);
console.log(`   🎨 Tema: ${instanceConfig.theme}`);
console.log(`   🏟️ Deporte: ${instanceConfig.sport}`);
console.log(`   📦 Elementos: ${Object.keys(instanceConfig.allowedElements).filter(k => instanceConfig.allowedElements[k]).join(', ')}`);
console.log(`   ⚽ Capacidades: ${Object.keys(instanceConfig.meta.capabilities).filter(k => instanceConfig.meta.capabilities[k]).join(', ')}`);

export default instanceConfig;