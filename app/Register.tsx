// screens/Register.jsx o .tsx si usas TypeScript
import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Button, Alert, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from './navigation/types';

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

  const handleSubmit = () => {
    Alert.alert('Formulario enviado (simulación)');
    // En producción, podrías enviar datos al backend aquí
  };

  const handleTestButton = () => {
    navigation.navigate('FacialRecognition'); // Asegúrate de que la ruta exista
  };

  return (
    <View style={styles.container}>
      {/* Logo (simple SVG reemplazado por texto) */}
      <Text style={styles.logo}>🌿 DERMIS</Text>

      <Text style={styles.title}>Bienvenid@ a Dermis</Text>
      <Text style={styles.subtitle}>
        Para pertenecer a la comunidad Dermis, completa los siguientes datos:
      </Text>

      <View style={styles.form}>
        <TextInput
          placeholder="Tu nombre completo"
          style={styles.input}
          value={formData.nombre}
          onChangeText={(text) => handleChange('nombre', text)}
        />
        <TextInput
          placeholder="Cómo quieres que te llamemos"
          style={styles.input}
          value={formData.nickname}
          onChangeText={(text) => handleChange('nickname', text)}
        />
        <TextInput
          placeholder="Tu edad"
          keyboardType="numeric"
          style={styles.input}
          value={formData.edad}
          onChangeText={(text) => handleChange('edad', text)}
        />
        <TextInput
          placeholder="tu@correo.com"
          keyboardType="email-address"
          style={styles.input}
          value={formData.correo}
          onChangeText={(text) => handleChange('correo', text)}
        />

        <Button
          title="Unirse a la comunidad (próximamente)"
          onPress={handleSubmit}
          disabled
          color="#ff9999"
        />

        <View style={{ height: 16 }} />

        <Button title="Ir a Análisis (Modo Prueba)" onPress={handleTestButton} color="#f59e0b" />
      </View>

      <TouchableOpacity onPress={() => navigation.navigate('Intro')}>
        <Text style={styles.loginLink}>¿Ya tienes cuenta? Inicia sesión</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fffaf0',
    justifyContent: 'center',
  },
  logo: {
    fontSize: 48,
    fontWeight: 'bold',
    alignSelf: 'center',
    marginBottom: 16,
    color: '#ff8a7a',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#9f1239',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#b91c1c',
    textAlign: 'center',
    marginBottom: 16,
  },
  form: {
    backgroundColor: '#fff0f0',
    borderRadius: 12,
    padding: 20,
    elevation: 4,
  },
  input: {
    borderColor: '#fca5a5',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#fff5f5',
  },
  loginLink: {
    marginTop: 20,
    color: '#db2777',
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
});

export default Register;
