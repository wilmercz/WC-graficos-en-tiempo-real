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
      // Actualizamos el texto del invitado y rol
      document.getElementById('invitado').innerText = data.INVITADO_ACTIVO || 'Sin invitado';
      document.getElementById('rol').innerText = data.ROL_ACTIVO || 'Sin rol';
      document.getElementById('tema').innerText = data.TEMA_ACTIVO || 'Sin tema';

      const graficoInvitadoRol = document.getElementById('grafico-invitado-rol');
      const graficoTema = document.getElementById('grafico-tema');

      if (data.TEMA_AL_AIRE) {
        // Si el tema está al aire, ocultamos invitado/rol y mostramos tema
        
        graficoInvitadoRol.style.display = 'none';
        graficoTema.style.display = 'block';
        
        // Actualizamos el valor en Firebase para GRAFICO_AL_AIRE
       // update(graficoRef, { GRAFICO_AL_AIRE: false });
        
      } else if (data.GRAFICO_AL_AIRE) {
        // Si el gráfico del invitado/rol está al aire, ocultamos el tema y mostramos invitado/rol
        grafico.classList.add('show'); // Add class to show
        //graficoTema.style.display = 'none';
        //graficoInvitadoRol.style.display = 'block';
        
        // Actualizamos el valor en Firebase para TEMA_AL_AIRE
        //update(graficoRef, { TEMA_AL_AIRE: false });
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
