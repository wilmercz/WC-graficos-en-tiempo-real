// 🗺️ modules/route-manager.js
// Responsabilidad: Gestionar la precarga, renderizado y vuelo 3D de rutas (Mapbox + OSRM)

import { EventBus } from '../utils/event-bus.js';

export class RouteManager {
    constructor() {
        this.isInitialized = false;
        this.map = null;
        this.mapContainer = null;
        this.overlayContainer = null;
        this.isMapLoaded = false;
        this.isFlying = false;

        // Configuración de motor
        this.token = 'pk.eyJ1IjoiYXJraS1tZWRlczE5ODUiLCJhIjoiY21vZzNqeXdrMDZlMTJ2cTNoZDJoMXE4MSJ9.poOFAaOccIhbmzTSLiqn5A';
        this.rutaCoordenadas = [];
        this.rutaCamaraCoordenadas = []; // ✅ Array exclusivo para el heading del dron
        this.marcadores = [];
        this.flightAnimationId = null;
        this.currentData = null; // Guardará la info de la ruta actual
        this.pendingShow = false; // ✅ Control si piden Mostrar antes de que termine de Preparar
        this.currentRouteGeometry = null; // ✅ Guardará la geometría para el encuadre final
        this.hideTimeoutId = null; // ✅ Control para el temporizador de ocultamiento suave
        this.flightStartTimeout = null; // ✅ Control del arranque del dron para evitar "drones fantasma"
    }

    /**
     * Inicializar el módulo (Se ejecuta al arrancar main.js)
     */
    init() {
        this.mapContainer = document.getElementById('map-container');
        this.overlayContainer = document.getElementById('map-overlay');

        if (!this.mapContainer) {
            console.warn('⚠️ Contenedor de mapa 3D no encontrado');
            return;
        }

        this.setupEventListeners();
        this.isInitialized = true;
        console.log('🗺️ Route Manager inicializado. Esperando comandos de precarga.');
        
        // Exponer para debug manual
        window.RouteDebug = () => this.debugEstado();
    }

    /**
     * Escuchar eventos emitidos por Firebase a través de main.js
     */
    setupEventListeners() {
        EventBus.on('route-prepare', (data) => this.prepareMapAndRoute(data));
        EventBus.on('route-show', (data) => this.showMapAndFly(data));
        EventBus.on('route-hide', () => this.hideMap());
    }

    // ==========================================
    // LÓGICA PRINCIPAL (SE IMPLEMENTARÁ LUEGO)
    // ==========================================

    async prepareMapAndRoute(data) {
        console.log('🗺️ [PASO 1] Recibida orden PREPARAR en segundo plano. Datos:', data);
        this.currentData = data;

        // Limpiar animaciones previas si se vuelve a preparar
        if (this.flightAnimationId) cancelAnimationFrame(this.flightAnimationId);
        if (this.flightStartTimeout) clearTimeout(this.flightStartTimeout);
        this.isFlying = false;

        // 1. Convertir string a Array [Lon, Lat] con Auto-Corrección Inteligente y soporte para comas decimales
        const parseCoords = (str) => {
            // Extraer solo los números, soportando punto o coma como separador decimal
            let matches = str.match(/-?\d+([.,]\d+)?/g);
            if (!matches || matches.length < 2) return [0, 0];
            
            // Reemplazar coma por punto y convertir a número real
            let n1 = parseFloat(matches[0].replace(',', '.'));
            let n2 = parseFloat(matches[1].replace(',', '.'));
            
            // Si el primer número parece Latitud (pequeño) y el segundo Longitud (-70s) de Google Maps:
            if (Math.abs(n1) < 20 && Math.abs(n2) > 50) {
                console.log(`🔄 Auto-corrigiendo coordenada invertida: [${n2}, ${n1}]`);
                return [n2, n1]; // Forzar siempre el orden [Longitud, Latitud]
            }
            return [n1, n2];
        };
        const coordsA = parseCoords(data.origenCoords);
        const coordsC = parseCoords(data.destinoCoords);

        // 2. Actualizar el texto del Overlay de TV
        const textoRuta = document.getElementById('map-ruta-texto');
        if (textoRuta) textoRuta.innerText = `${data.origenNombre} ➔ ${data.destinoNombre}`;

        if (typeof turf === 'undefined') {
            console.error('🚨 [ERROR CRÍTICO] La librería Turf.js fue bloqueada por tu navegador. El cálculo matemático fallará.');
        }

        // 3. Inicializar el motor Mapbox (solo la primera vez)
        if (!this.map) {
            mapboxgl.accessToken = this.token;
            console.log('🗺️ [PASO 2] Creando lienzo 3D de Mapbox...');
            
            this.map = new mapboxgl.Map({
                container: 'map-container',
                style: 'mapbox://styles/mapbox/satellite-streets-v12',
                center: coordsA,
                zoom: 13,
                pitch: 65,
                bearing: 0
            });

            this.map.on('load', () => {
                console.log('🗺️ [PASO 3] Mapa satelital base descargado con éxito.');
                this.isMapLoaded = true;
                
                // Activar montañas 3D
                this.map.addSource('mapbox-dem', { 'type': 'raster-dem', 'url': 'mapbox://mapbox.mapbox-terrain-dem-v1', 'tileSize': 512, 'maxzoom': 14 });
                this.map.setTerrain({ 'source': 'mapbox-dem', 'exaggeration': 1.5 });

                // Capa vacía para la línea de ruta
                this.map.addSource('linea-ruta', { 'type': 'geojson', 'data': { 'type': 'Feature', 'properties': {}, 'geometry': { 'type': 'LineString', 'coordinates': [] } } });
                this.map.addLayer({ 'id': 'linea-amarilla', 'type': 'line', 'source': 'linea-ruta', 'layout': { 'line-join': 'round', 'line-cap': 'round' }, 'paint': { 'line-color': '#FFD700', 'line-width': 8, 'line-opacity': 0.9 } });
                
                this.calculateRouteAndMarkers(coordsA, coordsC, data);
            });
            
            this.map.on('error', (e) => console.error('🚨 [ERROR MAPBOX]', e));
        } else if (this.isMapLoaded) {
            console.log('🗺️ [PASO 2] El lienzo ya existía, recalculando ruta...');
            // Si ya estaba cargado, solo recalcula la ruta nueva
            this.calculateRouteAndMarkers(coordsA, coordsC, data);
        }
    }

    async calculateRouteAndMarkers(coordsA, coordsC, data) {
        console.log(`🗺️ [PASO 4] Iniciando cálculo de ruta hacia ${data.destinoNombre}...`);
        // Borrar ruta anterior
        this.map.getSource('linea-ruta').setData({ 'type': 'Feature', 'properties': {}, 'geometry': { 'type': 'LineString', 'coordinates': [] } });
        
        // Borrar pines anteriores
        this.marcadores.forEach(m => m.remove());
        this.marcadores = [];

        // Crear Pines y Textos
        const addLabel = (coords, text) => {
            const marker = new mapboxgl.Marker({ color: '#FFD700' }).setLngLat(coords).addTo(this.map);
            const el = marker.getElement();
            const label = document.createElement('div');
            label.className = 'etiqueta-tv';
            label.innerText = text;
            el.appendChild(label);
            this.marcadores.push(marker);
        };

        addLabel(coordsA, data.origenNombre);
        addLabel(coordsC, data.destinoNombre);

        // Posicionar cámara lista en la salida
        this.map.jumpTo({ center: coordsA, zoom: 13, pitch: 65, bearing: 0 });

        let lineaCurvaOriginal = null;

        // LOGICA HÍBRIDA: ¿Usar Archivo GPX Manual o Auto OSRM?
        if (data.usarManual && data.coordsManuales && data.coordsManuales !== '[]') {
            console.log('🗺️ [PASO 5] Usando ruta MANUAL GPX subida desde Android');
            try {
                lineaCurvaOriginal = JSON.parse(data.coordsManuales);
            } catch(e) { console.error("Error parseando coords manuales", e); }
        } 
        
        if (!lineaCurvaOriginal) {
            console.log(`🗺️ [PASO 5] Consultando API de OSRM Automático...`);
            const urlOSRM = `https://router.project-osrm.org/route/v1/driving/${coordsA[0]},${coordsA[1]};${coordsC[0]},${coordsC[1]}?overview=full&geometries=geojson`;
            try {
                const res = await fetch(urlOSRM);
                if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
                const json = await res.json();
                lineaCurvaOriginal = json.routes[0].geometry;
                console.log('🗺️ [PASO 6] Respuesta de OSRM recibida correctamente.');
            } catch(e) { console.error("🚨 [ERROR OSRM] La API falló o no hay internet:", e); return; }
        }

        // MATEMÁTICA: Suavizar con Turf para la cámara (200 puntos por km)
        this.rutaCoordenadas = [];
        try {
            let coords = Array.isArray(lineaCurvaOriginal) ? lineaCurvaOriginal : lineaCurvaOriginal.coordinates;
            let rutaFeature = turf.lineString(coords);
            
            // 🚀 FIX: Mantenemos la fidelidad de OSRM para la LÍNEA AMARILLA.
            // Ya no le aplicamos Bezier aquí para que no "corte" las curvas en las calles.
            
            const geometry = rutaFeature.geometry;
            this.currentRouteGeometry = geometry; // ✅ Guardar geometría para el encuadre final
            const distancia = turf.length(geometry, { units: 'kilometers' });
            const pasos = Math.floor(distancia * 200); 
            
            for (let i = 0; i <= pasos; i++) {
                const segmento = turf.along(geometry, (i / pasos) * distancia, { units: 'kilometers' });
                this.rutaCoordenadas.push(segmento.geometry.coordinates);
            }
            console.log(`🗺️ [PASO 7] ✅ Precarga LISTA. Distancia: ${distancia.toFixed(1)}km, Puntos calculados: ${this.rutaCoordenadas.length}`);
            
            this.rutaCamaraCoordenadas = [];
            try {
                let coords2 = Array.isArray(lineaCurvaOriginal) ? lineaCurvaOriginal : lineaCurvaOriginal.coordinates;
                let rutaCam = turf.lineString(coords2);
                rutaCam = turf.simplify(rutaCam, { tolerance: 0.0035, highQuality: true });
                rutaCam = turf.bezierSpline(rutaCam, { resolution: 10000, sharpness: 0.5 });
                const distCam = turf.length(rutaCam.geometry, { units: 'kilometers' });
                for (let i = 0; i <= pasos; i++) {
                    const seg = turf.along(rutaCam.geometry, (i / pasos) * distCam, { units: 'kilometers' });
                    this.rutaCamaraCoordenadas.push(seg.geometry.coordinates);
                }
                console.log(`📷 Ruta de cámara lista: ${this.rutaCamaraCoordenadas.length} puntos suavizados`);
            } catch(e) {
                console.warn('⚠️ Falló ruta de cámara, usando fallback.', e);
                this.rutaCamaraCoordenadas = [...this.rutaCoordenadas];
            }

            // ✅ Si se ordenó "Mostrar" mientras cargaba, lanzarlo ahora
            if (this.pendingShow) {
                console.log('🗺️ [PASO 8] pendingShow estaba activo. Lanzando mapa automáticamente...');
                this.pendingShow = false;
                this.showMapAndFly();
            }
        } catch(e) { console.error("🚨 [ERROR MATEMÁTICO] Falló el suavizado de curvas con Turf.js:", e); }
    }

    showMapAndFly(data) {
        console.log('🗺️ [PASO 9] Recibida orden MOSTRAR (showMapAndFly)');
        
        // ✅ AUTOCORRECCIÓN: Si el usuario presiona "Mostrar" sin haber presionado "Preparar"
        if (!this.map && data) {
            console.warn('🗺️ [ALERTA] No se había preparado la ruta. Forzando preparación automática...');
            this.prepareMapAndRoute(data);
            this.pendingShow = true;
            return;
        }
        
        console.log('📊 ESTADO ACTUAL DEL MOTOR:', {
            LienzoExiste: !!this.mapContainer,
            MapaDescargado: this.isMapLoaded,
            PuntosDeVueloCalculados: this.rutaCoordenadas.length
        });
        
        // Si piden mostrar pero aún no descarga el mapa o la ruta, esperar pacientemente.
        if (!this.mapContainer || !this.isMapLoaded || this.rutaCoordenadas.length === 0) {
            console.warn('🗺️ [ALERTA] ⏳ El mapa aún está procesando... Se lanzó a la sala de espera (pendingShow = true).');
            this.pendingShow = true;
            return;
        }
        
        // ✅ Si había un temporizador de ocultamiento en curso, cancelarlo
        if (this.hideTimeoutId) {
            clearTimeout(this.hideTimeoutId);
            this.hideTimeoutId = null;
        }

        console.log('🗺️ [PASO 10] Forzando visibilidad en pantalla (display: block)...');
        
        // 🌟 Preparar animación de entrada suave (Fade In)
        this.mapContainer.style.transition = 'none';
        this.mapContainer.style.opacity = '0';
        this.mapContainer.style.display = 'block';
        
        if (this.overlayContainer) {
            this.overlayContainer.style.transition = 'none';
            this.overlayContainer.style.opacity = '0';
            this.overlayContainer.style.display = 'block';
        }
        
        // Forzar al navegador a registrar el estado inicial (reflow)
        this.mapContainer.offsetHeight;
        
        // 🌟 Revelar suavemente
        setTimeout(() => {
            this.mapContainer.style.transition = 'opacity 0.8s ease-in-out';
            this.mapContainer.style.opacity = '1';
            
            if (this.overlayContainer) {
                this.overlayContainer.style.transition = 'opacity 0.8s ease-in-out';
                this.overlayContainer.style.opacity = '1';
            }
        }, 50);
        
        // ✅ Ponerle fondo oscuro al reloj solo cuando el mapa esté visible
        const clock = document.getElementById('stream-clock');
        if (clock) clock.classList.add('mapa-activo');

        // ✅ FIX CRÍTICO DEFINITIVO: Darle tiempo al navegador para aplicar display:block
        // antes de decirle a Mapbox que recalcule el tamaño de la pantalla.
        setTimeout(() => {
            if (this.map) {
                this.map.resize();
                console.log('🗺️ [PASO 11] 🚀 Redibujado exitoso (resize). ¡Iniciando vuelo del dron!');
            }
        }, 150);

        if (this.isFlying) return;
        this.isFlying = true;

        let indexPuntoActual = 0;
        let ultimoAngulo = null;
        const coordsC = this.rutaCoordenadas[this.rutaCoordenadas.length - 1];

        // ✅ Variables para la dirección inteligente de la órbita (Atajo más corto)
        let orbitEnterDir = 1;
        let orbitExitDir = 1;
        let enterCalculated = false;
        let exitCalculated = false;

        const animarFrame = () => {
            if (!this.isFlying) return;

            if (indexPuntoActual >= this.rutaCoordenadas.length) {
                // Llegada a destino
                console.log('🏁 Vuelo finalizado. Centrando ruta completa en pantalla...');
                if (this.currentRouteGeometry) {
                    const bbox = turf.bbox(this.currentRouteGeometry);
                    this.map.fitBounds(bbox, {
                        padding: { top: 50, bottom: 200, left: 200, right: 50 },
                        pitch: 30,
                        bearing: 0,
                        duration: 4000
                    });
                } else {
                    // Fallback si la geometría no está disponible
                    this.map.flyTo({ center: coordsC, zoom: 10.5, pitch: 30, bearing: 0, duration: 4000 });
                }
                this.isFlying = false;
                return;
            }

            // El dron vuela sobre la ruta suavizada, la línea se dibuja en la real
            const puntoActual = this.rutaCamaraCoordenadas.length > 0
                ? this.rutaCamaraCoordenadas[indexPuntoActual]
                : this.rutaCoordenadas[indexPuntoActual];
                
            const lineaCreciente = this.rutaCoordenadas.slice(0, indexPuntoActual + 1);
            
            // Dibujar la línea gradualmente
            this.map.getSource('linea-ruta').setData({ 'type': 'Feature', 'properties': {}, 'geometry': { 'type': 'LineString', 'coordinates': lineaCreciente } });

            // ESTABILIZACIÓN CINEMÁTICA (lee de la ruta de cámara ultra-suavizada)
            const fuenteAngulo = this.rutaCamaraCoordenadas.length > 0
                ? this.rutaCamaraCoordenadas
                : this.rutaCoordenadas; // fallback

            // Lookahead más largo porque la ruta de cámara es más corta en variaciones
            const maxLookahead = Math.floor(fuenteAngulo.length * 0.15);
            const puntosAdelante = Math.min(indexPuntoActual + maxLookahead, fuenteAngulo.length - 1);
            let anguloRutaFutura = this.map.getBearing();
            if (indexPuntoActual < puntosAdelante) {
                anguloRutaFutura = turf.bearing(
                    turf.point(fuenteAngulo[indexPuntoActual]),  // ✅ origen desde array de cámara
                    turf.point(fuenteAngulo[puntosAdelante])     // ✅ destino desde array de cámara
                );
            }

            if (ultimoAngulo === null) {
                ultimoAngulo = anguloRutaFutura;
            } else {
                let diff = anguloRutaFutura - ultimoAngulo;
                diff = ((diff + 540) % 360) - 180;
                ultimoAngulo += diff * 0.015; // Lerp levemente más suave que el 0.02 original
            }

            // COREOGRAFÍA RELIVE (Órbita entre 20% y 70%)
            let progreso = indexPuntoActual / this.rutaCoordenadas.length;
            let offsetAngulo = 0, offsetZoom = 0, offsetPitch = 0;

            if (progreso > 0.20 && progreso < 0.70) {
                if (progreso < 0.35) {
                    if (!enterCalculated) {
                        // Mirar adelante para decidir por qué lado entrar a la órbita
                        let pAdelante = Math.min(indexPuntoActual + 200, this.rutaCoordenadas.length - 1);
                        let angFuturo = turf.bearing(turf.point(puntoActual), turf.point(this.rutaCoordenadas[pAdelante]));
                        let diffCurva = ((angFuturo - ultimoAngulo + 540) % 360) - 180;
                        orbitEnterDir = diffCurva < 0 ? -1 : 1; // Orbitar hacia el lado de la curva
                        enterCalculated = true;
                    }
                    let t = (progreso - 0.20) / 0.15;
                    let smoothT = -(Math.cos(Math.PI * t) - 1) / 2;
                    offsetAngulo = orbitEnterDir * smoothT * 180; 
                    offsetZoom = smoothT * 1.8; 
                    offsetPitch = -(smoothT * 20);
                } else if (progreso >= 0.35 && progreso < 0.50) {
                    offsetAngulo = orbitEnterDir * 180; 
                    offsetZoom = 1.8; 
                    offsetPitch = -20;
                } else if (progreso >= 0.50 && progreso < 0.65) {
                    if (!exitCalculated) {
                        // Buscar el atajo más corto al regresar de la órbita
                        let pAdelante = Math.min(indexPuntoActual + 200, this.rutaCoordenadas.length - 1);
                        let angFuturo = turf.bearing(turf.point(puntoActual), turf.point(this.rutaCoordenadas[pAdelante]));
                        let diffCurva = ((angFuturo - ultimoAngulo + 540) % 360) - 180;
                        orbitExitDir = diffCurva < 0 ? -1 : 1; 
                        exitCalculated = true;
                    }
                    let t = (progreso - 0.50) / 0.15;
                    let smoothT = -(Math.cos(Math.PI * t) - 1) / 2;
                    offsetAngulo = (orbitEnterDir * 180) + (orbitExitDir * smoothT * 180); 
                    offsetZoom = 1.8 - (smoothT * 1.8); 
                    offsetPitch = -20 + (smoothT * 20);
                }
            }

            this.map.jumpTo({ center: puntoActual, pitch: 68 + offsetPitch, bearing: ultimoAngulo + offsetAngulo, zoom: 12.8 - offsetZoom });

            // 4. Aumentar el salto de puntos para un vuelo más rápido y fluido (antes 3)
            indexPuntoActual += 4;
            this.flightAnimationId = requestAnimationFrame(animarFrame);
        };

        // Pequeña pausa antes de arrancar
        if (this.flightStartTimeout) clearTimeout(this.flightStartTimeout);
        this.flightStartTimeout = setTimeout(() => { if (this.isFlying) animarFrame(); }, 800);
    }

    hideMap() {
        console.log('🛑 Ocultando Mapa 3D y deteniendo vuelo.');
        if (!this.mapContainer) return;

        // 🌟 Animación de salida suave (Fade Out)
        this.mapContainer.style.transition = 'opacity 0.8s ease-in-out';
        this.mapContainer.style.opacity = '0';
        
        if (this.overlayContainer) {
            this.overlayContainer.style.transition = 'opacity 0.8s ease-in-out';
            this.overlayContainer.style.opacity = '0';
        }
        
        // ✅ Quitarle el fondo oscuro al reloj al cerrar el mapa
        const clock = document.getElementById('stream-clock');
        if (clock) clock.classList.remove('mapa-activo');

        this.isFlying = false;
        this.pendingShow = false;
        if (this.flightStartTimeout) clearTimeout(this.flightStartTimeout);
        if (this.flightAnimationId) cancelAnimationFrame(this.flightAnimationId);
        
        // ✅ Ocultar completamente del DOM después de que termine el desvanecimiento
        this.hideTimeoutId = setTimeout(() => {
            this.mapContainer.style.display = 'none';
            if (this.overlayContainer) {
                this.overlayContainer.style.display = 'none';
            }
        }, 800);
    }

    debugEstado() {
        console.group('🔍 DEBUG RUTAS 3D');
        console.log('Inicializado:', this.isInitialized);
        console.log('Librería Turf.js disponible:', typeof turf !== 'undefined');
        console.log('Lienzo Mapbox cargado:', this.isMapLoaded);
        console.log('Vuelo Activo:', this.isFlying);
        console.log('Sala de Espera (Pending):', this.pendingShow);
        console.log('Puntos de Ruta:', this.rutaCoordenadas.length);
        console.log('Visibilidad CSS Lienzo:', this.mapContainer ? this.mapContainer.style.display : 'N/A');
        console.log('Token:', this.token ? 'Presente' : 'Falta');
        console.groupEnd();
        return "Revisa los datos arriba.";
    }
}

// Instancia Global
export const routeManager = new RouteManager();