import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { UserProvider } from '../context/UserContext';

import { getNavigationState, saveNavigationState } from '../services/navigationState';
import FR_efficient_net from '../FR_efficient_net'; // Ajusta la ruta
import FR_cnn from '../FR_cnn';
import AnalysisResults from '../AnalysisResults';
import SkinSensitive from '../SkinSensitive';
import { RootStackParamList } from './_types';

// Tipado para TypeScript
// type RootStackParamList = {
//   FR_efficient_net: { _user_id: string };
//   FR_cnn: undefined;
//   // Agrega otras pantallas aquí...
// };

const Stack = createNativeStackNavigator<RootStackParamList>();
export function MyStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="FR_efficient_net" 
        component={FR_efficient_net}
        options={{ title: 'Foto Frontal' }}
      />
      <Stack.Screen 
        name="FR_cnn"  
        component={FR_cnn}
        options={{ title: 'Foto Lateral' }}
      />
      <Stack.Screen 
        name="AnalysisResults"  
        component={AnalysisResults}
        options={{ title: 'Foto Lateral' }}
      />
      <Stack.Screen 
        name="SkinSensitive"  
        component={SkinSensitive}
        options={{ title: 'Foto Lateral' }}
      />
    </Stack.Navigator>
  );
}