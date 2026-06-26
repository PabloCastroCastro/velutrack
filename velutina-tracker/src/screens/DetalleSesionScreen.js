import { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getObservaciones } from '../storage/db';

const COLOR_CFG = {
  rojo:     { hex: '#e53935', label: 'Rojo' },
  azul:     { hex: '#1e88e5', label: 'Azul' },
  verde:    { hex: '#43a047', label: 'Verde' },
  amarillo: { hex: '#f9a825', label: 'Amarillo' },
  naranja:  { hex: '#e8820c', label: 'Naranja' },
};

const CARDINAL = ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO'];
function cardinal(deg) {
  return CARDINAL[Math.round(((deg % 360) + 360) / 45) % 8];
}

function formatDuracion(ms) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  return m > 0 ? `${m}m ${s % 60}s` : `${s}s`;
}

export default function DetalleSesionScreen({ route }) {
  const { sesion, puntoNombre } = route.params;
  const [observaciones, setObservaciones] = useState([]);

  const cargar = useCallback(() => {
    async function fetchData() {
      const todas = await getObservaciones();
      const mias = todas
        .filter((o) => o.sesionId === sesion.id)
        .sort((a, b) => new Date(a.timestampSalida) - new Date(b.timestampSalida));
      setObservaciones(mias);
    }
    fetchData();
  }, [sesion.id]);

  useFocusEffect(cargar);

  const completadas = observaciones.filter((o) => o.estado === 'completada').length;
  const eliminadas = observaciones.filter((o) => o.estado === 'eliminada').length;

  const renderItem = ({ item, index }) => {
    const cfg = COLOR_CFG[item.color] || { hex: '#999', label: item.color };
    const completada = item.estado === 'completada';
    const eliminada = item.estado === 'eliminada';
    const duracionMs = completada
      ? new Date(item.timestampLlegada) - new Date(item.timestampSalida)
      : null;

    return (
      <View style={[styles.item, eliminada && styles.itemEliminada]}>
        <View style={[styles.colorDot, { backgroundColor: cfg.hex }]} />
        <View style={styles.itemBody}>
          <View style={styles.itemRow}>
            <Text style={styles.itemColor}>{cfg.label}</Text>
            <Text style={styles.itemDir}>
              {item.direccionGrados}° {cardinal(item.direccionGrados)}
            </Text>
            {completada && (
              <View style={styles.badgeOk}>
                <Ionicons name="checkmark" size={11} color="#fff" />
                <Text style={styles.badgeTxt}>completada</Text>
              </View>
            )}
            {eliminada && (
              <View style={styles.badgeKo}>
                <Ionicons name="close" size={11} color="#fff" />
                <Text style={styles.badgeTxt}>eliminada</Text>
              </View>
            )}
          </View>
          {completada && (
            <View style={styles.statsRow}>
              <Ionicons name="time-outline" size={13} color="#999" />
              <Text style={styles.statTxt}>{formatDuracion(duracionMs)}</Text>
              <Ionicons name="navigate-outline" size={13} color="#999" style={{ marginLeft: 10 }} />
              <Text style={styles.statTxt}>
                {item.distanciaMetros != null ? `~${item.distanciaMetros} m` : '—'}
              </Text>
            </View>
          )}
        </View>
        <Text style={styles.itemNum}>{index + 1}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Ionicons name="calendar-outline" size={14} color="#e8820c" />
          <Text style={styles.headerFecha}>
            {new Date(sesion.fecha).toLocaleDateString('es-ES', {
              weekday: 'long', day: 'numeric', month: 'long',
            })}
            {' · '}
            {new Date(sesion.fecha).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
        <View style={styles.statsHeader}>
          <View style={styles.stat}>
            <Text style={styles.statNum}>{completadas}</Text>
            <Text style={styles.statLabel}>completadas</Text>
          </View>
          <View style={styles.stat}>
            <Text style={[styles.statNum, { color: '#e53935' }]}>{eliminadas}</Text>
            <Text style={styles.statLabel}>eliminadas</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statNum}>{observaciones.length}</Text>
            <Text style={styles.statLabel}>total</Text>
          </View>
        </View>
      </View>

      <FlatList
        data={observaciones}
        keyExtractor={(o) => o.id}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <Text style={styles.empty}>Sin observaciones en esta sesión.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: {
    backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: '#eee', gap: 12,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  headerFecha: { fontSize: 13, color: '#666', textTransform: 'capitalize', flex: 1 },
  statsHeader: { flexDirection: 'row', gap: 24 },
  stat: { alignItems: 'center' },
  statNum: { fontSize: 22, fontWeight: '800', color: '#e8820c' },
  statLabel: { fontSize: 11, color: '#999', textTransform: 'uppercase', letterSpacing: 0.5 },
  item: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 14, gap: 12,
  },
  itemEliminada: { opacity: 0.5 },
  colorDot: { width: 14, height: 14, borderRadius: 7, flexShrink: 0 },
  itemBody: { flex: 1 },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  itemColor: { fontSize: 15, fontWeight: '700', color: '#1a1a1a' },
  itemDir: { fontSize: 14, color: '#555' },
  badgeOk: {
    flexDirection: 'row', alignItems: 'center', gap: 2,
    backgroundColor: '#43a047', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2,
  },
  badgeKo: {
    flexDirection: 'row', alignItems: 'center', gap: 2,
    backgroundColor: '#e53935', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2,
  },
  badgeTxt: { fontSize: 10, color: '#fff', fontWeight: '700' },
  statsRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 5 },
  statTxt: { fontSize: 13, color: '#666' },
  itemNum: { fontSize: 12, color: '#ccc', fontWeight: '700' },
  separator: { height: 1, backgroundColor: '#eee' },
  empty: { textAlign: 'center', color: '#999', marginTop: 40 },
});
