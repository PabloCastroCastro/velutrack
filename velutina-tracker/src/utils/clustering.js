import { movePoint, haversineDistance } from './geo';

export function calcularCandidatos(puntos, sesiones, observaciones, radioMetros = 200) {
  const sesionPunto = {};
  sesiones.forEach((s) => {
    sesionPunto[s.id] = puntos.find((p) => p.id === s.puntoCapturaId);
  });

  const endpoints = observaciones
    .filter((o) => o.estado === 'completada' && o.distanciaMetros != null)
    .map((o) => {
      const punto = sesionPunto[o.sesionId];
      if (!punto) return null;
      const pos = movePoint(punto.latitud, punto.longitud, o.direccionGrados, o.distanciaMetros);
      return { lat: pos.lat, lng: pos.lng, obsId: o.id };
    })
    .filter(Boolean);

  const visitado = new Set();
  const clusters = [];

  for (let i = 0; i < endpoints.length; i++) {
    if (visitado.has(i)) continue;
    const grupo = [endpoints[i]];
    visitado.add(i);
    for (let j = i + 1; j < endpoints.length; j++) {
      if (!visitado.has(j) && haversineDistance(endpoints[i], endpoints[j]) <= radioMetros) {
        grupo.push(endpoints[j]);
        visitado.add(j);
      }
    }

    const lat = grupo.reduce((s, p) => s + p.lat, 0) / grupo.length;
    const lng = grupo.reduce((s, p) => s + p.lng, 0) / grupo.length;
    const radio = Math.max(
      grupo.reduce((mx, p) => Math.max(mx, haversineDistance({ lat, lng }, p)), 0),
      30
    );
    const count = grupo.length;

    clusters.push({
      lat,
      lng,
      radio,
      count,
      confianza: count >= 3 ? 'Alta' : count === 2 ? 'Media' : 'Baja',
      obsIds: grupo.map((p) => p.obsId),
    });
  }

  return clusters.sort((a, b) => b.count - a.count);
}
