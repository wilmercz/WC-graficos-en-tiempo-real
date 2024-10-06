import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-database.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
import { firebaseConfig } from './firebase-config.js'; // Importa la configuración de Firebase
import { slideIn, slideOut, fadeIn, fadeOut, slideInLeft, slideOutLeft, slideInTop, slideOutTop } from './animations.js'; // Importa las funciones de animación

const app = initializeApp(firebaseConfig); // Usa la configuración importada
const auth = getAuth(app);
const database = getDatabase(app);

signInAnonymously(auth)
  .then(() => {
    console.log("Autenticación anónima exitosa");
    initializeDataListeners();
  })
  .catch((error) => {
    console.error("Error de autenticación:", error);
    document.getElementById('status').innerText = 'Error de autenticación: ' + error.message;
  });

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
    console.log(`Aplicando colores a ${element.id}:`, { backgroundColor, textColor });
  }
}

function updateVisibility(element, isVisible, animationFunctionIn = null, animationFunctionOut = null) {
  if (isVisible) {
    element.style.display = 'block';  // Muestra el elemento
    if (animationFunctionIn) {
      animationFunctionIn(element);  // Aplica la animación de entrada si se especifica
    }
  } else {
    if (animationFunctionOut) {
      animationFunctionOut(element);  // Aplica la animación de salida si se especifica
      setTimeout(() => { 
        element.style.display = 'none';  // Oculta después de la animación
      }, 700);  // Duración de la animación
    } else {
      element.style.display = 'none';  // Oculta inmediatamente si no hay animación
    }
  }
  console.log(`Actualizando visibilidad de ${element.id}:`, isVisible);
}


function initializeDataListeners() {
  const graficoRef = ref(database, 'CLAVE_STREAM_FB/STREAM_LIVE/GRAFICOS');

  onValue(graficoRef, (snapshot) => {
    const data = snapshot.val();
    console.log('Datos recibidos de Firebase:', data);

    if (data) {
      const colorFondo1 = data.colorFondo1 || 'rgba(220, 223, 220, 1)';
      const colorLetra1 = data.colorLetra1 || 'rgba(22, 75, 131, 1)';
      const colorFondo2 = data.colorFondo2 || 'rgba(255, 255, 255, 1)';
      const colorLetra2 = data.colorLetra2 || 'rgba(0, 0, 0, 1)';
      const colorFondo3 = data.colorFondo3 || 'rgba(240, 240, 240, 1)';
      const colorLetra3 = data.colorLetra3 || 'rgba(0, 0, 0, 1)';

      console.log('Colores aplicados:', { colorFondo1, colorLetra1, colorFondo2, colorLetra2, colorFondo3, colorLetra3 });

      const graficoInvitadoRol = document.getElementById('grafico-invitado-rol');
      const graficoInvitadoRolH1 = document.querySelector('#grafico-invitado-rol h1');
      const graficoInvitadoRolH2 = document.querySelector('#grafico-invitado-rol h2');
      const graficoInvitadoRolH3 = document.querySelector('#grafico-invitado-rol h3');
      const graficoTema = document.getElementById('grafico-tema');
      const graficoTemaH1 = document.querySelector('#grafico-tema h1');
      const graficoTemaH2 = document.querySelector('#grafico-tema h2');
      const logo = document.getElementById('logo');
      const graficoPublicidad = document.getElementById('grafico-publicidad');
      const publicidadImg = document.getElementById('publicidad-img');

      applyColors(graficoInvitadoRolH3, colorFondo1, colorLetra1);
      applyColors(graficoInvitadoRolH1, colorFondo1, colorLetra1);
      applyColors(graficoInvitadoRolH2, colorFondo2, colorLetra2);
      applyColors(graficoTemaH2, colorFondo3, colorLetra3);
      applyColors(graficoTemaH1, colorFondo3, colorLetra3);

      const invitado = (data.Invitado || 'Sin Invitado').replace(/^"|"$/g, '');
      const rol = (data.Rol || '-').replace(/^"|"$/g, '');
      const tema = (data.Tema || '-').replace(/^"|"$/g, '');

      document.getElementById('invitado').innerText = invitado;
      document.getElementById('rol').innerText = rol;
      document.getElementById('tema').innerText = tema;

      const temaAlAire  = (data.Mostrar_Tema === "true") ? true : (data.Mostrar_Tema === "false") ? false : data.Mostrar_Tema;
      const graficoAlAire = (data.Mostrar_Invitado === "true") ? true : (data.Mostrar_Invitado === "false") ? false : data.Mostrar_Invitado;
      const logoAlAire = (data.Mostrar_Logo === "true") ? true : (data.Mostrar_Logo === "false") ? false : data.Mostrar_Logo;
      const publicidadAlAire = (data.Mostrar_Publicidad === "true") ? true : (data.Mostrar_Publicidad === "false") ? false : data.Mostrar_Publicidad;

      console.log('Estado de visibilidad:', { temaAlAire, graficoAlAire, logoAlAire, publicidadAlAire });

      updateVisibility(graficoTema, temaAlAire, temaAlAire ? slideIn : slideOut);
      //BLOQUES DE INVITADO
      updateVisibility(graficoInvitadoRol, graficoAlAire);  // Sin animaciones
      updateVisibility(graficoInvitadoRolH3, graficoAlAire, graficoAlAire ? fadeIn : fadeOut);
      updateVisibility(graficoInvitadoRolH1, graficoAlAire, graficoAlAire ? slideInLeft : slideOutLeft);
       updateVisibility(graficoInvitadoRolH2, graficoAlAire, graficoAlAire ? slideInLeft : slideOutLeft);
      //FIN BLOQUES INVITADO
      
      updateVisibility(logo, logoAlAire, logoAlAire ? fadeIn : fadeOut);
      updateVisibility(graficoPublicidad, publicidadAlAire, publicidadAlAire ? fadeIn : fadeOut);

      const logoUrl = (data.urlLogo || 'https://raw.githubusercontent.com/wilmercz/WC-graficos-en-tiempo-real/main/imagenes/LOGOS%20ARKIMEDES%204.png')
        .trim()
        .replace(/^"|"$/g, '');
      
      const publicidadUrl = (data.urlImagenPublicidad || '')
        .trim()
        .replace(/^"|"$/g, '');

      if (logoAlAire && logoUrl) {
        logo.src = logoUrl;
      }

      if (publicidadAlAire && publicidadUrl) {
        publicidadImg.src = publicidadUrl;
      }

    } else {
      console.log('No se recibieron datos');
    }
  }, (error) => {
    console.error('Error al leer datos:', error);
  });
}
