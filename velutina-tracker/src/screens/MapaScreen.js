import { useState, useCallback, useRef, Fragment } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MapView, { Marker, Polyline, Circle, Callout } from 'react-native-maps';
import { useFocusEffect } from '@react-navigation/native';
import * as Location from 'expo-location';
import { getPuntos, getSesiones, getObservaciones, getNidos } from '../storage/db';
import { movePoint, haversineDistance } from '../utils/geo';

const COLOR_HEX = {
  rojo: '#e53935',
  azul: '#1e88e5',
  verde: '#43a047',
  amarillo: '#f9a825',
  naranja: '#e8820c',
};

const REGION_INICIAL = {
  latitude: 42.5,
  longitude: -8.0,
  latitudeDelta: 0.1,
  longitudeDelta: 0.1,
};

function clusterear(pts, radio = 150) {
  const visitado = new Set();
  const clusters = [];

  for (let i = 0; i < pts.length; i++) {
    if (visitado.has(i)) continue;
    const grupo = [pts[i]];
    visitado.add(i);
    for (let j = i + 1; j < pts.length; j++) {
      if (!visitado.has(j) && haversineDistance(pts[i], pts[j]) <= radio) {
        grupo.push(pts[j]);
        visitado.add(j);
      }
    }
    const lat = grupo.reduce((s, p) => s + p.lat, 0) / grupo.length;
    const lng = grupo.reduce((s, p) => s + p.lng, 0) / grupo.length;
    const maxDist = grupo.reduce((mx, p) => Math.max(mx, haversineDistance({ lat, lng }, p)), 0);
    clusters.push({ lat, lng, radio: Math.max(maxDist, 50), count: grupo.length });
  }
  return clusters;
}

function nivelConfianza(count) {
  if (count >= 6) return 'Alta';
  if (count >= 3) return 'Media';
  return 'Baja';
}

export default function MapaScreen() {
  const mapRef = useRef(null);
  const [puntos, setPuntos] = useState([]);
  const [lineas, setLineas] = useState([]);
  const [zonas, setZonas] = useState([]);
  const [nidos, setNidos] = useState([]);

  const cargar = useCallback(() => {
    async function fetchData() {
      const [ps, ss, obs, ns] = await Promise.all([
        getPuntos(), getSesiones(), getObservaciones(), getNidos(),
      ]);

      setPuntos(ps);
      setNidos(ns);

      const sesionPunto = {};
      ss.forEach((s) => {
        sesionPunto[s.id] = ps.find((p) => p.id === s.puntoCapturaId);
      });

      const completadas = obs.filter((o) => o.estado === 'completada' && o.distanciaMetros != null);

      const nuevasLineas = completadas.map((o) => {
        const punto = sesionPunto[o.sesionId];
        if (!punto) return null;
        const fin = movePoint(punto.latitud, punto.longitud, o.direccionGrados, o.distanciaMetros);
        return {
          id: o.id,
          coords: [
            { latitude: punto.latitud, longitude: punto.longitud },
            { latitude: fin.lat, longitude: fin.lng },
          ],
          color: COLOR_HEX[o.color] || '#888',
        };
      }).filter(Boolean);
      setLineas(nuevasLineas);

      const endpoints = completadas.map((o) => {
        const punto = sesionPunto[o.sesionId];
        if (!punto) return null;
        return movePoint(punto.latitud, punto.longitud, o.direccionGrados, o.distanciaMetros);
      }).filter(Boolean);
      setZonas(clusterear(endpoints));

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        mapRef.current?.animateToRegion({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        }, 600);
      }
    }
    fetchData();
  }, []);

  useFocusEffect(cargar);

  return (
    <MapView
      ref={mapRef}
      style={styles.map}
      initialRegion={REGION_INICIAL}
      showsUserLocation
      rotateEnabled
    >
      {puntos.map((p) => (
        <Marker
          key={p.id}
          coordinate={{ latitude: p.latitud, longitude: p.longitud }}
          pinColor="#e8820c"
          title={p.nombre}
        />
      ))}

      {lineas.map((l) => (
        <Polyline
          key={l.id}
          coordinates={l.coords}
          strokeColor={l.color}
          strokeWidth={2.5}
          lineDashPattern={[8, 4]}
        />
      ))}

      {zonas.map((z, i) => (
        <Fragment key={i}>
          <Circle
            center={{ latitude: z.lat, longitude: z.lng }}
            radius={z.radio}
            fillColor="rgba(232,130,12,0.12)"
            strokeColor="rgba(232,130,12,0.45)"
            strokeWidth={1.5}
          />
          <Marker
            coordinate={{ latitude: z.lat, longitude: z.lng }}
            anchor={{ x: 0.5, y: 0.5 }}
            tracksViewChanges={false}
          >
            <View style={styles.zonaPin}>
              <Text style={styles.zonaPinTxt}>{z.count}</Text>
            </View>
            <Callout tooltip={false}>
              <View style={styles.callout}>
                <Text style={styles.calloutTitulo}>Zona estimada</Text>
                <Text style={styles.calloutLin}>{z.count} observaciones</Text>
                <Text style={styles.calloutLin}>
                  Confianza: <Text style={styles.calloutBold}>{nivelConfianza(z.count)}</Text>
                </Text>
              </View>
            </Callout>
          </Marker>
        </Fragment>
      ))}

      {nidos.map((n) => (
        <Marker
          key={n.id}
          coordinate={{ latitude: n.latitud, longitude: n.longitud }}
          pinColor={n.estado === 'activo' ? '#43a047' : '#888'}
          tracksViewChanges={false}
        >
          <Callout tooltip={false}>
            <View style={styles.callout}>
              <Text style={styles.calloutTitulo}>
                {n.estado === 'activo' ? 'Nido activo' : 'Nido eliminado'}
              </Text>
              <Text style={styles.calloutLin}>
                {new Date(n.fechaLocalizacion).toLocaleDateString('es-ES', {
                  day: 'numeric', month: 'long', year: 'numeric',
                })}
              </Text>
              {n.notas ? <Text style={styles.calloutLin}>{n.notas}</Text> : null}
            </View>
          </Callout>
        </Marker>
      ))}
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: { flex: 1 },
  zonaPin: {
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: 'rgba(232,130,12,0.8)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: '#e8820c',
  },
  zonaPinTxt: { color: '#fff', fontSize: 11, fontWeight: '800' },
  callout: { padding: 10, minWidth: 160, maxWidth: 220 },
  calloutTitulo: { fontSize: 14, fontWeight: '700', color: '#1a1a1a', marginBottom: 4 },
  calloutLin: { fontSize: 13, color: '#555', marginTop: 2 },
  calloutBold: { fontWeight: '700', color: '#e8820c' },
});
