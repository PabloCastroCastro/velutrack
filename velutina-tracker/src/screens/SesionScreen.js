import { View, Text, StyleSheet } from 'react-native';

export default function SesionScreen() {
  return (
    <View style={styles.container}>
      <Text>Sesión activa</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
