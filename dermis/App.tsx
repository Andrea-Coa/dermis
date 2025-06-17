import React from 'react';
import { UserProvider } from './context/UserContext';
import { PaperProvider } from 'react-native-paper';
import RootNavigation from './app/navigation/RootNavigation';

export default function App() {
  return (
    <PaperProvider>
      <UserProvider>
        <RootNavigation />
      </UserProvider>
    </PaperProvider>
  );
}