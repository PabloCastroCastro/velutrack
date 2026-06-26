import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { movePoint, bearing } from '../utils/geo';

const LINE_M = 400;

function cardinal(deg) {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO'];
  return dirs[Math.round(((deg % 360) + 360) / 45) % 8];
}

export default function MapDirectionPicker({ puntoCaptura, value, onChange }) {
  const origin = { latitude: puntoCaptura.latitud, longitude: puntoCaptura.longitud };

  const adjust = (delta) => onChange(((value + delta) % 360 + 360) % 360);

  const handleMapPress = (e) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    const b = bearing(
      { lat: puntoCaptura.latitud, lng: puntoCaptura.longitud },
      { lat: latitude, lng: longitude }
    );
    onChange(Math.round(b));
  };

  const tip = movePoint(puntoCaptura.latitud, puntoCaptura.longitud, value, LINE_M);
  const tipCoord = { latitude: tip.lat, longitude: tip.lng };

  return (
    <View style={styles.container}>
      <View style={styles.bearingBar}>
        <Text style={styles.bearingNum}>{value}°</Text>
        <Text style={styles.bearingCard}>{cardinal(value)}</Text>
      </View>

      <MapView
        style={styles.map}
        initialRegion={{
          latitude: puntoCaptura.latitud,
          longitude: puntoCaptura.longitud,
          latitudeDelta: 0.006,
          longitudeDelta: 0.006,
        }}
        onPress={handleMapPress}
        rotateEnabled
        pitchEnabled={false}
        showsUserLocation
      >
        <Marker coordinate={origin} pinColor="#e8820c" title={puntoCaptura.nombre} />

        <Polyline
          coordinates={[origin, tipCoord]}
          strokeColor="#e8820c"
          strokeWidth={3}
          lineDashPattern={[12, 6]}
        />

        <Marker coordinate={tipCoord} anchor={{ x: 0.5, y: 0.5 }} flat>
          <Ionicons
            name="arrow-up"
            size={28}
            color="#e8820c"
            style={{ transform: [{ rotate: `${value}deg` }] }}
          />
        </Marker>
      </MapView>

      <View style={styles.adjRow}>
        <TouchableOpacity style={styles.adjBtn} onPress={() => adjust(-10)}>
          <Text style={styles.adjTxt}>-10°</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.adjBtn} onPress={() => adjust(-1)}>
          <Text style={styles.adjTxt}>-1°</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.adjBtn} onPress={() => adjust(1)}>
          <Text style={styles.adjTxt}>+1°</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.adjBtn} onPress={() => adjust(10)}>
          <Text style={styles.adjTxt}>+10°</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.hint}>Toca el mapa para marcar la dirección de vuelo</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  bearingBar: {
    flexDirection: 'row', alignItems: 'baseline', gap: 8,
    paddingHorizontal: 20, paddingVertical: 12,
    backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee',
  },
  bearingNum: { fontSize: 32, fontWeight: '800', color: '#e8820c' },
  bearingCard: { fontSize: 18, fontWeight: '600', color: '#555' },
  map: { flex: 1 },
  adjRow: {
    flexDirection: 'row', justifyContent: 'center', gap: 10,
    paddingVertical: 12, backgroundColor: '#fff',
    borderTopWidth: 1, borderTopColor: '#eee',
  },
  adjBtn: {
    backgroundColor: '#f0f0f0', paddingHorizontal: 16, paddingVertical: 10,
    borderRadius: 8,
  },
  adjTxt: { fontSize: 14, fontWeight: '700', color: '#333' },
  hint: {
    textAlign: 'center', color: '#aaa', fontSize: 12,
    paddingBottom: 8, backgroundColor: '#fff',
  },
});
