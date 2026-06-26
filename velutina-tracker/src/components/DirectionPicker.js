import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const PRESETS = [
  ['NO', 315], ['N', 0],   ['NE', 45],
  ['O',  270], [null, null], ['E', 90],
  ['SO', 225], ['S', 180], ['SE', 135],
];

function cardinal(deg) {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO'];
  return dirs[Math.round(((deg % 360) + 360) / 45) % 8];
}

export default function DirectionPicker({ value, onChange }) {
  const adjust = (delta) => onChange(((value + delta) % 360 + 360) % 360);

  return (
    <View style={styles.container}>
      <View style={styles.arrowContainer}>
        <View style={{ transform: [{ rotate: `${value}deg` }] }}>
          <Ionicons name="arrow-up" size={48} color="#e8820c" />
        </View>
      </View>

      <View style={styles.degRow}>
        <TouchableOpacity style={styles.adjBtn} onPress={() => adjust(-10)}>
          <Text style={styles.adjTxt}>-10</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.adjBtn} onPress={() => adjust(-1)}>
          <Text style={styles.adjTxt}>-1</Text>
        </TouchableOpacity>
        <View style={styles.degDisplay}>
          <Text style={styles.degNum}>{value}°</Text>
          <Text style={styles.cardinalTxt}>{cardinal(value)}</Text>
        </View>
        <TouchableOpacity style={styles.adjBtn} onPress={() => adjust(1)}>
          <Text style={styles.adjTxt}>+1</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.adjBtn} onPress={() => adjust(10)}>
          <Text style={styles.adjTxt}>+10</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.grid}>
        {PRESETS.map(([label, deg], i) =>
          label ? (
            <TouchableOpacity
              key={i}
              style={[styles.gridBtn, value === deg && styles.gridBtnActive]}
              onPress={() => onChange(deg)}
            >
              <Text style={[styles.gridTxt, value === deg && styles.gridTxtActive]}>
                {label}
              </Text>
            </TouchableOpacity>
          ) : (
            <View key={i} style={styles.gridCenter} />
          )
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: 8 },
  arrowContainer: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: '#fff5eb', alignItems: 'center', justifyContent: 'center',
    marginBottom: 16, borderWidth: 2, borderColor: '#e8820c',
  },
  degRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  adjBtn: {
    backgroundColor: '#f0f0f0', paddingHorizontal: 10, paddingVertical: 6,
    borderRadius: 6,
  },
  adjTxt: { fontSize: 13, fontWeight: '600', color: '#555' },
  degDisplay: { alignItems: 'center', minWidth: 64 },
  degNum: { fontSize: 26, fontWeight: 'bold', color: '#1a1a1a' },
  cardinalTxt: { fontSize: 12, color: '#999', marginTop: -2 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', width: 168 },
  gridBtn: {
    width: 56, height: 44, alignItems: 'center', justifyContent: 'center',
    borderRadius: 6, backgroundColor: '#f0f0f0', margin: 0,
  },
  gridBtnActive: { backgroundColor: '#e8820c' },
  gridTxt: { fontSize: 13, fontWeight: '600', color: '#555' },
  gridTxtActive: { color: '#fff' },
  gridCenter: { width: 56, height: 44 },
});
