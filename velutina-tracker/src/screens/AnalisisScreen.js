import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { movePoint, haversineDistance, calcularPuntoEstimado } from '../utils/geo';

function testGeo() {
  console.log('── TEST GEO ─────────────────────');

  // movePoint: 500m al Norte desde Santiago de Compostela
  const origen = { lat: 42.8782, lng: -8.5448 };
  const norte500 = movePoint(origen.lat, origen.lng, 0, 500);
  console.log('movePoint Norte 500m:', norte500);

  const este1000 = movePoint(origen.lat, origen.lng, 90, 1000);
  console.log('movePoint Este 1000m:', este1000);

  // haversineDistance: entre el origen y el punto desplazado
  const dist = haversineDistance(origen, norte500);
  console.log('haversineDistance (debe ser ~500m):', dist.toFixed(1), 'm');

  const dist2 = haversineDistance(origen, este1000);
  console.log('haversineDistance (debe ser ~1000m):', dist2.toFixed(1), 'm');

  // calcularPuntoEstimado: velutina suelta al SE, vuelve en 2 min → ~500m
  const punto = { latitud: 42.8782, longitud: -8.5448 };
  const ahora = new Date();
  const dosMinutosDespues = new Date(ahora.getTime() + 2 * 60 * 1000);
  const obs = {
    direccionGrados: 135,
    timestampSalida: ahora.toISOString(),
    timestampLlegada: dosMinutosDespues.toISOString(),
  };
  const estimado = calcularPuntoEstimado(punto, obs);
  console.log('calcularPuntoEstimado (2 min, 135°, 500m/min):', estimado);
  console.log('  → distancia estimada (debe ser ~500m):', estimado.distanciaMetros.toFixed(1), 'm');

  console.log('── FIN TEST ─────────────────────');
}

export default function AnalisisScreen() {
  useEffect(() => { testGeo(); }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Análisis</Text>
      <Text style={styles.sub}>Abre el debugger (j) para ver los logs del test geo</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  text: { fontSize: 20, fontWeight: 'bold' },
  sub: { marginTop: 12, color: '#666', textAlign: 'center', fontSize: 13 },
});
