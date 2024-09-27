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

function initializeDataListeners() {
  const graficoRef = ref(database, 'CLAVE_STREAM_FB/GRAFICOS_TIEMPO_REAL');

  // Escuchar los cambios en los datos de Firebase
  onValue(graficoRef, (snapshot) => {
    const data = snapshot.val();
    console.log('Datos recibidos:', data);

    if (data) {


      // Leer los colores de Firebase
      const colorFondo1 = data.COLOR_FONDO_1 || 'rgba(220, 223, 220, 1)'; // Valor por defecto si no hay datos
      const colorLetra1 = data.COLOR_LETRA_1 || 'rgba(22, 75, 131, 1)';
      const colorFondo2 = data.COLOR_FONDO_2 || 'rgba(255, 255, 255, 1)'; // Valor por defecto si no hay datos
      const colorLetra2 = data.COLOR_LETRA_2 || 'rgba(0, 0, 0, 1)';
      const colorFondo3 = data.COLOR_FONDO_3 || 'rgba(240, 240, 240, 1)'; // Color por defecto para graficoTema
      const colorLetra3 = data.COLOR_LETRA_3 || 'rgba(0, 0, 0, 1)'; // Color de letra por defecto para graficoTema

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
      const graficoTema = document.querySelector('#grafico-tema h1');
      if (graficoTema) {
        graficoTema.style.backgroundColor = colorFondo3;
        graficoTema.style.color = colorLetra3;
      }

      // Obtener la URL de la imagen de publicidad desde el campo GRAFICO_1
      const publicidadUrl = data.GRAFICO_1 || ''; // Aquí es donde obtienes la URL desde el campo GRAFICO_1

      // Convertir explícitamente la cadena "true" y "false" a booleano para la publicidad
      const publicidadAlAire = (data.GRAFICO_PUBLICIDAD_AL_AIRE === "true") ? true : (data.GRAFICO_PUBLICIDAD_AL_AIRE === "false") ? false : data.GRAFICO_PUBLICIDAD_AL_AIRE;

      // Mostrar u ocultar el gráfico de publicidad
      const graficoPublicidad = document.getElementById('grafico-publicidad');
      const publicidadImg = document.getElementById('publicidad-img');
      if (publicidadAlAire && publicidadUrl) {
        publicidadImg.src = publicidadUrl; // Establecer la URL de la imagen desde GRAFICO_1
        graficoPublicidad.style.display = 'block';
        graficoInvitadoRol.style.display = 'none';
        graficoTema.style.display = 'none';
      } else {
        graficoPublicidad.style.display = 'none';
      }
    } else {
      console.log('No se recibieron datos');
      document.getElementById('status').innerText = 'Estado de la conexión: Conectado, pero sin datos';
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

