import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Register from '../screens/auth/Register';
import Login from '../screens/auth/Login'; // Import your Login component

const Stack = createNativeStackNavigator();

export default function AuthStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false, // Hide headers for a cleaner auth flow
      }}
      initialRouteName="Register" // You can change this to "Login" if you prefer
    >
      <Stack.Screen name="Register" component={Register} />
      <Stack.Screen name="Login" component={Login} />
    </Stack.Navigator>
  );
}