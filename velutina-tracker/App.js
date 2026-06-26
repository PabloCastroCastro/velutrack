import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import MapaScreen from './src/screens/MapaScreen';
import SesionScreen from './src/screens/SesionScreen';
import HistorialScreen from './src/screens/HistorialScreen';
import AnalisisScreen from './src/screens/AnalisisScreen';

const Tab = createBottomTabNavigator();

const TAB_ICONS = {
  Mapa: 'map',
  Sesión: 'radio-button-on',
  Historial: 'list',
  Análisis: 'stats-chart',
};

export default function App() {
  return (
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
        <Tab.Screen name="Sesión" component={SesionScreen} />
        <Tab.Screen name="Historial" component={HistorialScreen} />
        <Tab.Screen name="Análisis" component={AnalisisScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
