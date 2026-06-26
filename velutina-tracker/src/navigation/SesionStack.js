import { createStackNavigator } from '@react-navigation/stack';
import PuntosCapturaScreen from '../screens/PuntosCapturaScreen';
import DetallePuntoScreen from '../screens/DetallePuntoScreen';

const Stack = createStackNavigator();

const HEADER = {
  headerStyle: { backgroundColor: '#e8820c' },
  headerTintColor: '#fff',
  headerTitleStyle: { fontWeight: 'bold' },
};

export default function SesionStack() {
  return (
    <Stack.Navigator screenOptions={HEADER}>
      <Stack.Screen
        name="PuntosCaptura"
        component={PuntosCapturaScreen}
        options={{ title: 'Puntos de captura' }}
      />
      <Stack.Screen
        name="DetallePunto"
        component={DetallePuntoScreen}
        options={({ route }) => ({ title: route.params.punto.nombre })}
      />
    </Stack.Navigator>
  );
}
