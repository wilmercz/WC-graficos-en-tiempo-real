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
        this.marcadores = [];
        this.flightAnimationId = null;
        this.currentData = null; // Guardará la info de la ruta actual
        this.pendingShow = false; // ✅ Control si piden Mostrar antes de que termine de Preparar
        this.currentRouteGeometry = null; // ✅ Guardará la geometría para el encuadre final
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
        EventBus.on('route-show', () => this.showMapAndFly());
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
        this.isFlying = false;

        // 1. Convertir string "Lon, Lat" de Android a Array [Lon, Lat]
        const parseCoords = (str) => str.split(',').map(n => parseFloat(n.trim()));
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
            const geometry = Array.isArray(lineaCurvaOriginal) ? { type: 'LineString', coordinates: lineaCurvaOriginal } : lineaCurvaOriginal;
            this.currentRouteGeometry = geometry; // ✅ Guardar geometría para el encuadre final
            const distancia = turf.length(geometry, { units: 'kilometers' });
            const pasos = Math.floor(distancia * 200); 
            
            for (let i = 0; i <= pasos; i++) {
                const segmento = turf.along(geometry, (i / pasos) * distancia, { units: 'kilometers' });
                this.rutaCoordenadas.push(segmento.geometry.coordinates);
            }
            console.log(`🗺️ [PASO 7] ✅ Precarga LISTA. Distancia: ${distancia.toFixed(1)}km, Puntos calculados: ${this.rutaCoordenadas.length}`);
            
            // ✅ Si se ordenó "Mostrar" mientras cargaba, lanzarlo ahora
            if (this.pendingShow) {
                console.log('🗺️ [PASO 8] pendingShow estaba activo. Lanzando mapa automáticamente...');
                this.pendingShow = false;
                this.showMapAndFly();
            }
        } catch(e) { console.error("🚨 [ERROR MATEMÁTICO] Falló el suavizado de curvas con Turf.js:", e); }
    }

    showMapAndFly() {
        console.log('️ [PASO 9] Recibida orden MOSTRAR (showMapAndFly)');
        
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
        
        console.log('🗺️ [PASO 10] Forzando visibilidad en pantalla (display: block)...');
        this.mapContainer.style.display = 'block';
        this.overlayContainer.style.display = 'block';
        
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
        let anguloObjetivoFijo = null;
        const coordsC = this.rutaCoordenadas[this.rutaCoordenadas.length - 1];

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

            const puntoActual = this.rutaCoordenadas[indexPuntoActual];
            const lineaCreciente = this.rutaCoordenadas.slice(0, indexPuntoActual + 1);
            
            // Dibujar la línea gradualmente
            this.map.getSource('linea-ruta').setData({ 'type': 'Feature', 'properties': {}, 'geometry': { 'type': 'LineString', 'coordinates': lineaCreciente } });

            // ESTABILIZACIÓN CINEMÁTICA (Heading Lock)
            const puntosAdelante = Math.min(indexPuntoActual + 150, this.rutaCoordenadas.length - 1);
            let anguloRutaFutura = this.map.getBearing();
            if (indexPuntoActual < puntosAdelante) {
                anguloRutaFutura = turf.bearing(turf.point(puntoActual), turf.point(this.rutaCoordenadas[puntosAdelante]));
            }

            if (ultimoAngulo === null) {
                ultimoAngulo = anguloRutaFutura;
                anguloObjetivoFijo = anguloRutaFutura;
            } else {
                let desvio = anguloRutaFutura - anguloObjetivoFijo;
                desvio = ((desvio + 540) % 360) - 180; 
                if (Math.abs(desvio) > 15) anguloObjetivoFijo = anguloRutaFutura;
                
                let diff = anguloObjetivoFijo - ultimoAngulo;
                diff = ((diff + 540) % 360) - 180; 
                ultimoAngulo += diff * 0.02;
            }

            // COREOGRAFÍA RELIVE (Órbita entre 20% y 70%)
            let progreso = indexPuntoActual / this.rutaCoordenadas.length;
            let offsetAngulo = 0, offsetZoom = 0, offsetPitch = 0;

            if (progreso > 0.20 && progreso < 0.70) {
                if (progreso < 0.35) {
                    let t = (progreso - 0.20) / 0.15;
                    let smoothT = -(Math.cos(Math.PI * t) - 1) / 2;
                    offsetAngulo = smoothT * 180; offsetZoom = smoothT * 1.8; offsetPitch = -(smoothT * 20);
                } else if (progreso >= 0.35 && progreso < 0.50) {
                    offsetAngulo = 180; offsetZoom = 1.8; offsetPitch = -20;
                } else if (progreso >= 0.50 && progreso < 0.65) {
                    let t = (progreso - 0.50) / 0.15;
                    let smoothT = -(Math.cos(Math.PI * t) - 1) / 2;
                    offsetAngulo = 180 + (smoothT * 180); offsetZoom = 1.8 - (smoothT * 1.8); offsetPitch = -20 + (smoothT * 20);
                }
            }

            this.map.jumpTo({ center: puntoActual, pitch: 68 + offsetPitch, bearing: ultimoAngulo + offsetAngulo, zoom: 12.8 - offsetZoom });

            indexPuntoActual += 3;
            this.flightAnimationId = requestAnimationFrame(animarFrame);
        };

        // Pequeña pausa antes de arrancar
        setTimeout(() => { if (this.isFlying) animarFrame(); }, 800);
    }

    hideMap() {
        console.log('🛑 Ocultando Mapa 3D y deteniendo vuelo.');
        if (!this.mapContainer) return;

        this.mapContainer.style.display = 'none';
        this.overlayContainer.style.display = 'none';
        
        // ✅ Quitarle el fondo oscuro al reloj al cerrar el mapa
        const clock = document.getElementById('stream-clock');
        if (clock) clock.classList.remove('mapa-activo');

        this.isFlying = false;
        this.pendingShow = false;
        if (this.flightAnimationId) cancelAnimationFrame(this.flightAnimationId);
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