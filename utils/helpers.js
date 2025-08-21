// 🛠️ utils/helpers.js
// Responsabilidad: Funciones utilitarias reutilizables

export class Helpers {
    /**
     * Conversión de tipos
     */
    static convertBoolean(value) {
        if (value === "true" || value === true) return true;
        if (value === "false" || value === false) return false;
        if (value === 1 || value === "1") return true;
        if (value === 0 || value === "0") return false;
        return Boolean(value);
    }

    static parseInteger(value, defaultValue = 0) {
        const parsed = parseInt(value, 10);
        return isNaN(parsed) ? defaultValue : parsed;
    }

    static parseFloat(value, defaultValue = 0.0) {
        const parsed = parseFloat(value);
        return isNaN(parsed) ? defaultValue : parsed;
    }

    /**
     * Manipulación de strings
     */
    static cleanText(text, defaultValue = '') {
        if (!text || typeof text !== 'string') {
            return defaultValue;
        }
        return text.trim().replace(/^"|"$/g, '') || defaultValue;
    }

    static capitalizeFirst(str) {
        if (!str || typeof str !== 'string') return '';
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    }

    static slugify(text) {
        return text
            .toString()
            .toLowerCase()
            .trim()
            .replace(/\s+/g, '-')
            .replace(/[^\w\-]+/g, '')
            .replace(/\-\-+/g, '-')
            .replace(/^-+/, '')
            .replace(/-+$/, '');
    }

    /**
     * Validación de URLs
     */
    static isValidUrl(url) {
        if (!url || typeof url !== 'string') return false;
        
        const cleaned = url.trim();
        
        // Rechazar casos problemáticos
        if (cleaned === '' || 
            cleaned === 'null' || 
            cleaned === 'undefined' || 
            cleaned.length < 8) {
            return false;
        }
        
        try {
            new URL(cleaned);
            return true;
        } catch {
            return false;
        }
    }

    static cleanUrl(url) {
        if (!url || typeof url !== 'string') return '';
        
        const cleaned = url.trim().replace(/^"|"$/g, '');
        
        if (!this.isValidUrl(cleaned)) return '';
        
        return cleaned;
    }

    /**
     * Manipulación de fechas y tiempo
     */
    static formatTime(date = new Date(), format = '24h') {
        const hours = date.getHours();
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const seconds = date.getSeconds().toString().padStart(2, '0');
        
        if (format === '12h') {
            const ampm = hours >= 12 ? 'PM' : 'AM';
            const displayHours = hours % 12 || 12;
            return `${displayHours}:${minutes} ${ampm}`;
        }
        
        return `${hours.toString().padStart(2, '0')}:${minutes}`;
    }

    static formatTimeWithSeconds(date = new Date()) {
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const seconds = date.getSeconds().toString().padStart(2, '0');
        return `${hours}:${minutes}:${seconds}`;
    }

    static formatDate(date = new Date(), format = 'DD/MM/YYYY') {
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        
        switch (format) {
            case 'DD/MM/YYYY':
                return `${day}/${month}/${year}`;
            case 'MM/DD/YYYY':
                return `${month}/${day}/${year}`;
            case 'YYYY-MM-DD':
                return `${year}-${month}-${day}`;
            default:
                return `${day}/${month}/${year}`;
        }
    }

    static getTimestamp() {
        return Date.now();
    }

    static getISOString() {
        return new Date().toISOString();
    }

    /**
     * Utilidades para elementos DOM
     */
    static getElementById(id) {
        const element = document.getElementById(id);
        if (!element) {
            console.warn(`⚠️ Elemento no encontrado: #${id}`);
        }
        return element;
    }

    static querySelector(selector) {
        const element = document.querySelector(selector);
        if (!element) {
            console.warn(`⚠️ Elemento no encontrado: ${selector}`);
        }
        return element;
    }

    static isElementVisible(element) {
        if (!element) return false;
        
        const style = window.getComputedStyle(element);
        return style.display !== 'none' && 
               style.visibility !== 'hidden' && 
               style.opacity !== '0';
    }

    static getElementInfo(element) {
        if (!element) return null;
        
        const rect = element.getBoundingClientRect();
        const style = window.getComputedStyle(element);
        
        return {
            id: element.id,
            tagName: element.tagName,
            className: element.className,
            isVisible: this.isElementVisible(element),
            position: {
                x: rect.x,
                y: rect.y,
                width: rect.width,
                height: rect.height
            },
            styles: {
                display: style.display,
                opacity: style.opacity,
                transform: style.transform,
                zIndex: style.zIndex
            }
        };
    }

    /**
     * Utilidades de performance
     */
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    static throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    static measureTime(label, fn) {
        const start = performance.now();
        const result = fn();
        const end = performance.now();
        console.log(`⏱️ ${label}: ${(end - start).toFixed(2)}ms`);
        return result;
    }

    /**
     * Utilidades de objetos y arrays
     */
    static deepClone(obj) {
        if (obj === null || typeof obj !== 'object') return obj;
        if (obj instanceof Date) return new Date(obj.getTime());
        if (obj instanceof Array) return obj.map(item => this.deepClone(item));
        
        const cloned = {};
        Object.keys(obj).forEach(key => {
            cloned[key] = this.deepClone(obj[key]);
        });
        return cloned;
    }

    static isEmpty(value) {
        if (value === null || value === undefined) return true;
        if (typeof value === 'string') return value.trim() === '';
        if (Array.isArray(value)) return value.length === 0;
        if (typeof value === 'object') return Object.keys(value).length === 0;
        return false;
    }

    static getNestedValue(obj, path, defaultValue = null) {
        return path.split('.').reduce((current, key) => {
            return (current && current[key] !== undefined) ? current[key] : defaultValue;
        }, obj);
    }

    static setNestedValue(obj, path, value) {
        const keys = path.split('.');
        const lastKey = keys.pop();
        const target = keys.reduce((current, key) => {
            current[key] = current[key] || {};
            return current[key];
        }, obj);
        target[lastKey] = value;
    }

    /**
     * Utilidades de logging
     */
    static log(level, message, data = null) {
        const timestamp = this.formatTimeWithSeconds();
        const prefix = `[${timestamp}]`;
        
        switch (level.toLowerCase()) {
            case 'error':
                console.error(`${prefix} ❌`, message, data);
                break;
            case 'warn':
                console.warn(`${prefix} ⚠️`, message, data);
                break;
            case 'info':
                console.info(`${prefix} ℹ️`, message, data);
                break;
            case 'debug':
                console.log(`${prefix} 🔧`, message, data);
                break;
            default:
                console.log(`${prefix}`, message, data);
        }
    }

    static createLogger(prefix) {
        return {
            error: (msg, data) => this.log('error', `[${prefix}] ${msg}`, data),
            warn: (msg, data) => this.log('warn', `[${prefix}] ${msg}`, data),
            info: (msg, data) => this.log('info', `[${prefix}] ${msg}`, data),
            debug: (msg, data) => this.log('debug', `[${prefix}] ${msg}`, data),
            log: (msg, data) => this.log('info', `[${prefix}] ${msg}`, data)
        };
    }

    /**
     * Utilidades de colores
     */
    static hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    static rgbToHex(r, g, b) {
        return "#" + [r, g, b].map(x => {
            const hex = x.toString(16);
            return hex.length === 1 ? "0" + hex : hex;
        }).join("");
    }

    static isValidColor(color) {
        const style = new Option().style;
        style.color = color;
        return style.color !== '';
    }

    /**
     * Utilidades de archivos y datos
     */
    static downloadText(content, filename, mimeType = 'text/plain') {
        const blob = new Blob([content], { type: mimeType });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    }

    static downloadJSON(data, filename) {
        const json = JSON.stringify(data, null, 2);
        this.downloadText(json, filename, 'application/json');
    }

    static copyToClipboard(text) {
        if (navigator.clipboard) {
            return navigator.clipboard.writeText(text).then(() => {
                console.log('📋 Texto copiado al portapapeles');
                return true;
            }).catch(err => {
                console.error('❌ Error copiando al portapapeles:', err);
                return false;
            });
        } else {
            // Fallback para navegadores más antiguos
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            try {
                const successful = document.execCommand('copy');
                document.body.removeChild(textArea);
                if (successful) {
                    console.log('📋 Texto copiado al portapapeles (fallback)');
                }
                return successful;
            } catch (err) {
                document.body.removeChild(textArea);
                console.error('❌ Error copiando al portapapeles (fallback):', err);
                return false;
            }
        }
    }

    /**
     * Utilidades de eventos personalizados
     */
    static createCustomEvent(name, data = {}) {
        return new CustomEvent(name, {
            detail: data,
            bubbles: true,
            cancelable: true
        });
    }

    static dispatchCustomEvent(element, eventName, data = {}) {
        const event = this.createCustomEvent(eventName, data);
        element.dispatchEvent(event);
    }

    /**
     * Utilidades de configuración
     */
    static mergeConfigs(...configs) {
        return configs.reduce((merged, config) => {
            if (config && typeof config === 'object') {
                Object.keys(config).forEach(key => {
                    if (config[key] && typeof config[key] === 'object' && !Array.isArray(config[key])) {
                        merged[key] = this.mergeConfigs(merged[key] || {}, config[key]);
                    } else {
                        merged[key] = config[key];
                    }
                });
            }
            return merged;
        }, {});
    }

    static validateConfig(config, schema) {
        const errors = [];
        
        Object.keys(schema).forEach(key => {
            const rule = schema[key];
            const value = config[key];
            
            if (rule.required && (value === undefined || value === null)) {
                errors.push(`Campo requerido: ${key}`);
            }
            
            if (value !== undefined && rule.type && typeof value !== rule.type) {
                errors.push(`Tipo incorrecto para ${key}: esperado ${rule.type}, recibido ${typeof value}`);
            }
            
            if (rule.validator && typeof rule.validator === 'function' && !rule.validator(value)) {
                errors.push(`Validación fallida para ${key}`);
            }
        });
        
        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    /**
     * Utilidades de desarrollo/debug
     */
    static generateId(prefix = 'id') {
        return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    static createMockData(schema) {
        const mock = {};
        
        Object.keys(schema).forEach(key => {
            const type = schema[key];
            switch (type) {
                case 'string':
                    mock[key] = `mock_${key}`;
                    break;
                case 'number':
                    mock[key] = Math.floor(Math.random() * 100);
                    break;
                case 'boolean':
                    mock[key] = Math.random() > 0.5;
                    break;
                case 'array':
                    mock[key] = [`item1_${key}`, `item2_${key}`];
                    break;
                case 'object':
                    mock[key] = { mock: true };
                    break;
                default:
                    mock[key] = null;
            }
        });
        
        return mock;
    }

    static benchmark(name, iterations, fn) {
        const times = [];
        
        for (let i = 0; i < iterations; i++) {
            const start = performance.now();
            fn();
            const end = performance.now();
            times.push(end - start);
        }
        
        const total = times.reduce((sum, time) => sum + time, 0);
        const average = total / iterations;
        const min = Math.min(...times);
        const max = Math.max(...times);
        
        console.group(`📊 Benchmark: ${name}`);
        console.log(`Iteraciones: ${iterations}`);
        console.log(`Promedio: ${average.toFixed(3)}ms`);
        console.log(`Mínimo: ${min.toFixed(3)}ms`);
        console.log(`Máximo: ${max.toFixed(3)}ms`);
        console.log(`Total: ${total.toFixed(3)}ms`);
        console.groupEnd();
        
        return { average, min, max, total, times };
    }
}

// ===== FUNCIONES GLOBALES DE CONVENIENCIA =====
export const Utils = Helpers;

// ===== FUNCIONES INDIVIDUALES PARA IMPORTACIÓN SELECTIVA =====
export const {
    convertBoolean,
    parseInteger,
    parseFloat,
    cleanText,
    isValidUrl,
    cleanUrl,
    formatTime,
    formatDate,
    getElementById,
    isElementVisible,
    debounce,
    throttle,
    deepClone,
    isEmpty,
    log,
    downloadJSON,
    copyToClipboard
} = Helpers;

console.log('🛠️ Helpers module loaded');