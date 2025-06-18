import React, {useState, useEffect } from 'react';
import {
     View,
     Text,
    Image, 
    StyleSheet,
    Alert,
    ScrollView, 
    TouchableOpacity } from 'react-native';
import {useNavigation, RouteProp, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/_types';
import * as ImagePicker from 'expo-image-picker';


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
  

    // useEffect(() => {
    //     console.log('Received params in FR_cnn:', params);
    // }, [params]);

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
     } ;

     const sendImageToAPI = async (): Promise<SkinAnalysisResult | null> => {
        if (!frontImage?.uri) {
            Alert.alert('Error', 'No se encontró la imagen seleccionada');
            return null;
        }
    
        try {
            setLoading(true);
    
            // const formData = new FormData();
            // formData.append('image', {
            //     uri: frontImage.uri,
            //     type: 'image/jpeg',
            //     name: 'foto.jpg',
            // } as any);
    
            // Simulated delay to mimic real API latency
            await new Promise((resolve) => setTimeout(resolve, 1000));
    
            // Mocked API response
            const data = {
                status: "success",
                skin_type: "Oily",
                confidence: 0.8723,
            };
    
            Alert.alert(
                'Resultado del análisis',
                `Tipo de piel: ${data.skin_type}\nConfianza: ${(data.confidence * 100).toFixed(2)}%`
            );
    
            // return [data.skin_type]; // or return data if you prefer
            return data;
        } catch (error) {
            console.error('Error al enviar imagen:', error);
            Alert.alert('Error', 'Ocurrió un error al analizar la imagen');
            return null;
        } finally {
            setLoading(false);
        }
    };
    
    const handleContinue = async() => {
        if (!frontImage) {
            Alert.alert('Imagen requerida', 'Por favor selecciona una foto lateral');
            return;
        }    
        const response = await sendImageToAPI();
        if (!response) return;
        console.log("Response from server", response);

        const safeImage: SafeImagePickerAsset = {
            uri: frontImage.uri,
            width: frontImage.width,
            height: frontImage.height,
            ...(frontImage.base64 && { base64: frontImage.base64 }),
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
            }
        });
          


    }

    return (
        <ScrollView contentContainerStyle={styles.container}>
          <Image
            source={require('../../../assets/logo_yes.png')}
            style={styles.logo}
            resizeMode="contain"
          />
    
          <Text style={styles.title}>ARMEMOS TU RUTINA DE CUIDADO!</Text>
          <Text style={styles.subtitle}>RECONOCIMIENTO FACIAL</Text>
          
          <Text style={styles.description}>
            Para reconocer tu tipo de piel y condiciones requerimos dos fotos de tu rostro
          </Text>
    
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>FOTO LATERAL</Text>
            <Text style={styles.instructions}>Ejemplo de cómo tomar la foto:</Text>
            
            <View style={styles.exampleContainer}>
              <Image 
                source={require('../../../assets/lateral_example.jpg')} 
                style={styles.exampleImage}
              />
              <Text style={styles.exampleText}>
                • Muestra un lado de tu rostro{'\n'}
                • Buena iluminación{'\n'}
                • Sin maquillaje{'\n'}
                • Sin gafas o accesorios
              </Text>
            </View>
    
            {/* Image selection buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity onPress={takePhoto} style={styles.cameraButton}>
                <Text style={styles.buttonText}>Tomar foto</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={pickImageFromGallery} style={styles.galleryButton}>
                <Text style={styles.buttonText}>Galería</Text>
              </TouchableOpacity>
            </View>
    
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
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 15,
      gap: 10,
    },
    cameraButton: {
      flex: 1,
      backgroundColor: '#a44230',
      borderRadius: 24,
      paddingVertical: 12,
      paddingHorizontal: 16,
      alignItems: 'center',
    },
    galleryButton: {
      flex: 1,
      backgroundColor: '#cc5533',
      borderRadius: 24,
      paddingVertical: 12,
      paddingHorizontal: 16,
      alignItems: 'center',
    },
    buttonText: {
      color: '#ffece0',
      fontSize: 16,
      fontWeight: 'bold',
      textAlign: 'center',
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

export default FR_cnn;