import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = '@velutrack:ajustes';

export const DEFAULT_AJUSTES = {
  velocidadMpm: 500,
  radioCluster: 200,
  anguloTolerancia: 30,
};

export async function getAjustes() {
  const json = await AsyncStorage.getItem(KEY);
  return json ? { ...DEFAULT_AJUSTES, ...JSON.parse(json) } : { ...DEFAULT_AJUSTES };
}

export async function saveAjustes(ajustes) {
  await AsyncStorage.setItem(KEY, JSON.stringify(ajustes));
}
