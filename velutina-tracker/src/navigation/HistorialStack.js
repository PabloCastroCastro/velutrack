import { createStackNavigator } from '@react-navigation/stack';
import HistorialScreen from '../screens/HistorialScreen';
import DetalleSesionScreen from '../screens/DetalleSesionScreen';

const Stack = createStackNavigator();

const HEADER = {
  headerStyle: { backgroundColor: '#e8820c' },
  headerTintColor: '#fff',
  headerTitleStyle: { fontWeight: 'bold' },
};

export default function HistorialStack() {
  return (
    <Stack.Navigator screenOptions={HEADER}>
      <Stack.Screen name="HistorialLista" component={HistorialScreen} options={{ title: 'Historial' }} />
      <Stack.Screen
        name="DetalleSesion"
        component={DetalleSesionScreen}
        options={({ route }) => ({ title: route.params.puntoNombre })}
      />
    </Stack.Navigator>
  );
}
