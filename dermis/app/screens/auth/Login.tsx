import React, { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUser } from '../../../context/UserContext';
import {Button} from 'react-native-paper';


import {
  View,
  Text,
  Alert,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/_types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

const Login = () => {
  const navigation = useNavigation<NavigationProp>();
  const { setUserId } = useUser();
  const [formData, setFormData] = useState({
    correo: '',
    contrasena: '',
  });

  const handleChange = (name: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        email: formData.correo,
        password: formData.contrasena,
      };

      // --- REAL RESPONSE BELOW ---
      // Replace with your actual login endpoint
      const response = await fetch('https://70i447ofic.execute-api.us-east-1.amazonaws.com/login_users_dermis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      console.log('Respuesta completa:', response);
      console.log('Cuerpo:', result);

      if (response.ok) {
        Alert.alert('✅ ¡Bienvenid@ de vuelta!');
        await AsyncStorage.setItem('user_id', result.user_id);
        setUserId(result.user_id);
        // navigation.navigate('FR_efficient_net', { _user_id: result.user_id });
      } else {
        Alert.alert('❌ Error', result.error || 'Credenciales incorrectas');
      }

      // --- MOCKED RESPONSE BELOW ---
      /*
      const result = {
        user_id: 'mock-user-123',
      };

      console.log('Respuesta simulada:', result);

      Alert.alert('✅ ¡Bienvenid@ de vuelta!');
      await AsyncStorage.setItem('user_id', result.user_id);
      setUserId(result.user_id);
      // navigation.navigate('FR_efficient_net', { _user_id: result.user_id });
      */
    } catch (err) {
      if (err instanceof Error) {
        Alert.alert('❌ Error de red', err.message);
      } else {
        Alert.alert('❌ Error desconocido', JSON.stringify(err));
      }
    }
  };

  const goToRegister = () => {
    navigation.replace('Register');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Logo */}
      <Image
        source={require('../../../assets/logo_yes.png')}
        style={styles.logo}
        resizeMode="contain"
      />

      <Text style={styles.description}>
        ¡Qué bueno verte de nuevo! Inicia sesión para continuar cuidando tu piel
      </Text>

      <View style={styles.form}>
        <TextInput
          placeholder="Correo"
          placeholderTextColor="#6b0d29"
          keyboardType="email-address"
          autoCapitalize="none"
          style={styles.input}
          value={formData.correo}
          onChangeText={(text) => handleChange('correo', text)}
        />
        <TextInput
          placeholder="Contraseña"
          placeholderTextColor="#6b0d29"
          secureTextEntry
          style={styles.input}
          value={formData.contrasena}
          onChangeText={(text) => handleChange('contrasena', text)}
        />
      <Button 
          mode="contained" 
          style={styles.loginButton}
          labelStyle={styles.loginButtonText}
          onPress={handleSubmit}
        >
          Iniciar sesión
      </Button>

        {/* Register Option */}
        <View style={styles.registerSection}>
          <Text style={styles.registerPrompt}>¿No tienes cuenta?</Text>
          <TouchableOpacity onPress={goToRegister}>
            <Text style={styles.registerLink}>Regístrate aquí</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#ffece0', // durazno claro
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 12,
  },
  description: {
    color: '#6b0d29', // rojo vino oscuro
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  form: {
    width: '100%',
    alignItems: 'center',
    gap: 12,
  },
  input: {
    backgroundColor: '#ffe6e1', // rosado claro
    borderColor: '#cc5533',
    borderWidth: 2,
    borderRadius: 24,
    paddingVertical: 10,
    paddingHorizontal: 20,
    fontSize: 16,
    width: '85%',
    maxWidth: 280,
    color: '#6b0d29',
    marginBottom: 10,
  },
  loginButton: {
    backgroundColor: '#a44230',
    borderRadius: 30,
    paddingVertical: 8,
    elevation: 3,
    width: '85%',
    maxWidth: 280,
    alignItems: 'center',
    marginTop: 10,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  registerSection: {
    marginTop: 30,
    alignItems: 'center',
  },
  registerPrompt: {
    color: '#6b0d29',
    fontSize: 14,
    marginBottom: 8,
  },
  registerLink: {
    color: '#a44230',
    fontSize: 16,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
});

export default Login;