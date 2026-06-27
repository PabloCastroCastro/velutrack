import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, Modal, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { saveObservacion, updateObservacion } from '../storage/db';
import { getAjustes, DEFAULT_AJUSTES } from '../storage/ajustes';
import MapDirectionPicker from '../components/MapDirectionPicker';

const COLORES = ['rojo', 'azul', 'verde', 'amarillo', 'naranja'];

const COLOR_CFG = {
  rojo:     { hex: '#e53935', label: 'Rojo',     darkText: false },
  azul:     { hex: '#1e88e5', label: 'Azul',     darkText: false },
  verde:    { hex: '#43a047', label: 'Verde',     darkText: false },
  amarillo: { hex: '#f9a825', label: 'Amarillo', darkText: true  },
  naranja:  { hex: '#e8820c', label: 'Naranja',  darkText: false },
};

const FICHA_LIBRE = { estado: 'libre', observacionId: null, timestampSalida: null, direccionGrados: null };

function estadoInicial() {
  return Object.fromEntries(COLORES.map((c) => [c, { ...FICHA_LIBRE }]));
}

function formatTimer(ms) {
  const s = Math.floor(Math.max(0, ms) / 1000);
  const m = Math.floor(s / 60).toString().padStart(2, '0');
  return `${m}:${(s % 60).toString().padStart(2, '0')}`;
}

export default function SesionActivaScreen({ route, navigation }) {
  const { sesionId, punto } = route.params;
  const insets = useSafeAreaInsets();
  const [fichas, setFichas] = useState(estadoInicial);
  const [ahora, setAhora] = useState(Date.now());
  const [modal, setModal] = useState({ visible: false, color: null });
  const [direccion, setDireccion] = useState(0);
  const [velocidadMpm, setVelocidadMpm] = useState(DEFAULT_AJUSTES.velocidadMpm);

  useEffect(() => {
    getAjustes().then((aj) => setVelocidadMpm(aj.velocidadMpm));
  }, []);

  useEffect(() => {
    const hayVuelo = Object.values(fichas).some((f) => f.estado === 'en_vuelo');
    if (!hayVuelo) return;
    const id = setInterval(() => setAhora(Date.now()), 1000);
    return () => clearInterval(id);
  }, [fichas]);

  const abrirModalSuelta = (color) => {
    setDireccion(0);
    setModal({ visible: true, color });
  };

  const confirmarSuelta = async () => {
    const { color } = modal;
    setModal({ visible: false, color: null });
    const ts = new Date().toISOString();
    const obs = await saveObservacion(sesionId, color, direccion);
    setFichas((prev) => ({
      ...prev,
      [color]: { estado: 'en_vuelo', observacionId: obs.id, timestampSalida: ts, direccionGrados: direccion },
    }));
  };

  const handleTapEnVuelo = (color) => {
    const ficha = fichas[color];
    const elapsed = ahora - new Date(ficha.timestampSalida).getTime();
    Alert.alert(
      `${COLOR_CFG[color].label} — en vuelo`,
      `Dirección: ${ficha.direccionGrados}°\nTiempo: ${formatTimer(elapsed)}`,
      [
        {
          text: 'Llegó ✓',
          onPress: async () => {
            const llegada = new Date().toISOString();
            const duracionMs = new Date(llegada) - new Date(ficha.timestampSalida);
            const distanciaMetros = Math.round((duracionMs / 1000 / 60 / 2) * velocidadMpm);
            await updateObservacion(ficha.observacionId, {
              timestampLlegada: llegada,
              distanciaMetros,
              estado: 'completada',
            });
            setFichas((prev) => ({ ...prev, [color]: { ...FICHA_LIBRE } }));
          },
        },
        {
          text: 'Eliminada',
          style: 'destructive',
          onPress: async () => {
            await updateObservacion(ficha.observacionId, { estado: 'eliminada' });
            setFichas((prev) => ({ ...prev, [color]: { ...FICHA_LIBRE } }));
          },
        },
        { text: 'Cancelar', style: 'cancel' },
      ]
    );
  };

  const terminarSesion = () => {
    const enVuelo = COLORES.filter((c) => fichas[c].estado === 'en_vuelo');
    const confirmar = () => navigation.popToTop();
    if (enVuelo.length > 0) {
      Alert.alert(
        'Sesión activa',
        `Hay ${enVuelo.length} velutina(s) en vuelo. ¿Terminar igualmente?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Terminar', style: 'destructive', onPress: confirmar },
        ]
      );
    } else {
      confirmar();
    }
  };

  const renderFicha = (color) => {
    const ficha = fichas[color];
    const cfg = COLOR_CFG[color];
    const enVuelo = ficha.estado === 'en_vuelo';
    const txt = enVuelo && !cfg.darkText ? '#fff' : enVuelo && cfg.darkText ? '#333' : '#1a1a1a';

    return (
      <TouchableOpacity
        key={color}
        style={[
          styles.ficha,
          { backgroundColor: enVuelo ? cfg.hex : '#fff', borderColor: cfg.hex },
        ]}
        onPress={() => (enVuelo ? handleTapEnVuelo(color) : abrirModalSuelta(color))}
        activeOpacity={0.75}
      >
        <View style={[styles.colorBar, { backgroundColor: cfg.hex }]} />
        <View style={styles.fichaContent}>
          <View style={styles.fichaRow}>
            <Text style={[styles.fichaNombre, { color: txt }]}>{cfg.label}</Text>
            {enVuelo && (
              <View style={styles.enVueloBadge}>
                <Text style={[styles.enVueloTxt, { color: txt }]}>EN VUELO</Text>
              </View>
            )}
          </View>
          {enVuelo ? (
            <View style={styles.fichaStats}>
              <Text style={[styles.fichaTimer, { color: txt }]}>
                {formatTimer(ahora - new Date(ficha.timestampSalida).getTime())}
              </Text>
              <Text style={[styles.fichaDireccion, { color: txt }]}>
                {ficha.direccionGrados}°
              </Text>
            </View>
          ) : (
            <Text style={styles.fichaLibre}>Toca para soltar</Text>
          )}
        </View>
        <Ionicons
          name={enVuelo ? 'chevron-down-circle' : 'add-circle-outline'}
          size={26}
          color={enVuelo ? (cfg.darkText ? '#333' : '#fff') : cfg.hex}
        />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.subHeader}>
        <Ionicons name="location-outline" size={14} color="#e8820c" />
        <Text style={styles.subHeaderTxt}>{punto.nombre}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.lista}>
        {COLORES.map(renderFicha)}
      </ScrollView>

      <TouchableOpacity style={styles.btnTerminar} onPress={terminarSesion}>
        <Ionicons name="stop-circle" size={20} color="#fff" style={{ marginRight: 8 }} />
        <Text style={styles.btnTerminarTxt}>Terminar sesión</Text>
      </TouchableOpacity>

      <Modal visible={modal.visible} animationType="slide">
        <View style={styles.modalFull}>
          <View style={[styles.modalHeader, { paddingTop: insets.top + 10 }]}>
            <TouchableOpacity onPress={() => setModal({ visible: false, color: null })} style={styles.btnCancelar}>
              <Ionicons name="close" size={22} color="#555" />
              <Text style={styles.btnCancelarTxt}>Cancelar</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {modal.color
                ? `Suelta ${COLOR_CFG[modal.color].label}`
                : 'Dirección de vuelo'}
            </Text>
            <TouchableOpacity style={styles.btnSuelta} onPress={confirmarSuelta}>
              <Text style={styles.btnSueltaTxt}>Suelta</Text>
              <Ionicons name="arrow-up-circle" size={20} color="#fff" style={{ marginLeft: 4 }} />
            </TouchableOpacity>
          </View>

          <MapDirectionPicker
            puntoCaptura={punto}
            value={direccion}
            onChange={setDireccion}
          />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  subHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 16, paddingVertical: 10,
    backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee',
  },
  subHeaderTxt: { fontSize: 13, color: '#666' },
  lista: { padding: 12, gap: 10 },
  ficha: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 12, borderWidth: 2, overflow: 'hidden',
    elevation: 1,
  },
  colorBar: { width: 8, alignSelf: 'stretch' },
  fichaContent: { flex: 1, paddingHorizontal: 14, paddingVertical: 16 },
  fichaRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  fichaNombre: { fontSize: 17, fontWeight: '700' },
  enVueloBadge: {
    backgroundColor: 'rgba(0,0,0,0.15)', borderRadius: 4,
    paddingHorizontal: 6, paddingVertical: 2,
  },
  enVueloTxt: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  fichaStats: { flexDirection: 'row', alignItems: 'baseline', gap: 12, marginTop: 6 },
  fichaTimer: { fontSize: 28, fontWeight: '800', letterSpacing: 1 },
  fichaDireccion: { fontSize: 16, fontWeight: '600', opacity: 0.85 },
  fichaLibre: { fontSize: 13, color: '#aaa', marginTop: 4 },
  btnTerminar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#333', margin: 12, padding: 16, borderRadius: 12,
  },
  btnTerminarTxt: { color: '#fff', fontSize: 16, fontWeight: '700' },
  modalFull: { flex: 1, backgroundColor: '#fff' },
  modalHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 12, paddingBottom: 10,
    backgroundColor: '#e8820c',
  },
  modalTitle: { fontSize: 16, fontWeight: '800', color: '#fff', flex: 1, textAlign: 'center' },
  btnCancelar: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 6,
  },
  btnCancelarTxt: { color: '#fff', fontWeight: '600' },
  btnSuelta: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 6,
  },
  btnSueltaTxt: { color: '#e8820c', fontWeight: '800', fontSize: 15 },
});
