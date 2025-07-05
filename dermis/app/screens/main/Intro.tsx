import React from 'react';
import { View, StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/_types';

const Intro: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handleStart = () => {
    navigation.navigate('FR_efficient_net');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.headerContainer}>
        <Image
          source={require('../../../assets/logo_circle.png')}
          style={styles.logo}
        />
        <Text style={styles.headerTitle}>Analiza tu piel en 3 pasos</Text>
      </View>

      <View style={styles.descriptionContainer}>
        <Text style={styles.description}>
          Para poder recomendarte productos personalizados, necesitamos analizar tu piel.
          Este proceso es completamente privado y solo tomará un par de minutos.
        </Text>
      </View>

      <View style={styles.stepContainer}>
        <Text style={styles.stepTitle}>1. Foto frontal</Text>
        <Text style={styles.stepText}>
          Detectaremos condiciones visibles como acné, manchas o enrojecimiento a partir de una foto de tu rostro de frente.
        </Text>
      </View>

      <View style={styles.stepContainer}>
        <Text style={styles.stepTitle}>2. Foto lateral</Text>
        <Text style={styles.stepText}>
          Identificaremos tu tipo de piel cosmético (seca, grasa, mixta, etc.) usando una imagen lateral.
        </Text>
      </View>

      <View style={styles.stepContainer}>
        <Text style={styles.stepTitle}>3. Pregunta rápida</Text>
        <Text style={styles.stepText}>
          Te preguntaremos si tienes piel sensible. ¡Solo debes responder sí o no!
        </Text>
      </View>

      <TouchableOpacity style={styles.startButton} onPress={handleStart}>
        <Text style={styles.startButtonText}>Empezar análisis</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingVertical: 40,
    backgroundColor: '#ffffff',
    flexGrow: 1,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    width: 90,
    height: 90,
    borderRadius: 45,
    marginBottom: 15,
    marginTop: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#d5582b',
    textAlign: 'center',
  },
  descriptionContainer: {
    backgroundColor: '#ffece0',
    borderRadius: 15,
    padding: 20,
    marginBottom: 25,
  },
  description: {
    fontSize: 16,
    color: '#a44230',
    lineHeight: 22,
    textAlign: 'center',
  },
  stepContainer: {
    backgroundColor: '#fff7f2',
    borderLeftWidth: 4,
    borderLeftColor: '#d5582b',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 15,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#a44230',
    marginBottom: 6,
  },
  stepText: {
    fontSize: 15,
    color: '#664234',
    lineHeight: 20,
  },
  startButton: {
    backgroundColor: '#a44230',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 30,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Intro;
