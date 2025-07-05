import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type UserContextType = {
  userId: string | null;
  setUserId: (id: string | null) => void;
  hasCompletedOnboarding: boolean;
  setHasCompletedOnboarding: (value: boolean) => void;
  loginAndSetStatus: (id: string, onboardingStatus: boolean) => Promise<void>;
};

const UserContext = createContext<UserContextType>({
  userId: null,
  setUserId: () => {},
  hasCompletedOnboarding: false,
  setHasCompletedOnboarding: () => {},
  loginAndSetStatus: async () => {},
});

export const useUser = () => useContext(UserContext);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userId, setUserIdState] = useState<string | null>(null);
  const [hasCompletedOnboarding, setHasCompletedOnboardingState] = useState(false);

  useEffect(() => {
    const loadUserData = async () => {
      const id = await AsyncStorage.getItem('user_id');
      const onboarding = await AsyncStorage.getItem('has_completed_onboarding');
      setUserIdState(id);
      setHasCompletedOnboardingState(onboarding === 'true');
    };
    loadUserData();
  }, []);

  const setUserId = async (id: string | null) => {
    setUserIdState(id);
    if (id) {
      await AsyncStorage.setItem('user_id', id);
    } else {
      await AsyncStorage.removeItem('user_id');
    }
  };

  const setHasCompletedOnboarding = async (value: boolean) => {
    setHasCompletedOnboardingState(value);
    await AsyncStorage.setItem('has_completed_onboarding', value.toString());
  };

  // 🔐 Atomic setter for login state
  const loginAndSetStatus = async (id: string, onboardingStatus: boolean) => {
    await AsyncStorage.multiSet([
      ['user_id', id],
      ['has_completed_onboarding', onboardingStatus.toString()],
    ]);
    setUserIdState(id);
    setHasCompletedOnboardingState(onboardingStatus);
  };

  return (
    <UserContext.Provider
      value={{
        userId,
        setUserId,
        hasCompletedOnboarding,
        setHasCompletedOnboarding,
        loginAndSetStatus,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
