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
  });

  const handleChange = (name: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        name: formData.nombre,
        email: formData.correo,
        age: parseInt(formData.edad, 10),
        nick_name: formData.nickname,
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
        source={require('../../../assets/logo_yes.png')}
        style={styles.logo}
        resizeMode="contain"
      />

      <Text style={styles.description}>
        Para pertenecer a la comunidad Dermis, por favor regístrate y prepárate para cuidar tu piel
      </Text>

      <View style={styles.form}>
        <TextInput
          placeholder="Nombre"
          placeholderTextColor="#6b0d29"
          style={styles.input}
          value={formData.nombre}
          onChangeText={(text) => handleChange('nombre', text)}
        />
        <TextInput
          placeholder="Apodo favorito"
          placeholderTextColor="#6b0d29"
          style={styles.input}
          value={formData.nickname}
          onChangeText={(text) => handleChange('nickname', text)}
        />
        <TextInput
          placeholder="Edad"
          placeholderTextColor="#6b0d29"
          keyboardType="numeric"
          style={styles.input}
          value={formData.edad}
          onChangeText={(text) => handleChange('edad', text)}
        />
        <TextInput
          placeholder="Correo"
          placeholderTextColor="#6b0d29"
          keyboardType="email-address"
          style={styles.input}
          value={formData.correo}
          onChangeText={(text) => handleChange('correo', text)}
        />
        <TextInput
          placeholder="Contraseña"
          placeholderTextColor="#6b0d29"
          secureTextEntry
          style={styles.input}
          // value={formData.contrasena}
          // onChangeText={(text) => handleChange('contrasena', text)}
        />


      <Button 
          mode="contained" 
          style={styles.registerButton}
          labelStyle={styles.registerButtonText}
          onPress={handleSubmit}
        >
          Registrarme
      </Button>

        {/* Login Option */}
        <View style={styles.loginSection}>
          <Text style={styles.loginPrompt}>¿Ya tienes cuenta?</Text>
          <TouchableOpacity onPress={goToLogin}>
            <Text style={styles.loginLink}>Inicia sesión aquí</Text>
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
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 12,
  },
  description: {
    color: '#6b0d29',
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
    backgroundColor: '#ffe6e1',
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
  registerButton: {
    backgroundColor: '#a44230',
    borderRadius: 30,
    paddingVertical: 8,
    elevation: 3,
    width: '85%',
    maxWidth: 280,
    alignItems: 'center',
    marginTop: 10,
  },
  registerButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  loginSection: {
    marginTop: 30,
    alignItems: 'center',
  },
  loginPrompt: {
    color: '#6b0d29',
    fontSize: 14,
    marginBottom: 8,
  },
  loginLink: {
    color: '#a44230',
    fontSize: 16,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
});

export default Register;