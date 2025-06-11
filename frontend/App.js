import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Pantallas
import Intro from './screens/IntroScreen';
import FacialRecScreen from './screens/FacialRecScreen';
import Register from './screens/Register';

// Componentes comunes
import Navbar from './components/Navbar';
import Footer from './components/Footer';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      {/* Puedes usar Navbar y Footer fuera del stack si son fijos */}
      <Navbar />

      <View style={styles.container}>
        <Stack.Navigator initialRouteName="Intro" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Intro" component={Intro} />
          <Stack.Screen name="Register" component={Register} />
          <Stack.Screen name="FacialRecognition" component={FacialRecScreen} />
          <Stack.Screen
            name="NotFound"
            component={() => (
              <View style={styles.notFound}>
                <Text style={styles.title}>404</Text>
                <Text style={styles.subtitle}>Página no encontrada</Text>
              </View>
            )}
          />
        </Stack.Navigator>
      </View>

      <Footer />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eef4ff', // Similar a tu fondo gradient en web
    paddingTop: 20,
    paddingBottom: 16,
  },
  notFound: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#6b21a8', // text-purple-800
  },
  subtitle: {
    fontSize: 18,
    color: '#4b5563', // text-gray-600
  },
});
