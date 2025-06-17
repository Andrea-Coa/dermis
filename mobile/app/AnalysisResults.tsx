import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  Alert,
  ActivityIndicator
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from './navigation/_types';
import {updateUserSkinData} from './api/user'
type AnalysisResultsRouteProp = RouteProp<RootStackParamList, 'AnalysisResults'>;

interface AnalysisResultsProps {
  route: AnalysisResultsRouteProp;
}

const AnalysisResults: React.FC<AnalysisResultsProps> = ({ route }) => {
  const { results, _user_id } = route.params;
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [magnifierPosition] = useState(new Animated.ValueXY());
  const [currentImage, setCurrentImage] = useState<'front' | 'side'>('front');
  const [isLoading, setIsLoading] = useState(false);

  // Animación de la lupa de análisis
  useEffect(() => {
    const screenWidth = Dimensions.get('window').width;
    const screenHeight = Dimensions.get('window').height * 0.4;

    const animateMagnifier = () => {
      const positions = [
        { x: 0, y: 0 },
        { x: screenWidth * 0.7, y: 0 },
        { x: screenWidth * 0.5, y: screenHeight * 0.5 },
        { x: screenWidth * 0.3, y: screenHeight * 0.8 },
        { x: screenWidth * 0.7, y: screenHeight * 0.6 },
      ];

      const animations = positions.map((pos) => {
        return Animated.timing(magnifierPosition, {
          toValue: { x: pos.x, y: pos.y },
          duration: 1000,
          useNativeDriver: true,
        });
      });

      Animated.sequence(animations).start(() => {
        setTimeout(() => {
          animateMagnifier();
        }, 2000);
      });
    };

    animateMagnifier();

    return () => {
      magnifierPosition.stopAnimation();
    };
  }, []);

  const handleDisagree = () => {
    navigation.goBack();
  };
const updateSkinData = async (userId: string, skinType: string, conditions: string[]) => {
  try {
    const response = await fetch('https://70i447ofic.execute-api.us-east-1.amazonaws.com/register_users_dermis', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: userId,
        skyn_type: skinType,
        skyn_conditions: conditions
      }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Update failed');
    
    return data;
  } catch (error) {
    console.error('Update error:', error);
    throw error;
  }
};
 const handleContinue = async () => {
    setIsLoading(true);
    try {
      await updateUserSkinData(
        _user_id,
        results.cnn.skinType || 'Normal',
        results.eff.conditions || []
      );
      updateSkinData(_user_id,results.cnn.skinType,results.eff.conditions)
      navigation.navigate('Intro');
        
        //{ 
        //updatedSkinData: {
         // skinType: results.cnn.skinType,
          //conditions: results.eff.conditions
       // }
      //});
    } catch (error) {
      console.error('Error saving skin data:', error);
      Alert.alert('Error', 'No se pudo guardar la información de la piel');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image
        source={require('../assets/logo_yes.png')}
        style={styles.logo}
        resizeMode="contain"
      />

      <Text style={styles.title}>RESULTADOS DEL ANÁLISIS</Text>
      <Text style={styles.subtitle}>
        Hemos detectado las siguientes condiciones y un tipo de piel tentativo para tu rostro.
      </Text>
      <Text style={styles.description}>
        Puedes estar de acuerdo con el reconocimiento o retroceder e insertar los datos por tu cuenta.
      </Text>

      {/* Selector de imágenes */}
      <View style={styles.imageSelector}>
        <TouchableOpacity 
          onPress={() => setCurrentImage('front')}
          style={[styles.selectorButton, currentImage === 'front' && styles.activeSelector]}
        >
          <Text style={styles.selectorButtonText}>Foto Frontal</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => setCurrentImage('side')}
          style={[styles.selectorButton, currentImage === 'side' && styles.activeSelector]}
        >
          <Text style={styles.selectorButtonText}>Foto Lateral</Text>
        </TouchableOpacity>
      </View>

      {/* Contenedor de imagen con animación */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: currentImage === 'front' ? results.eff.imageUri : results.cnn.imageUri }}
          style={styles.analysisImage}
          resizeMode="contain"
        />
        
        <Animated.View 
          style={[
            styles.magnifier,
            {
              transform: [
                { translateX: magnifierPosition.x },
                { translateY: magnifierPosition.y }
              ]
            }
          ]}
        >
          <Image 
            source={require('../assets/magnifier.png')} 
            style={styles.magnifierIcon}
          />
        </Animated.View>
      </View>

      {/* Resultados del análisis */}
      <View style={styles.resultsContainer}>
        <View style={styles.resultSection}>
          <Text style={styles.resultTitle}>TIPO DE PIEL</Text>
          <Text style={styles.resultValue}>{results.cnn.skinType || 'No detectado'}</Text>
        </View>

        <View style={styles.resultSection}>
          <Text style={styles.resultTitle}>CONDICIONES DETECTADAS</Text>
          {results.eff.conditions && results.eff.conditions.length > 0 ? (
            results.eff.conditions.map((condition: string, index: number) => (
              <Text key={index} style={styles.resultValue}>• {condition}</Text>
            ))
          ) : (
            <Text style={styles.resultValue}>No se detectaron condiciones</Text>
          )}
        </View>

        <View style={styles.resultSection}>
          <Text style={styles.resultTitle}>CONFIANZA DEL ANÁLISIS</Text>
          <Text style={styles.resultValue}>
            Tipo de piel: {(results.cnn.confidence * 100).toFixed(1)}% de certeza
          </Text>
          <Text style={styles.resultValue}>
            Condiciones: {(results.eff.confidence * 100).toFixed(1)}% de certeza promedio
          </Text>
        </View>
      </View>

      {/* Botones de acción */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={handleDisagree} style={styles.disagreeButton}>
          <Text style={styles.buttonText}>Difiero con los resultados</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={handleContinue} 
          style={styles.agreeButton}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.buttonText}>Siguiente</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

// Los estilos permanecen igual que en tu código original
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#ffece0',
    alignItems: 'center',
    padding: 24,
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 12,
  },
  title: {
    color: '#6b0d29',
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    color: '#6b0d29',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 8,
    paddingHorizontal: 20,
  },
  description: {
    color: '#6b0d29',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 20,
    lineHeight: 20,
  },
  imageSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
    width: '100%',
  },
  selectorButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginHorizontal: 5,
    borderRadius: 20,
    backgroundColor: '#ffe6e1',
    borderWidth: 1,
    borderColor: '#cc5533',
  },
  activeSelector: {
    backgroundColor: '#a44230',
  },
  selectorButtonText: {
    color: '#6b0d29',
    fontWeight: '600',
  },
  imageContainer: {
    width: '100%',
    height: 250,
    backgroundColor: '#ffe6e1',
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#cc5533',
    marginBottom: 20,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  analysisImage: {
    width: '80%',
    height: '80%',
    resizeMode: 'contain',
  },
  magnifier: {
    position: 'absolute',
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  magnifierIcon: {
    width: 40,
    height: 40,
    tintColor: '#a44230',
  },
  resultsContainer: {
    width: '100%',
    backgroundColor: '#ffe6e1',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#cc5533',
  },
  resultSection: {
    marginBottom: 15,
  },
  resultTitle: {
    color: '#6b0d29',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  resultValue: {
    color: '#6b0d29',
    fontSize: 16,
    marginLeft: 10,
    marginBottom: 3,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 10,
  },
  disagreeButton: {
    backgroundColor: '#cccccc',
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 25,
    flex: 1,
    marginRight: 10,
  },
  agreeButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 25,
    flex: 1,
    marginLeft: 10,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default AnalysisResults;