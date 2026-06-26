import { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getSesiones } from '../storage/db';

export default function DetallePuntoScreen({ route, navigation }) {
  const { punto } = route.params;
  const [sesiones, setSesiones] = useState([]);

  const cargar = useCallback(async () => {
    const todas = await getSesiones();
    const mias = todas
      .filter((s) => s.puntoCapturaId === punto.id)
      .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    setSesiones(mias);
  }, [punto.id]);

  useFocusEffect(cargar);

  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <Ionicons name="time-outline" size={18} color="#e8820c" style={{ marginRight: 10 }} />
      <View>
        <Text style={styles.itemFecha}>
          {new Date(item.fecha).toLocaleDateString('es-ES', {
            weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
          })}
        </Text>
        <Text style={styles.itemHora}>
          {new Date(item.fecha).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="location" size={16} color="#e8820c" />
        <Text style={styles.coords}>
          {`${punto.latitud.toFixed(5)}, ${punto.longitud.toFixed(5)}`}
        </Text>
      </View>

      <Text style={styles.seccion}>Sesiones</Text>

      <FlatList
        data={sesiones}
        keyExtractor={(s) => s.id}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <Text style={styles.empty}>Sin sesiones todavía.</Text>
        }
      />

      <TouchableOpacity
        style={styles.botonSesion}
        onPress={() => navigation.navigate('SesionInicio', { punto })}
      >
        <Ionicons name="play-circle" size={20} color="#fff" style={{ marginRight: 8 }} />
        <Text style={styles.botonSesionTxt}>Nueva sesión desde este punto</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: '#eee',
  },
  coords: { fontSize: 13, color: '#666' },
  seccion: {
    fontSize: 12, fontWeight: '700', color: '#999', textTransform: 'uppercase',
    letterSpacing: 0.8, paddingHorizontal: 16, paddingTop: 20, paddingBottom: 8,
  },
  item: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 14,
  },
  itemFecha: { fontSize: 15, color: '#1a1a1a', textTransform: 'capitalize' },
  itemHora: { fontSize: 12, color: '#999', marginTop: 2 },
  separator: { height: 1, backgroundColor: '#eee' },
  empty: { textAlign: 'center', color: '#999', marginTop: 32 },
  botonSesion: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#e8820c', margin: 16, padding: 16, borderRadius: 12,
  },
  botonSesionTxt: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
