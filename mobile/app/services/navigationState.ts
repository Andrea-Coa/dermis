import AsyncStorage from '@react-native-async-storage/async-storage';

const NAVIGATION_STATE_KEY = '@NAVIGATION_STATE';

export const saveNavigationState = async (currentRoute: string) => {
  try {
    await AsyncStorage.setItem(NAVIGATION_STATE_KEY, currentRoute);
  } catch (error) {
    console.error('Error saving navigation state:', error);
  }
};

export const getNavigationState = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(NAVIGATION_STATE_KEY);
  } catch (error) {
    console.error('Error getting navigation state:', error);
    return null;
  }
};

export const clearNavigationState = async () => {
  try {
    await AsyncStorage.removeItem(NAVIGATION_STATE_KEY);
  } catch (error) {
    console.error('Error clearing navigation state:', error);
  }
};