import { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ActivityIndicator, StyleSheet, ScrollView, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { saveNido } from '../storage/db';

export default function NidoRegistrarScreen({ navigation }) {
  const [ubicacion, setUbicacion] = useState(null);
  const [cargandoGps, setCargandoGps] = useState(true);
  const [estado, setEstado] = useState('activo');
  const [notas, setNotas] = useState('');
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    async function obtenerUbicacion() {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Sin permiso de ubicación', 'Activa la ubicación para registrar el nido.');
        setCargandoGps(false);
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      setUbicacion({ lat: loc.coords.latitude, lng: loc.coords.longitude });
      setCargandoGps(false);
    }
    obtenerUbicacion();
  }, []);

  const guardar = async () => {
    if (!ubicacion) {
      Alert.alert('Sin ubicación', 'Espera a que se obtenga la posición GPS.');
      return;
    }
    setGuardando(true);
    await saveNido({
      latitud: ubicacion.lat,
      longitud: ubicacion.lng,
      estado,
      notas: notas.trim() || null,
      observacionesIds: [],
    });
    navigation.goBack();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <View style={styles.seccion}>
        <Text style={styles.seccionLabel}>Posición GPS</Text>
        {cargandoGps ? (
          <View style={styles.gpsRow}>
            <ActivityIndicator size="small" color="#e8820c" />
            <Text style={styles.gpsTxt}>Obteniendo ubicación…</Text>
          </View>
        ) : ubicacion ? (
          <View style={styles.gpsRow}>
            <Ionicons name="location" size={16} color="#e8820c" />
            <Text style={styles.gpsCoordenadas}>
              {ubicacion.lat.toFixed(6)}, {ubicacion.lng.toFixed(6)}
            </Text>
          </View>
        ) : (
          <View style={styles.gpsRow}>
            <Ionicons name="warning-outline" size={16} color="#e53935" />
            <Text style={[styles.gpsTxt, { color: '#e53935' }]}>No se pudo obtener la ubicación</Text>
          </View>
        )}
      </View>

      <View style={styles.seccion}>
        <Text style={styles.seccionLabel}>Estado</Text>
        <View style={styles.toggleRow}>
          <TouchableOpacity
            style={[styles.toggleBtn, estado === 'activo' && styles.toggleActivo]}
            onPress={() => setEstado('activo')}
          >
            <Ionicons name="home" size={16} color={estado === 'activo' ? '#fff' : '#555'} />
            <Text style={[styles.toggleTxt, estado === 'activo' && styles.toggleTxtActivo]}>Activo</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, estado === 'eliminado' && styles.toggleEliminado]}
            onPress={() => setEstado('eliminado')}
          >
            <Ionicons name="checkmark-done" size={16} color={estado === 'eliminado' ? '#fff' : '#555'} />
            <Text style={[styles.toggleTxt, estado === 'eliminado' && styles.toggleTxtActivo]}>Eliminado</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.seccion}>
        <Text style={styles.seccionLabel}>Notas (opcional)</Text>
        <TextInput
          style={styles.input}
          value={notas}
          onChangeText={setNotas}
          placeholder="Describe la ubicación, altura, tamaño…"
          placeholderTextColor="#bbb"
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />
      </View>

      <TouchableOpacity
        style={[styles.btnGuardar, (guardando || !ubicacion) && styles.btnDisabled]}
        onPress={guardar}
        disabled={guardando || !ubicacion}
        activeOpacity={0.8}
      >
        {guardando ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Ionicons name="save-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.btnGuardarTxt}>Guardar nido</Text>
          </>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  content: { padding: 16, gap: 16 },
  seccion: {
    backgroundColor: '#fff', borderRadius: 12,
    padding: 16, gap: 10,
  },
  seccionLabel: { fontSize: 12, fontWeight: '700', color: '#aaa', textTransform: 'uppercase', letterSpacing: 0.5 },
  gpsRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  gpsTxt: { fontSize: 14, color: '#666' },
  gpsCoordenadas: { fontSize: 14, color: '#1a1a1a', fontFamily: 'monospace' },
  toggleRow: { flexDirection: 'row', gap: 10 },
  toggleBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingVertical: 10, borderRadius: 10,
    backgroundColor: '#f5f5f5', borderWidth: 1, borderColor: '#ddd',
  },
  toggleActivo: { backgroundColor: '#43a047', borderColor: '#43a047' },
  toggleEliminado: { backgroundColor: '#888', borderColor: '#888' },
  toggleTxt: { fontSize: 15, fontWeight: '600', color: '#555' },
  toggleTxtActivo: { color: '#fff' },
  input: {
    borderWidth: 1, borderColor: '#eee', borderRadius: 8,
    padding: 12, fontSize: 14, color: '#1a1a1a', minHeight: 80,
    backgroundColor: '#fafafa',
  },
  btnGuardar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#e8820c', borderRadius: 12, padding: 16, marginTop: 4,
  },
  btnDisabled: { opacity: 0.5 },
  btnGuardarTxt: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
