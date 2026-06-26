import { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getAjustes, saveAjustes, DEFAULT_AJUSTES } from '../storage/ajustes';

const AJUSTES_CFG = [
  {
    key: 'velocidadMpm',
    label: 'Velocidad de vuelo',
    unidad: 'm/min',
    descripcion: 'Velocidad media de la velutina en vuelo de regreso al nido. Afecta a la distancia estimada.',
    min: 100,
    max: 1000,
    paso: 50,
  },
  {
    key: 'radioCluster',
    label: 'Radio de agrupación',
    unidad: 'm',
    descripcion: 'Distancia máxima entre endpoints para agruparlos en el mismo nido candidato.',
    min: 50,
    max: 500,
    paso: 25,
  },
  {
    key: 'anguloTolerancia',
    label: 'Tolerancia de dirección',
    unidad: '°',
    descripcion: 'Margen de error angular al marcar la dirección de vuelo.',
    min: 5,
    max: 90,
    paso: 5,
  },
];

export default function AjustesScreen() {
  const [valores, setValores] = useState(DEFAULT_AJUSTES);

  const cargar = useCallback(() => {
    async function fetchData() {
      const aj = await getAjustes();
      setValores(aj);
    }
    fetchData();
  }, []);

  useFocusEffect(cargar);

  const cambiar = async (key, delta, cfg) => {
    const nuevo = Math.min(cfg.max, Math.max(cfg.min, valores[key] + delta));
    const nuevosValores = { ...valores, [key]: nuevo };
    setValores(nuevosValores);
    await saveAjustes(nuevosValores);
  };

  const resetear = () => {
    Alert.alert(
      'Restablecer ajustes',
      '¿Volver a los valores por defecto?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Restablecer',
          style: 'destructive',
          onPress: async () => {
            setValores(DEFAULT_AJUSTES);
            await saveAjustes(DEFAULT_AJUSTES);
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {AJUSTES_CFG.map((cfg) => {
        const valor = valores[cfg.key];
        const esDefault = valor === DEFAULT_AJUSTES[cfg.key];
        return (
          <View key={cfg.key} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardLabel}>{cfg.label}</Text>
              {!esDefault && (
                <View style={styles.modBadge}>
                  <Text style={styles.modBadgeTxt}>modificado</Text>
                </View>
              )}
            </View>
            <Text style={styles.cardDesc}>{cfg.descripcion}</Text>

            <View style={styles.control}>
              <TouchableOpacity
                style={[styles.btn, valor <= cfg.min && styles.btnDisabled]}
                onPress={() => cambiar(cfg.key, -cfg.paso, cfg)}
                disabled={valor <= cfg.min}
              >
                <Ionicons name="remove" size={20} color={valor <= cfg.min ? '#ccc' : '#333'} />
              </TouchableOpacity>

              <View style={styles.valorWrap}>
                <Text style={styles.valor}>{valor}</Text>
                <Text style={styles.unidad}>{cfg.unidad}</Text>
              </View>

              <TouchableOpacity
                style={[styles.btn, valor >= cfg.max && styles.btnDisabled]}
                onPress={() => cambiar(cfg.key, cfg.paso, cfg)}
                disabled={valor >= cfg.max}
              >
                <Ionicons name="add" size={20} color={valor >= cfg.max ? '#ccc' : '#333'} />
              </TouchableOpacity>
            </View>

            <View style={styles.rangoRow}>
              <Text style={styles.rangoTxt}>Mín {cfg.min} {cfg.unidad}</Text>
              <Text style={styles.rangoTxt}>Default {DEFAULT_AJUSTES[cfg.key]} {cfg.unidad}</Text>
              <Text style={styles.rangoTxt}>Máx {cfg.max} {cfg.unidad}</Text>
            </View>
          </View>
        );
      })}

      <TouchableOpacity style={styles.btnReset} onPress={resetear} activeOpacity={0.75}>
        <Ionicons name="refresh" size={16} color="#e53935" style={{ marginRight: 6 }} />
        <Text style={styles.btnResetTxt}>Restablecer valores por defecto</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  content: { padding: 14, gap: 12 },

  card: { backgroundColor: '#fff', borderRadius: 14, padding: 16, gap: 8 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardLabel: { fontSize: 15, fontWeight: '700', color: '#1a1a1a', flex: 1 },
  modBadge: { backgroundColor: '#fff3e0', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  modBadgeTxt: { fontSize: 10, color: '#e8820c', fontWeight: '700' },
  cardDesc: { fontSize: 13, color: '#777', lineHeight: 18 },

  control: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 20, marginTop: 4 },
  btn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#f0f0f0', alignItems: 'center', justifyContent: 'center',
  },
  btnDisabled: { opacity: 0.4 },
  valorWrap: { flexDirection: 'row', alignItems: 'baseline', gap: 4, minWidth: 80, justifyContent: 'center' },
  valor: { fontSize: 28, fontWeight: '800', color: '#e8820c' },
  unidad: { fontSize: 14, color: '#aaa', fontWeight: '600' },

  rangoRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 2 },
  rangoTxt: { fontSize: 11, color: '#bbb' },

  btnReset: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 14, borderRadius: 12, borderWidth: 1, borderColor: '#e53935',
    marginTop: 4, marginBottom: 16,
  },
  btnResetTxt: { fontSize: 14, color: '#e53935', fontWeight: '600' },
});
