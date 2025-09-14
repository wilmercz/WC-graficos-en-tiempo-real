// ⚽ shared/templates/sports/config.js
// Configuración base para instancias de FÚTBOL

export const sportsTemplateConfig = {
    // 🎯 IDENTIFICACIÓN BASE
    category: 'futbol',
    theme: 'sports',
    
    // 📦 ELEMENTOS HABILITADOS PARA FÚTBOL
    allowedElements: {
        logo: true,
        marcador: true,        // Marcador del partido
        equipos: true,         // Información de equipos
        jugador: true,         // Jugador destacado
        estadisticas: true,    // Estadísticas del partido
        clock: true,           // Reloj del stream
        // Elementos específicos de fútbol
        formaciones: false,    // Para futuras expansiones
        substituciones: false, // Para futuras expansiones
        tarjetas: false       // Para futuras expansiones
    },
    
    // ⏰ CONFIGURACIÓN DE TIEMPOS PARA FÚTBOL
    timing: {
        autoHide: true,
        defaultDurations: {
            logo: 60,          // Logo principal 60 segundos
            marcador: 120,     // Marcador 2 minutos (más tiempo en deportes)
            jugador: 45,       // Jugador destacado 45 segundos
            estadisticas: 60,  // Estadísticas 1 minuto
            equipos: 30        // Información equipos 30 segundos
        }
    },
    
    // 🎬 ANIMACIONES PARA FÚTBOL
    animations: {
        preset: 'sports-dynamic',
        customConfig: {
            marcador: {
                delay: 100,
                duracion: 800,
                easing: 'BOUNCE',
                entrada: 'SLIDE_IN_TOP',
                salida: 'SLIDE_OUT_TOP'
            },
            jugador: {
                delay: 200,
                duracion: 700,
                easing: 'EASE_IN_OUT',
                entrada: 'SLIDE_IN_RIGHT',
                salida: 'SLIDE_OUT_RIGHT'
            },
            equipos: {
                delay: 150,
                duracion: 600,
                easing: 'EASE_IN_OUT',
                entrada: 'SLIDE_IN_LEFT',
                salida: 'SLIDE_OUT_LEFT'
            },
            estadisticas: {
                delay: 100,
                duracion: 500,
                easing: 'EASE_IN_OUT',
                entrada: 'FADE_IN',
                salida: 'FADE_OUT'
            },
            logo: {
                delay: 0,
                duracion: 400,
                easing: 'EASE_IN_OUT',
                entrada: 'FADE_IN',
                salida: 'FADE_OUT'
            }
        }
    },
    
    // 🎨 COLORES POR DEFECTO PARA FÚTBOL
    defaultColors: {
        // Colores para marcador
        fondo_marcador: '#000000',    // Negro para fondo marcador
        texto_marcador: '#FFFFFF',    // Blanco para texto marcador
        
        // Colores por defecto para equipos
        equipo_local: '#FF0000',      // Rojo para equipo local
        equipo_visitante: '#0000FF',  // Azul para equipo visitante
        
        // Colores para jugador destacado
        fondo_jugador: '#1a1a1a',     // Gris oscuro
        texto_jugador: '#FFFFFF',     // Blanco
        acento_jugador: '#FFD700',    // Dorado para acentos
        
        // Colores para estadísticas
        fondo_stats: '#2d2d2d',       // Gris medio
        texto_stats: '#FFFFFF',       // Blanco
        
        // Color general
        accentColor: '#00FF00'        // Verde para elementos activos
    },
    
    // 🔐 SEGURIDAD PARA FÚTBOL
    security: {
        allowedDomains: ['wilmercz.github.io'],
        sessionTimeout: 10800000,    // 3 horas para partidos largos
        maxConnections: 5             // Más conexiones para equipos técnicos
    },
    
    // 📊 LOGGING PARA FÚTBOL
    debug: {
        enabled: false,
        logLevel: 'info',
        logToConsole: true,
        logToFile: false,
        modules: {
            firebase: true,
            animations: true,
            scheduler: true,
            matchEvents: true         // Específico para eventos del partido
        }
    },
    
    // 📋 CAMPOS ESPECÍFICOS DE FIREBASE PARA FÚTBOL
    firebaseFields: {
        // Campos de visibilidad
        visibility: [
            'Mostrar_Logo',
            'Mostrar_Marcador',
            'Mostrar_Equipos',
            'Mostrar_Jugador',
            'Mostrar_Estadisticas',
            'Mostrar_Hora'
        ],
        
        // Datos del partido
        matchData: [
            'Equipo_Local',           // Nombre equipo local
            'Equipo_Visitante',       // Nombre equipo visitante
            'Goles_Local',            // Goles equipo local
            'Goles_Visitante',        // Goles equipo visitante
            'Tiempo_Partido',         // Tiempo mostrado (ej: "15:30")
            'Minuto_Partido',         // Minuto actual del partido
            'Estado_Partido',         // PRIMER_TIEMPO, SEGUNDO_TIEMPO, DESCANSO, FINALIZADO
            'Periodo_Actual',         // 1T, 2T, DESC, FIN
            'Tiempo_Adicional'        // Tiempo adicional si aplica
        ],
        
        // Datos del jugador destacado
        playerData: [
            'Jugador_Destacado',      // Nombre del jugador
            'Posicion_Jugador',       // Posición (DEL, MED, DEF, POR)
            'Equipo_Jugador',         // Equipo al que pertenece
            'Numero_Jugador',         // Número de camiseta
            'Goles_Jugador',          // Goles del jugador en el partido
            'Tarjetas_Jugador'        // Tarjetas del jugador
        ],
        
        // URLs de imágenes
        images: [
            'urlLogo',                // Logo principal del canal/evento
            'urlLogo_Local',          // Escudo equipo local
            'urlLogo_Visitante',      // Escudo equipo visitante
            'urlFoto_Jugador',        // Foto del jugador destacado
            'urlFondo_Estadio'        // Imagen del estadio (opcional)
        ],
        
        // Colores personalizados
        colors: [
            'colorEquipo_Local',      // Color principal equipo local
            'colorEquipo_Visitante',  // Color principal equipo visitante
            'colorFondo_Marcador',    // Color fondo del marcador
            'colorTexto_Marcador',    // Color texto del marcador
            'colorFondo_Jugador',     // Color fondo info jugador
            'colorTexto_Jugador',     // Color texto info jugador
            'colorFondo_Stats',       // Color fondo estadísticas
            'colorTexto_Stats'        // Color texto estadísticas
        ],
        
        // Estadísticas del partido
        statistics: [
            'Posesion_Local',         // % posesión equipo local
            'Posesion_Visitante',     // % posesión equipo visitante
            'Tiros_Local',            // Tiros al arco equipo local
            'Tiros_Visitante',        // Tiros al arco equipo visitante
            'Corners_Local',          // Corners equipo local
            'Corners_Visitante',      // Corners equipo visitante
            'Tarjetas_A_Local',       // Tarjetas amarillas equipo local
            'Tarjetas_A_Visitante',   // Tarjetas amarillas equipo visitante
            'Tarjetas_R_Local',       // Tarjetas rojas equipo local
            'Tarjetas_R_Visitante'    // Tarjetas rojas equipo visitante
        ],
        
        // Configuración de tiempo/duración
        timing: [
            'duracionMarcador',       // Duración marcador visible
            'duracionJugador',        // Duración info jugador
            'duracionEstadisticas',   // Duración estadísticas
            'duracionEquipos',        // Duración info equipos
            'modoAutomatico',
            'habilitarOcultamientoAutomatico'
        ],
        
        // Configuración de animaciones
        animations: [
            'animacion_marcador_entrada',
            'animacion_marcador_salida',
            'animacion_marcador_duracion',
            'animacion_marcador_delay',
            'animacion_marcador_easing',
            'animacion_jugador_entrada',
            'animacion_jugador_salida',
            'animacion_jugador_duracion',
            'animacion_jugador_delay',
            'animacion_jugador_easing',
            'animacion_estadisticas_entrada',
            'animacion_estadisticas_salida',
            'animacion_estadisticas_duracion',
            'animacion_estadisticas_delay',
            'animacion_estadisticas_easing'
        ],
        
        // Configuración del evento
        eventConfig: [
            'Nombre_Torneo',          // Nombre del torneo/liga
            'Fecha_Partido',          // Fecha del partido
            'Estadio',                // Nombre del estadio
            'Ciudad',                 // Ciudad donde se juega
            'Arbitro',                // Árbitro principal
            'Temperatura',            // Temperatura del partido
            'Asistencia'              // Número de asistentes
        ]
    },
    
    // 🎯 VALIDACIONES ESPECÍFICAS PARA FÚTBOL
    validations: {
        required: [
            'Equipo_Local',           // Debe tener equipo local
            'Equipo_Visitante'        // Debe tener equipo visitante
        ],
        optional: [
            'Jugador_Destacado',
            'urlLogo_Local',
            'urlLogo_Visitante',
            'Nombre_Torneo'
        ],
        contentLimits: {
            equipoMaxLength: 20,
            jugadorMaxLength: 25,
            posicionMaxLength: 10,
            torneoMaxLength: 30
        },
        numericRanges: {
            golesMin: 0,
            golesMax: 20,
            minutoMin: 0,
            minutoMax: 120,
            posesionMin: 0,
            posesionMax: 100
        }
    },
    
    // ⚽ CONFIGURACIONES ESPECÍFICAS DE FÚTBOL
    sportsSpecific: {
        // Estados válidos del partido
        validMatchStates: [
            'PROXIMO',
            'PRIMER_TIEMPO',
            'DESCANSO', 
            'SEGUNDO_TIEMPO',
            'TIEMPO_EXTRA',
            'PENALES',
            'FINALIZADO'
        ],
        
        // Posiciones válidas de jugadores
        validPositions: [
            'POR',      // Portero
            'DEF',      // Defensa
            'MED',      // Mediocampista
            'DEL',      // Delantero
            'DT'        // Director Técnico
        ],
        
        // Tipos de tarjetas
        cardTypes: [
            'AMARILLA',
            'ROJA',
            'DOBLE_AMARILLA'
        ],
        
        // Formato de tiempo por defecto
        timeFormat: 'MM:SS',
        
        // Colores por defecto para estados
        stateColors: {
            'PROXIMO': '#666666',
            'PRIMER_TIEMPO': '#00FF00',
            'DESCANSO': '#FFFF00',
            'SEGUNDO_TIEMPO': '#00FF00',
            'TIEMPO_EXTRA': '#FF8000',
            'PENALES': '#FF0000',
            'FINALIZADO': '#808080'
        }
    }
};

// 🔧 FUNCIÓN PARA CREAR CONFIGURACIÓN DE INSTANCIA ESPECÍFICA DE FÚTBOL
export function createSportsInstanceConfig(teamId, sport = 'futbol', customOverrides = {}) {
    const instanceId = `${teamId}-${sport}`;
    const firebasePath = `CLAVE_STREAM_FB/${teamId.toUpperCase()}/${sport.toUpperCase()}/MATCH_LIVE/GRAFICOS`;
    
    return {
        // Heredar configuración base
        ...sportsTemplateConfig,
        
        // Configuración específica de instancia
        instanceId: instanceId,
        instanceName: `${teamId.charAt(0).toUpperCase() + teamId.slice(1)} - ${sport.charAt(0).toUpperCase() + sport.slice(1)}`,
        teamName: teamId,
        sport: sport,
        
        // Firebase específico
        firebasePath: firebasePath,
        backupPath: `CLAVE_STREAM_FB/${teamId.toUpperCase()}/${sport.toUpperCase()}/BACKUP`,
        
        // CSS personalizado
        customCSS: `/instances/${teamId}/${sport}/styles.css`,
        
        // Sobrescribir con personalizaciones
        ...customOverrides,
        
        // Meta información
        meta: {
            created: new Date().toISOString(),
            template: 'sports',
            sport: sport,
            version: '2.0.0'
        }
    };
}

// 📊 DATOS DE EJEMPLO PARA TESTING
export const sampleMatchData = {
    // Datos básicos del partido
    Mostrar_Marcador: true,
    Mostrar_Equipos: false,
    Mostrar_Jugador: false,
    Mostrar_Estadisticas: false,
    
    // Información del partido
    Equipo_Local: "Barcelona SC",
    Equipo_Visitante: "Emelec",
    Goles_Local: 2,
    Goles_Visitante: 1,
    Tiempo_Partido: "67:23",
    Minuto_Partido: 67,
    Estado_Partido: "SEGUNDO_TIEMPO",
    
    // Jugador destacado
    Jugador_Destacado: "Carlos Garcés",
    Posicion_Jugador: "DEL",
    Equipo_Jugador: "Barcelona SC",
    Numero_Jugador: 9,
    
    // URLs de imágenes
    urlLogo_Local: "https://example.com/barcelona-logo.png",
    urlLogo_Visitante: "https://example.com/emelec-logo.png",
    
    // Colores
    colorEquipo_Local: "#FFD700",     // Amarillo Barcelona
    colorEquipo_Visitante: "#0066CC", // Azul Emelec
    
    // Estadísticas
    Posesion_Local: 65,
    Posesion_Visitante: 35,
    Tiros_Local: 8,
    Tiros_Visitante: 4,
    
    // Configuración
    modoAutomatico: true,
    duracionMarcador: 90,
    duracionJugador: 45
};

console.log('⚽ Sports Template Config loaded');