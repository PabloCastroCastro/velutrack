import { View, Text, StyleSheet } from 'react-native';

export default function AnalisisScreen() {
  return (
    <View style={styles.container}>
      <Text>Análisis</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
