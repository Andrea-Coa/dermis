// MainAppStack.tsx - Updated with Stack Navigator
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import SettingsScreen from '../screens/main/Settings';
import RoutineScreen from '../screens/main/Routine';
import ProfileScreen from '../screens/main/ProfileScreen';
import ProductDetailScreen from '../screens/main/ProductDetail';
import CustomDrawer from '../components/CustomDrawer';
import { SafeImagePickerAsset } from './_types';

// Type definitions
type Product = {
  id: number;
  title: string;
  description: string;
  image: SafeImagePickerAsset;
  step: string;
};

// Stack Navigator Types (includes all screens including modal-like screens)
export type MainStackParamList = {
  DrawerNavigator: undefined;
  ProductDetail: { product: Product };
};

// Drawer Navigator Types (only drawer screens)
export type DrawerParamList = {
  'My Routine': undefined;
  Profile: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<MainStackParamList>();
const Drawer = createDrawerNavigator<DrawerParamList>();

// Drawer Navigator Component (your existing drawer)
function DrawerNavigator() {
  return (
    <Drawer.Navigator
      initialRouteName="My Routine"
      drawerContent={(props) => <CustomDrawer {...props} />}
      screenOptions={{
        headerShown: true,
      }}
    >
      <Drawer.Screen name="My Routine" component={RoutineScreen} />
      <Drawer.Screen name="Profile" component={ProfileScreen} />
      <Drawer.Screen name="Settings" component={SettingsScreen} />
    </Drawer.Navigator>
  );
}

// Main Stack Navigator (wraps drawer + additional screens)
export default function MainAppStack() {
  return (
    <Stack.Navigator
      initialRouteName="DrawerNavigator"
      screenOptions={{
        headerShown: false, // Drawer handles its own headers
      }}
    >
      {/* Main app with drawer */}
      <Stack.Screen 
        name="DrawerNavigator" 
        component={DrawerNavigator} 
      />
      
      {/* Modal-like screens that don't appear in drawer */}
      <Stack.Screen 
        name="ProductDetail" 
        component={ProductDetailScreen}
        options={{
          headerShown: false, // ProductDetailScreen has its own header
          presentation: 'card', // You could use 'modal' for iOS modal presentation
        }}
      />
    </Stack.Navigator>
  );
}