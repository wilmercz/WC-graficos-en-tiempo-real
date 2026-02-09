// 🔄 core/data-processor.js
// Responsabilidad: Procesar y transformar datos de Firebase

import { EventBus } from '../utils/event-bus.js';

export class DataProcessor {
    constructor() {
        this.lastProcessedData = null;
        this.processingStats = {
            totalProcessed: 0,
            lastProcessTime: null,
            averageProcessTime: 0
        };
    }

    /**
     * Procesar datos principales de Firebase
     */
    process(rawData) {
        const startTime = performance.now();
        
        try {
            console.log('🔄 Procesando datos de Firebase...');
            
            // Procesar cada tipo de dato
            const processedData = {
                // Datos de visibilidad
                visibility: this.processVisibility(rawData),
                
                // Contenidos de texto
                content: this.processContent(rawData),
                
                // URLs de imágenes
                images: this.processImages(rawData),
                
                // Configuración de colores
                colors: this.processColors(rawData),
                
                // Configuración de duraciones
                timing: this.processTiming(rawData),
                
                // Configuración de animaciones
                animations: this.processAnimations(rawData),
                
                // Configuración de logos aliados
                logos: this.processLogos(rawData),
                
                // Metadatos
                meta: {
                    timestamp: Date.now(),
                    source: 'firebase',
                    processedIn: 0 // Se calculará al final
                }
            };
            
            // Calcular tiempo de procesamiento
            const endTime = performance.now();
            const processTime = endTime - startTime;
            processedData.meta.processedIn = processTime;
            
            // Actualizar estadísticas
            this.updateStats(processTime);
            
            // Guardar datos procesados
            this.lastProcessedData = processedData;
            
            console.log(`✅ Datos procesados en ${processTime.toFixed(2)}ms`);
            
            // Emitir evento de datos procesados
            EventBus.emit('data-processed', processedData);
            
            return processedData;
            
        } catch (error) {
            console.error('❌ Error procesando datos:', error);
            EventBus.emit('data-processing-error', error);
            return null;
        }
    }

    /**
     * Procesar datos de visibilidad
     */
    processVisibility(data) {
        return {
            logoAlAire: this.convertBoolean(data.Mostrar_Logo),
            graficoAlAire: this.convertBoolean(data.Mostrar_Invitado),
            temaAlAire: this.convertBoolean(data.Mostrar_Tema),
            lugarAlAire: this.convertBoolean(data.Mostrar_Lugar),
            publicidadAlAire: this.convertBoolean(data.Mostrar_Publicidad),
            
            // Secuencia automática
            secuenciaInvitadoTema: this.convertBoolean(data.mostrar_secuencia_invitado_tema),
            // ✅ NUEVO: Campo para controlar visibilidad del reloj
            horaAlAire: this.convertBoolean(data.Mostrar_Hora),
            // 🛡️ NUEVO: Campo para Portada
            portadaAlAire: this.convertBoolean(data.Mostrar_Portada),
            // 🎥 NUEVO: Campo para Video de Portada
            portadaVideoAlAire: this.convertBoolean(data.Mostar_PortadaVideo),
        };
    }

    /**
     * Procesar contenidos de texto
     */
    processContent(data) {
        return {
            invitado: this.cleanText(data.Invitado, 'Sin Invitado'),
            rol: this.cleanText(data.Rol, 'Sin Rol'),
            tema: this.cleanText(data.Tema, 'Sin Tema'),
            lugar: this.cleanText(data.Lugar, 'Sin Lugar')
        };
    }

    /**
     * Procesar URLs de imágenes
     */
    processImages(data) {
        return {
            logoUrl: this.cleanUrl(data.urlLogo),
            publicidadUrl: this.cleanUrl(data.urlImagenPublicidad),
            portadaLogoUrl: this.cleanUrl(data.portada_urlLogo), // 🛡️ URL Logo Portada
            portadaVideoUrl: this.cleanUrl(data.portada_urlVideo) // 🎥 URL Video Portada
        };
    }

    /**
     * Procesar configuración de colores
     */
    processColors(data) {
        return {
            // Colores básicos del sistema actual
            fondo1: data.colorFondo1 || '#FFFFFF',
            letra1: data.colorLetra1 || '#000000',
            fondo2: data.colorFondo2 || '#FFFFFF', 
            letra2: data.colorLetra2 || '#000000',
            fondo3: data.colorFondo3 || '#FFFFFF',
            letra3: data.colorLetra3 || '#000000',
            
            // Color de fondo para logos
            fondoLogos: data.colorFondoLogos || null,

            // 🛡️ Color base para la portada (si no viene, usa el azul por defecto)
            portadaFondo: data.portada_color || '#2E5BBA'
        };
    }

    /**
     * Procesar configuración de tiempos
     */
    processTiming(data) {
        return {
            duracionNombreRol: this.parseInteger(data.duracionNombreRol, 45),
            duracionTema: this.parseInteger(data.duracionTema, 45),
            duracionPublicidad: this.parseInteger(data.duracionPublicidad, 30),
            duracionLogoPrincipal: this.parseInteger(data.duracionLogoPrincipal, 60),
            duracionLogosAliados: this.parseInteger(data.duracionLogosAliados, 45),
            
            // Configuración del modo automático
            modoAutomatico: this.convertBoolean(data.modoAutomatico, true),
            habilitarOcultamientoAutomatico: this.convertBoolean(data.habilitarOcultamientoAutomatico, true)
        };
    }

    /**
     * Procesar configuración de animaciones
     */
    processAnimations(data) {
    console.group('🎬 PROCESANDO ANIMACIONES CON CAMPOS CORRECTOS');
    
    // 🔍 DEBUG: Ver qué campos existen realmente
    console.log('🔍 Campos disponibles para invitadoRol:');
    console.log('  - animacion_invitadoRol_entrada:', data.animacion_invitadoRol_entrada);
    console.log('  - animacion_invitadoRol_salida:', data.animacion_invitadoRol_salida);
    console.log('  - animacion_invitadoRol_duracion:', data.animacion_invitadoRol_duracion);
    console.log('  - animacion_invitadoRol_delay:', data.animacion_invitadoRol_delay);
    console.log('  - animacion_invitadoRol_easing:', data.animacion_invitadoRol_easing);
    
    const result = {
        invitadoRol: {
            // ✅ CAMPOS CORRECTOS (copiados del sistema viejo)
            delay: this.parseInteger(data.animacion_invitadoRol_delay, 100),
            duracion: this.parseInteger(data.animacion_invitadoRol_duracion, 600),
            easing: data.animacion_invitadoRol_easing || 'EASE_IN_OUT',
            entrada: data.animacion_invitadoRol_entrada || 'WIPE_IN_RIGHT',
            salida: data.animacion_invitadoRol_salida || 'WIPE_OUT_LEFT'
        },
        tema: {
            // ✅ CAMPOS CORRECTOS para tema
            delay: this.parseInteger(data.animacion_tema_delay, 100),
            duracion: this.parseInteger(data.animacion_tema_duracion, 600),
            easing: data.animacion_tema_easing || 'EASE_IN_OUT',
            entrada: data.animacion_tema_entrada || 'WIPE_IN_RIGHT',
            salida: data.animacion_tema_salida || 'WIPE_OUT_LEFT'
        },
        logo: {
            // ✅ CAMPOS CORRECTOS para logo
            delay: this.parseInteger(data.animacion_logo_delay, 0),
            duracion: this.parseInteger(data.animacion_logo_duracion, 600),
            easing: data.animacion_logo_easing || 'EASE_IN_OUT',
            entrada: data.animacion_logo_entrada || 'FADE_IN',
            salida: data.animacion_logo_salida || 'FADE_OUT'
        },
        publicidad: {
            // ✅ CAMPOS CORRECTOS para publicidad
            delay: this.parseInteger(data.animacion_publicidad_delay, 0),
            duracion: this.parseInteger(data.animacion_publicidad_duracion, 600),
            easing: data.animacion_publicidad_easing || 'EASE_IN_OUT',
            entrada: data.animacion_publicidad_entrada || 'WIPE_IN_TOP',
            salida: data.animacion_publicidad_salida || 'WIPE_OUT_BOTTOM'
        },
        lugar: {
            delay: this.parseInteger(data.animacion_lugar_delay, 200),
            duracion: this.parseInteger(data.animacion_lugar_duracion, 600),
            easing: data.animacion_lugar_easing || 'EASE_IN_OUT',
            entrada: data.animacion_lugar_entrada || 'WIPE_IN_RIGHT',
            salida: data.animacion_lugar_salida || 'WIPE_OUT_LEFT'
        }
    };
    
    console.log('✅ Configuración final de animaciones:', result);
    console.groupEnd();
    
    return result;
}
    /**
     * Procesar configuración de logos aliados
     */
    processLogos(data) {
        return {
            habilitado: this.convertBoolean(data.logosAliados_config_habilitado, false),
            cicloContinuo: this.convertBoolean(data.cicloContinuoLogos, true),
            lista: this.processLogosAliados(data.logosAliados_config_lista || [])
        };
    }

    /**
     * Procesar lista de logos aliados
     */
    processLogosAliados(lista) {
        if (!Array.isArray(lista)) {
            return [];
        }
        
        return lista
            .filter(logo => logo && logo.url && logo.activo !== false)
            .map((logo, index) => ({
                id: logo.id || `logo_aliado_${index}`,
                nombre: logo.nombre || `Logo Aliado ${index + 1}`,
                url: this.cleanUrl(logo.url),
                activo: logo.activo !== false,
                orden: typeof logo.orden === 'number' ? logo.orden : index
            }))
            .sort((a, b) => a.orden - b.orden);
    }

    // ===== FUNCIONES DE UTILIDAD =====

    /**
     * Convertir valores a boolean
     */
    convertBoolean(value, defaultValue = false) {
        if (value === "true" || value === true) return true;
        if (value === "false" || value === false) return false;
        return defaultValue;
    }

    /**
     * Parsear enteros con valor por defecto
     */
    parseInteger(value, defaultValue = 0) {
        const parsed = parseInt(value);
        return isNaN(parsed) ? defaultValue : parsed;
    }

    /**
     * Limpiar texto
     */
    cleanText(text, defaultValue = '') {
        if (!text || typeof text !== 'string') {
            return defaultValue;
        }
        
        // Remover comillas del inicio y final
        return text.trim().replace(/^"|"$/g, '') || defaultValue;
    }

    /**
     * Limpiar URLs
     */
    cleanUrl(url) {
        if (!url || typeof url !== 'string') {
            return '';
        }
        
        const cleaned = url.trim().replace(/^"|"$/g, '');
        
        // Validaciones básicas
        if (cleaned === 'null' || 
            cleaned === 'undefined' || 
            cleaned.length < 8) {
            return '';
        }
        
        // Verificar que tenga protocolo
        if (!cleaned.startsWith('http://') && 
            !cleaned.startsWith('https://') && 
            !cleaned.startsWith('data:')) {
            return '';
        }
        
        return cleaned;
    }

    /**
     * Actualizar estadísticas de procesamiento
     */
    updateStats(processTime) {
        this.processingStats.totalProcessed++;
        this.processingStats.lastProcessTime = processTime;
        
        // Calcular promedio (simple)
        if (this.processingStats.totalProcessed === 1) {
            this.processingStats.averageProcessTime = processTime;
        } else {
            this.processingStats.averageProcessTime = 
                (this.processingStats.averageProcessTime + processTime) / 2;
        }
    }

    /**
     * Validar datos procesados
     */
    validateProcessedData(data) {
        const issues = [];
        
        // Validar visibilidad
        if (typeof data.visibility !== 'object') {
            issues.push('Datos de visibilidad inválidos');
        }
        
        // Validar contenido
        if (typeof data.content !== 'object') {
            issues.push('Datos de contenido inválidos');
        }
        
        // Validar URLs
        if (data.images.logoUrl && !this.isValidUrl(data.images.logoUrl)) {
            issues.push('URL de logo inválida');
        }
        
        if (data.images.publicidadUrl && !this.isValidUrl(data.images.publicidadUrl)) {
            issues.push('URL de publicidad inválida');
        }
        
        // Validar duraciones
        if (data.timing.duracionNombreRol <= 0) {
            issues.push('Duración de nombre/rol debe ser mayor a 0');
        }
        
        return {
            isValid: issues.length === 0,
            issues: issues
        };
    }

    /**
     * Validar URL
     */
    isValidUrl(url) {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Comparar con datos anteriores
     */
    getChanges(newData) {
        if (!this.lastProcessedData) {
            return { hasChanges: true, changes: ['initial_load'] };
        }
        
        const changes = [];
        
        // Comparar visibilidad
        Object.keys(newData.visibility).forEach(key => {
            if (newData.visibility[key] !== this.lastProcessedData.visibility[key]) {
                changes.push(`visibility.${key}`);
            }
        });
        
        // Comparar contenido
        Object.keys(newData.content).forEach(key => {
            if (newData.content[key] !== this.lastProcessedData.content[key]) {
                changes.push(`content.${key}`);
            }
        });
        
        // Comparar imágenes
        Object.keys(newData.images).forEach(key => {
            if (newData.images[key] !== this.lastProcessedData.images[key]) {
                changes.push(`images.${key}`);
            }
        });
        
        return {
            hasChanges: changes.length > 0,
            changes: changes
        };
    }

    /**
     * Obtener estadísticas
     */
    getStats() {
        return {
            ...this.processingStats,
            lastDataSize: this.lastProcessedData ? 
                JSON.stringify(this.lastProcessedData).length : 0
        };
    }

    /**
     * Resetear estadísticas
     */
    resetStats() {
        this.processingStats = {
            totalProcessed: 0,
            lastProcessTime: null,
            averageProcessTime: 0
        };
        console.log('📊 Estadísticas de procesamiento reseteadas');
    }

    /**
     * Obtener últimos datos procesados
     */
    getLastProcessedData() {
        return this.lastProcessedData;
    }
}

// ===== INSTANCIA GLOBAL =====
export const dataProcessor = new DataProcessor();

// ===== FUNCIONES DE CONVENIENCIA =====
export const DataUtils = {
    /**
     * Procesar datos rápidamente
     */
    process: (data) => dataProcessor.process(data),
    
    /**
     * Validar datos
     */
    validate: (data) => dataProcessor.validateProcessedData(data),
    
    /**
     * Obtener cambios
     */
    getChanges: (data) => dataProcessor.getChanges(data),
    
    /**
     * Estadísticas
     */
    stats: () => dataProcessor.getStats(),
    
    /**
     * Últimos datos
     */
    lastData: () => dataProcessor.getLastProcessedData()
};

console.log('🔄 Data Processor module loaded');