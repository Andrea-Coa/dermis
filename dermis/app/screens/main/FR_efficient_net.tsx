import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  Image, 
  StyleSheet, 
  ScrollView, 
  Alert,
  TouchableOpacity
} from 'react-native';
import { 
  Button, 
  Card, 
  Title, 
  Paragraph, 
  ActivityIndicator,
  IconButton,
  Chip,
} from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/_types';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  const [cameraPermissionGranted, setCameraPermissionGranted] = useState(false);
  const [galleryPermissionGranted, setGalleryPermissionGranted] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  useEffect(() => {
    (async () => {
      // Request gallery permissions
      const galleryStatus = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (galleryStatus.status !== 'granted') {
        Alert.alert(
          'Permisos requeridos',
          'Necesitamos permiso para acceder a tus fotos para el análisis de piel.'
        );
      }
      setGalleryPermissionGranted(galleryStatus.status === 'granted');

      // Request camera permissions
      const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
      if (cameraStatus.status !== 'granted') {
        Alert.alert(
          'Permisos de cámara requeridos',
          'Necesitamos permiso para usar la cámara para tomar fotos de análisis.'
        );
      }
      setCameraPermissionGranted(cameraStatus.status === 'granted');
    })();
  }, []);

  const sendImageToAPI = async (): Promise<string[] | null> => {
    if (!frontImage?.uri) {
      Alert.alert('Error', 'No se encontró la imagen seleccionada');
      return null;
    }
  
    try {
      setLoading(true);
  
      const formData = new FormData();
      formData.append('image', {
        uri: frontImage.uri,
        type: 'image/jpeg',
        name: 'foto.jpg',
      } as any);
  
      const response = await fetch('http://192.168.37.225:5000/api/analyze-skin/efficient-net', {
        method: 'POST',
        body: formData,
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.message || 'Error del servidor');
      }
  
      const conditions: string[] = data['skin_conditions'] ?? [];
  
      Alert.alert(
        'Resultado del análisis',
        conditions.length > 0 ? conditions.join(', ') : 'No se detectaron condiciones de la piel.'
      );
  
      return conditions;
    } catch (error) {
      console.error('Error al enviar imagen:', error);
      Alert.alert('Error', 'Ocurrió un error al analizar la imagen');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const takePhoto = async () => {
    if (!cameraPermissionGranted) {
      Alert.alert(
        'Permiso de cámara denegado',
        'Por favor habilita los permisos de cámara en la configuración de tu dispositivo.'
      );
      return;
    }

    try {
      setLoading(true);
      const result = await ImagePicker.launchCameraAsync({
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
      console.error('Error al tomar foto:', error);
      Alert.alert('Error', 'No se pudo tomar la foto');
    } finally {
      setLoading(false);
    }
  };

  const pickImageFromGallery = async () => {
    if (!galleryPermissionGranted) {
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

  const handleContinue = async () => {
    if (!frontImage) {
      Alert.alert('Imagen requerida', 'Por favor selecciona una foto frontal');
      return;
    }
  
    const conditions = await sendImageToAPI();
    if (!conditions) return;
  
    const safeImage: SafeImagePickerAsset = {
      uri: frontImage.uri,
      width: frontImage.width,
      height: frontImage.height,
      ...(frontImage.base64 && { base64: frontImage.base64 }),
    };
  
    const storedUserId = await AsyncStorage.getItem('user_id');
  
    navigation.navigate('FR_cnn', {
      frontImage: safeImage,
      skin_conditions: conditions,
      _user_id: storedUserId ?? route.params._user_id,
    });
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator animating={true} size="large" />
        <Text style={styles.loadingText}>
          {frontImage ? 'Analizando imagen...' : 'Cargando...'}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image
        source={require('../../../assets/logo_yes.png')}
        style={styles.logo}
        resizeMode="contain"
      />

      <Title style={styles.title}>ARMEMOS TU RUTINA DE CUIDADO!</Title>
      <Title style={styles.subtitle}>RECONOCIMIENTO FACIAL</Title>
      
      <Paragraph style={styles.description}>
        Para reconocer tu tipo de piel y condiciones requerimos dos fotos de tu rostro
      </Paragraph>

      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.sectionTitle}>FOTO FRONTAL</Title>
          <Paragraph style={styles.instructions}>Ejemplo de cómo tomar la foto:</Paragraph>
          
          <View style={styles.exampleContainer}>
            <Image 
              source={require('../../../assets/frontal_example.png')} 
              style={styles.exampleImage}
            />
            <View style={styles.exampleTextContainer}>
              <Chip icon="check" style={styles.chip}>Rostro completo y centrado</Chip>
              <Chip icon="lightbulb-outline" style={styles.chip}>Buena iluminación</Chip>
              <Chip icon="face-woman" style={styles.chip}>Sin maquillaje</Chip>
              <Chip icon="glasses" style={styles.chip}>Sin gafas o accesorios</Chip>
            </View>
          </View>

          {/* Image selection buttons */}
          <View style={styles.buttonContainer}>
            <Button 
              mode="contained" 
              icon="camera" 
              onPress={takePhoto}
              style={styles.cameraButton}
              contentStyle={styles.buttonContent}
            >
              Tomar foto
            </Button>

            <Button 
              mode="contained" 
              icon="image" 
              onPress={pickImageFromGallery}
              style={styles.galleryButton}
              contentStyle={styles.buttonContent}
            >
              Galería
            </Button>
          </View>

          {frontImage && (
            <View style={styles.previewContainer}>
              <Image source={{ uri: frontImage.uri }} style={styles.previewImage} />
              <Paragraph style={styles.previewText}>Vista previa</Paragraph>
            </View>
          )}
        </Card.Content>
      </Card>

      <TouchableOpacity 
            onPress={handleContinue} 
            style={[styles.continueButton2, !frontImage && styles.disabledButton]}
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
  card: {
    width: '100%',
    backgroundColor: '#ffe6e1',
    marginBottom: 20,
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
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  exampleImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginRight: 15,
  },
  exampleTextContainer: {
    flex: 1,
    flexDirection: 'column',
    gap: 8,
  },
  chip: {
    marginBottom: 4,
    backgroundColor: '#ffece0',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    gap: 10,
  },
  cameraButton: {
    flex: 1,
    backgroundColor: '#a44230',
  },
  galleryButton: {
    flex: 1,
    backgroundColor: '#cc5533',
  },
  continueButtonText: {
    color: '#ffece0',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonContent: {
    paddingVertical: 8,
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
    marginBottom: 8,
  },
  continueButton: {
    backgroundColor: '#a44230',
    marginTop: 10,
  },
  continueButton2: {
    backgroundColor: '#a44230',
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 40,
  },
  continueButtonContent: {
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  disabledButton: {
    backgroundColor: '#cccccc',
  },
  loadingText: {
    color: '#6b0d29',
    fontSize: 16,
    marginTop: 10,
    textAlign: 'center',
  },
});

export default FR_efficient_net;