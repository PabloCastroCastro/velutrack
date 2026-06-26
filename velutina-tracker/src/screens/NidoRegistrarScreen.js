import { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ActivityIndicator, StyleSheet, Alert,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { saveNido } from '../storage/db';

const REGION_INICIAL = { latitude: 42.5, longitude: -8.0, latitudeDelta: 0.05, longitudeDelta: 0.05 };

export default function NidoRegistrarScreen({ navigation }) {
  const mapRef = useRef(null);
  const [marcador, setMarcador] = useState(null);
  const [cargandoGps, setCargandoGps] = useState(true);
  const [estado, setEstado] = useState('activo');
  const [notas, setNotas] = useState('');
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    async function centrarEnGps() {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        mapRef.current?.animateToRegion({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
          latitudeDelta: 0.003,
          longitudeDelta: 0.003,
        }, 600);
      }
      setCargandoGps(false);
    }
    centrarEnGps();
  }, []);

  const handleMapPress = (e) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setMarcador({ latitude, longitude });
  };

  const guardar = async () => {
    if (!marcador) {
      Alert.alert('Sin posición', 'Toca el mapa para marcar la ubicación del nido.');
      return;
    }
    setGuardando(true);
    await saveNido({
      latitud: marcador.latitude,
      longitud: marcador.longitude,
      estado,
      notas: notas.trim() || null,
      observacionesIds: [],
    });
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      {/* Mapa a pantalla completa */}
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFillObject}
        initialRegion={REGION_INICIAL}
        onPress={handleMapPress}
        showsUserLocation
        rotateEnabled={false}
      >
        {marcador && <Marker coordinate={marcador} pinColor="#e8820c" />}
      </MapView>

      {/* Overlay superior: hint o coordenadas */}
      {cargandoGps && (
        <View style={styles.topOverlay}>
          <ActivityIndicator size="small" color="#fff" />
          <Text style={styles.overlayTxt}>Obteniendo posición…</Text>
        </View>
      )}
      {!cargandoGps && !marcador && (
        <View style={styles.topOverlay}>
          <Ionicons name="locate-outline" size={15} color="#fff" />
          <Text style={styles.overlayTxt}>Toca el mapa para marcar el nido</Text>
        </View>
      )}
      {marcador && (
        <View style={[styles.topOverlay, styles.topOverlayLight]}>
          <Ionicons name="location" size={14} color="#e8820c" />
          <Text style={styles.overlayTxtDark}>
            {marcador.latitude.toFixed(5)}, {marcador.longitude.toFixed(5)}
          </Text>
        </View>
      )}

      {/* Panel flotante anclado al fondo */}
      <View style={styles.panel}>
        <View style={styles.toggleRow}>
          <TouchableOpacity
            style={[styles.toggleBtn, estado === 'activo' && styles.toggleActivo]}
            onPress={() => setEstado('activo')}
          >
            <Ionicons name="home" size={15} color={estado === 'activo' ? '#fff' : '#555'} />
            <Text style={[styles.toggleTxt, estado === 'activo' && styles.toggleTxtOn]}>Activo</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, estado === 'eliminado' && styles.toggleEliminado]}
            onPress={() => setEstado('eliminado')}
          >
            <Ionicons name="checkmark-done" size={15} color={estado === 'eliminado' ? '#fff' : '#555'} />
            <Text style={[styles.toggleTxt, estado === 'eliminado' && styles.toggleTxtOn]}>Eliminado</Text>
          </TouchableOpacity>
        </View>

        <TextInput
          style={styles.input}
          value={notas}
          onChangeText={setNotas}
          placeholder="Notas (altura, árbol, acceso…)"
          placeholderTextColor="#bbb"
          returnKeyType="done"
        />

        <TouchableOpacity
          style={[styles.btnGuardar, (!marcador || guardando) && styles.btnDisabled]}
          onPress={guardar}
          disabled={!marcador || guardando}
          activeOpacity={0.8}
        >
          {guardando ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="save-outline" size={19} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.btnGuardarTxt}>Guardar nido</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  topOverlay: {
    position: 'absolute', top: 12, alignSelf: 'center',
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(0,0,0,0.55)', borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 7,
  },
  topOverlayLight: { backgroundColor: '#fff', elevation: 3 },
  overlayTxt: { color: '#fff', fontSize: 13 },
  overlayTxtDark: { fontSize: 12, color: '#333', fontFamily: 'monospace' },

  panel: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#fff',
    paddingHorizontal: 12, paddingTop: 14, paddingBottom: 20,
    gap: 10,
    borderTopLeftRadius: 18, borderTopRightRadius: 18,
    elevation: 12,
  },

  toggleRow: { flexDirection: 'row', gap: 8 },
  toggleBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5,
    paddingVertical: 9, borderRadius: 10,
    backgroundColor: '#f5f5f5', borderWidth: 1, borderColor: '#ddd',
  },
  toggleActivo: { backgroundColor: '#43a047', borderColor: '#43a047' },
  toggleEliminado: { backgroundColor: '#888', borderColor: '#888' },
  toggleTxt: { fontSize: 14, fontWeight: '600', color: '#555' },
  toggleTxtOn: { color: '#fff' },

  input: {
    borderWidth: 1, borderColor: '#eee', borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 9,
    fontSize: 14, color: '#1a1a1a', backgroundColor: '#fafafa',
  },

  btnGuardar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#e8820c', borderRadius: 10, padding: 13,
  },
  btnDisabled: { opacity: 0.45 },
  btnGuardarTxt: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
