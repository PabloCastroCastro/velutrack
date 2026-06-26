import { useState, useCallback, Fragment } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, Modal,
  ScrollView, StyleSheet,
} from 'react-native';
import MapView, { Marker, Circle } from 'react-native-maps';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getPuntos, getSesiones, getObservaciones, getNidos } from '../storage/db';
import { getAjustes, DEFAULT_AJUSTES } from '../storage/ajustes';
import { calcularCandidatos } from '../utils/clustering';
import { haversineDistance } from '../utils/geo';

const CONFIANZA_COLOR = { Alta: '#43a047', Media: '#f9a825', Baja: '#e53935' };
const PERIODOS = [
  { label: '7 días', dias: 7 },
  { label: '30 días', dias: 30 },
  { label: 'Todo', dias: null },
];

function formatCoords(lat, lng) {
  return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
}

export default function AnalisisScreen() {
  const [puntos, setPuntos] = useState([]);
  const [candidatos, setCandidatos] = useState([]);
  const [nidos, setNidos] = useState([]);
  const [periodo, setPeriodo] = useState(null);
  const [filtroPunto, setFiltroPunto] = useState(null);
  const [modalCandidato, setModalCandidato] = useState(null);
  const [obsDetalle, setObsDetalle] = useState([]);

  const cargar = useCallback(() => {
    async function fetchData() {
      const [ps, ss, obs, ns] = await Promise.all([
        getPuntos(), getSesiones(), getObservaciones(), getNidos(),
      ]);
      setPuntos(ps);
      setNidos(ns);

      // Apply filters
      let obsFiltradas = obs;
      if (periodo) {
        const desde = new Date(Date.now() - periodo * 24 * 60 * 60 * 1000);
        obsFiltradas = obsFiltradas.filter((o) => new Date(o.timestampSalida) >= desde);
      }
      let sesionesFiltradas = ss;
      if (filtroPunto) {
        sesionesFiltradas = sesionesFiltradas.filter((s) => s.puntoCapturaId === filtroPunto);
        const sesIds = new Set(sesionesFiltradas.map((s) => s.id));
        obsFiltradas = obsFiltradas.filter((o) => sesIds.has(o.sesionId));
      }

      const aj = await getAjustes();
      setCandidatos(calcularCandidatos(ps, sesionesFiltradas, obsFiltradas, aj.radioCluster));
    }
    fetchData();
  }, [periodo, filtroPunto]);

  useFocusEffect(cargar);

  const abrirDetalle = async (candidato) => {
    const todas = await getObservaciones();
    setObsDetalle(todas.filter((o) => candidato.obsIds.includes(o.id)));
    setModalCandidato(candidato);
  };

  // Comparativa: nearest candidate for each real nest
  const comparativa = nidos.map((n) => {
    if (!candidatos.length) return { nido: n, distancia: null, candidato: null };
    let nearest = null;
    let minDist = Infinity;
    candidatos.forEach((c) => {
      const d = haversineDistance({ lat: n.latitud, lng: n.longitud }, { lat: c.lat, lng: c.lng });
      if (d < minDist) { minDist = d; nearest = c; }
    });
    return { nido: n, distancia: Math.round(minDist), candidato: nearest };
  });

  const renderCandidato = ({ item, index }) => (
    <TouchableOpacity style={styles.card} onPress={() => abrirDetalle(item)} activeOpacity={0.75}>
      <View style={styles.cardLeft}>
        <Text style={styles.cardNum}>#{index + 1}</Text>
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.cardCoords}>{formatCoords(item.lat, item.lng)}</Text>
        <Text style={styles.cardSub}>{item.count} observaciones · radio ~{Math.round(item.radio)} m</Text>
      </View>
      <View style={[styles.badge, { backgroundColor: CONFIANZA_COLOR[item.confianza] + '22' }]}>
        <Text style={[styles.badgeTxt, { color: CONFIANZA_COLOR[item.confianza] }]}>
          {item.confianza}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color="#ccc" style={{ marginLeft: 4 }} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Filtros período */}
      <View style={styles.filtrosPeriodo}>
        {PERIODOS.map((p) => (
          <TouchableOpacity
            key={p.label}
            style={[styles.periodoBtn, periodo === p.dias && styles.periodoBtnActive]}
            onPress={() => setPeriodo(p.dias)}
          >
            <Text style={[styles.periodoBtnTxt, periodo === p.dias && styles.periodoBtnTxtActive]}>
              {p.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Filtro punto */}
      {puntos.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filtrosPuntoWrap}
        >
          <View style={styles.filtrosPunto}>
            <TouchableOpacity
              style={[styles.chip, !filtroPunto && styles.chipActive]}
              onPress={() => setFiltroPunto(null)}
            >
              <Text style={[styles.chipTxt, !filtroPunto && styles.chipTxtActive]}>Todos</Text>
            </TouchableOpacity>
            {puntos.map((p) => (
              <TouchableOpacity
                key={p.id}
                style={[styles.chip, filtroPunto === p.id && styles.chipActive]}
                onPress={() => setFiltroPunto(p.id)}
              >
                <Text style={[styles.chipTxt, filtroPunto === p.id && styles.chipTxtActive]} numberOfLines={1}>
                  {p.nombre}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      )}

      <FlatList
        data={candidatos}
        keyExtractor={(_, i) => String(i)}
        renderItem={renderCandidato}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListHeaderComponent={
          <Text style={styles.seccionHeader}>
            {candidatos.length} zona{candidatos.length !== 1 ? 's' : ''} candidata{candidatos.length !== 1 ? 's' : ''}
          </Text>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="analytics-outline" size={48} color="#ccc" />
            <Text style={styles.emptyTxt}>Sin observaciones completadas todavía.</Text>
          </View>
        }
        ListFooterComponent={
          comparativa.length > 0 ? (
            <View>
              <Text style={styles.seccionHeader}>Comparativa con nidos reales</Text>
              {comparativa.map(({ nido, distancia, candidato }) => (
                <View key={nido.id} style={styles.compRow}>
                  <View style={[styles.estadoDot, { backgroundColor: nido.estado === 'activo' ? '#43a047' : '#bbb' }]} />
                  <View style={styles.compBody}>
                    <Text style={styles.compFecha}>
                      {new Date(nido.fechaLocalizacion).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </Text>
                    {distancia !== null ? (
                      <Text style={styles.compDist}>
                        Candidato más cercano a{' '}
                        <Text style={{ fontWeight: '700', color: distancia < 100 ? '#43a047' : distancia < 300 ? '#f9a825' : '#e53935' }}>
                          {distancia} m
                        </Text>
                      </Text>
                    ) : (
                      <Text style={styles.compDist}>Sin candidatos para comparar</Text>
                    )}
                  </View>
                </View>
              ))}
              <View style={{ height: 24 }} />
            </View>
          ) : null
        }
        style={{ flex: 1 }}
      />

      {/* Modal detalle candidato */}
      <Modal visible={!!modalCandidato} animationType="slide" onRequestClose={() => setModalCandidato(null)}>
        {modalCandidato && (
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setModalCandidato(null)} style={styles.modalClose}>
                <Ionicons name="close" size={22} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Zona candidata</Text>
              <View style={[styles.badge, { backgroundColor: '#fff3', borderWidth: 0 }]}>
                <Text style={[styles.badgeTxt, { color: '#fff' }]}>{modalCandidato.confianza}</Text>
              </View>
            </View>

            <MapView
              style={styles.modalMapa}
              initialRegion={{
                latitude: modalCandidato.lat,
                longitude: modalCandidato.lng,
                latitudeDelta: Math.max(modalCandidato.radio / 50000, 0.005),
                longitudeDelta: Math.max(modalCandidato.radio / 50000, 0.005),
              }}
              pitchEnabled={false}
            >
              <Circle
                center={{ latitude: modalCandidato.lat, longitude: modalCandidato.lng }}
                radius={modalCandidato.radio}
                fillColor="rgba(232,130,12,0.15)"
                strokeColor="rgba(232,130,12,0.5)"
                strokeWidth={2}
              />
              <Marker
                coordinate={{ latitude: modalCandidato.lat, longitude: modalCandidato.lng }}
                pinColor="#e8820c"
              />
            </MapView>

            <ScrollView style={styles.modalBody}>
              <Text style={styles.modalSub}>
                {modalCandidato.count} observaciones · radio ~{Math.round(modalCandidato.radio)} m
              </Text>
              <Text style={styles.modalCoords}>{formatCoords(modalCandidato.lat, modalCandidato.lng)}</Text>

              <Text style={styles.modalSeccion}>Observaciones incluidas</Text>
              {obsDetalle.map((o, i) => (
                <View key={o.id} style={styles.obsRow}>
                  <Text style={styles.obsNum}>{i + 1}</Text>
                  <Text style={styles.obsTxt}>
                    {o.color} · {o.direccionGrados}° · ~{o.distanciaMetros} m
                  </Text>
                </View>
              ))}
            </ScrollView>
          </View>
        )}
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },

  filtrosPeriodo: { flexDirection: 'row', padding: 10, gap: 8, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
  periodoBtn: { flex: 1, paddingVertical: 7, borderRadius: 8, backgroundColor: '#f0f0f0', alignItems: 'center' },
  periodoBtnActive: { backgroundColor: '#e8820c' },
  periodoBtnTxt: { fontSize: 13, fontWeight: '600', color: '#555' },
  periodoBtnTxtActive: { color: '#fff' },

  filtrosPuntoWrap: { flexGrow: 0, flexShrink: 0, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
  filtrosPunto: { flexDirection: 'row', paddingHorizontal: 10, paddingVertical: 8, gap: 6 },
  chip: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 16, backgroundColor: '#f0f0f0', borderWidth: 1, borderColor: '#ddd' },
  chipActive: { backgroundColor: '#e8820c', borderColor: '#e8820c' },
  chipTxt: { fontSize: 12, color: '#555', fontWeight: '500' },
  chipTxtActive: { color: '#fff', fontWeight: '700' },

  seccionHeader: { fontSize: 12, fontWeight: '700', color: '#aaa', textTransform: 'uppercase', letterSpacing: 0.5, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },

  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', paddingHorizontal: 14, paddingVertical: 13 },
  cardLeft: { width: 32, alignItems: 'center' },
  cardNum: { fontSize: 16, fontWeight: '800', color: '#e8820c' },
  cardBody: { flex: 1, marginLeft: 8 },
  cardCoords: { fontSize: 13, fontWeight: '600', color: '#1a1a1a', fontFamily: 'monospace' },
  cardSub: { fontSize: 12, color: '#888', marginTop: 2 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, borderWidth: 1, borderColor: 'transparent' },
  badgeTxt: { fontSize: 11, fontWeight: '700' },
  separator: { height: 1, backgroundColor: '#eee' },

  empty: { alignItems: 'center', paddingTop: 80 },
  emptyTxt: { color: '#999', marginTop: 12, textAlign: 'center', paddingHorizontal: 32 },

  compRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: 1, borderTopColor: '#eee' },
  estadoDot: { width: 10, height: 10, borderRadius: 5, flexShrink: 0 },
  compBody: { flex: 1, marginLeft: 12 },
  compFecha: { fontSize: 13, fontWeight: '600', color: '#1a1a1a' },
  compDist: { fontSize: 12, color: '#777', marginTop: 2 },

  modalContainer: { flex: 1, backgroundColor: '#f5f5f5' },
  modalHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#e8820c', paddingHorizontal: 12, paddingVertical: 10,
  },
  modalClose: { padding: 4 },
  modalTitle: { flex: 1, fontSize: 16, fontWeight: '800', color: '#fff', textAlign: 'center' },
  modalMapa: { height: 260 },
  modalBody: { flex: 1, padding: 16 },
  modalSub: { fontSize: 14, color: '#555', marginBottom: 4 },
  modalCoords: { fontSize: 13, fontFamily: 'monospace', color: '#888', marginBottom: 16 },
  modalSeccion: { fontSize: 11, fontWeight: '700', color: '#aaa', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 },
  obsRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#eee' },
  obsNum: { width: 20, fontSize: 13, fontWeight: '700', color: '#e8820c', textAlign: 'center' },
  obsTxt: { fontSize: 13, color: '#444' },
});
