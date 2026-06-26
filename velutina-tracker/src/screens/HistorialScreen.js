import { View, Text, StyleSheet } from 'react-native';

export default function HistorialScreen() {
  return (
    <View style={styles.container}>
      <Text>Historial</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
