#!/bin/bash
# 🛠️ tools/create-instance.sh
# Script para crear nuevas instancias del sistema multi-instancia
# Uso: ./create-instance.sh <teamId> <category> [options]

set -e  # Salir si algún comando falla

# ===== COLORES PARA OUTPUT =====
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# ===== CONFIGURACIÓN =====
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
INSTANCES_DIR="$PROJECT_ROOT/instances"
SHARED_DIR="$PROJECT_ROOT/shared"
TEMPLATES_DIR="$SHARED_DIR/templates"

# ===== FUNCIONES DE UTILIDAD =====
print_header() {
    echo -e "${CYAN}"
    echo "🚀 ====================================="
    echo "   CREAR NUEVA INSTANCIA - v2.0"
    echo "   Sistema Multi-Instancia"
    echo "=====================================${NC}"
    echo
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ ERROR: $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  WARNING: $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  INFO: $1${NC}"
}

print_step() {
    echo -e "${PURPLE}🔧 STEP: $1${NC}"
}

# ===== FUNCIÓN DE AYUDA =====
show_help() {
    echo -e "${CYAN}📖 USO DEL SCRIPT${NC}"
    echo
    echo "Crear nueva instancia:"
    echo "  ./create-instance.sh <teamId> <category>"
    echo
    echo "Parámetros:"
    echo "  teamId     - ID del equipo (ej: equipo1, equipoA, equipoB)"
    echo "  category   - Categoría (noticias, futbol, basquet, etc.)"
    echo
    echo "Opciones:"
    echo "  -f, --force    - Forzar creación (sobrescribir si existe)"
    echo "  -d, --debug    - Habilitar modo debug en la instancia"
    echo "  -t, --test     - Crear con datos de prueba"
    echo "  -h, --help     - Mostrar esta ayuda"
    echo
    echo "Ejemplos:"
    echo "  ./create-instance.sh equipo2 noticias"
    echo "  ./create-instance.sh equipoA futbol --debug"
    echo "  ./create-instance.sh equipoB basquet --force --test"
    echo
    echo "Categorías soportadas:"
    echo "  📺 noticias  - Para equipos de noticias"
    echo "  ⚽ futbol    - Para equipos de fútbol"
    echo "  🏀 basquet   - Para equipos de básquet"
    echo "  🎾 generico  - Para otros deportes"
    exit 0
}

# ===== VALIDACIÓN DE ARGUMENTOS =====
validate_arguments() {
    if [ $# -eq 0 ]; then
        print_error "Faltan argumentos. Use --help para ver la ayuda."
        exit 1
    fi
    
    # Verificar si pidió ayuda
    for arg in "$@"; do
        case $arg in
            -h|--help)
                show_help
                ;;
        esac
    done
    
    if [ -z "$1" ] || [ -z "$2" ]; then
        print_error "Se requieren teamId y category."
        echo "Uso: ./create-instance.sh <teamId> <category>"
        exit 1
    fi
    
    TEAM_ID="$1"
    CATEGORY="$2"
    
    # Validar teamId
    if [[ ! "$TEAM_ID" =~ ^[a-zA-Z0-9]+$ ]]; then
        print_error "teamId debe contener solo letras y números: $TEAM_ID"
        exit 1
    fi
    
    # Validar category
    case "$CATEGORY" in
        noticias|futbol|basquet|generico)
            print_info "Categoría válida: $CATEGORY"
            ;;
        *)
            print_error "Categoría no soportada: $CATEGORY"
            echo "Categorías válidas: noticias, futbol, basquet, generico"
            exit 1
            ;;
    esac
}

# ===== PARSEAR OPCIONES =====
parse_options() {
    FORCE_CREATE=false
    ENABLE_DEBUG=false
    WITH_TEST_DATA=false
    
    # Procesar opciones
    while [[ $# -gt 2 ]]; do
        case $3 in
            -f|--force)
                FORCE_CREATE=true
                print_info "Modo forzado habilitado"
                ;;
            -d|--debug)
                ENABLE_DEBUG=true
                print_info "Modo debug habilitado"
                ;;
            -t|--test)
                WITH_TEST_DATA=true
                print_info "Datos de prueba habilitados"
                ;;
            *)
                print_warning "Opción desconocida: $3"
                ;;
        esac
        shift
    done
}

# ===== VERIFICAR DEPENDENCIAS =====
check_dependencies() {
    print_step "Verificando dependencias..."
    
    # Verificar que existe el directorio del proyecto
    if [ ! -d "$PROJECT_ROOT" ]; then
        print_error "Directorio del proyecto no encontrado: $PROJECT_ROOT"
        exit 1
    fi
    
    # Verificar que existe el directorio shared
    if [ ! -d "$SHARED_DIR" ]; then
        print_error "Directorio shared no encontrado: $SHARED_DIR"
        exit 1
    fi
    
    # Verificar que existe el directorio de templates
    if [ ! -d "$TEMPLATES_DIR" ]; then
        print_error "Directorio de templates no encontrado: $TEMPLATES_DIR"
        exit 1
    fi
    
    # Determinar template según categoría
    case "$CATEGORY" in
        noticias)
            TEMPLATE_DIR="$TEMPLATES_DIR/news"
            ;;
        futbol|basquet)
            TEMPLATE_DIR="$TEMPLATES_DIR/sports"
            ;;
        generico)
            TEMPLATE_DIR="$TEMPLATES_DIR/generic"
            ;;
    esac
    
    if [ ! -d "$TEMPLATE_DIR" ]; then
        print_error "Template no encontrado: $TEMPLATE_DIR"
        exit 1
    fi
    
    print_success "Todas las dependencias verificadas"
}

# ===== CREAR ESTRUCTURA DE DIRECTORIOS =====
create_directory_structure() {
    print_step "Creando estructura de directorios..."
    
    INSTANCE_DIR="$INSTANCES_DIR/$TEAM_ID/$CATEGORY"
    
    # Verificar si ya existe
    if [ -d "$INSTANCE_DIR" ]; then
        if [ "$FORCE_CREATE" = false ]; then
            print_error "La instancia ya existe: $INSTANCE_DIR"
            print_info "Use --force para sobrescribir"
            exit 1
        else
            print_warning "Sobrescribiendo instancia existente"
            rm -rf "$INSTANCE_DIR"
        fi
    fi
    
    # Crear directorios
    mkdir -p "$INSTANCE_DIR"
    mkdir -p "$INSTANCES_DIR/../revoked"  # Para instancias revocadas
    
    print_success "Estructura de directorios creada: $INSTANCE_DIR"
}

# ===== COPIAR ARCHIVOS TEMPLATE =====
copy_template_files() {
    print_step "Copiando archivos template..."
    
    # Copiar todos los archivos del template
    cp -r "$TEMPLATE_DIR"/* "$INSTANCE_DIR/"
    
    print_success "Archivos template copiados"
}

# ===== GENERAR CONFIGURACIÓN ESPECÍFICA =====
generate_instance_config() {
    print_step "Generando configuración específica..."
    
    CONFIG_FILE="$INSTANCE_DIR/config.js"
    
    # Generar configuración según categoría
    case "$CATEGORY" in
        noticias)
            generate_news_config
            ;;
        futbol)
            generate_sports_config "futbol"
            ;;
        basquet)
            generate_sports_config "basquet"
            ;;
        generico)
            generate_generic_config
            ;;
    esac
    
    print_success "Configuración específica generada"
}

# ===== CONFIGURACIÓN PARA NOTICIAS =====
generate_news_config() {
    cat > "$CONFIG_FILE" << EOF
// 📺 instances/$TEAM_ID/$CATEGORY/config.js
// Configuración específica: $TEAM_ID - $CATEGORY
// Generado automáticamente: $(date)

import { createNewsInstanceConfig } from '../../../shared/templates/news/config.js';

// 🎯 CONFIGURACIÓN PERSONALIZADA PARA ${TEAM_ID^^}
const customConfig = {
    // 🔐 CONFIGURACIÓN DE SEGURIDAD
    security: {
        allowedDomains: [
            'wilmercz.github.io',
            'localhost',
            '127.0.0.1'
        ],
        sessionTimeout: 7200000,    // 2 horas
        maxConnections: 3,
        allowDebug: $ENABLE_DEBUG
    },
    
    // 📊 CONFIGURACIÓN DE LOGGING
    debug: {
        enabled: $ENABLE_DEBUG,
        logLevel: 'info',
        logToConsole: true,
        logToFile: false,
        modules: {
            firebase: true,
            animations: true,
            scheduler: true,
            lowerThirds: true
        }
    }
};

// 🔧 CREAR CONFIGURACIÓN FINAL
export const instanceConfig = createNewsInstanceConfig('$TEAM_ID', customConfig);

// 🎯 INFORMACIÓN ADICIONAL DE LA INSTANCIA
instanceConfig.meta = {
    ...instanceConfig.meta,
    teamInfo: {
        fullName: '${TEAM_ID^} Producciones',
        contact: '$TEAM_ID@example.com',
        timezone: 'America/Guayaquil',
        language: 'es-EC'
    },
    deployment: {
        environment: 'production',
        lastUpdate: '$(date -Iseconds)',
        version: '2.0.0',
        build: '$TEAM_ID-$CATEGORY-$(date +%Y%m%d)'
    }
};

console.log('📺 Configuración $TEAM_ID-$CATEGORY cargada');
export default instanceConfig;
EOF
}

# ===== CONFIGURACIÓN PARA DEPORTES =====
generate_sports_config() {
    local sport=$1
    cat > "$CONFIG_FILE" << EOF
// ⚽ instances/$TEAM_ID/$CATEGORY/config.js
// Configuración específica: $TEAM_ID - $sport
// Generado automáticamente: $(date)

import { createSportsInstanceConfig } from '../../../shared/templates/sports/config.js';

// 🎯 CONFIGURACIÓN PERSONALIZADA PARA ${TEAM_ID^^} $sport
const customConfig = {
    // 🔐 CONFIGURACIÓN DE SEGURIDAD
    security: {
        allowedDomains: [
            'wilmercz.github.io',
            'localhost',
            '127.0.0.1'
        ],
        sessionTimeout: 10800000,   // 3 horas para partidos largos
        maxConnections: 5,          // Más conexiones para equipo técnico
        allowDebug: $ENABLE_DEBUG,
        allowRemoteControl: true
    },
    
    // 📊 CONFIGURACIÓN DE LOGGING
    debug: {
        enabled: $ENABLE_DEBUG,
        logLevel: 'info',
        logToConsole: true,
        logToFile: false,
        modules: {
            firebase: true,
            animations: true,
            scheduler: true,
            matchEvents: true,
            scoreboard: true
        }
    }
};

// 🔧 CREAR CONFIGURACIÓN FINAL
export const instanceConfig = createSportsInstanceConfig('$TEAM_ID', '$sport', customConfig);

// 🎯 INFORMACIÓN ADICIONAL DE LA INSTANCIA DEPORTIVA
instanceConfig.meta = {
    ...instanceConfig.meta,
    teamInfo: {
        fullName: '${TEAM_ID^} Deportes',
        contact: 'deportes@$TEAM_ID.com',
        timezone: 'America/Guayaquil',
        language: 'es-EC',
        specialization: '${sport^} Profesional'
    },
    deployment: {
        environment: 'production',
        lastUpdate: '$(date -Iseconds)',
        version: '2.0.0',
        build: '$TEAM_ID-$sport-$(date +%Y%m%d)',
        sport: '$sport'
    }
};

console.log('⚽ Configuración $TEAM_ID-$sport cargada');
export default instanceConfig;
EOF
}

# ===== GENERAR ARCHIVO MAIN.JS =====
generate_main_file() {
    print_step "Generando archivo main.js..."
    
    MAIN_FILE="$INSTANCE_DIR/main.js"
    
    cat > "$MAIN_FILE" << EOF
// 🚀 instances/$TEAM_ID/$CATEGORY/main.js
// Punto de entrada específico para $TEAM_ID - $CATEGORY
// Generado automáticamente: $(date)

import instanceConfig from './config.js';
import { StreamGraphicsApp } from '../../../shared/js/main-template.js';

console.log('🎬 === SISTEMA MODULAR v2.0 ===');
console.log('📍 Iniciando: ${TEAM_ID^} - ${CATEGORY^}');
console.log('🔗 URL: https://wilmercz.github.io/WC-graficos-en-tiempo-real/instances/$TEAM_ID/$CATEGORY/');
console.log('🔥 Firebase Path:', instanceConfig.firebasePath);

// 🎯 CREAR INSTANCIA DE LA APLICACIÓN
const app = new StreamGraphicsApp(instanceConfig);

// 🌍 HACER DISPONIBLE GLOBALMENTE
window.${TEAM_ID^}${CATEGORY^}App = app;
window.instanceConfig = instanceConfig;

// 🚀 INICIALIZACIÓN PRINCIPAL
document.addEventListener('DOMContentLoaded', async () => {
    try {
        console.log('📄 DOM cargado - Iniciando ${TEAM_ID^} ${CATEGORY^}...');
        await app.init();
        console.log('✅ ${TEAM_ID^} ${CATEGORY^} iniciado correctamente');
    } catch (error) {
        console.error('💥 Error inicializando ${TEAM_ID^} ${CATEGORY^}:', error);
    }
});

export { app, instanceConfig };
EOF
    
    print_success "Archivo main.js generado"
}

# ===== ACTUALIZAR HTML =====
update_html_file() {
    print_step "Actualizando archivo HTML..."
    
    HTML_FILE="$INSTANCE_DIR/index.html"
    
    # Reemplazar placeholders en el HTML
    sed -i.bak "s/{{TEAM_ID}}/$TEAM_ID/g" "$HTML_FILE" 2>/dev/null || \
    sed "s/{{TEAM_ID}}/$TEAM_ID/g" "$HTML_FILE" > "$HTML_FILE.tmp" && mv "$HTML_FILE.tmp" "$HTML_FILE"
    
    sed -i.bak "s/{{CATEGORY}}/$CATEGORY/g" "$HTML_FILE" 2>/dev/null || \
    sed "s/{{CATEGORY}}/$CATEGORY/g" "$HTML_FILE" > "$HTML_FILE.tmp" && mv "$HTML_FILE.tmp" "$HTML_FILE"
    
    sed -i.bak "s/{{INSTANCE_NAME}}/${TEAM_ID^} - ${CATEGORY^}/g" "$HTML_FILE" 2>/dev/null || \
    sed "s/{{INSTANCE_NAME}}/${TEAM_ID^} - ${CATEGORY^}/g" "$HTML_FILE" > "$HTML_FILE.tmp" && mv "$HTML_FILE.tmp" "$HTML_FILE"
    
    # Limpiar archivos de backup si existen
    rm -f "$HTML_FILE.bak"
    
    print_success "Archivo HTML actualizado"
}

# ===== CREAR DATOS DE PRUEBA =====
create_test_data() {
    if [ "$WITH_TEST_DATA" = true ]; then
        print_step "Creando datos de prueba..."
        
        TEST_DATA_FILE="$INSTANCE_DIR/test-data.js"
        
        case "$CATEGORY" in
            noticias)
                cat > "$TEST_DATA_FILE" << EOF
// 📊 Datos de prueba para $TEAM_ID - $CATEGORY
export const testData = {
    logoAlAire: true,
    graficoAlAire: true,
    temaAlAire: false,
    publicidadAlAire: false,
    
    Invitado: "Dr. Juan Pérez",
    Rol: "Director de Salud",
    Tema: "Nuevas medidas sanitarias",
    
    urlLogo: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiPjxyZWN0IHdpZHRoPSI1MCIgaGVpZ2h0PSI1MCIgZmlsbD0iIzAwNjZjYyIvPjx0ZXh0IHg9IjI1IiB5PSIzMCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkxPR088L3RleHQ+PC9zdmc+",
    
    modoAutomatico: false
};
EOF
                ;;
            futbol)
                cat > "$TEST_DATA_FILE" << EOF
// 📊 Datos de prueba para $TEAM_ID - $CATEGORY
export const testData = {
    logoAlAire: true,
    marcadorAlAire: true,
    jugadorAlAire: false,
    estadisticasAlAire: false,
    
    Equipo_Local: "Barcelona SC",
    Equipo_Visitante: "Emelec",
    Goles_Local: 2,
    Goles_Visitante: 1,
    Tiempo_Partido: "67:30",
    Estado_Partido: "SEGUNDO_TIEMPO",
    
    Jugador_Destacado: "Carlos Garcés",
    Posicion_Jugador: "DEL",
    Numero_Jugador: 9,
    
    modoAutomatico: false
};
EOF
                ;;
        esac
        
        print_success "Datos de prueba creados"
    fi
}

# ===== VALIDAR INSTANCIA CREADA =====
validate_instance() {
    print_step "Validando instancia creada..."
    
    # Verificar archivos principales
    local required_files=("index.html" "config.js" "main.js")
    
    for file in "${required_files[@]}"; do
        if [ ! -f "$INSTANCE_DIR/$file" ]; then
            print_error "Archivo requerido no encontrado: $file"
            exit 1
        fi
    done
    
    # Verificar estructura de configuración
    if ! grep -q "instanceConfig" "$CONFIG_FILE"; then
        print_error "Configuración inválida en config.js"
        exit 1
    fi
    
    print_success "Instancia validada correctamente"
}

# ===== MOSTRAR RESUMEN =====
show_summary() {
    echo
    echo -e "${GREEN}🎉 ===== INSTANCIA CREADA EXITOSAMENTE ===== ${NC}"
    echo
    echo -e "${CYAN}📋 RESUMEN DE LA INSTANCIA:${NC}"
    echo "   🏷️  ID: $TEAM_ID"
    echo "   📂 Categoría: $CATEGORY"
    echo "   📁 Directorio: $INSTANCE_DIR"
    echo "   🔗 URL: https://wilmercz.github.io/WC-graficos-en-tiempo-real/instances/$TEAM_ID/$CATEGORY/"
    echo "   🔥 Firebase: CLAVE_STREAM_FB/${TEAM_ID^^}/${CATEGORY^^}/STREAM_LIVE/GRAFICOS"
    echo
    echo -e "${CYAN}🔧 CONFIGURACIÓN:${NC}"
    echo "   🛡️  Debug: $([ "$ENABLE_DEBUG" = true ] && echo "Habilitado" || echo "Deshabilitado")"
    echo "   💪 Forzado: $([ "$FORCE_CREATE" = true ] && echo "Sí" || echo "No")"
    echo "   🧪 Datos prueba: $([ "$WITH_TEST_DATA" = true ] && echo "Incluidos" || echo "No incluidos")"
    echo
    echo -e "${CYAN}📁 ARCHIVOS CREADOS:${NC}"
    ls -la "$INSTANCE_DIR"
    echo
    echo -e "${YELLOW}📝 PRÓXIMOS PASOS:${NC}"
    echo "   1. Configurar Firebase path en su aplicación de control"
    echo "   2. Probar la URL en el navegador"
    echo "   3. Configurar CameraFi con la nueva URL"
    echo "   4. ¡Comenzar a transmitir!"
    echo
    echo -e "${GREEN}✅ ¡Instancia lista para usar!${NC}"
}

# ===== FUNCIÓN PRINCIPAL =====
main() {
    print_header
    
    # Validar argumentos
    validate_arguments "$@"
    
    # Parsear opciones
    parse_options "$@"
    
    print_info "Creando instancia: $TEAM_ID/$CATEGORY"
    
    # Ejecutar pasos
    check_dependencies
    create_directory_structure
    copy_template_files
    generate_instance_config
    generate_main_file
    update_html_file
    create_test_data
    validate_instance
    
    # Mostrar resumen
    show_summary
}

# ===== EJECUTAR SCRIPT =====
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi