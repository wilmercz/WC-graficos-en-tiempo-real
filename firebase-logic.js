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
      // Actualizar textos de Invitado, Rol y Tema
      document.getElementById('invitado').innerText = data.INVITADO_ACTIVO || 'Sin invitado';
      document.getElementById('rol').innerText = data.ROL_ACTIVO || 'Sin rol';
      document.getElementById('tema').innerText = data.TEMA_ACTIVO || 'Sin tema';

      const graficoInvitadoRol = document.getElementById('grafico-invitado-rol');
      const graficoTema = document.getElementById('grafico-tema');

      // Mostrar u ocultar el gráfico del tema
      if (data.TEMA_AL_AIRE) {
        graficoTema.style.display = 'block';
        graficoInvitadoRol.style.display = 'none';

        // Asegurarse de que solo el tema está al aire
        //if (data.GRAFICO_AL_AIRE) {
          //update(graficoRef, { GRAFICO_AL_AIRE: false });
        //}
      } else {
        graficoTema.style.display = 'none';
      }

      // Mostrar u ocultar el gráfico de invitado/rol
      if (data.GRAFICO_AL_AIRE) {
        graficoInvitadoRol.style.display = 'block';
        graficoTema.style.display = 'none';

        // Asegurarse de que solo el invitado/rol está al aire
        //if (data.TEMA_AL_AIRE) {
          //update(graficoRef, { TEMA_AL_AIRE: false });
        //}
      } else {
        graficoInvitadoRol.style.display = 'none';
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
