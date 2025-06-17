import React, { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
import { RootStackParamList } from './navigation/_types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Intro'>;

const Register = () => {
  const navigation = useNavigation<NavigationProp>();
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
      const payload ={
        name:formData.nombre,
        email:formData.correo,
        age:parseInt(formData.edad,10),
        nick_name:formData.nickname,
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
          await AsyncStorage.setItem('user_id', result.user_id); // Acceso global :3
          navigation.navigate('FR_efficient_net', { _user_id: result.user_id });
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
      await AsyncStorage.setItem('user_id', result.user_id); // Acceso global :3
      navigation.navigate('FR_efficient_net', { _user_id: result.user_id });
*/
    }catch (err) {
  if (err instanceof Error) {
    Alert.alert('❌ Error de red', err.message);
  } else {
    Alert.alert('❌ Error desconocido', JSON.stringify(err));
  }
}

  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Logo - reemplaza por tu imagen real si tienes */}
      <Image
        source={require('../assets/logo_yes.png')} // <-- cambia a tu path real
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

        <TouchableOpacity onPress={handleSubmit} style={styles.registerButton}>
          <Text style={styles.registerButtonText}>Registrarme</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#ffece0', // durazno claro
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
    paddingVertical:10,
    paddingHorizontal:20,
    
    fontSize: 16,
    width:'85%',
    maxWidth: 280,
    color: '#6b0d29',
    marginBottom: 10,
  },
  registerButton: {
    alignSelf: 'flex-end',
    marginTop: 10,
    marginRight: 20
  },
  registerButtonText: {
    color: '#a44230',
    fontWeight: 'bold',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
});

export default Register;
