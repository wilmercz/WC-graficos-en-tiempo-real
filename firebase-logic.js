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


function LowerThirdsInvitado(graficoInvitadoRol, graficoInvitadoRolH3, graficoInvitadoRolH1, graficoInvitadoRolH2, isVisible) {
  // Primero muestra el contenedor inmediatamente
  if (isVisible) {
      updateVisibility(graficoInvitadoRol, isVisible);
  }

  // Luego, muestra el h3 con fadeIn si es visible
  if (isVisible) {
    setTimeout(() => {
      updateVisibility(graficoInvitadoRolH3, true, fadeIn);
    }, 0); // Inmediatamente

    // Después de 300ms muestra el h1 con slideInLeft
    setTimeout(() => {
      updateVisibility(graficoInvitadoRolH1, true, slideInLeft);
    }, 100); // Después de 300ms

    // Después de 600ms muestra el h2 con slideInTop
    setTimeout(() => {
      updateVisibility(graficoInvitadoRolH2, true, slideInTop);
    }, 250); // Después de 600ms
  } else {
    // Si no es visible, oculta todos los elementos con sus animaciones de salida
    setTimeout(() => {
      updateVisibility(graficoInvitadoRolH2, false, slideOutTop);
    }, 100); // Después de 600ms
    
    setTimeout(() => {
      updateVisibility(graficoInvitadoRolH1, false, slideOutLeft);
    }, 200); // Después de 300ms

    setTimeout(() => {
    updateVisibility(graficoInvitadoRolH3, false, fadeOut);
    }, 400); // Después de 300ms

    setTimeout(() => {
      if (isVisible === false) {
        updateVisibility(graficoInvitadoRol, isVisible);
      }
    }, 600); // Después de 600ms
  } // Cierre del bloque else
} // Cierre de la función

function LowerThirdsTema(graficoTema, graficoTemaH1, graficoTemaH2, isVisible) {
  // Primero muestra el contenedor inmediatamente
  if (isVisible) {
      updateVisibility(graficoTema, isVisible);
  }

  // Luego, muestra el h3 con fadeIn si es visible
  if (isVisible) {
    setTimeout(() => {
      updateVisibility(graficoTemaH2, true, fadeIn);
    }, 0); // Inmediatamente

    // Después de 300ms muestra el h1 con slideInLeft
    setTimeout(() => {
      updateVisibility(graficoTemaH1, true, slideInLeft);
    }, 100); // Después de 300ms

    
  } else {
    // Si no es visible, oculta todos los elementos con sus animaciones de salida
    setTimeout(() => {
      updateVisibility(graficoTemaH1, false, slideOutTop);
    }, 100); // Después de 600ms
   

    setTimeout(() => {
    updateVisibility(graficoTemaH2, false, fadeOut);
    }, 400); // Después de 300ms

    setTimeout(() => {
      if (isVisible === false) {
        updateVisibility(graficoTema, isVisible);
      }
    }, 600); // Después de 600ms
  } // Cierre del bloque else
} // Cierre




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



      applyColors(graficoInvitadoRolH3, colorFondo1, colorLetra1); //fondo del logo
      applyColors(graficoInvitadoRolH1, colorFondo2, colorLetra2); //NOMBRE INVITADO
      applyColors(graficoInvitadoRolH2, colorFondo3, colorLetra3); //ROL
      applyColors(graficoTemaH2, colorFondo1, colorLetra1); //fondo del logo
      applyColors(graficoTemaH1, colorFondo2, colorLetra2); //DESCRIPCION

      
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


      LowerThirdsTema(graficoTema, graficoTemaH1, graficoTemaH2, temaAlAire);
      //updateVisibility(graficoTema, temaAlAire, temaAlAire ? slideIn : slideOut);
      //BLOQUES DE INVITADO
      LowerThirdsInvitado(graficoInvitadoRol, graficoInvitadoRolH3, graficoInvitadoRolH1, graficoInvitadoRolH2, graficoAlAire);
      //updateVisibility(graficoInvitadoRol, graficoAlAire);  // Sin animaciones
      //updateVisibility(graficoInvitadoRolH3, graficoAlAire, graficoAlAire ? fadeIn : fadeOut);
      //updateVisibility(graficoInvitadoRolH1, graficoAlAire, graficoAlAire ? slideInLeft : slideOutLeft);
      // updateVisibility(graficoInvitadoRolH2, graficoAlAire, graficoAlAire ? slideInTop : slideOutTop);
      //FIN BLOQUES INVITADO
    
      


      const logoUrl = (data.urlLogo || '')
        .trim()
        .replace(/^"|"$/g, '');
       
      const publicidadUrl = (data.urlImagenPublicidad || '')
        .trim()
        .replace(/^"|"$/g, '');

      console.log('La URL del logo es válida:', logoUrl);
      
     // if (logoAlAire && logoUrl) {
      if (logoUrl) {
        logo.src = logoUrl;
        console.log('logo cargado');
      } else {
        console.log('El logo no se cargó: logoAlAire =', logoAlAire, ', logoUrl =', logoUrl);
      }

      if (publicidadAlAire && publicidadUrl) {
        publicidadImg.src = publicidadUrl;
      }

      //BLOQUES DE VISIBILIDAD DEL LOGO Y PUBLICIDAD
      updateVisibility(logo, logoAlAire, logoAlAire ? fadeIn : fadeOut);
      updateVisibility(graficoPublicidad, publicidadAlAire, publicidadAlAire ? fadeIn : fadeOut);
      
    } else {
      console.log('No se recibieron datos');
    }
  }, (error) => {
    console.error('Error al leer datos:', error);
  });
}
