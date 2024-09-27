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
      const colorFondo1 = data.COLOR_FONDO_1 ? hexToRgba(data.COLOR_FONDO_1) : 'rgba(220, 223, 220, 1)';
      const colorLetra1 = data.COLOR_LETRA_1 ? hexToRgba(data.COLOR_LETRA_1) : 'rgba(22, 75, 131, 1)';
      const colorLetra1 = data.COLOR_FONDO_2 ? hexToRgba(data.COLOR_FONDO_2) : 'rgba(255, 255, 255, 1)'; // Valor por defecto si no hay datos
      const colorLetra1 = data.COLOR_LETRA_2 ? hexToRgba(data.COLOR_LETRA_2) :'rgba(0, 0, 0, 1)';
      const colorFondo1 = data.COLOR_FONDO_3 ? hexToRgba(data.COLOR_FONDO_3) : 'rgba(220, 223, 220, 1)';
      const colorLetra1 = data.COLOR_LETRA_3 ? hexToRgba(data.COLOR_LETRA_3) : 'rgba(22, 75, 131, 1)';
      //const colorFondo3 = data.COLOR_FONDO_3 || 'rgba(240, 240, 240, 1)'; // Color por defecto para graficoTema
     
      const logoUrl = data.LOGO_RUTA || 'https://raw.githubusercontent.com/wilmercz/WC-graficos-en-tiempo-real/main/imagenes/LOGOS%20ARKIMEDES%204.png'; // Aquí es donde obtienes la URL del logo

      // Aplicar colores al h1 y h2 de #grafico-invitado-rol
     const graficoInvitadoRolH1 = document.querySelector('#grafico-invitado-rol h1');
    const graficoInvitadoRolH2 = document.querySelector('#grafico-invitado-rol h2');

      //if (graficoInvitadoRolH1) {
      //  graficoInvitadoRolH1.style.backgroundColor = colorFondo1;
     //   graficoInvitadoRolH1.style.color = colorLetra1;
      //}

      //if (graficoInvitadoRolH2) {
      //  graficoInvitadoRolH2.style.backgroundColor = colorFondo2;
       // graficoInvitadoRolH2.style.color = colorLetra2;
      //}

      // Aplicar colores a graficoTema
      //const graficoTema = document.querySelector('#grafico-tema h1');
      //if (graficoTema) {
      //  graficoTema.style.backgroundColor = colorFondo3;
      //  graficoTema.style.color = colorLetra3;
      //}
      
      
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

// Convertir explícitamente las cadenas "true" y "false" a booleanos
      const temaAlAire = (data.TEMA_AL_AIRE === "true") ? true : (data.TEMA_AL_AIRE === "false") ? false : data.TEMA_AL_AIRE;
      const graficoAlAire = (data.GRAFICO_AL_AIRE === "true") ? true : (data.GRAFICO_AL_AIRE === "false") ? false : data.GRAFICO_AL_AIRE;
      const logoAlAire = (data.LOGO_AL_AIRE === "true") ? true : (data.LOGO_AL_AIRE === "false") ? false : data.LOGO_AL_AIRE;

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

      // Mostrar u ocultar el logo basado en el valor de LOGO_AL_AIRE
      
      if (logoAlAire) {
        logo.src = logoUrl; // Cambiar dinámicamente la URL del logo
        logo.style.display = 'block';
      } else {
        logo.style.display = 'none';
      }

      document.getElementById('status').innerText = 'Estado de la conexión: Conectado y actualizado';
    } else {
      console.log('No se recibieron datos');
      document.getElementById('status').innerText = 'Estado de la conexión: Conectado, pero sin datos';
    }
  }, (error) => {
    console.error('Error al leer datos:', error);
    document.getElementById('status').innerText = 'Error al leer datos: ' + error.message;
  });
}
