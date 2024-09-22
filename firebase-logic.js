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

  onValue(graficoRef, (snapshot) => {
    const data = snapshot.val();
    console.log('Datos recibidos:', data);

    if (data) {
      document.getElementById('invitado').innerText = data.INVITADO_ACTIVO || 'Sin invitado';
      document.getElementById('rol').innerText = data.ROL_ACTIVO || 'Sin rol';

      const tema = document.getElementById('tema');
      const grafico = document.getElementById('grafico');

      if (data.TEMA_AL_AIRE) {
        grafico.style.display = 'none'; // Ocultar el gráfico de invitado y rol
        tema.style.display = 'block'; // Mostrar el tema
        tema.classList.add('show'); // Agregar clase para animación
      } else {
        grafico.style.display = 'block'; // Mostrar gráfico de invitado y rol
        tema.style.display = 'none'; // Ocultar tema
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
