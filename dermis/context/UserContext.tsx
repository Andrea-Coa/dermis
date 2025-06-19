import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 1. Define the type
type UserContextType = {
  userId: string | null;
  setUserId: (id: string | null) => void;
  hasCompletedOnboarding: boolean;
  setHasCompletedOnboarding: (value: boolean) => void;
};

// 2. Create context with default dummy values
const UserContext = createContext<UserContextType>({
  userId: null,
  setUserId: () => {},
  hasCompletedOnboarding: false,
  setHasCompletedOnboarding: () => {},
});

export const useUser = () => useContext(UserContext);


export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userId, setUserId] = useState<string | null>(null);
  const [hasCompletedOnboarding, setHasCompletedOnboardingState] = useState(false);

  useEffect(() => {
    const loadUserData = async () => {
      const id = await AsyncStorage.getItem('user_id');
      const onboarding = await AsyncStorage.getItem('has_completed_onboarding');
      setUserId(id);
      setHasCompletedOnboardingState(onboarding === 'true');
    };
    loadUserData();
  }, []);

  const setHasCompletedOnboarding = async (value: boolean) => {
    setHasCompletedOnboardingState(value);
    await AsyncStorage.setItem('has_completed_onboarding', value.toString());
  };

  return (
    <UserContext.Provider value={{ userId, setUserId, hasCompletedOnboarding, setHasCompletedOnboarding }}>
      {children}
    </UserContext.Provider>
  );
};