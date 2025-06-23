// FR_cnn.tsx — Updated to match FR_efficient_net.tsx UI

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
  ActivityIndicator,
  Icon
} from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/_types';

const exampleImages = [
  require('../../../assets/lateral_example1.png'),
  require('../../../assets/lateral_example2.png'),
  require('../../../assets/lateral_example3.png')
];

type SafeImagePickerAsset = {
  uri: string;
  width: number;
  height: number;
  base64?: string;
};

type SkinAnalysisResult = {
  status: string;
  skin_type: string;
  confidence: number;
};

type FRCnnRouteProp = RouteProp<RootStackParamList, 'FR_cnn'>;

const FR_cnn: React.FC = () => {
  const { params } = useRoute<FRCnnRouteProp>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [sideImage, setSideImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [cameraPermissionGranted, setCameraPermissionGranted] = useState(false);
  const [galleryPermissionGranted, setGalleryPermissionGranted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [currentExampleIndex, setCurrentExampleIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentExampleIndex((prev) => (prev + 1) % exampleImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    (async () => {
      const galleryStatus = await ImagePicker.requestMediaLibraryPermissionsAsync();
      setGalleryPermissionGranted(galleryStatus.status === 'granted');

      const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
      setCameraPermissionGranted(cameraStatus.status === 'granted');
    })();
  }, []);

  const sendImageToAPI = async (): Promise<SkinAnalysisResult | null> => {
    if (!sideImage?.uri) {
      Alert.alert('Error', 'No se encontró la imagen seleccionada');
      return null;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('image', {
        uri: sideImage.uri,
        type: 'image/jpeg',
        name: 'foto.jpg',
      } as any);

      const response = await fetch('http://192.168.1.48:5000/api/analyze-skin/cnn', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Error del servidor');

      Alert.alert('Resultado del análisis', `Tipo de piel: ${data.skin_type}\nConfianza: ${(data.confidence * 100).toFixed(2)}%`);
      return data;
    } catch (error) {
      Alert.alert('Error', 'Ocurrió un error al analizar la imagen');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const takePhoto = async () => {
    if (!cameraPermissionGranted) return;
    setLoading(true);
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
      base64: true,
    });
    if (!result.canceled && result.assets.length > 0) setSideImage(result.assets[0]);
    setLoading(false);
  };

  const pickImageFromGallery = async () => {
    if (!galleryPermissionGranted) return;
    setLoading(true);
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
      base64: true,
    });
    if (!result.canceled && result.assets.length > 0) setSideImage(result.assets[0]);
    setLoading(false);
  };

  const handleContinue = async () => {
    if (!sideImage) {
      Alert.alert('Imagen requerida', 'Por favor selecciona una foto lateral');
      return;
    }

    const response = await sendImageToAPI();
    if (!response) return;

    const safeImage: SafeImagePickerAsset = {
      uri: sideImage.uri,
      width: sideImage.width,
      height: sideImage.height,
      ...(sideImage.base64 && { base64: sideImage.base64 }),
    };

    navigation.navigate('SkinSensitive', {
      results: {
        cnn: {
          skinType: response.skin_type,
          confidence: response.confidence,
          inputImage: safeImage,
        },
        eff: {
          conditions: params.skin_conditions,
          inputImage: params.frontImage,
        },
      },
    });
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator animating={true} size="large" color="#D2691E" />
        <Text style={styles.loadingText}>{sideImage ? 'Analizando imagen...' : 'Cargando...'}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={styles.progressStep}>
            <View style={[styles.stepCircle]}>
              <Text style={styles.stepNumber}>1</Text>
            </View>
            <Text style={styles.stepLabel}>Frontal</Text>
          </View>
          <View style={styles.progressLine} />
          <View style={styles.progressStep}>
            <View style={[styles.stepCircle, styles.activeStep]}>
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
        <View style={styles.headerContainer}>
          <Image source={require('../../../assets/circle_logo_pinkbg.png')} style={styles.logo} />
          <Text style={styles.headerTitle}>Reconocimiento facial</Text>
        </View>

        <View style={styles.descriptionContainer}>
          <Text style={styles.description}>
            Ya analizamos tu rostro de frente. Ahora, toma una foto lateral para continuar con el análisis.
          </Text>
        </View>

        <View style={styles.photoSection}>
          <Text style={styles.sectionTitle}>Foto lateral</Text>
          <Text style={styles.sectionSubtitle}>
            Toma una foto de lado, similar a las siguientes imágenes de referencia:
          </Text>

          <View style={styles.imageContainer}>
            <View style={styles.carouselContainer}>
              <Image source={exampleImages[currentExampleIndex]} style={styles.exampleImage} />
              <View style={styles.dotsContainer}>
                {exampleImages.map((_, index) => (
                  <View
                    key={index}
                    style={[styles.dot, index === currentExampleIndex && styles.activeDot]}
                  />
                ))}
              </View>
            </View>
          </View>

          <TouchableOpacity style={styles.recommendationsButton} onPress={() => setShowRecommendations(true)}>
            <Text style={styles.recommendationsButtonText}>Recomendaciones</Text>
          </TouchableOpacity>

          {sideImage && (
            <View style={styles.userImageContainer}>
              <Text style={styles.sectionSubtitle}>Tu selección:</Text>
              <Image source={{ uri: sideImage.uri }} style={styles.previewImage} />
            </View>
          )}

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

          {sideImage && (
            <TouchableOpacity style={styles.squareContinueButton} onPress={handleContinue}>
              <Text style={styles.squareButtonText}>Continuar</Text>
            </TouchableOpacity>
          )}
        </View>

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
              <TouchableOpacity style={styles.modalCloseButton} onPress={() => setShowRecommendations(false)}>
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

export default FR_cnn;
