import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  PUNTOS: '@velutrack:puntos',
  SESIONES: '@velutrack:sesiones',
  OBSERVACIONES: '@velutrack:observaciones',
  NIDOS: '@velutrack:nidos',
};

function generateId() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

async function getAll(key) {
  const json = await AsyncStorage.getItem(key);
  return json ? JSON.parse(json) : [];
}

async function saveAll(key, items) {
  await AsyncStorage.setItem(key, JSON.stringify(items));
}

// ── Puntos de captura ──────────────────────────────────────────────────────

export async function getPuntos() {
  return getAll(KEYS.PUNTOS);
}

export async function savePunto(nombre, latitud, longitud) {
  const puntos = await getPuntos();
  const nuevo = {
    id: generateId(),
    nombre,
    latitud,
    longitud,
    fechaCreacion: new Date().toISOString(),
  };
  await saveAll(KEYS.PUNTOS, [...puntos, nuevo]);
  return nuevo;
}

export async function deletePunto(id) {
  const puntos = await getPuntos();
  await saveAll(KEYS.PUNTOS, puntos.filter((p) => p.id !== id));
}

// ── Sesiones ───────────────────────────────────────────────────────────────

export async function getSesiones() {
  return getAll(KEYS.SESIONES);
}

export async function saveSesion(puntoCapturaId) {
  const sesiones = await getSesiones();
  const nueva = {
    id: generateId(),
    puntoCapturaId,
    fecha: new Date().toISOString(),
  };
  await saveAll(KEYS.SESIONES, [...sesiones, nueva]);
  return nueva;
}

// ── Observaciones ──────────────────────────────────────────────────────────

export async function getObservaciones() {
  return getAll(KEYS.OBSERVACIONES);
}

export async function saveObservacion(sesionId, color, direccionGrados) {
  const observaciones = await getObservaciones();
  const nueva = {
    id: generateId(),
    sesionId,
    color,
    direccionGrados,
    timestampSalida: new Date().toISOString(),
    timestampLlegada: null,
    distanciaMetros: null,
    estado: 'en_vuelo',
  };
  await saveAll(KEYS.OBSERVACIONES, [...observaciones, nueva]);
  return nueva;
}

export async function updateObservacion(id, cambios) {
  const observaciones = await getObservaciones();
  const actualizadas = observaciones.map((o) =>
    o.id === id ? { ...o, ...cambios } : o
  );
  await saveAll(KEYS.OBSERVACIONES, actualizadas);
  return actualizadas.find((o) => o.id === id);
}

// ── Nidos encontrados ──────────────────────────────────────────────────────

export async function getNidos() {
  return getAll(KEYS.NIDOS);
}

export async function saveNido({ latitud, longitud, estado = 'activo', observacionesIds = [], notas = null }) {
  const nidos = await getNidos();
  const nuevo = {
    id: generateId(),
    latitud,
    longitud,
    fechaLocalizacion: new Date().toISOString(),
    estado,
    observacionesIds,
    notas,
  };
  await saveAll(KEYS.NIDOS, [...nidos, nuevo]);
  return nuevo;
}

export async function updateNido(id, cambios) {
  const nidos = await getNidos();
  const actualizados = nidos.map((n) =>
    n.id === id ? { ...n, ...cambios } : n
  );
  await saveAll(KEYS.NIDOS, actualizados);
  return actualizados.find((n) => n.id === id);
}
