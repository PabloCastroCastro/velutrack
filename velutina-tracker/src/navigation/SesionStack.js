import { createStackNavigator } from '@react-navigation/stack';
import PuntosCapturaScreen from '../screens/PuntosCapturaScreen';
import DetallePuntoScreen from '../screens/DetallePuntoScreen';
import SesionInicioScreen from '../screens/SesionInicioScreen';
import SesionActivaScreen from '../screens/SesionActivaScreen';

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
      <Stack.Screen
        name="SesionInicio"
        component={SesionInicioScreen}
        options={{ title: 'Nueva sesión' }}
      />
      <Stack.Screen
        name="SesionActiva"
        component={SesionActivaScreen}
        options={{ title: 'Sesión activa', headerLeft: null }}
      />
    </Stack.Navigator>
  );
}
