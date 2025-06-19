import React from 'react';
import { useUser } from '../../context/UserContext';
import { NavigationContainer } from '@react-navigation/native';

import AuthStack from './AuthStack';
import OnboardingStack from './OnboardingStack' // <-- Create this
import MainAppStack from './MainAppStack';       // <-- Create this

export default function RootNavigation() {
  const { userId, hasCompletedOnboarding } = useUser();

  return (
  <NavigationContainer>
    {!userId ? (
      <AuthStack />
    ) : !hasCompletedOnboarding ? (
      <OnboardingStack />
    ) : (
      <MainAppStack /> // Now includes the drawer!
    )}
  </NavigationContainer>
  );
}
