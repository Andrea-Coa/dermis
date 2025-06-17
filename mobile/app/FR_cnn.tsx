import React, { useState, useEffect } from 'react';
import { useUser } from './context/UserContext';
import { 
  View, 
  Text, 
  Image, 
  StyleSheet, 
  ScrollView, 
  ActivityIndicator, 
  Alert,
  TouchableOpacity 
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from './navigation/_types';

type FacialRecognitionLateralRouteProp = RouteProp<RootStackParamList, 'FR_cnn'>;

interface FR_cnnProps {
  route: FacialRecognitionLateralRouteProp;
}

type SafeImagePickerAsset = {
  uri: string;
  width: number;
  height: number;
  base64?: string;
};

const FR_cnn = () => {
  const { frontImage } = useUser();
  if (!frontImage) {
  Alert.alert('Imagen requerida', 'Por favor selecciona una foto frontal');
  return;
}
  useEffect(() => {
    if (frontImage) {
      console.log('Imagen recibida global:', frontImage.uri);
    }
  }, []);


//const FR_cnn: React.FC<FR_cnnProps> = ({ route }) => {
  const [sideImage, setSideImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [loading, setLoading] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  //const { frontImage, _user_id } = route.params;

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

  const pickImage = async () => {
    if (!permissionGranted) {
      Alert.alert(
        'Permiso denegado',
        'Por favor habilita los permisos en la configuración de tu dispositivo.'
      );
      return;
    }

    try {
      setLoading(true);
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSideImage(result.assets[0]);
      }
    } catch (error) {
      console.error('Error al seleccionar imagen:', error);
      Alert.alert('Error', 'No se pudo seleccionar la imagen');
    } finally {
      setLoading(false);
    }
  };

  const analyze = async () => {
    if (!sideImage) {
      Alert.alert('Imagen requerida', 'Por favor selecciona una foto lateral');
      return;
    }

    setLoading(true);

    try {
      // Verificar que ambas imágenes tengan base64
      if (!frontImage.base64 || !sideImage.base64) {
        throw new Error('Las imágenes no tienen datos base64');
      }

      const [resEff, resCNN] = await Promise.all([
        fetch('http://127.0.0.1:5000/api/analyze-skin/efficient-net', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: frontImage.base64 }),
        }).then(res => res.json()),

        fetch('http://127.0.0.1:5000/api/analyze-skin/cnn', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: sideImage.base64 }),
        }).then(res => res.json()),
      ]);
      Alert.alert("Resultados: ", resEff, resCNN)

      
     // navigation.navigate('AnalysisResults', {
       // results: { eff: resEff, cnn: resCNN },
        //_user_id: _user_id
      //});
    } catch (error) {
      console.error('Error en el análisis:', error);
      Alert.alert('Error', 'Hubo un problema al analizar las imágenes');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image
        source={require('../assets/logo_yes.png')}
        style={styles.logo}
        resizeMode="contain"
      />

      <Text style={styles.title}>ARMEMOS TU RUTINA DE CUIDADO!</Text>
      <Text style={styles.subtitle}>RECONOCIMIENTO FACIAL</Text>
      
      <Text style={styles.description}>
        Segundo paso: foto lateral del rostro
      </Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>FOTO LATERAL</Text>
        <Text style={styles.instructions}>Ejemplo de cómo tomar la foto:</Text>
        
        <View style={styles.exampleContainer}>
          <Image 
            source={require('../assets/lateral_example.jpg')} 
            style={styles.exampleImage}
          />
          <Text style={styles.exampleText}>
            • Perfil izquierdo o derecho{'\n'}
            • Inclina ligeramente la cabeza hacia adelante{'\n'}
            • Buena iluminación{'\n'}
            • Sin maquillaje
          </Text>
        </View>

        <TouchableOpacity onPress={pickImage} style={styles.uploadButton}>
          <Text style={styles.uploadButtonText}>Subir foto lateral</Text>
        </TouchableOpacity>

        {sideImage && (
          <View style={styles.previewContainer}>
            <Image source={{ uri: sideImage.uri }} style={styles.previewImage} />
            <Text style={styles.previewText}>Vista previa</Text>
          </View>
        )}
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>Volver</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={analyze} 
          style={[styles.analyzeButton, (!sideImage || loading) && styles.disabledButton]}
          disabled={!sideImage || loading}
        >
          {loading ? (
            <ActivityIndicator color="#ffece0" />
          ) : (
            <Text style={styles.analyzeButtonText}>Analizar</Text>
          )}
        </TouchableOpacity>
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
  title: {
    color: '#6b0d29',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
  },
  subtitle: {
    color: '#6b0d29',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
  },
  description: {
    color: '#6b0d29',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  section: {
    width: '100%',
    backgroundColor: '#ffe6e1',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#cc5533',
  },
  sectionTitle: {
    color: '#6b0d29',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  instructions: {
    color: '#6b0d29',
    fontSize: 16,
    marginBottom: 10,
    fontWeight: '600',
  },
  exampleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  exampleImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginRight: 15,
  },
  exampleText: {
    color: '#6b0d29',
    fontSize: 14,
    flex: 1,
  },
  uploadButton: {
    backgroundColor: '#a44230',
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignSelf: 'center',
    marginBottom: 15,
  },
  uploadButtonText: {
    color: '#ffece0',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  previewContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  previewImage: {
    width: 150,
    height: 150,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#cc5533',
  },
  previewText: {
    color: '#6b0d29',
    fontSize: 14,
    marginTop: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 20,
  },
  backButton: {
    backgroundColor: '#cccccc',
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 30,
  },
  backButtonText: {
    color: '#333333',
    fontSize: 16,
    fontWeight: 'bold',
  },
  analyzeButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 30,
  },
  analyzeButtonText: {
    color: '#ffece0',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: '#cccccc',
  },
});

export default FR_cnn;