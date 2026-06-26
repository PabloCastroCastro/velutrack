import { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { updateNido, getObservaciones } from '../storage/db';

const COLOR_HEX = {
  rojo: '#e53935', azul: '#1e88e5', verde: '#43a047',
  amarillo: '#f9a825', naranja: '#e8820c',
};
const COLOR_LABEL = {
  rojo: 'Rojo', azul: 'Azul', verde: 'Verde', amarillo: 'Amarillo', naranja: 'Naranja',
};

export default function NidoDetalleScreen({ route, navigation }) {
  const [nido, setNido] = useState(route.params.nido);
  const [obsVinculadas, setObsVinculadas] = useState([]);

  const cargar = useCallback(() => {
    async function fetchData() {
      if (!nido.observacionesIds?.length) return;
      const todas = await getObservaciones();
      setObsVinculadas(todas.filter((o) => nido.observacionesIds.includes(o.id)));
    }
    fetchData();
  }, [nido.id]);

  useFocusEffect(cargar);

  const cambiarEstado = () => {
    const nuevoEstado = nido.estado === 'activo' ? 'eliminado' : 'activo';
    const accion = nuevoEstado === 'eliminado' ? 'marcar como eliminado' : 'marcar como activo';
    Alert.alert(
      'Cambiar estado',
      `¿Quieres ${accion} este nido?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            await updateNido(nido.id, { estado: nuevoEstado });
            const actualizado = { ...nido, estado: nuevoEstado };
            setNido(actualizado);
            navigation.setParams({ nido: actualizado });
          },
        },
      ]
    );
  };

  const activo = nido.estado === 'activo';
  const coord = { latitude: nido.latitud, longitude: nido.longitud };

  return (
    <ScrollView style={styles.container}>
      <MapView
        style={styles.mapa}
        initialRegion={{
          latitude: nido.latitud,
          longitude: nido.longitud,
          latitudeDelta: 0.004,
          longitudeDelta: 0.004,
        }}
        scrollEnabled={false}
        zoomEnabled={false}
        pitchEnabled={false}
        rotateEnabled={false}
      >
        <Marker coordinate={coord} pinColor={activo ? '#43a047' : '#888'} />
      </MapView>

      <View style={styles.infoCard}>
        <View style={styles.infoRow}>
          <Ionicons name="calendar-outline" size={15} color="#e8820c" />
          <Text style={styles.infoTxt}>
            {new Date(nido.fechaLocalizacion).toLocaleDateString('es-ES', {
              weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
            })}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="location-outline" size={15} color="#e8820c" />
          <Text style={[styles.infoTxt, { fontFamily: 'monospace' }]}>
            {nido.latitud.toFixed(6)}, {nido.longitud.toFixed(6)}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name={activo ? 'home' : 'checkmark-done'} size={15} color={activo ? '#43a047' : '#888'} />
          <Text style={[styles.infoTxt, { color: activo ? '#43a047' : '#888', fontWeight: '700' }]}>
            {activo ? 'Activo' : 'Eliminado'}
          </Text>
        </View>
        {nido.notas ? (
          <View style={[styles.infoRow, { alignItems: 'flex-start' }]}>
            <Ionicons name="document-text-outline" size={15} color="#e8820c" style={{ marginTop: 1 }} />
            <Text style={styles.infoTxt}>{nido.notas}</Text>
          </View>
        ) : null}
      </View>

      {obsVinculadas.length > 0 && (
        <View style={styles.seccion}>
          <Text style={styles.seccionLabel}>Observaciones vinculadas</Text>
          {obsVinculadas.map((o) => (
            <View key={o.id} style={styles.obsItem}>
              <View style={[styles.colorDot, { backgroundColor: COLOR_HEX[o.color] || '#888' }]} />
              <Text style={styles.obsTxt}>
                {COLOR_LABEL[o.color] || o.color} · {o.direccionGrados}°
                {o.distanciaMetros ? ` · ~${o.distanciaMetros} m` : ''}
              </Text>
            </View>
          ))}
        </View>
      )}

      <TouchableOpacity
        style={[styles.btnEstado, activo ? styles.btnEliminar : styles.btnActivar]}
        onPress={cambiarEstado}
        activeOpacity={0.8}
      >
        <Ionicons
          name={activo ? 'checkmark-done-outline' : 'home-outline'}
          size={18} color="#fff"
          style={{ marginRight: 8 }}
        />
        <Text style={styles.btnEstadoTxt}>
          {activo ? 'Marcar como eliminado' : 'Marcar como activo'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  mapa: { height: 220 },
  infoCard: {
    backgroundColor: '#fff', margin: 12, borderRadius: 12,
    padding: 16, gap: 10,
  },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  infoTxt: { fontSize: 14, color: '#444', flex: 1 },
  seccion: {
    backgroundColor: '#fff', marginHorizontal: 12, marginBottom: 12,
    borderRadius: 12, padding: 16, gap: 8,
  },
  seccionLabel: { fontSize: 11, fontWeight: '700', color: '#aaa', textTransform: 'uppercase', letterSpacing: 0.5 },
  obsItem: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  colorDot: { width: 12, height: 12, borderRadius: 6, flexShrink: 0 },
  obsTxt: { fontSize: 13, color: '#555' },
  btnEstado: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    margin: 12, marginTop: 4, padding: 15, borderRadius: 12,
  },
  btnEliminar: { backgroundColor: '#888' },
  btnActivar: { backgroundColor: '#43a047' },
  btnEstadoTxt: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
