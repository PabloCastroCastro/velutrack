import { createStackNavigator } from '@react-navigation/stack';
import NidosListaScreen from '../screens/NidosListaScreen';
import NidoRegistrarScreen from '../screens/NidoRegistrarScreen';
import NidoDetalleScreen from '../screens/NidoDetalleScreen';

const Stack = createStackNavigator();

const HEADER = {
  headerStyle: { backgroundColor: '#e8820c' },
  headerTintColor: '#fff',
  headerTitleStyle: { fontWeight: 'bold' },
};

export default function NidosStack() {
  return (
    <Stack.Navigator screenOptions={HEADER}>
      <Stack.Screen name="NidosLista" component={NidosListaScreen} options={{ title: 'Nidos' }} />
      <Stack.Screen name="NidoRegistrar" component={NidoRegistrarScreen} options={{ title: 'Registrar nido' }} />
      <Stack.Screen
        name="NidoDetalle"
        component={NidoDetalleScreen}
        options={({ route }) => ({
          title: new Date(route.params.nido.fechaLocalizacion).toLocaleDateString('es-ES', {
            day: 'numeric', month: 'short', year: 'numeric',
          }),
        })}
      />
    </Stack.Navigator>
  );
}
