# Velutrack

App Android para localizar nidos de *Vespa velutina* (avispón asiático) mediante triangulación de observaciones de vuelo marcadas.

> **v1.0.0** — Primera versión funcional. Todas las funcionalidades implementadas, sin backend, datos locales en el dispositivo.

---

## Cómo funciona

Los apicultores capturan velutinas en el apiario, las marcan con pintura de colores y las sueltan. La velutina vuela directo al nido. Registrando la **dirección de vuelo** y el **tiempo de ida y vuelta** desde distintos puntos de captura, la app estima la posición del nido por triangulación:

```
distancia (m) = (tiempo_vuelo_ida_vuelta / 2) × velocidad_vuelo
```

Las líneas de vuelo de varias observaciones convergen cerca del nido. Un algoritmo de clustering agrupa los endpoints cercanos y calcula zonas candidatas con nivel de confianza (Baja / Media / Alta según el número de observaciones convergentes).

---

## Pantallas

| Tab | Pantalla | Descripción |
|---|---|---|
| Mapa | MapaScreen | Mapa completo con puntos de captura, líneas de vuelo dashed, zonas estimadas (círculo + pin) y nidos reales |
| Nidos | NidosListaScreen | Lista de nidos registrados con estado (activo/eliminado) |
| Nidos | NidoRegistrarScreen | Registrar nido tocando en mapa + notas |
| Nidos | NidoDetalleScreen | Detalle de nido con mapa, observaciones vinculadas y cambio de estado |
| Sesión | SesionInicioScreen | Seleccionar punto de captura e iniciar sesión |
| Sesión | SesionActivaScreen | 5 fichas de color con timer, registro de dirección de vuelo mediante mapa interactivo |
| Historial | HistorialScreen | Lista de sesiones pasadas con filtros por punto y estado |
| Historial | DetalleSesionScreen | Observaciones de una sesión con distancias calculadas |
| Análisis | AnalisisScreen | Zonas candidatas ordenadas por confianza, filtros por período y punto, comparativa con nidos reales |
| Ajustes | AjustesScreen | Velocidad de vuelo, radio de clustering, tolerancia angular — todos calibrables |

---

## Arquitectura

```
velutina-tracker/
├── App.js                              # NavigationContainer + 6 bottom tabs
├── app.json                            # Config Expo (bundleIdentifier, icono, splash)
├── src/
│   ├── navigation/
│   │   ├── SesionStack.js              # Stack: SesionInicio → SesionActiva
│   │   ├── HistorialStack.js           # Stack: Historial → DetalleSesion
│   │   └── NidosStack.js              # Stack: NidosLista → NidoRegistrar, NidoDetalle
│   ├── screens/
│   │   ├── MapaScreen.js
│   │   ├── PuntosCapturaScreen.js
│   │   ├── DetallePuntoScreen.js
│   │   ├── SesionInicioScreen.js
│   │   ├── SesionActivaScreen.js
│   │   ├── HistorialScreen.js
│   │   ├── DetalleSesionScreen.js
│   │   ├── NidosListaScreen.js
│   │   ├── NidoRegistrarScreen.js
│   │   ├── NidoDetalleScreen.js
│   │   ├── AnalisisScreen.js
│   │   └── AjustesScreen.js
│   ├── components/
│   │   ├── MapDirectionPicker.js       # Selector de dirección basado en mapa
│   │   └── DirectionPicker.js          # Selector de dirección con brújula (fallback)
│   ├── storage/
│   │   ├── db.js                       # CRUD sobre AsyncStorage (4 entidades)
│   │   └── ajustes.js                  # Ajustes persistentes con valores por defecto
│   └── utils/
│       ├── geo.js                      # movePoint, haversineDistance, bearing
│       └── clustering.js              # Algoritmo greedy de clustering de endpoints
```

### Stack técnico

| Componente | Tecnología |
|---|---|
| Framework | React Native + Expo SDK 54 |
| Mapas | react-native-maps |
| GPS | expo-location |
| Persistencia | AsyncStorage (local, sin backend) |
| Navegación | @react-navigation/native v6 |
| Iconos | @expo/vector-icons (Ionicons) |
| Gestos | react-native-gesture-handler |

---

## Modelo de datos

```
PuntoDeCaptura  { id, nombre, latitud, longitud, fechaCreacion }

Sesion          { id, puntoCapturaId, fecha }

Observacion     { id, sesionId, color, direccionGrados,
                  timestampSalida, timestampLlegada,
                  distanciaMetros, estado }
                  estado: 'en_vuelo' | 'completada' | 'eliminada'
                  color:  'rojo' | 'azul' | 'verde' | 'amarillo' | 'naranja'

NidoEncontrado  { id, latitud, longitud, fechaLocalizacion,
                  estado, observacionesIds, notas }
                  estado: 'activo' | 'eliminado'
```

---

## Algoritmo de clustering

1. Para cada observación completada: calcular el endpoint usando `movePoint(lat, lng, dirección, distancia)`.
2. Clustering greedy: para cada endpoint no asignado, buscarlo en clusters existentes dentro de `radioCluster` metros (Haversine). Si no hay ninguno, crear cluster nuevo.
3. Para cada cluster: calcular centroide, radio envolvente y nivel de confianza:
   - 1 observación → **Baja**
   - 2 observaciones → **Media**
   - 3+ observaciones → **Alta**
4. Ordenar por número de observaciones descendente.

---

## Ajustes calibrables

| Parámetro | Defecto | Rango | Descripción |
|---|---|---|---|
| Velocidad de vuelo | 500 m/min | 100–1000 | Velocidad media de vuelo de regreso al nido |
| Radio de agrupación | 200 m | 50–500 | Distancia máxima para agrupar endpoints en el mismo candidato |
| Tolerancia angular | 30° | 5–90° | Margen de error al registrar la dirección de vuelo |

---

## Ejecutar en desarrollo

```bash
cd velutina-tracker
npm install
npx expo start
```

Escanea el QR con **Expo Go** en Android. Requiere Node.js 18+.

> La app usa `softwareKeyboardLayoutMode: "pan"` en Android — este ajuste sólo tiene efecto en builds standalone, no en Expo Go.

---

## Generar APK para instalar en el móvil

La app usa **EAS Build** (Expo Application Services) para generar un APK instalable directamente en Android.

### 1. Instalar EAS CLI

```bash
npm install -g eas-cli
```

### 2. Iniciar sesión en Expo

```bash
eas login
```

Crea una cuenta gratuita en [expo.dev](https://expo.dev) si no tienes una.

### 3. Configurar el proyecto (solo la primera vez)

```bash
cd velutina-tracker
eas build:configure
```

### 4. Generar el APK

```bash
eas build -p android --profile preview
```

El perfil `preview` genera un **APK** (instalable directamente). El proceso tarda ~5–10 minutos en los servidores de Expo. Al terminar, recibirás un enlace de descarga.

### 5. Instalar en el móvil

Opción A — Descarga el APK desde el enlace y ábrelo en el móvil (requiere activar "Instalar de fuentes desconocidas").

Opción B — Via ADB:
```bash
adb install velutrack.apk
```

> El perfil `production` genera un **AAB** para subir a Google Play Store.

---

## Issues implementadas

| Issue | Epic | Descripción |
|---|---|---|
| [#1](https://github.com/PabloCastroCastro/velutrack/issues/1) | Setup | Inicializar proyecto Expo SDK 54 |
| [#2](https://github.com/PabloCastroCastro/velutrack/issues/2) | Setup | Navegación base con bottom tabs |
| [#3](https://github.com/PabloCastroCastro/velutrack/issues/3) | Setup | Capa de persistencia AsyncStorage |
| [#4](https://github.com/PabloCastroCastro/velutrack/issues/4) | Setup | Utilidades geográficas |
| [#5](https://github.com/PabloCastroCastro/velutrack/issues/5) | Captura | Lista de puntos de captura |
| [#6](https://github.com/PabloCastroCastro/velutrack/issues/6) | Captura | Crear punto con GPS |
| [#7](https://github.com/PabloCastroCastro/velutrack/issues/7) | Captura | Detalle de punto |
| [#8](https://github.com/PabloCastroCastro/velutrack/issues/8) | Sesión | Inicio de sesión |
| [#9](https://github.com/PabloCastroCastro/velutrack/issues/9) | Sesión | Fichas de color con timer |
| [#10](https://github.com/PabloCastroCastro/velutrack/issues/10) | Sesión | Flujo "suelta velutina" con dirección en mapa |
| [#11](https://github.com/PabloCastroCastro/velutrack/issues/11) | Sesión | Flujo "velutina llegó" con cálculo de distancia |
| [#12](https://github.com/PabloCastroCastro/velutrack/issues/12) | Sesión | Flujo "velutina eliminada" |
| [#13](https://github.com/PabloCastroCastro/velutrack/issues/13) | Sesión | Cerrar sesión |
| [#14](https://github.com/PabloCastroCastro/velutrack/issues/14) | Historial | Lista de sesiones con filtros |
| [#15](https://github.com/PabloCastroCastro/velutrack/issues/15) | Historial | Detalle de sesión |
| [#16](https://github.com/PabloCastroCastro/velutrack/issues/16) | Mapa | Mapa con puntos de captura |
| [#17](https://github.com/PabloCastroCastro/velutrack/issues/17) | Mapa | Líneas de vuelo dashed por color |
| [#18](https://github.com/PabloCastroCastro/velutrack/issues/18) | Mapa | Zonas estimadas (círculo + pin con count) |
| [#19](https://github.com/PabloCastroCastro/velutrack/issues/19) | Mapa | Nidos reales en mapa con callout |
| [#20](https://github.com/PabloCastroCastro/velutrack/issues/20) | Nidos | Lista de nidos registrados |
| [#21](https://github.com/PabloCastroCastro/velutrack/issues/21) | Nidos | Registrar nido tocando en mapa |
| [#22](https://github.com/PabloCastroCastro/velutrack/issues/22) | Nidos | Detalle de nido y cambio de estado |
| [#23](https://github.com/PabloCastroCastro/velutrack/issues/23) | Análisis | Zonas candidatas con nivel de confianza |
| [#24](https://github.com/PabloCastroCastro/velutrack/issues/24) | Análisis | Filtros por período y punto de captura |
| [#25](https://github.com/PabloCastroCastro/velutrack/issues/25) | Análisis | Comparativa candidatos vs. nidos reales |
| [#26](https://github.com/PabloCastroCastro/velutrack/issues/26) | Ajustes | Ajustes calibrables con persistencia |

---

## Licencia

MIT — ver [LICENSE](velutina-tracker/LICENSE).
