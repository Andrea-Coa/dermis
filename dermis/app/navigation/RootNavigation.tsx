// RootNavigation.tsx
import React from 'react';
import { useUser } from '../../context/UserContext'; // Adjust path as needed
import { NavigationContainer } from '@react-navigation/native';


// Import your navigation components here

import AppStack from './AppStack';
import AuthStack from './AuthStack';

export default function RootNavigation() {
  const { userId } = useUser();
  
  // Your navigation logic here
  return (
    // Your navigation components
    <NavigationContainer>
    {userId ? <AppStack /> : <AuthStack />}
  </NavigationContainer>
  );
}