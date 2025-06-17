import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { MyStack } from './navigation'; // ajusta si es otra ruta
import { UserProvider } from './context/UserContext'; // ajusta la ruta

export default function App() {
  return (
    <UserProvider>
      <NavigationContainer>
        <MyStack />
      </NavigationContainer>
    </UserProvider>
  );
}