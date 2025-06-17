import React, { useState, useEffect } from 'react';
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

type FacialRecognitionFrontalParams = {
  _user_id: string;
  // otros parámetros si los hay
};
type SafeImagePickerAsset = {
  uri: string;
  width: number;
  height: number;
  base64?: string;
};

type FacialRecognitionFrontalRouteProp = RouteProp<RootStackParamList, 'FR_efficient_net'>;

interface FR_efficient_netProps {
  route: FacialRecognitionFrontalRouteProp;
}

const FR_efficient_net: React.FC<FR_efficient_netProps> = ({ route }) => {
    
  const [frontImage, setFrontImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

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


const sendImageToAPI = async () => {
  if (!frontImage?.uri) {
    Alert.alert('Error', 'No se encontró la imagen seleccionada');
    return;
  }

  try {
    setLoading(true);

    const formData = new FormData();
    formData.append('image', {
      uri: frontImage.uri,
      type: 'image/jpeg', // asegúrate de que el tipo sea correcto
      name: 'foto.jpg',
    } as any); // ← necesario para evitar errores de tipo en TS

    const response = await fetch('http://172.20.10.3:5000/api/analyze-skin/efficient-net', {
      method: 'POST',
      // no pongas Content-Type manualmente aquí
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Error del servidor');
    }

    const conditions = data['skin_conditions'];
    const message = (Array.isArray(conditions) && conditions.length > 0)
    ? conditions.join(', ')
    : 'No se detectaron condiciones de la piel.';

    Alert.alert('Resultado del análisis', message);

        
    // Puedes navegar o guardar data aquí si lo deseas

  } catch (error) {
    console.error('Error al enviar imagen:', error);
    Alert.alert('Error', 'Ocurrió un error al analizar la imagen');
  } finally {
    setLoading(false);
  }
};



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
        setFrontImage(result.assets[0]);
      }
      
    } catch (error) {
      console.error('Error al seleccionar imagen:', error);
      Alert.alert('Error', 'No se pudo seleccionar la imagen');
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    if (!frontImage) {
      Alert.alert('Imagen requerida', 'Por favor selecciona una foto frontal');
      return;
    }
    sendImageToAPI();
    const safeImage: SafeImagePickerAsset = {
      uri: frontImage.uri,
      width: frontImage.width,
      height: frontImage.height,
      ...(frontImage.base64 && { base64: frontImage.base64 })
    };

   
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color="#a44230" />
      </View>
    );
  }

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
        Para reconocer tu tipo de piel y condiciones requerimos dos fotos de tu rostro
      </Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>FOTO FRONTAL</Text>
        <Text style={styles.instructions}>Ejemplo de cómo tomar la foto:</Text>
        
        <View style={styles.exampleContainer}>
          <Image 
            source={require('../assets/frontal_example.png')} 
            style={styles.exampleImage}
          />
          <Text style={styles.exampleText}>
            • Rostro completo y centrado{'\n'}
            • Buena iluminación{'\n'}
            • Sin maquillaje{'\n'}
            • Sin gafas o accesorios
          </Text>
        </View>

        <TouchableOpacity onPress={pickImage} style={styles.uploadButton}>
          <Text style={styles.uploadButtonText}>Subir foto frontal</Text>
        </TouchableOpacity>

        {frontImage && (
          <View style={styles.previewContainer}>
            <Image source={{ uri: frontImage.uri }} style={styles.previewImage} />
            <Text style={styles.previewText}>Vista previa</Text>
          </View>
        )}
      </View>

      <TouchableOpacity 
        onPress={handleContinue} 
        style={[styles.continueButton, !frontImage && styles.disabledButton]}
        disabled={!frontImage}
      >
        <Text style={styles.continueButtonText}>Continuar</Text>
      </TouchableOpacity>
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
  continueButton: {
    backgroundColor: '#a44230',
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 40,
  },
  continueButtonText: {
    color: '#ffece0',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: '#cccccc',
  },
});

export default FR_efficient_net;