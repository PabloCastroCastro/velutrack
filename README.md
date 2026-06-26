# Velutrack

App móvil Android para localizar nidos de *Vespa velutina* (avispón asiático) mediante triangulación de vuelos marcados.

## Cómo funciona

Los apicultores capturan velutinas en el apiario, las marcan con pintura de colores y las sueltan. La velutina vuela directo al nido y regresa. Registrando la **dirección de vuelo** y el **tiempo de ida y vuelta** desde distintos puntos de captura, la app estima la posición del nido mediante triangulación.

## Stack

| Componente | Tecnología |
|---|---|
| Framework | React Native + Expo SDK 54 |
| Mapas | react-native-maps |
| GPS | expo-location |
| Persistencia | AsyncStorage (local, sin backend) |
| Navegación | @react-navigation/native + bottom-tabs + stack |

## Arrancar en desarrollo

```bash
cd velutina-tracker
npm install
npx expo start
```

Escanea el QR con **Expo Go** (SDK 54) desde Android.

> Node.js 20+ recomendado.

## Estructura

```
velutina-tracker/
├── App.js                        # Navegación raíz (tabs)
├── src/
│   ├── navigation/
│   │   └── SesionStack.js        # Stack del flujo de sesión
│   ├── screens/
│   │   ├── MapaScreen.js
│   │   ├── PuntosCapturaScreen.js
│   │   ├── DetallePuntoScreen.js
│   │   ├── SesionScreen.js
│   │   ├── HistorialScreen.js
│   │   ├── AnalisisScreen.js
│   │   └── NidosScreen.js
│   ├── storage/
│   │   └── db.js                 # CRUD sobre AsyncStorage
│   └── utils/
│       ├── geo.js                # Cálculo geográfico
│       └── clustering.js         # Agrupación de observaciones
```

## Estado de desarrollo

### ✅ Implementado

| Issue | Descripción |
|---|---|
| [#1](https://github.com/PabloCastroCastro/velutrack/issues/1) | Inicializar proyecto Expo SDK 54 + estructura de carpetas |
| [#2](https://github.com/PabloCastroCastro/velutrack/issues/2) | Navegación base: 4 tabs (Mapa, Sesión, Historial, Análisis) |
| [#3](https://github.com/PabloCastroCastro/velutrack/issues/3) | Capa de persistencia AsyncStorage — CRUD para las 4 entidades |
| [#4](https://github.com/PabloCastroCastro/velutrack/issues/4) | Utilidades geográficas: `movePoint`, `haversineDistance`, `calcularPuntoEstimado` |
| [#5](https://github.com/PabloCastroCastro/velutrack/issues/5) | Pantalla lista de puntos de captura con swipe para eliminar |
| [#6](https://github.com/PabloCastroCastro/velutrack/issues/6) | Crear punto de captura con GPS + modal de nombre |
| [#7](https://github.com/PabloCastroCastro/velutrack/issues/7) | Detalle de punto: coordenadas y sesiones asociadas |

### 🔜 Pendiente

| Issue | Descripción |
|---|---|
| [#8](https://github.com/PabloCastroCastro/velutrack/issues/8) | Pantalla inicio de sesión |
| [#9](https://github.com/PabloCastroCastro/velutrack/issues/9) | Sesión activa — estado de colores con timers |
| [#10](https://github.com/PabloCastroCastro/velutrack/issues/10) | Flujo "suelta velutina" |
| [#11](https://github.com/PabloCastroCastro/velutrack/issues/11) | Flujo "velutina llegó" |
| [#12](https://github.com/PabloCastroCastro/velutrack/issues/12) | Flujo "velutina eliminada" |
| [#13](https://github.com/PabloCastroCastro/velutrack/issues/13) | Cerrar sesión |
| [#14](https://github.com/PabloCastroCastro/velutrack/issues/14) – [#15](https://github.com/PabloCastroCastro/velutrack/issues/15) | Historial de sesiones y detalle |
| [#16](https://github.com/PabloCastroCastro/velutrack/issues/16) – [#19](https://github.com/PabloCastroCastro/velutrack/issues/19) | Mapa con líneas de vuelo y zonas estimadas |
| [#20](https://github.com/PabloCastroCastro/velutrack/issues/20) – [#22](https://github.com/PabloCastroCastro/velutrack/issues/22) | Nidos encontrados |
| [#23](https://github.com/PabloCastroCastro/velutrack/issues/23) – [#25](https://github.com/PabloCastroCastro/velutrack/issues/25) | Análisis y clustering |
| [#26](https://github.com/PabloCastroCastro/velutrack/issues/26) | Ajustes y calibración |

## Modelo de datos

```
PuntoDeCaptura  { id, nombre, latitud, longitud, fechaCreacion }
Sesion          { id, puntoCapturaId, fecha }
Observacion     { id, sesionId, color, direccionGrados,
                  timestampSalida, timestampLlegada,
                  distanciaMetros, estado }
NidoEncontrado  { id, latitud, longitud, fechaLocalizacion,
                  estado, observacionesIds, notas }
```

## Lógica de estimación

```
distancia (m) = (tiempo_vuelo_ida_vuelta_ms / 1000 / 60 / 2) × velocidad_mpm
```

Velocidad por defecto: **500 m/min** (~30 km/h). Configurable en ajustes (#26).

Las observaciones cuyas líneas de vuelo convergen en un radio < 200 m se agrupan en un **nido candidato**. El nivel de confianza sube con el número de observaciones (1 = Baja, 2 = Media, 3+ = Alta).

## Workflow de ramas

```
main
└── develop
    ├── feature/GH-1   → inicialización
    ├── feature/GH-2   → navegación
    ├── feature/GH-3   → persistencia
    ├── feature/GH-4   → geo utils
    └── feature/GH-5   → puntos de captura
```

Cada issue tiene su rama `feature/GH-N` y su PR a `develop`.
