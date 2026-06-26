import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getPuntos, savePunto, deletePunto, getSesiones, saveSesion, getObservaciones, saveObservacion, updateObservacion, getNidos, saveNido, updateNido } from '../storage/db';

async function testDb() {
  console.log('── TEST DB ──────────────────────');

  const punto = await savePunto('Apiario Norte', 42.123, -8.456);
  console.log('savePunto:', punto);

  const puntos = await getPuntos();
  console.log('getPuntos:', puntos.length, 'punto(s)');

  const sesion = await saveSesion(punto.id);
  console.log('saveSesion:', sesion);

  const obs = await saveObservacion(sesion.id, 'rojo', 135);
  console.log('saveObservacion:', obs);

  const obsActualizada = await updateObservacion(obs.id, {
    timestampLlegada: new Date().toISOString(),
    distanciaMetros: 450,
    estado: 'completada',
  });
  console.log('updateObservacion:', obsActualizada);

  const nido = await saveNido({ latitud: 42.127, longitud: -8.452, notas: 'En roble grande' });
  console.log('saveNido:', nido);

  const nidoActualizado = await updateNido(nido.id, { estado: 'eliminado' });
  console.log('updateNido:', nidoActualizado);

  await deletePunto(punto.id);
  const puntosPost = await getPuntos();
  console.log('deletePunto → quedan:', puntosPost.length, 'punto(s)');

  console.log('── FIN TEST ─────────────────────');
}

export default function HistorialScreen() {
  useEffect(() => { testDb(); }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Historial</Text>
      <Text style={styles.sub}>Abre el debugger (j) para ver los logs del test de BD</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  text: { fontSize: 20, fontWeight: 'bold' },
  sub: { marginTop: 12, color: '#666', textAlign: 'center', fontSize: 13 },
});
