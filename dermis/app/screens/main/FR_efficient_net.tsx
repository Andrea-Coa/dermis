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
import { Icon } from 'react-native-paper';

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
        <ActivityIndicator animating={true} size="large" color="#D2691E" />
        <Text style={styles.loadingText}>
          {frontImage ? 'Analizando imagen...' : 'Cargando...'}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={styles.progressStep}>
            <View style={[styles.stepCircle, styles.activeStep]}>
              <Text style={styles.stepNumber}>1</Text>
            </View>
            <Text style={styles.stepLabel}>Frontal</Text>
          </View>
          <View style={styles.progressLine} />
          <View style={styles.progressStep}>
            <View style={styles.stepCircle}>
              <Text style={styles.stepNumber}>2</Text>
            </View>
            <Text style={styles.stepLabel}>Lateral</Text>
          </View>
          <View style={styles.progressLine} />
          <View style={styles.progressStep}>
            <View style={styles.stepCircle}>
              <Text style={styles.stepNumber}>3</Text>
            </View>
            <Text style={styles.stepLabel}>Rutina</Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <Image 
            source={require('../../../assets/circle_logo_pinkbg.png')} 
            style={styles.logo} 
          />
          <Text style={styles.headerTitle}>Reconocimiento facial</Text>
        </View>

        {/* Description */}
        <View style={styles.descriptionContainer}>
          <Text style={styles.description}>
            Para reconocer tu tipo de piel y condiciones, requerimos de dos fotos de tu rostro: una completa frontal y una lateral completa. Empecemos con la foto frontal.
          </Text>
        </View>

        {/* Photo Section */}
        <View style={styles.photoSection}>
          <Text style={styles.sectionTitle}>Foto frontal</Text>
          <Text style={styles.sectionSubtitle}>
            Toma una foto de frente, similar a las siguientes imágenes de referencia:
          </Text>

          {/* Carousel is always visible */}
          <View style={styles.imageContainer}>
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
          </View>

          {/* Recommendations */}
          <TouchableOpacity 
            style={styles.recommendationsButton}
            onPress={() => setShowRecommendations(true)}
          >
            <Text style={styles.recommendationsButtonText}>Recomendaciones</Text>
          </TouchableOpacity>

          {/* User photo preview goes here, below the carousel */}
          {frontImage && (
            <View style={styles.userImageContainer}>
              <Text style={styles.sectionSubtitle}>Tu selección:</Text>
              <Image source={{ uri: frontImage.uri }} style={styles.previewImage} />
            </View>
          )}

          {/* Buttons with icons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.squareButton} onPress={takePhoto}>
              <Icon source="camera" size={24} color="#FFFFFF" />
              <Text style={styles.squareButtonText}>Cámara</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.squareButton} onPress={pickImageFromGallery}>
              <Icon source="image-multiple" size={24} color="#FFFFFF" />
              <Text style={styles.squareButtonText}>Galería</Text>
            </TouchableOpacity>
          </View>


          {/* Continue Button */}
          {frontImage && (
            <TouchableOpacity style={styles.squareContinueButton} onPress={handleContinue}>
              <Text style={styles.squareButtonText}>Continuar</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Modal */}
        <Modal
          visible={showRecommendations}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowRecommendations(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Recomendaciones para tus fotos</Text>
              <View style={styles.recommendationsList}>
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
              </View>
              <TouchableOpacity 
                style={styles.modalCloseButton}
                onPress={() => setShowRecommendations(false)}
              >
                <Text style={styles.modalCloseButtonText}>Entendido</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffece0',
  },
  progressContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f9d8c3',
  },
  progressBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressStep: {
    alignItems: 'center',
  },
  stepCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f1c5b3',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  activeStep: {
    backgroundColor: '#d5582b',
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  stepLabel: {
    fontSize: 12,
    color: '#a44230',
    fontWeight: '500',
  },
  progressLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#f1c5b3',
    marginHorizontal: 10,
    marginBottom: 25,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  headerContainer: {
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 30,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 15,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#d5582b',
    textAlign: 'center',
  },
  descriptionContainer: {
    backgroundColor: '#fcd4c2',
    borderRadius: 15,
    padding: 20,
    marginBottom: 30,
  },
  description: {
    fontSize: 16,
    color: '#a44230',
    lineHeight: 22,
  },
  photoSection: {
    backgroundColor: '#fcd4c2',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#a44230',
    marginBottom: 10,
    textAlign: 'center',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#a44230',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  imageContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  imagePlaceholder: {
    display: 'none',
  },
  carouselContainer: {
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  userImageContainer: {
    marginTop: 15,
    marginBottom: 20, // ✅ Add this line
    alignItems: 'center',
  },
  previewImage: {
    width: 200,
    height: 200,
    borderRadius: 15,
    borderWidth: 3,
    borderColor: '#d5582b',
    marginTop: 8,
  },
  squareButton: {
    backgroundColor: '#d5582b',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '45%',
    gap: 8,
  },
  squareButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  squareContinueButton: {
    backgroundColor: '#a44230',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  exampleImage: {
    width: 150,
    height: 150,
    borderRadius: 10,
    marginBottom: 15,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#f1c5b3',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#d5582b',
  },
  recommendationsButton: {
    marginBottom: 20,
  },
  recommendationsButtonText: {
    color: '#d5582b',
    fontSize: 16,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
  },
  loadingText: {
    color: '#a44230',
    fontSize: 16,
    marginTop: 15,
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#a44230',
    textAlign: 'center',
  },
  recommendationsList: {
    width: '100%',
    marginBottom: 25,
  },
  recommendationItem: {
    marginBottom: 12,
    paddingLeft: 10,
  },
  recommendationText: {
    fontSize: 16,
    color: '#666666',
    lineHeight: 22,
  },
  modalCloseButton: {
    backgroundColor: '#d5582b',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    width: '80%',
    alignItems: 'center',
  },
  modalCloseButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});


export default FR_efficient_net;