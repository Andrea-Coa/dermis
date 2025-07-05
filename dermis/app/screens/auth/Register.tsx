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

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Register'>;

const Register = () => {
  const navigation = useNavigation<NavigationProp>();
  const { userId, setUserId } = useUser();
  const [formData, setFormData] = useState({
    nombre: '',
    nickname: '',
    edad: '',
    correo: '',
    contrasena: '',
  });
  
  const [errors, setErrors] = useState({
    nombre: '',
    nickname: '',
    edad: '',
    correo: '',
    contrasena: '',
  });

  const validateField = (name: keyof typeof formData, value: string) => {
    let error = '';
    
    switch (name) {
      case 'nombre':
        if (value.length > 0 && value.length < 2) {
          error = 'El nombre debe tener al menos 2 caracteres';
        }
        break;
      case 'nickname':
        if (value.length > 0 && value.length < 2) {
          error = 'El apodo debe tener al menos 2 caracteres';
        }
        break;
      case 'edad':
        if (value.length > 0) {
          const age = parseInt(value, 10);
          if (isNaN(age) || age < 14 || age > 120) {
            error = 'La edad debe estar entre 14 y 120 años';
          }
        }
        break;
      case 'correo':
        if (value.length > 0) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) {
            error = 'Ingresa un correo electrónico válido';
          }
        }
        break;
      case 'contrasena':
        if (value.length > 0 && value.length < 6) {
          error = 'La contraseña debe tener al menos 6 caracteres';
        }
        break;
    }
    
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleChange = (name: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        name: formData.nombre,
        email: formData.correo,
        age: parseInt(formData.edad, 10),
        nick_name: formData.nickname,
        password: formData.contrasena,
      };

      // --- REAL RESPONSE BELOW ---
      const response = await fetch('https://70i447ofic.execute-api.us-east-1.amazonaws.com/register_users_dermis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      console.log('Respuesta completa:', response);
      console.log('Cuerpo:', result);

      if (response.ok) {
        Alert.alert('✅ YES! Bienvenid@');
        await AsyncStorage.setItem('user_id', result.user_id);
        setUserId(result.user_id);
        // navigation.navigate('FR_efficient_net', { _user_id: result.user_id });
      } else {
        Alert.alert('❌ Error', result.error || 'Algo salió mal');
      }

      // --- MOCKED RESPONSE BELOW ---
      /*
      const result = {
        user_id: 'mock-user-123',
      };

      console.log('Respuesta simulada:', result);

      Alert.alert('✅ YES! Bienvenid@');
      await AsyncStorage.setItem('user_id', result.user_id);
      navigation.navigate('FR_efficient_net', { _user_id: result.user_id });
      */
    } catch (err) {
      if (err instanceof Error) {
        Alert.alert('❌ Error de red', err.message);
      } else {
        Alert.alert('❌ Error desconocido', JSON.stringify(err));
      }
    }
  };

  const goToLogin = () => {
    navigation.replace('Login');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Logo */}
      <Image
        source={require('../../../assets/circle_logo_pinkbg.png')}
        style={styles.logo}
        resizeMode="contain"
      />

      <Text style={styles.title}>Únete a Dermis</Text>

      <Text style={styles.description}>
        Regístrate y empieza a cuidar tu piel con nuestra comunidad.
      </Text>

      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <TextInput
            placeholder="Nombre completo"
            placeholderTextColor="#a44230"
            style={[styles.input, errors.nombre ? styles.inputError : null]}
            value={formData.nombre}
            onChangeText={(text) => handleChange('nombre', text)}
          />
          {errors.nombre ? <Text style={styles.errorText}>{errors.nombre}</Text> : null}
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            placeholder="Apodo favorito"
            placeholderTextColor="#a44230"
            style={[styles.input, errors.nickname ? styles.inputError : null]}
            value={formData.nickname}
            onChangeText={(text) => handleChange('nickname', text)}
          />
          {errors.nickname ? <Text style={styles.errorText}>{errors.nickname}</Text> : null}
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            placeholder="Edad"
            placeholderTextColor="#a44230"
            keyboardType="numeric"
            style={[styles.input, errors.edad ? styles.inputError : null]}
            value={formData.edad}
            onChangeText={(text) => handleChange('edad', text)}
          />
          {errors.edad ? <Text style={styles.errorText}>{errors.edad}</Text> : null}
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            placeholder="Correo electrónico"
            placeholderTextColor="#a44230"
            keyboardType="email-address"
            style={[styles.input, errors.correo ? styles.inputError : null]}
            value={formData.correo}
            onChangeText={(text) => handleChange('correo', text)}
          />
          {errors.correo ? <Text style={styles.errorText}>{errors.correo}</Text> : null}
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            placeholder="Contraseña"
            placeholderTextColor="#a44230"
            secureTextEntry
            style={[styles.input, errors.contrasena ? styles.inputError : null]}
            value={formData.contrasena}
            onChangeText={(text) => handleChange('contrasena', text)}
          />
          {errors.contrasena ? <Text style={styles.errorText}>{errors.contrasena}</Text> : null}
        </View>

        {/* Primary Action Button */}
        <TouchableOpacity onPress={handleSubmit} style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Crear cuenta</Text>
        </TouchableOpacity>

        {/* Secondary Action */}
        <View style={styles.loginSection}>
          <Text style={styles.loginPrompt}>¿Ya tienes una cuenta?</Text>
          <TouchableOpacity onPress={goToLogin} style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Iniciar sesión</Text>
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
    justifyContent: 'flex-start',
    padding: 24,
    paddingTop: 40,
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
    marginBottom: 8,
    fontWeight: 'bold',
  },
  description: {
    color: '#a44230',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
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
  inputError: {
    borderColor: '#ff4444',
    borderWidth: 2,
  },
  errorText: {
    color: '#ff4444',
    fontSize: 14,
    marginTop: 4,
    marginLeft: 4,
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
  loginSection: {
    alignItems: 'center',
    marginTop: 16,
  },
  loginPrompt: {
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

export default Register;