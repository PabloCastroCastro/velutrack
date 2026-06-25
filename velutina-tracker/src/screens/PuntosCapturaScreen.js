import { View, Text, StyleSheet } from 'react-native';

export default function PuntosCapturaScreen() {
  return (
    <View style={styles.container}>
      <Text>Puntos de captura</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
