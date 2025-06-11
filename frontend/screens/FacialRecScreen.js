import React, { useState, useEffect } from 'react';
import { View, Text, Button, Image, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

export default function SkinAnalyzer() {
  const [frontImage, setFrontImage] = useState(null);
  const [sideImage, setSideImage] = useState(null);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);

  // Solicitar permisos para acceder a la galería
  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permisos requeridos',
          'Necesitamos permiso para acceder a tus fotos para el análisis de piel.'
        );
      }
      setPermissionGranted(status === 'granted');
    })();
  }, []);

  const pickImage = async (setImageCallback) => {
    if (!permissionGranted) {
      Alert.alert(
        'Permiso denegado',
        'Por favor habilita los permisos en la configuración de tu dispositivo.'
      );
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImageCallback(result.assets[0]);
      }
    } catch (error) {
      console.error('Error al seleccionar imagen:', error);
      Alert.alert('Error', 'No se pudo seleccionar la imagen');
    }
  };

  const analyze = async () => {
    if (!frontImage || !sideImage) {
      Alert.alert('Faltan imágenes', 'Por favor selecciona ambas imágenes');
      return;
    }

    setLoading(true);
    setResults(null);

    try {
      // Usar HTTP en lugar de HTTPS para desarrollo local
      const [resEff, resCNN] = await Promise.all([
        fetch('http://10.100.229.211/api/analyze-skin/efficient-net', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: frontImage.base64 }),
        }).then(res => {
          if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
          return res.json();
        }),

        fetch('http://10.100.229.211/api/analyze-skin/cnn', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: sideImage.base64 }),
        }).then(res => {
          if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
          return res.json();
        }),
      ]);

      setResults({ eff: resEff, cnn: resCNN });
    } catch (error) {
      console.error('Error en el análisis:', error);
      setResults({ 
        error: `Hubo un error al analizar las imágenes: ${error.message || 'Por favor verifica tu conexión'}` 
      });
    } finally {
      setLoading(false);
    }
  };

  const resetAll = () => {
    setFrontImage(null);
    setSideImage(null);
    setResults(null);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Análisis de piel</Text>
      
      {results && (
        <Button title="Nuevo análisis" onPress={resetAll} color="#ff5555" />
      )}

      <View style={styles.imageSection}>
        <Button 
          title="Selecciona rostro frontal" 
          onPress={() => pickImage(setFrontImage)} 
          disabled={!permissionGranted}
        />
        {frontImage && (
          <View style={styles.imageContainer}>
            <Image source={{ uri: frontImage.uri }} style={styles.image} />
            <Text style={styles.imageLabel}>Vista frontal</Text>
          </View>
        )}
      </View>

      <View style={styles.imageSection}>
        <Button 
          title="Selecciona rostro lateral" 
          onPress={() => pickImage(setSideImage)} 
          disabled={!permissionGranted}
        />
        {sideImage && (
          <View style={styles.imageContainer}>
            <Image source={{ uri: sideImage.uri }} style={styles.image} />
            <Text style={styles.imageLabel}>Vista lateral</Text>
          </View>
        )}
      </View>

      <Button
        title="Analizar"
        onPress={analyze}
        disabled={!frontImage || !sideImage || loading}
        color="#4CAF50"
        style={styles.analyzeButton}
      />

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text style={styles.loadingText}>Analizando tu piel...</Text>
        </View>
      )}

      {results && results.error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{results.error}</Text>
        </View>
      )}

      {results && results.eff && (
        <View style={styles.result}>
          <Text style={styles.resultTitle}>Resultado Condiciones</Text>
          <View style={styles.resultContent}>
            {results.eff.skyn_conditions?.length > 0 ? (
              results.eff.skyn_conditions.map((c, i) => (
                <Text key={i} style={styles.conditionItem}>• {c}</Text>
              ))
            ) : (
              <Text>No se detectaron condiciones específicas</Text>
            )}
          </View>
        </View>
      )}

      {results && results.cnn && (
        <View style={styles.result}>
          <Text style={styles.resultTitle}>Resultado Tipo de piel</Text>
          <View style={styles.resultContent}>
            <Text style={styles.skinType}>
              Tipo de piel: <Text style={styles.skinTypeValue}>{results.cnn.skin_type}</Text>
            </Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    minHeight: '100%',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  imageSection: {
    marginBottom: 25,
    width: '100%',
    alignItems: 'center',
  },
  imageContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: 12,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  imageLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: -5,
  },
  analyzeButton: {
    marginTop: 15,
    marginBottom: 25,
    paddingVertical: 12,
  },
  loadingContainer: {
    marginTop: 30,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#555',
  },
  result: {
    marginTop: 20,
    backgroundColor: '#e8f4ff',
    padding: 20,
    borderRadius: 12,
    width: '100%',
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  resultTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 12,
    color: '#2196F3',
  },
  resultContent: {
    paddingLeft: 10,
  },
  conditionItem: {
    marginVertical: 5,
    fontSize: 16,
  },
  skinType: {
    fontSize: 16,
    fontWeight: '500',
  },
  skinTypeValue: {
    fontWeight: 'bold',
    color: '#E91E63',
  },
  errorContainer: {
    marginTop: 20,
    backgroundColor: '#ffebee',
    padding: 16,
    borderRadius: 10,
    width: '100%',
  },
  errorText: {
    color: '#f44336',
    textAlign: 'center',
  },
});