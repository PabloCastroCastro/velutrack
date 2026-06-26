import { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  ScrollView, StyleSheet,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getSesiones, getPuntos, getObservaciones } from '../storage/db';

function formatFecha(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}

function formatHora(iso) {
  return new Date(iso).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
}

export default function HistorialScreen({ navigation }) {
  const [sesiones, setSesiones] = useState([]);
  const [puntos, setPuntos] = useState([]);
  const [obsCount, setObsCount] = useState({});
  const [filtro, setFiltro] = useState(null);

  const cargar = useCallback(() => {
    async function fetchData() {
      const [ss, ps, obs] = await Promise.all([getSesiones(), getPuntos(), getObservaciones()]);

      const counts = {};
      obs.forEach((o) => {
        if (o.estado === 'completada') {
          counts[o.sesionId] = (counts[o.sesionId] || 0) + 1;
        }
      });

      setSesiones(ss.sort((a, b) => new Date(b.fecha) - new Date(a.fecha)));
      setPuntos(ps);
      setObsCount(counts);
    }
    fetchData();
  }, []);

  useFocusEffect(cargar);

  const puntoMap = Object.fromEntries(puntos.map((p) => [p.id, p.nombre]));

  const sesionesFiltradas = filtro
    ? sesiones.filter((s) => s.puntoCapturaId === filtro)
    : sesiones;

  const renderFiltro = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.filtros}
    >
      <TouchableOpacity
        style={[styles.chip, !filtro && styles.chipActive]}
        onPress={() => setFiltro(null)}
      >
        <Text style={[styles.chipTxt, !filtro && styles.chipTxtActive]}>Todas</Text>
      </TouchableOpacity>
      {puntos.map((p) => (
        <TouchableOpacity
          key={p.id}
          style={[styles.chip, filtro === p.id && styles.chipActive]}
          onPress={() => setFiltro(p.id)}
        >
          <Text style={[styles.chipTxt, filtro === p.id && styles.chipTxtActive]} numberOfLines={1}>
            {p.nombre}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderItem = ({ item }) => {
    const puntoNombre = puntoMap[item.puntoCapturaId] || 'Punto eliminado';
    const nObs = obsCount[item.id] || 0;
    return (
      <TouchableOpacity
        style={styles.item}
        onPress={() => navigation.navigate('DetalleSesion', { sesion: item, puntoNombre })}
        activeOpacity={0.7}
      >
        <View style={styles.itemLeft}>
          <Text style={styles.itemFecha}>{formatFecha(item.fecha)}</Text>
          <View style={styles.itemPuntoRow}>
            <Ionicons name="location-outline" size={13} color="#e8820c" />
            <Text style={styles.itemPunto} numberOfLines={1}>{puntoNombre}</Text>
          </View>
        </View>
        <View style={styles.itemRight}>
          <Text style={styles.itemObs}>{nObs}</Text>
          <Text style={styles.itemObsTxt}>obs.</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color="#ccc" />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {renderFiltro()}
      <FlatList
        data={sesionesFiltradas}
        keyExtractor={(s) => s.id}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="time-outline" size={48} color="#ccc" />
            <Text style={styles.emptyTxt}>Sin sesiones todavía.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  filtros: { paddingHorizontal: 12, paddingVertical: 10, gap: 8 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20,
    backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd',
    maxWidth: 140,
  },
  chipActive: { backgroundColor: '#e8820c', borderColor: '#e8820c' },
  chipTxt: { fontSize: 13, color: '#555', fontWeight: '500' },
  chipTxtActive: { color: '#fff', fontWeight: '700' },
  item: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 14,
  },
  itemLeft: { flex: 1 },
  itemFecha: { fontSize: 15, fontWeight: '600', color: '#1a1a1a', textTransform: 'capitalize' },
  itemPuntoRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 3 },
  itemPunto: { fontSize: 12, color: '#999', flex: 1 },
  itemRight: { alignItems: 'center', marginRight: 8 },
  itemObs: { fontSize: 20, fontWeight: '800', color: '#e8820c' },
  itemObsTxt: { fontSize: 10, color: '#999' },
  separator: { height: 1, backgroundColor: '#eee' },
  empty: { alignItems: 'center', paddingTop: 80 },
  emptyTxt: { color: '#999', marginTop: 12 },
});
