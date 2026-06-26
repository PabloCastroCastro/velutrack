import { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, Alert,
  Modal, TextInput, ActivityIndicator, StyleSheet,
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { getPuntos, savePunto, deletePunto, getSesiones } from '../storage/db';

export default function PuntosCapturaScreen({ navigation }) {
  const [puntos, setPuntos] = useState([]);
  const [sesionesCount, setSesionesCount] = useState({});
  const [cargandoGps, setCargandoGps] = useState(false);
  const [modal, setModal] = useState({ visible: false, nombre: '', coords: null });

  const cargar = useCallback(async () => {
    const [ps, ss] = await Promise.all([getPuntos(), getSesiones()]);
    const counts = {};
    ss.forEach((s) => { counts[s.puntoCapturaId] = (counts[s.puntoCapturaId] || 0) + 1; });
    setPuntos(ps.sort((a, b) => new Date(b.fechaCreacion) - new Date(a.fechaCreacion)));
    setSesionesCount(counts);
  }, []);

  useFocusEffect(cargar);

  const abrirCrear = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso denegado', 'Necesito acceso a la ubicación para registrar un punto de captura.');
      return;
    }
    setCargandoGps(true);
    try {
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      setModal({ visible: true, nombre: '', coords: loc.coords });
    } catch {
      Alert.alert('Error', 'No se pudo obtener la ubicación. Comprueba que el GPS está activo.');
    } finally {
      setCargandoGps(false);
    }
  };

  const guardarPunto = async () => {
    const nombre = modal.nombre.trim();
    if (!nombre) { Alert.alert('Nombre requerido', 'Escribe un nombre para el punto.'); return; }
    await savePunto(nombre, modal.coords.latitude, modal.coords.longitude);
    setModal({ visible: false, nombre: '', coords: null });
    cargar();
  };

  const confirmarEliminar = (punto) => {
    Alert.alert(
      'Eliminar punto',
      `¿Eliminar "${punto.nombre}"? Se perderán sus sesiones asociadas.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: async () => { await deletePunto(punto.id); cargar(); } },
      ]
    );
  };

  const renderSwipeDelete = (punto) => (
    <TouchableOpacity style={styles.swipeDelete} onPress={() => confirmarEliminar(punto)}>
      <Ionicons name="trash" size={22} color="#fff" />
    </TouchableOpacity>
  );

  const renderItem = ({ item }) => (
    <Swipeable renderRightActions={() => renderSwipeDelete(item)}>
      <TouchableOpacity
        style={styles.item}
        onPress={() => navigation.navigate('DetallePunto', { punto: item })}
        activeOpacity={0.7}
      >
        <View style={styles.itemBody}>
          <Text style={styles.itemNombre}>{item.nombre}</Text>
          <Text style={styles.itemFecha}>
            {new Date(item.fechaCreacion).toLocaleDateString('es-ES')}
          </Text>
        </View>
        <View style={styles.itemRight}>
          <Text style={styles.sesionesNum}>{sesionesCount[item.id] || 0}</Text>
          <Text style={styles.sesionsTxt}>sesiones</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color="#ccc" style={{ marginLeft: 4 }} />
      </TouchableOpacity>
    </Swipeable>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={puntos}
        keyExtractor={(p) => p.id}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="location-outline" size={48} color="#ccc" />
            <Text style={styles.emptyText}>Sin puntos de captura.{'\n'}Pulsa + para añadir el primero.</Text>
          </View>
        }
      />

      <TouchableOpacity style={styles.fab} onPress={abrirCrear} disabled={cargandoGps}>
        {cargandoGps
          ? <ActivityIndicator color="#fff" />
          : <Ionicons name="add" size={30} color="#fff" />}
      </TouchableOpacity>

      <Modal visible={modal.visible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Nuevo punto de captura</Text>
            <Text style={styles.modalCoords}>
              {modal.coords
                ? `${modal.coords.latitude.toFixed(5)}, ${modal.coords.longitude.toFixed(5)}`
                : ''}
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Nombre (ej: Apiario Norte)"
              value={modal.nombre}
              onChangeText={(t) => setModal((m) => ({ ...m, nombre: t }))}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={guardarPunto}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnCancel]}
                onPress={() => setModal({ visible: false, nombre: '', coords: null })}
              >
                <Text style={styles.modalBtnCancelTxt}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, styles.modalBtnSave]} onPress={guardarPunto}>
                <Text style={styles.modalBtnSaveTxt}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  item: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 14,
  },
  itemBody: { flex: 1 },
  itemNombre: { fontSize: 16, fontWeight: '600', color: '#1a1a1a' },
  itemFecha: { fontSize: 12, color: '#999', marginTop: 2 },
  itemRight: { alignItems: 'center', marginRight: 8 },
  sesionesNum: { fontSize: 18, fontWeight: 'bold', color: '#e8820c' },
  sesionsTxt: { fontSize: 10, color: '#999' },
  separator: { height: 1, backgroundColor: '#eee' },
  swipeDelete: {
    backgroundColor: '#e53935', justifyContent: 'center',
    alignItems: 'center', width: 72,
  },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80 },
  emptyText: { textAlign: 'center', color: '#999', marginTop: 12, lineHeight: 22 },
  fab: {
    position: 'absolute', bottom: 24, right: 24,
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: '#e8820c', alignItems: 'center', justifyContent: 'center',
    elevation: 4,
  },
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center', alignItems: 'center',
  },
  modalBox: {
    backgroundColor: '#fff', borderRadius: 12,
    padding: 24, width: '85%',
  },
  modalTitle: { fontSize: 17, fontWeight: 'bold', marginBottom: 4 },
  modalCoords: { fontSize: 12, color: '#999', marginBottom: 16 },
  input: {
    borderWidth: 1, borderColor: '#ddd', borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 10, fontSize: 15,
  },
  modalButtons: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 16, gap: 8 },
  modalBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  modalBtnCancel: { backgroundColor: '#f0f0f0' },
  modalBtnCancelTxt: { color: '#555' },
  modalBtnSave: { backgroundColor: '#e8820c' },
  modalBtnSaveTxt: { color: '#fff', fontWeight: '600' },
});
