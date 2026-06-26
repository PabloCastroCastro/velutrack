import { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getNidos } from '../storage/db';

function formatFecha(iso) {
  return new Date(iso).toLocaleDateString('es-ES', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

function formatCoords(lat, lng) {
  return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
}

export default function NidosListaScreen({ navigation }) {
  const [nidos, setNidos] = useState([]);

  const cargar = useCallback(() => {
    async function fetchData() {
      const ns = await getNidos();
      setNidos(ns.sort((a, b) => new Date(b.fechaLocalizacion) - new Date(a.fechaLocalizacion)));
    }
    fetchData();
  }, []);

  useFocusEffect(cargar);

  const renderItem = ({ item }) => {
    const activo = item.estado === 'activo';
    return (
      <TouchableOpacity
        style={styles.item}
        onPress={() => navigation.navigate('NidoDetalle', { nido: item })}
        activeOpacity={0.7}
      >
        <View style={[styles.estadoDot, { backgroundColor: activo ? '#43a047' : '#bbb' }]} />
        <View style={styles.itemBody}>
          <Text style={styles.itemFecha}>{formatFecha(item.fechaLocalizacion)}</Text>
          <Text style={styles.itemCoords}>{formatCoords(item.latitud, item.longitud)}</Text>
          {item.notas ? <Text style={styles.itemNotas} numberOfLines={1}>{item.notas}</Text> : null}
        </View>
        <View style={[styles.badge, { backgroundColor: activo ? '#e8f5e9' : '#f5f5f5' }]}>
          <Text style={[styles.badgeTxt, { color: activo ? '#43a047' : '#999' }]}>
            {activo ? 'activo' : 'eliminado'}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color="#ccc" style={{ marginLeft: 6 }} />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={nidos}
        keyExtractor={(n) => n.id}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="home-outline" size={48} color="#ccc" />
            <Text style={styles.emptyTxt}>Sin nidos registrados.</Text>
            <Text style={styles.emptyHint}>Pulsa + para añadir el primero.</Text>
          </View>
        }
      />
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('NidoRegistrar')}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  item: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 14,
  },
  estadoDot: { width: 10, height: 10, borderRadius: 5, marginRight: 12, flexShrink: 0 },
  itemBody: { flex: 1 },
  itemFecha: { fontSize: 15, fontWeight: '600', color: '#1a1a1a' },
  itemCoords: { fontSize: 12, color: '#999', marginTop: 2, fontFamily: 'monospace' },
  itemNotas: { fontSize: 13, color: '#777', marginTop: 3 },
  badge: {
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6,
  },
  badgeTxt: { fontSize: 11, fontWeight: '700' },
  separator: { height: 1, backgroundColor: '#eee' },
  empty: { alignItems: 'center', paddingTop: 80 },
  emptyTxt: { color: '#999', marginTop: 12, fontSize: 16 },
  emptyHint: { color: '#bbb', marginTop: 4, fontSize: 13 },
  fab: {
    position: 'absolute', bottom: 24, right: 24,
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: '#e8820c',
    alignItems: 'center', justifyContent: 'center',
    elevation: 4,
  },
});
