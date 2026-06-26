import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { saveSesion } from '../storage/db';

export default function SesionInicioScreen({ route, navigation }) {
  const { punto } = route.params;
  const [fecha] = useState(new Date());

  const iniciarSesion = async () => {
    const sesion = await saveSesion(punto.id);
    navigation.replace('SesionActiva', { sesionId: sesion.id, punto });
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Ionicons name="location" size={22} color="#e8820c" style={styles.cardIcon} />
        <Text style={styles.cardLabel}>Punto de captura</Text>
        <Text style={styles.cardValue}>{punto.nombre}</Text>
        <Text style={styles.cardSub}>
          {punto.latitud.toFixed(5)}, {punto.longitud.toFixed(5)}
        </Text>
      </View>

      <View style={styles.card}>
        <Ionicons name="calendar" size={22} color="#e8820c" style={styles.cardIcon} />
        <Text style={styles.cardLabel}>Fecha</Text>
        <Text style={styles.cardValue}>
          {fecha.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
        </Text>
        <Text style={styles.cardSub}>
          {fecha.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>

      <TouchableOpacity style={styles.btn} onPress={iniciarSesion}>
        <Ionicons name="play-circle" size={22} color="#fff" style={{ marginRight: 8 }} />
        <Text style={styles.btnTxt}>Iniciar sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 16, gap: 16 },
  card: {
    backgroundColor: '#fff', borderRadius: 12, padding: 20,
    elevation: 1,
  },
  cardIcon: { marginBottom: 8 },
  cardLabel: { fontSize: 11, fontWeight: '700', color: '#999', textTransform: 'uppercase', letterSpacing: 0.8 },
  cardValue: { fontSize: 20, fontWeight: '700', color: '#1a1a1a', marginTop: 4, textTransform: 'capitalize' },
  cardSub: { fontSize: 13, color: '#999', marginTop: 4 },
  btn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#e8820c', borderRadius: 12, padding: 18, marginTop: 8,
  },
  btnTxt: { color: '#fff', fontSize: 17, fontWeight: '700' },
});
