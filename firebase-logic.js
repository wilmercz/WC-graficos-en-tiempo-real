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
