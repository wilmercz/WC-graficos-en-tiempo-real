import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-database.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
import { firebaseConfig } from './firebase-config.js'; // Importa la configuración de Firebase

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

function initializeDataListeners() {
  const graficoRef = ref(database, 'CLAVE_STREAM_FB/GRAFICOS_TIEMPO_REAL');

  // Escuchar los cambios en los datos de Firebase
  onValue(graficoRef, (snapshot) => {
    const data = snapshot.val();
    console.log('Datos recibidos:', data);

    if (data) {
      // Leer los colores de Firebase
      const colorFondo1 = data.COLOR_FONDO_1 || 'rgba(220, 223, 220, 1)';
      const colorLetra1 = data.COLOR_LETRA_1 || 'rgba(22, 75, 131, 1)';
      const colorFondo2 = data.COLOR_FONDO_2 || 'rgba(255, 255, 255, 1)';
      const colorLetra2 = data.COLOR_LETRA_2 || 'rgba(0, 0, 0, 1)';
      const colorFondo3 = data.COLOR_FONDO_3 || 'rgba(240, 240, 240, 1)';
      const colorLetra3 = data.COLOR_LETRA_3 || 'rgba(0, 0, 0, 1)';

      // Aplicar colores al h1 y h2 de #grafico-invitado-rol
      const graficoInvitadoRolH1 = document.querySelector('#grafico-invitado-rol h1');
      const graficoInvitadoRolH2 = document.querySelector('#grafico-invitado-rol h2');

      if (graficoInvitadoRolH1) {
        graficoInvitadoRolH1.style.backgroundColor = colorFondo1;
        graficoInvitadoRolH1.style.color = colorLetra1;
      }

      if (graficoInvitadoRolH2) {
        graficoInvitadoRolH2.style.backgroundColor = colorFondo2;
        graficoInvitadoRolH2.style.color = colorLetra2;
      }

      // Aplicar colores a graficoTema
      const graficoTemaH1 = document.querySelector('#grafico-tema h1');
      if (graficoTemaH1) {
        graficoTemaH1.style.backgroundColor = colorFondo3;
        graficoTemaH1.style.color = colorLetra3;
      }

      // Eliminar las comillas extremas de los campos si las hay
      const invitado = (data.INVITADO_ACTIVO || 'Sin invitado').replace(/^"|"$/g, '');
      const rol = (data.ROL_ACTIVO || 'Sin rol').replace(/^"|"$/g, '');
      const tema = (data.TEMA_ACTIVO || 'Sin tema').replace(/^"|"$/g, '');

      // Actualizar textos de Invitado, Rol y Tema
      document.getElementById('invitado').innerText = invitado;
      document.getElementById('rol').innerText = rol;
      document.getElementById('tema').innerText = tema;

      
      const graficoInvitadoRol = document.getElementById('grafico-invitado-rol');
      const graficoTema = document.getElementById('grafico-tema');
      const logo = document.getElementById('logo');
      const graficoPublicidad = document.getElementById('grafico-publicidad');
      const publicidadImg = document.getElementById('publicidad-img');

      // Convertir explícitamente las cadenas "true" y "false" a booleanos
      //const temaAlAire = data.TEMA_AL_AIRE === "true";
      //const graficoAlAire = data.GRAFICO_AL_AIRE === "true";
      //const logoAlAire = data.LOGO_AL_AIRE === "true";
      //const publicidadAlAire = data.GRAFICO_1_ALAIRE === "true";
// Convertir explícitamente las cadenas "true" y "false" a booleanos
      const temaAlAire = (data.TEMA_AL_AIRE === "true") ? true : (data.TEMA_AL_AIRE === "false") ? false : data.TEMA_AL_AIRE;
      const graficoAlAire = (data.GRAFICO_AL_AIRE === "true") ? true : (data.GRAFICO_AL_AIRE === "false") ? false : data.GRAFICO_AL_AIRE;
      const logoAlAire = (data.LOGO_AL_AIRE === "true") ? true : (data.LOGO_AL_AIRE === "false") ? false : data.LOGO_AL_AIRE;
      const publicidadAlAire = (data.GRAFICO_1_ALAIRE === "true") ? true : (data.GRAFICO_1_ALAIRE === "false") ? false : data.GRAFICO_1_ALAIRE;

      console.log('PUBLICIDAD ESTADO:', publicidadAlAire);
      
      // Leer la URL del logo y de la publicidad desde Firebase
      const logoUrl = (data.LOGO_RUTA || 'https://raw.githubusercontent.com/wilmercz/WC-graficos-en-tiempo-real/main/imagenes/LOGOS%20ARKIMEDES%204.png')
        .trim()
        .replace(/^"|"$/g, '');
      
      const publicidadUrl = (data.GRAFICO_1 || '')
        .trim()
        .replace(/^"|"$/g, '');
//document.getElementById('status').innerText = 'PASO 4';
      
           // Mostrar u ocultar el gráfico del tema
      if (temaAlAire) {
        graficoTema.style.display = 'block';
        graficoInvitadoRol.style.display = 'none';
      } else {
        graficoTema.style.display = 'none';
      }

      // Mostrar u ocultar el gráfico de invitado/rol
      if (graficoAlAire) {
        graficoInvitadoRol.style.display = 'block';
        graficoTema.style.display = 'none';
      } else {
        graficoInvitadoRol.style.display = 'none';
      }

     // console.log('LOGO Estado:', logoAlAire);
     // console.log('LOGO URL:', logoUrl);
      if (logoAlAire && logoUrl) {
        logo.src = logoUrl;
        logo.style.display = 'block';
        //document.getElementById('status').innerText = 'logo visible';
      } else {
        logo.style.display = 'none';
        //document.getElementById('status').innerText = 'Logo invisible';
      }

            // Mostrar u ocultar el logo basado en el valor de LOGO_AL_AIRE
      //if (logoAlAire) {
       // logo.src = logoUrl;
       // logo.style.display = 'block';
       // console.log('Logo Visible segundo bloque', logoAlAire);
      //} else {
      //  logo.style.display = 'none';
     // }

      
      if (publicidadAlAire && publicidadUrl) {
        publicidadImg.src = publicidadUrl;
        graficoPublicidad.style.display = 'block';
        graficoInvitadoRol.style.display = 'none';
        graficoTema.style.display = 'none';
      } else {
        graficoPublicidad.style.display = 'none';
      }

      //document.getElementById('status').innerText = 'Estado de la conexión: Conectado y actualizado';
       console.log('proceso 7, PUBLICIDAD ESTADO:', publicidadAlAire);
    } else {
      console.log('No se recibieron datos');
      document.getElementById('status').innerText = 'Estado de la conexión: Conectado, pero sin datos';
    }
  }, (error) => {
    console.error('Error al leer datos:', error);
    document.getElementById('status').innerText = 'Error al leer datos: ' + error.message;
  });
}
