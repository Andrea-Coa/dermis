import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  Image, 
  StyleSheet, 
  ScrollView, 
  Alert,
  TouchableOpacity,
  Modal
} from 'react-native';
import { 
  Button, 
  ActivityIndicator
} from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/_types';
import AsyncStorage from '@react-native-async-storage/async-storage';

type FacialRecognitionFrontalParams = {
  _user_id: string;
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
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [currentExampleIndex, setCurrentExampleIndex] = useState(0);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // Imágenes de ejemplo para el carrusel
  const exampleImages = [
    require('../../../assets/example1.png'),
    require('../../../assets/example2.png'),
    require('../../../assets/example3.png')
  ];

  // Efecto para rotar imágenes cada 5 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentExampleIndex((prev) => (prev + 1) % exampleImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Efecto para permisos
  useEffect(() => {
    (async () => {
      const galleryStatus = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (galleryStatus.status !== 'granted') {
        Alert.alert(
          'Permisos requeridos',
          'Necesitamos permiso para acceder a tus fotos para el análisis de piel.'
        );
      }
      setGalleryPermissionGranted(galleryStatus.status === 'granted');

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
  
      const response = await fetch('http://192.168.1.48:5000/api/analyze-skin/logistic_regression_v1', {
        method: 'POST',
        body: formData,
      });
  
      const data = await response.json();
      console.log(data);
  
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
      {/* Encabezado con logo y título */}
      <View style={styles.headerContainer}>
        <Image source={require('../../../assets/logo_yes.png')} style={styles.logo} />
        <View style={styles.titleContainer}>
          <View style={styles.textPaddingWrapper}>  
            <Text style={styles.mainTitle} numberOfLines={2}>
              ¡ ARMEMOS TU RUTINA !
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.horizontalLine} />
      <Text style={styles.subtitle}>Reconocimiento Facial</Text>
      
      <Text style={styles.description}>
        Para reconocer tu tipo de piel y condiciones requerimos de dos fotos de tu rostro,
        una completa frontal y una lateral completa
      </Text>
      <View style={styles.horizontalLine} />

      {/* Sección de ejemplos con carrusel */}
      <Text style={styles.subtitle}>Ejemplos Frontales</Text>
      
      <View style={styles.exampleSection}>
        <View style={styles.carouselContainer}>
          <Image 
            source={exampleImages[currentExampleIndex]} 
            style={styles.exampleImage}
          />
          <View style={styles.dotsContainer}>
            {exampleImages.map((_, index) => (
              <View 
                key={index}
                style={[
                  styles.dot,
                  index === currentExampleIndex && styles.activeDot
                ]}
              />
            ))}
          </View>
        </View>

        <TouchableOpacity 
          style={styles.recommendationsButton}
          onPress={() => setShowRecommendations(true)}
        >
          <Text style={styles.recommendationsButtonText}>Ver Recomendaciones</Text>
        </TouchableOpacity>

        <Button 
          mode="contained" 
          onPress={takePhoto}
          style={styles.uploadButton}
          labelStyle={styles.uploadButtonText}
        >
          Subir foto frontal
        </Button>
      </View>

      {/* Botones de acción */}
      <View style={styles.actionButtons}>
        <Button 
          mode="outlined" 
          icon="camera" 
          onPress={takePhoto}
          style={styles.actionButton}
          labelStyle={styles.actionButtonText}
        >
          Tomar foto
        </Button>
        <Button 
          mode="outlined" 
          icon="image" 
          onPress={pickImageFromGallery}
          style={styles.actionButton}
          labelStyle={styles.actionButtonText}
        >
          Galería
        </Button>
      </View>

      {/* Modal de recomendaciones */}
      <Modal
        visible={showRecommendations}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowRecommendations(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Recomendaciones para tus fotos</Text>
            <View style={styles.recommendationItem}>
              <Text style={styles.recommendationText}>• Buena iluminación natural</Text>
            </View>
            <View style={styles.recommendationItem}>
              <Text style={styles.recommendationText}>• Sin maquillaje</Text>
            </View>
            <View style={styles.recommendationItem}>
              <Text style={styles.recommendationText}>• Rostro limpio y seco</Text>
            </View>
            <View style={styles.recommendationItem}>
              <Text style={styles.recommendationText}>• Sin accesorios</Text>
            </View>
            <View style={styles.recommendationItem}>
              <Text style={styles.recommendationText}>• Fondo neutro</Text>
            </View>
            
            <Button 
              mode="contained" 
              onPress={() => setShowRecommendations(false)}
              style={styles.modalButton}
            >
              Entendido
            </Button>
          </View>
        </View>
      </Modal>

      {/* Vista previa de imagen */}
      {frontImage && (
        <View style={styles.previewSection}>
          <Image source={{ uri: frontImage.uri }} style={styles.previewImage} />
          <Button 
            mode="contained" 
            onPress={handleContinue}
            style={styles.continueButton}
            labelStyle={styles.continueButtonText}
          >
            Continuar
          </Button>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#ffece0',
    padding: 20,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  logo: {
    width: 120,
    height: 120,
    left: 10,
    zIndex: 2,
  },
  titleContainer: {
    flex: 1,
    backgroundColor: '#eb8c84',
    borderRadius: 15,
    marginLeft: -35,
    height: 85,
    overflow: 'hidden',
  },
  textPaddingWrapper: {
    position: 'absolute',
    right: 65,
    width: '80%',
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    paddingRight: 10,
  },
  mainTitle: {
    color: '#ffece0',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'right',
    marginRight: 10,
    width: '100%',
    includeFontPadding: false,
  },
  horizontalLine: {
    height: 4,
    backgroundColor: '#eb8c84',
    width: '95%',
    alignSelf: 'center',
    marginVertical: 8,
    opacity: 0.9,
  },
  subtitle: {
    color: '#d5582b',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  description: {
    color: '#6b0d29',
    fontSize: 16,
    fontWeight: 'bold',
    
    lineHeight: 18,
    marginBottom: 8,
    textAlign: 'center',
    width: '95%',
  },
  exampleSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  carouselContainer: {
    alignItems: 'center',
    marginBottom: 15,
  },
  exampleImage: {
    width: 200,
    height: 200,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#a44230',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ccc',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#a44230',
  },
  recommendationsButton: {
    marginVertical: 15,
  },
  recommendationsButtonText: {
    color: '#d5582b',
    fontSize: 18,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#ffece0',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 22,
    width: '90%',
    
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#6b0d29',
  },
  recommendationItem: {
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  recommendationText: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#d5582b',
    textAlign: 'center',
    width: '80%',
  },
  modalButton: {
    marginTop: 20,
    backgroundColor: '#eb8c84',
    width: '80%',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  actionButton: {
    borderColor: '#a44230',
    borderWidth: 2,
    borderRadius: 25,
    width: '45%',
  },
  actionButtonText: {
    color: '#a44230',
    fontWeight: 'bold',
  },
  uploadButton: {
    backgroundColor: '#eb8c84',
    borderRadius: 15,
    paddingVertical: 5,
    width: '75%',
  },
  uploadButtonText: {
    color: '#ffece0',
    fontWeight: 'bold',
    fontSize: 18,
  },
  previewSection: {
    alignItems: 'center',
    marginTop: 20,
  },
  previewImage: {
    width: 150,
    height: 150,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: '#a44230',
  },
  continueButton: {
    backgroundColor: '#a44230',
    borderRadius: 25,
    paddingVertical: 5,
    width: '80%',
  },
  continueButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  loadingText: {
    color: '#6b0d29',
    fontSize: 16,
    marginTop: 10,
  },
});

export default FR_efficient_net;