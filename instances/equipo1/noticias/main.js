// 🚀 instances/equipo1/noticias/main.js
// Punto de entrada específico para Equipo1 - Noticias

// Importar configuración específica de esta instancia
import instanceConfig from './config.js';

// Importar motor principal del sistema
import { StreamGraphicsApp } from '../../../shared/js/main-template.js';

// 🎯 INICIALIZACIÓN ESPECÍFICA DE EQUIPO1 NOTICIAS
console.log('🎬 === SISTEMA MODULAR v2.0 ===');
console.log('📺 Iniciando: Equipo1 - Noticias');
console.log('🔗 URL: https://wilmercz.github.io/WC-graficos-en-tiempo-real/instances/equipo1/noticias/');
console.log('🔥 Firebase Path:', instanceConfig.firebasePath);

// 🔧 CONFIGURACIONES ESPECÍFICAS PARA EQUIPO1
const equipo1Customizations = {
    // Configuraciones adicionales específicas que no están en config.js
    ui: {
        showWelcomeMessage: true,
        enableKeyboardShortcuts: true,
        enableAutoRefresh: false
    },
    
    performance: {
        enableGPUAcceleration: true,
        reducedMotion: false,
        optimizeForBroadcast: true
    },
    
    features: {
        enableAdvancedAnimations: true,
        enableBackgroundEffects: false,
        enableSoundEffects: false
    }
};

// 🎯 CREAR INSTANCIA DE LA APLICACIÓN
const app = new StreamGraphicsApp({
    ...instanceConfig,
    ...equipo1Customizations
});

// 🌍 HACER DISPONIBLE GLOBALMENTE PARA DEBUG Y CONTROL
window.Equipo1NoticiasApp = app;
window.instanceConfig = instanceConfig;
window.equipo1Customizations = equipo1Customizations;

// 📊 VARIABLES DE COMPATIBILIDAD CON SISTEMA ANTERIOR
window.currentConfig = {
    duracionNombreRol: instanceConfig.timing.defaultDurations.invitado,
    duracionTema: instanceConfig.timing.defaultDurations.tema,
    duracionPublicidad: instanceConfig.timing.defaultDurations.publicidad,
    duracionLogoPrincipal: instanceConfig.timing.defaultDurations.logo,
    duracionLogosAliados: instanceConfig.timing.defaultDurations.logosAliados,
    modoAutomatico: instanceConfig.timing.autoHide,
    habilitarOcultamientoAutomatico: instanceConfig.timing.autoHide
};

window.logoConfig = instanceConfig.logoConfig || {
    habilitado: false,
    duraciones: {
        principal: instanceConfig.timing.defaultDurations.logo,
        aliados: instanceConfig.timing.defaultDurations.logosAliados
    },
    cicloContinuo: true
};

window.animacionConfig = instanceConfig.animations.customConfig;

// 🎨 APLICAR TEMA ESPECÍFICO DE EQUIPO1
function applyEquipo1Theme() {
    // Aplicar variables CSS específicas de Equipo1
    const root = document.documentElement;
    const colors = instanceConfig.defaultColors;
    
    root.style.setProperty('--equipo1-primary', colors.fondo1);
    root.style.setProperty('--equipo1-secondary', colors.fondo2);
    root.style.setProperty('--equipo1-accent', colors.accentColor);
    root.style.setProperty('--equipo1-text-light', colors.letra1);
    root.style.setProperty('--equipo1-bg-logos', colors.fondoLogos);
    
    console.log('🎨 Tema Equipo1 aplicado');
}

// 🚀 INICIALIZACIÓN PRINCIPAL
document.addEventListener('DOMContentLoaded', async () => {
    try {
        console.log('📄 DOM cargado - Iniciando Equipo1 Noticias...');
        
        // Mostrar mensaje de bienvenida si está habilitado
        if (equipo1Customizations.ui.showWelcomeMessage) {
            showWelcomeMessage();
        }
        
        // Aplicar tema específico
        applyEquipo1Theme();
        
        // Inicializar aplicación principal
        await app.init();
        
        // Configurar funcionalidades específicas de Equipo1
        setupEquipo1Features();
        
        // Configurar shortcuts de teclado si están habilitados
        if (equipo1Customizations.ui.enableKeyboardShortcuts) {
            setupKeyboardShortcuts();
        }
        
        console.log('✅ Equipo1 Noticias iniciado correctamente');
        
        // Actualizar indicador visual de estado
        updateStatusIndicator('ready');
        
    } catch (error) {
        console.error('💥 Error inicializando Equipo1 Noticias:', error);
        updateStatusIndicator('error');
        showErrorMessage(error);
    }
});

// 🎪 FUNCIONALIDADES ESPECÍFICAS DE EQUIPO1
function setupEquipo1Features() {
    console.log('🔧 Configurando funcionalidades específicas de Equipo1...');
    
    // Feature 1: Auto-refresh opcional
    if (equipo1Customizations.ui.enableAutoRefresh) {
        setInterval(() => {
            console.log('🔄 Auto-refresh Equipo1...');
            // Lógica de auto-refresh aquí
        }, 300000); // 5 minutos
    }
    
    // Feature 2: Optimizaciones de performance para broadcast
    if (equipo1Customizations.performance.optimizeForBroadcast) {
        // Configurar optimizaciones específicas
        document.body.classList.add('broadcast-optimized');
        
        // Reducir frecuencia de actualizaciones no críticas
        if (app.modules.clock) {
            app.modules.clock.setUpdateFrequency(60000); // 1 minuto
        }
    }
    
    // Feature 3: Animaciones avanzadas si están habilitadas
    if (equipo1Customizations.features.enableAdvancedAnimations) {
        document.body.classList.add('advanced-animations');
    }
    
    console.log('✅ Funcionalidades específicas de Equipo1 configuradas');
}

// ⌨️ SHORTCUTS DE TECLADO PARA EQUIPO1
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Solo funcionar si Ctrl está presionado
        if (!e.ctrlKey) return;
        
        switch (e.key) {
            case '1':
                e.preventDefault();
                console.log('⌨️ Shortcut: Mostrar Invitado');
                testShowInvitado();
                break;
                
            case '2':
                e.preventDefault();
                console.log('⌨️ Shortcut: Mostrar Tema');
                testShowTema();
                break;
                
            case '3':
                e.preventDefault();
                console.log('⌨️ Shortcut: Mostrar Logo');
                testShowLogo();
                break;
                
            case '0':
                e.preventDefault();
                console.log('⌨️ Shortcut: Ocultar Todo');
                testHideAll();
                break;
                
            case 'd':
                e.preventDefault();
                console.log('⌨️ Shortcut: Toggle Debug');
                toggleDebugPanel();
                break;
                
            case 'r':
                e.preventDefault();
                console.log('⌨️ Shortcut: Restart App');
                if (confirm('¿Reiniciar aplicación Equipo1?')) {
                    location.reload();
                }
                break;
        }
    });
    
    console.log('⌨️ Shortcuts configurados para Equipo1:');
    console.log('   Ctrl+1: Mostrar Invitado');
    console.log('   Ctrl+2: Mostrar Tema');
    console.log('   Ctrl+3: Mostrar Logo');
    console.log('   Ctrl+0: Ocultar Todo');
    console.log('   Ctrl+D: Debug');
    console.log('   Ctrl+R: Reiniciar');
}

// 🎭 FUNCIONES DE TESTING ESPECÍFICAS PARA EQUIPO1
function testShowInvitado() {
    if (app.showElement) {
        app.showElement('invitado', {
            invitado: 'Dr. María González',
            rol: 'Ministra de Salud'
        });
    }
}

function testShowTema() {
    if (app.showElement) {
        app.showElement('tema', {
            tema: 'Nuevas medidas sanitarias para el 2025'
        });
    }
}

function testShowLogo() {
    if (app.modules?.logoManager) {
        app.modules.logoManager.show();
    }
}

function testHideAll() {
    ['invitado', 'tema', 'publicidad'].forEach(element => {
        if (app.hideElement) {
            app.hideElement(element);
        }
    });
    
    if (app.modules?.logoManager) {
        app.modules.logoManager.hide();
    }
}

// 🎉 MENSAJE DE BIENVENIDA PARA EQUIPO1
function showWelcomeMessage() {
    const welcomeDiv = document.createElement('div');
    welcomeDiv.id = 'equipo1-welcome';
    welcomeDiv.className = 'welcome-message';
    welcomeDiv.innerHTML = `
        <div class="welcome-content">
            <h2>🎬 Bienvenido a Equipo1 Noticias</h2>
            <p>Sistema Modular v2.0 - Instancia de Noticias</p>
            <div class="welcome-info">
                <span>🔥 Firebase: Conectando...</span>
                <span>⚙️ Configuración: Cargada</span>
                <span>🎨 Tema: Equipo1 News</span>
            </div>
            <button onclick="closeWelcomeMessage()" class="welcome-close">
                Comenzar →
            </button>
        </div>
    `;
    
    document.body.appendChild(welcomeDiv);
    
    // Auto-cerrar después de 5 segundos
    setTimeout(() => {
        closeWelcomeMessage();
    }, 5000);
}

function closeWelcomeMessage() {
    const welcome = document.getElementById('equipo1-welcome');
    if (welcome) {
        welcome.style.opacity = '0';
        setTimeout(() => welcome.remove(), 300);
    }
}

// 📊 INDICADOR DE ESTADO VISUAL
function updateStatusIndicator(status) {
    const statusEl = document.getElementById('connection-status');
    if (!statusEl) return;
    
    switch (status) {
        case 'ready':
            statusEl.textContent = '✅ Equipo1 Listo';
            statusEl.className = 'status-ready';
            break;
        case 'error':
            statusEl.textContent = '❌ Error Equipo1';
            statusEl.className = 'status-error';
            break;
        default:
            statusEl.textContent = '🔄 Cargando...';
            statusEl.className = 'status-loading';
    }
}

// ❌ MANEJO DE ERRORES ESPECÍFICO PARA EQUIPO1
function showErrorMessage(error) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-overlay equipo1-error';
    errorDiv.innerHTML = `
        <div class="error-content">
            <h3>❌ Error en Equipo1 Noticias</h3>
            <p><strong>Instancia:</strong> ${instanceConfig.instanceName}</p>
            <p><strong>Firebase:</strong> ${instanceConfig.firebasePath}</p>
            <p><strong>Error:</strong> ${error.message}</p>
            <div class="error-actions">
                <button onclick="location.reload()" class="btn-retry">
                    🔄 Reintentar
                </button>
                <button onclick="this.parentElement.parentElement.parentElement.remove()" class="btn-close">
                    ❌ Cerrar
                </button>
            </div>
            <details class="error-details">
                <summary>Detalles técnicos</summary>
                <pre>${error.stack}</pre>
            </details>
        </div>
    `;
    
    document.body.appendChild(errorDiv);
}

// 🔧 DEBUG ESPECÍFICO PARA EQUIPO1
window.Equipo1Debug = {
    app: app,
    config: instanceConfig,
    customizations: equipo1Customizations,
    
    // Funciones de debug rápido
    showInvitado: testShowInvitado,
    showTema: testShowTema,
    showLogo: testShowLogo,
    hideAll: testHideAll,
    
    // Estado
    getStatus: () => ({
        app: app.getStatus(),
        config: instanceConfig,
        customizations: equipo1Customizations,
        firebase: window.lastFirebaseData
    }),
    
    // Utilidades
    restart: () => location.reload(),
    theme: applyEquipo1Theme,
    
    help: () => {
        console.log('🔧 COMANDOS DEBUG EQUIPO1:');
        console.log('  Equipo1Debug.showInvitado() - Mostrar invitado');
        console.log('  Equipo1Debug.showTema() - Mostrar tema');
        console.log('  Equipo1Debug.showLogo() - Mostrar logo');
        console.log('  Equipo1Debug.hideAll() - Ocultar todo');
        console.log('  Equipo1Debug.getStatus() - Ver estado');
        console.log('  Equipo1Debug.restart() - Reiniciar');
    }
};

console.log('🚀 Equipo1 Noticias - Main loaded');
console.log('💡 Debug disponible: window.Equipo1Debug.help()');

// Hacer disponible para el HTML template
window.testNewsElements = () => {
    testShowInvitado();
    setTimeout(testShowTema, 2000);
    setTimeout(testShowLogo, 4000);
    setTimeout(testHideAll, 8000);
};

export { app, instanceConfig, equipo1Customizations };