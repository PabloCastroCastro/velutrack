const EARTH_RADIUS_M = 6371000;

function toRad(deg) {
  return (deg * Math.PI) / 180;
}

function toDeg(rad) {
  return (rad * 180) / Math.PI;
}

/**
 * Rumbo en grados (0 = Norte) desde un punto hasta otro.
 */
export function bearing(from, to) {
  const y = Math.sin(toRad(to.lng - from.lng)) * Math.cos(toRad(to.lat));
  const x =
    Math.cos(toRad(from.lat)) * Math.sin(toRad(to.lat)) -
    Math.sin(toRad(from.lat)) * Math.cos(toRad(to.lat)) * Math.cos(toRad(to.lng - from.lng));
  return ((toDeg(Math.atan2(y, x)) + 360) % 360);
}

/**
 * Desplaza un punto (lat, lng) en una dirección (bearing) y distancia dadas.
 * bearing: 0 = Norte, 90 = Este, 180 = Sur, 270 = Oeste
 * Returns { lat, lng }
 */
export function movePoint(lat, lng, bearingDeg, distanceMeters) {
  const δ = distanceMeters / EARTH_RADIUS_M;
  const θ = toRad(bearingDeg);
  const φ1 = toRad(lat);
  const λ1 = toRad(lng);

  const φ2 = Math.asin(
    Math.sin(φ1) * Math.cos(δ) + Math.cos(φ1) * Math.sin(δ) * Math.cos(θ)
  );
  const λ2 =
    λ1 +
    Math.atan2(
      Math.sin(θ) * Math.sin(δ) * Math.cos(φ1),
      Math.cos(δ) - Math.sin(φ1) * Math.sin(φ2)
    );

  return { lat: toDeg(φ2), lng: ((toDeg(λ2) + 540) % 360) - 180 };
}

/**
 * Distancia en metros entre dos coordenadas (fórmula de Haversine).
 */
export function haversineDistance(ll1, ll2) {
  const φ1 = toRad(ll1.lat);
  const φ2 = toRad(ll2.lat);
  const Δφ = toRad(ll2.lat - ll1.lat);
  const Δλ = toRad(ll2.lng - ll1.lng);

  const a =
    Math.sin(Δφ / 2) ** 2 +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;

  return EARTH_RADIUS_M * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Calcula la posición estimada del nido a partir de un punto de captura
 * y una observación completada.
 * velocidadMpm: metros por minuto (default 500 = ~30 km/h)
 */
export function calcularPuntoEstimado(puntoCaptura, observacion, velocidadMpm = 500) {
  const { timestampSalida, timestampLlegada, direccionGrados } = observacion;
  const duracionMs = new Date(timestampLlegada) - new Date(timestampSalida);
  const distanciaMetros = (duracionMs / 1000 / 60 / 2) * velocidadMpm;

  return {
    ...movePoint(puntoCaptura.latitud, puntoCaptura.longitud, direccionGrados, distanciaMetros),
    distanciaMetros,
  };
}
