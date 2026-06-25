import { View, Text, StyleSheet } from 'react-native';

export default function NidosScreen() {
  return (
    <View style={styles.container}>
      <Text>Nidos encontrados</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
