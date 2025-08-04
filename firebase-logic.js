/* ============================================
   FIREBASE LOGIC - BROADCAST STANDARD
   Integración completa con animaciones optimizadas
   ============================================ */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-database.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
import { firebaseConfig } from './firebase-config.js';

// Importar animaciones simplificadas
import { 
  fadeIn, 
  fadeOut, 
  slideIn, 
  slideOut, 
  animateElement,
  toggleVisibility 
} from './animations.js';

// ============================================
// INICIALIZACIÓN FIREBASE
// ============================================
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

// Autenticación anónima
signInAnonymously(auth)
  .then(() => {
    console.log("✅ Autenticación Firebase exitosa");
    initializeDataListeners();
  })
  .catch((error) => {
    console.error("❌ Error de autenticación:", error);
    document.getElementById('status').innerText = 'Error de autenticación: ' + error.message;
  });

// ============================================
// FUNCIONES DE UTILIDAD
// ============================================

function hexToRgba(hex, alpha = 1) {
  if (!hex || typeof hex !== 'string') return null;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function applyColors(element, backgroundColor, textColor) {
  if (element) {
    element.style.backgroundColor = backgroundColor;
    element.style.color = textColor;
    console.log(`🎨 Colores aplicados a ${element.id}:`, { backgroundColor, textColor });
  }
}

function cleanText(text) {
  return (text || '').toString().replace(/^"|"$/g, '').trim();
}

// ============================================
// FUNCIONES PRINCIPALES DE LOWER THIRDS
// ============================================

function showLowerThirdsInvitado(isVisible) {
  const graficoInvitadoRol = document.getElementById('grafico-invitado-rol');
  
  if (isVisible) {
    console.log("👤 Mostrando gráfico invitado");
    slideIn(graficoInvitadoRol);
  } else {
    console.log("👤 Ocultando gráfico invitado");
    slideOut(graficoInvitadoRol);
  }
}

function showLowerThirdsTema(isVisible) {
  const graficoTema = document.getElementById('grafico-tema');
  
  if (isVisible) {
    console.log("📋 Mostrando gráfico tema");
    slideIn(graficoTema);
  } else {
    console.log("📋 Ocultando gráfico tema");
    slideOut(graficoTema);
  }
}

function showLogo(isVisible) {
  const logo = document.getElementById('logo');
  
  if (isVisible) {
    console.log("🏛️ Mostrando logo");
    fadeIn(logo);
  } else {
    console.log("🏛️ Ocultando logo");
    fadeOut(logo);
  }
}

function showPublicidad(isVisible) {
  const graficoPublicidad = document.getElementById('grafico-publicidad');
  
  if (isVisible) {
    console.log("📺 Mostrando publicidad");
    fadeIn(graficoPublicidad);
  } else {
    console.log("📺 Ocultando publicidad");
    fadeOut(graficoPublicidad);
  }
}

// ============================================
// LÓGICA PRINCIPAL DE DATOS
// ============================================

function processFirebaseData(data) {
  if (!data) {
    console.log("⚠️ No se recibieron datos de Firebase");
    return;
  }

  console.log('📡 Datos recibidos de Firebase:', data);

  // ============================================
  // 1. PROCESAR COLORES
  // ============================================
  const colorFondo1 = data.colorFondo1 || 'rgba(16, 102, 255, 1)';
  const colorLetra1 = data.colorLetra1 || 'rgba(255, 255, 255, 1)';
  const colorFondo2 = data.colorFondo2 || 'rgba(16, 102, 255, 1)';
  const colorLetra2 = data.colorLetra2 || 'rgba(255, 255, 255, 1)';
  const colorFondo3 = data.colorFondo3 || 'rgba(240, 131, 19, 1)';
  const colorLetra3 = data.colorLetra3 || 'rgba(255, 255, 255, 1)';

  console.log('🎨 Colores procesados:', { 
    colorFondo1, colorLetra1, 
    colorFondo2, colorLetra2, 
    colorFondo3, colorLetra3 
  });

  // ============================================
  // 2. OBTENER ELEMENTOS DEL DOM
  // ============================================
  const graficoInvitadoRolH1 = document.querySelector('#grafico-invitado-rol h1');
  const graficoInvitadoRolH2 = document.querySelector('#grafico-invitado-rol h2');
  const graficoTemaH1 = document.querySelector('#grafico-tema h1');
  const logo = document.getElementById('logo');
  const publicidadImg = document.getElementById('publicidad-img');

  // ============================================
  // 3. APLICAR COLORES A ELEMENTOS
  // ============================================
  applyColors(graficoInvitadoRolH1, colorFondo2, colorLetra2); // NOMBRE INVITADO
  applyColors(graficoInvitadoRolH2, colorFondo3, colorLetra3); // ROL
  applyColors(graficoTemaH1, colorFondo1, colorLetra1);       // DESCRIPCIÓN TEMA

  // ============================================
  // 4. PROCESAR TEXTOS
  // ============================================
  const invitado = cleanText(data.Invitado) || 'Sin Invitado';
  const rol = cleanText(data.Rol) || 'Sin Rol';
  const tema = cleanText(data.Tema) || 'Sin Tema';

  document.getElementById('invitado').innerText = invitado;
  document.getElementById('rol').innerText = rol;
  document.getElementById('tema').innerText = tema;

  console.log('📝 Textos actualizados:', { invitado, rol, tema });

  // ============================================
  // 5. PROCESAR ESTADOS DE VISIBILIDAD
  // ============================================
  const temaAlAire = data.Mostrar_Tema === "true";
  const graficoAlAire = data.Mostrar_Invitado === "true";
  const logoAlAire = data.Mostrar_Logo === "true";
  const publicidadAlAire = data.Mostrar_Publicidad === "true";

  console.log('👀 Estados de visibilidad:', { 
    temaAlAire, 
    graficoAlAire, 
    logoAlAire, 
    publicidadAlAire 
  });

  // ============================================
  // 6. APLICAR VISIBILIDAD CON ANIMACIONES
  // ============================================
  
  // IMPORTANTE: Solo mostrar uno a la vez (tema O invitado)
  if (temaAlAire && graficoAlAire) {
    // Si ambos están activos, priorizar tema y ocultar invitado
    console.log("⚠️ Conflicto: ambos gráficos activos, priorizando tema");
    showLowerThirdsTema(true);
    showLowerThirdsInvitado(false);
  } else {
    showLowerThirdsTema(temaAlAire);
    showLowerThirdsInvitado(graficoAlAire);
  }

  // Logo y publicidad independientes
  showLogo(logoAlAire);
  showPublicidad(publicidadAlAire);

  // ============================================
  // 7. PROCESAR URLs DE IMÁGENES
  // ============================================
  const logoUrl = cleanText(data.urlLogo);
  const publicidadUrl = cleanText(data.urlImagenPublicidad);

  if (logoUrl && logo) {
    logo.src = logoUrl;
    console.log('🖼️ Logo URL actualizada:', logoUrl);
  }

  if (publicidadUrl && publicidadImg) {
    publicidadImg.src = publicidadUrl;
    console.log('🖼️ Publicidad URL actualizada:', publicidadUrl);
  }

  // ============================================
  // 8. UPDATE STATUS
  // ============================================
  updateStatus('🟢 Conectado - Datos actualizados');
}

function updateStatus(message) {
  const statusElement = document.getElementById('status');
  if (statusElement) {
    statusElement.innerText = message;
    console.log('📊 Status:', message);
  }
}

// ============================================
// LISTENER PRINCIPAL DE FIREBASE
// ============================================

function initializeDataListeners() {
  const graficoRef = ref(database, 'CLAVE_STREAM_FB/STREAM_LIVE/GRAFICOS');

  onValue(graficoRef, (snapshot) => {
    try {
      const data = snapshot.val();
      processFirebaseData(data);
    } catch (error) {
      console.error('❌ Error procesando datos de Firebase:', error);
      updateStatus('❌ Error procesando datos');
    }
  }, (error) => {
    console.error('❌ Error al leer datos de Firebase:', error);
    updateStatus('❌ Error de conexión');
  });

  console.log('👂 Listener de Firebase inicializado');
}

// ============================================
// FUNCIONES DE DEBUG (opcional)
// ============================================

// Función para mostrar información de debug
function showDebugInfo() {
  const debugDiv = document.createElement('div');
  debugDiv.className = 'debug-info';
  debugDiv.innerHTML = `
    <strong>🔧 DEBUG INFO</strong><br>
    ✅ Safe Areas aplicadas<br>
    ✅ Fuentes optimizadas (15px/12px)<br>
    ✅ Sin contenedores circulares<br>
    ✅ Animaciones simplificadas<br>
    📐 Posición: 96px safe margin<br>
    📏 Tamaño: 720x60px containers
  `;
  document.body.appendChild(debugDiv);
}

// Mostrar debug info si está en desarrollo
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
  document.addEventListener('DOMContentLoaded', showDebugInfo);
}

// ============================================
// EXPORTAR FUNCIONES PARA USO GLOBAL
// ============================================

// Hacer funciones disponibles globalmente para testing
window.lowerThirds = {
  showInvitado: showLowerThirdsInvitado,
  showTema: showLowerThirdsTema,
  showLogo: showLogo,
  showPublicidad: showPublicidad,
  processData: processFirebaseData
};

console.log('🚀 Firebase Logic inicializado correctamente');

/* ============================================
   CAMBIOS PRINCIPALES RESPECTO AL CÓDIGO ANTERIOR:
   
   ✅ ELIMINADO: Funciones complejas LowerThirdsInvitado/LowerThirdsTema
   ✅ SIMPLIFICADO: Solo 4 funciones show/hide básicas
   ✅ OPTIMIZADO: Sin setTimeout anidados complejos
   ✅ MEJORADO: Mejor manejo de errores y logging
   ✅ ACTUALIZADO: Integración con animaciones simplificadas
   ✅ CORREGIDO: Posicionamiento según safe areas
   ✅ ELIMINADO: Referencias a elementos H3 circulares
   ============================================ */
