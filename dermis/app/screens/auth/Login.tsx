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
        source={require('../../../assets/logo_yes.png')}
        style={styles.logo}
        resizeMode="contain"
      />

      <Text style={styles.description}>
        ¡ Qué bueno verte de nuevo !            
        Inicia sesión para continuar con el cuidado tu piel
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
      <View style={styles.loginSection}>
          <TouchableOpacity onPress={handleSubmit}>
            <Text style={styles.loginLink}>Iniciar sesión</Text>
          </TouchableOpacity>
        </View>

        {/* Register Option */}
     <View>
    <TouchableOpacity onPress={goToRegister}>
      <View style={styles.registerTextContainer}>
        <Text style={styles.registerPrompt}>¿No tienes cuenta?</Text>
        <Text style={styles.registerLink}>Regístrate</Text>
      </View>
    </TouchableOpacity>
  </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1, // Cambiado de flexGrow a flex
    backgroundColor: '#ffdac5',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,// Añadido para posicionamiento absoluto de hijos
  },
  logo: {
    width: 260,
    height: 260,
    marginBottom: 12,
  },
  description: {
    color: '#d5582b',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    lineHeight: 24,
    width: '95%',
  },
  form: {
    width: '100%',
    alignItems: 'center',
    gap: 10,
    marginBottom: 60, // Espacio para el botón de registro
  },
  input: {
    backgroundColor: '#fbcec4',
    borderColor: '#d5582b',
    borderWidth: 4,
    borderRadius: 15,
    paddingVertical: 10,
    paddingHorizontal: 20,
    fontSize: 18,
    fontWeight: 'bold',
    width: '85%',
    maxWidth: 265,
    color: '#6b0d29',
    marginBottom: 8,
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
  // ESTILOS CORREGIDOS PARA EL REGISTRO (parte inferior derecha)
  
  registerTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  registerPrompt: {
    color: '#6b0d29',
    fontSize: 16, // Aumentado ligeramente
    marginRight: 4,
  },
  registerLink: {
    color: '#a44230',
    fontSize: 16, // Aumentado ligeramente
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  // (Mantén los otros estilos que no han cambiado)
  loginSection: {
    marginTop: 20,
    alignItems: 'center',
  },
  loginLink: {
    color: '#d5582b',
    fontSize: 20,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
});
export default Login;