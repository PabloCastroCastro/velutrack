import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import MapaScreen from './src/screens/MapaScreen';
import SesionStack from './src/navigation/SesionStack';
import HistorialStack from './src/navigation/HistorialStack';
import NidosStack from './src/navigation/NidosStack';
import AnalisisScreen from './src/screens/AnalisisScreen';

const Tab = createBottomTabNavigator();

const TAB_ICONS = {
  Mapa: 'map',
  Sesión: 'radio-button-on',
  Historial: 'list',
  Nidos: 'home',
  Análisis: 'stats-chart',
};

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => (
              <Ionicons
                name={focused ? TAB_ICONS[route.name] : `${TAB_ICONS[route.name]}-outline`}
                size={size}
                color={color}
              />
            ),
            tabBarActiveTintColor: '#e8820c',
            tabBarInactiveTintColor: '#888',
            headerStyle: { backgroundColor: '#e8820c' },
            headerTintColor: '#fff',
            headerTitleStyle: { fontWeight: 'bold' },
          })}
        >
          <Tab.Screen name="Mapa" component={MapaScreen} />
          <Tab.Screen name="Nidos" component={NidosStack} options={{ headerShown: false }} />
          <Tab.Screen name="Sesión" component={SesionStack} options={{ headerShown: false }} />
          <Tab.Screen name="Historial" component={HistorialStack} options={{ headerShown: false }} />
          <Tab.Screen name="Análisis" component={AnalisisScreen} />
        </Tab.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}
