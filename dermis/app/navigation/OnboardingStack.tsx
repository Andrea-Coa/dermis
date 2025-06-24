import { createNativeStackNavigator } from '@react-navigation/native-stack';
import FR_efficient_net from '../screens/main/FR_efficient_net';
import FR_cnn from '../screens/main/FR_cnn';
import SkinSensitive from '../screens/main/SkinSensitive';
import AnalysisResults from '../screens/main/AnalysisResults';
import { RootStackParamList } from './_types';
import Intro from '../screens/main/Intro';


const Stack = createNativeStackNavigator<RootStackParamList>();



export default function OnboardingStack() {
    return (
        <Stack.Navigator screenOptions={{headerShown: true}}>
          <Stack.Screen 
            name="Intro" 
            component={Intro}
            options={{ title: 'Creando tu rutina', headerShown: false }}
          />
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
              name="SkinSensitive"  
              component={SkinSensitive}
              options={{ title: 'Sensibilidad de la piel' }}
            />
          <Stack.Screen 
            name="AnalysisResults"  
            component={AnalysisResults}
            options={{ title: 'Resultados del análisis', headerShown:false }}
          />
        </Stack.Navigator>
      );
}
