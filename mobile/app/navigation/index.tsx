import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { UserProvider } from '../context/UserContext';

import { getNavigationState, saveNavigationState } from '../services/navigationState';
import FR_efficient_net from '../FR_efficient_net'; // Ajusta la ruta
import FR_cnn from '../FR_cnn';
// Tipado para TypeScript
type RootStackParamList = {
  FR_efficient_net: { _user_id: string };
  FR_cnn: undefined;
  // Agrega otras pantallas aquí...
};

const Stack = createNativeStackNavigator<RootStackParamList>();
export function MyStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="FR_efficient_net" 
        component={FR_efficient_net} 
      />
      <Stack.Screen 
        name="FR_cnn"  
        component={FR_cnn} 
      />
    </Stack.Navigator>
  );
}