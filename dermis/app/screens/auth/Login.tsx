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
  const { loginAndSetStatus } = useUser();
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
  
        // 🔍 Check if user has a routine
        try {
          const routineResponse = await fetch(
            `https://o1f915v3gh.execute-api.us-east-1.amazonaws.com/default/routines?user_id=${result.user_id}`
          );
  
          if (routineResponse.ok) {
            console.log('🎯 Rutina encontrada');
            await loginAndSetStatus(result.user_id, true);
          } else if (routineResponse.status === 404) {
            console.log('🕵️‍♀️ Rutina no encontrada');
            await loginAndSetStatus(result.user_id, false);
          } else {
            console.warn('⚠️ Error inesperado al verificar rutina');
            await loginAndSetStatus(result.user_id, false);
          }
        } catch (routineError) {
          console.error('❌ Error al consultar rutina:', routineError);
          await loginAndSetStatus(result.user_id, false); // fallback
        }
  
      } else {
        Alert.alert('❌ Error', result.error || 'Credenciales incorrectas');
      }
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
        source={require('../../../assets/circle_logo_pinkbg.png')}
        style={styles.logo}
        resizeMode="contain"
      />

      <Text style={styles.title}>Bienvenid@ de vuelta</Text>

      <Text style={styles.description}>
        Inicia sesión para continuar con el cuidado de tu piel.
      </Text>

      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <TextInput
            placeholder="Correo electrónico"
            placeholderTextColor="#a44230"
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
            value={formData.correo}
            onChangeText={(text) => handleChange('correo', text)}
          />
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            placeholder="Contraseña"
            placeholderTextColor="#a44230"
            secureTextEntry
            style={styles.input}
            value={formData.contrasena}
            onChangeText={(text) => handleChange('contrasena', text)}
          />
        </View>

        {/* Primary Action Button */}
        <TouchableOpacity onPress={handleSubmit} style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Iniciar sesión</Text>
        </TouchableOpacity>

        {/* Secondary Action */}
        <View style={styles.registerSection}>
          <Text style={styles.registerPrompt}>¿No tienes cuenta?</Text>
          <TouchableOpacity onPress={goToRegister} style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Regístrate</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#ffece0',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    minHeight: '100%',
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
    marginTop: 20,
    alignSelf: 'center',
  },
  title: {
    color: '#d5582b',
    fontSize: 28,
    textAlign: 'center',
    marginBottom: 12,
    fontWeight: 'bold',
  },
  description: {
    color: '#a44230',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 22,
    width: '90%',
  },
  form: {
    width: '100%',
    alignItems: 'center',
  },
  inputContainer: {
    width: '90%',
    maxWidth: 320,
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#ffffff',
    borderColor: '#e0e0e0',
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    fontSize: 16,
    width: '100%',
    color: '#333333',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  primaryButton: {
    backgroundColor: '#d5582b',
    borderRadius: 30,
    paddingVertical: 16,
    paddingHorizontal: 32,
    width: '90%',
    maxWidth: 320,
    marginTop: 8,
    marginBottom: 16,
    shadowColor: '#d5582b',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 18,
    textAlign: 'center',
    fontWeight: '600',
  },
  registerSection: {
    alignItems: 'center',
    marginTop: 16,
  },
  registerPrompt: {
    color: '#666666',
    fontSize: 16,
  },
  secondaryButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  secondaryButtonText: {
    color: '#a44230',
    fontSize: 16,
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
});

export default Login;