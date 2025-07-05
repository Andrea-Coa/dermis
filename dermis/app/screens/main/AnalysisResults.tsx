import React, { useState } from 'react';
import { View, StyleSheet, Image, ScrollView, Dimensions, Alert, ActivityIndicator } from 'react-native';
import { Text, Card, Surface, Button, IconButton } from 'react-native-paper';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList , RecommendedProduct} from '../../navigation/_types';
import { useUser } from '../../../context/UserContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

type AnalysisResultsRouteProp = RouteProp<RootStackParamList, 'AnalysisResults'>;

const { width } = Dimensions.get('window');

export default function AnalysisResults() {
  const route = useRoute<AnalysisResultsRouteProp>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { results, sensitive } = route.params;
  const { setUserId, setHasCompletedOnboarding } = useUser();

  const [loading, setLoading] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('user_id');
              setUserId(null);
            } catch (error) {
              console.error('Error during logout:', error);
              Alert.alert('Error', 'Ocurrió un error al cerrar sesión');
            }
          },
        },
      ]
    );
  };

  const handleContinue = async () => {
    setLoading(true);
    try {
      const userId = await AsyncStorage.getItem("user_id");
      if (!userId) {
        throw new Error("User ID not found in storage");
      }
  
      const preprocessingResponse = await fetch('http://192.168.37.225:5001/preprocesar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          skyn_type: results.cnn.skinType,
          conditions: results.eff.conditions.length > 0 ? results.eff.conditions : ["wrinkle"],
          is_sensitive: sensitive ? "true" : "false",
        }),
      });
  
      if (!preprocessingResponse.ok) {
        throw new Error(`Preprocessing API error: ${preprocessingResponse.status}`);
      }
  
      const preprocessedData = await preprocessingResponse.json();
      console.log('✅ Preprocessing result:', preprocessedData);
  
      // Fix: Cast response to known type before mapping
      const productNames = (Object.values(preprocessedData) as { name: string }[]).map(
        (product) => product.name
      );
  
      // 🧠 Call your Lambda to create the routine
      const lambdaResponse = await fetch('https://o1f915v3gh.execute-api.us-east-1.amazonaws.com/default/routines', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          name: "rutina facial", // 🔹 placeholder name
          product_names: productNames,
        }),
      });
  
      if (!lambdaResponse.ok) {
        const body = await lambdaResponse.json();

        console.log(body)
        throw new Error(`Lambda API error: ${lambdaResponse.status}`);
      }
  
      const lambdaData = await lambdaResponse.json();
      console.log("✅ Routine created:", lambdaData);
  
      // await AsyncStorage.setItem("routine_id", lambdaData.routine_id);
      
    } catch (error) {
      console.log('❌ Error during routine creation:', error); // better: console error!!
      Alert.alert('Error', 'Ocurrió un error al crear la rutina');
    } finally {
      await setHasCompletedOnboarding(true);
      setLoading(false);
    }
  };
  
  
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator animating={true} size="large" color="#d5582b" />
        <Text style={styles.loadingText}>
          Estamos creando tu rutina personalizada. Esto puede tomar unos segundos, ¡pero solo es necesario una vez!
        </Text>
        <Text style={styles.loadingSubtext}>
          Gracias por tu paciencia 💆‍♀️✨
        </Text>
      </View>
    );
  }
  
  

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        {/* Header with Logo */}
        <View style={styles.headerContainer}>
          <Image 
            source={require('../../../assets/logo_circle.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.headerTitle}>Reconocimiento facial</Text>
        </View>

        {/* Results Title */}
        <Text style={styles.resultsTitle}>RESULTADOS</Text>
        
        <View style={styles.descriptionContainer}>
          <Text style={styles.description}>
            Hemos detectado las siguientes condiciones y un tipo cosmético de piel 
            para tu rostro. Estas características serán utilizadas para crear tu rutina de cuidado de la piel.
          </Text>
        </View>

        {/* Skin Type Card */}
        <View style={styles.resultCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>TIPO DE PIEL</Text>
          </View>
          <View style={styles.cardContent}>
            <View style={styles.resultBadge}>
              <Text style={styles.resultText}>{results.cnn.skinType}</Text>
            </View>
            <Text style={styles.confidenceText}>
              Confianza: {(results.cnn.confidence * 100).toFixed(1)}%
            </Text>
            <Image 
              source={{ uri: results.cnn.inputImage.uri }} 
              style={styles.analysisImage} 
            />
          </View>
        </View>

        {/* Conditions Card */}
        <View style={styles.resultCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>CONDICIONES</Text>
          </View>
          <View style={styles.cardContent}>
            {results.eff.conditions.length > 0 ? (
              <View style={styles.conditionsContainer}>
                {results.eff.conditions.map((condition, index) => (
                  <View key={index} style={styles.conditionBadge}>
                    <Text style={styles.conditionText}>{condition}</Text>
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.noConditionsContainer}>
                <Text style={styles.noConditionsText}>
                  No se detectó ninguna condición de la piel.
                </Text>
              </View>
            )}
            <Image 
              source={{ uri: results.eff.inputImage.uri }} 
              style={styles.analysisImage} 
            />
          </View>
        </View>
        
       {/* Sensitive Skin Card */}
       <View style={styles.resultCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>SENSIBILIDAD</Text>
          </View>
          <View style={styles.cardContent}>
            <View style={styles.resultBadge}>
              <Text style={styles.resultText}>
                {route.params.sensitive ? 'Piel Sensible' : 'Piel No Sensible'}
              </Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          <Button 
            mode="contained" 
            style={styles.continueButton}
            labelStyle={styles.continueButtonText}
            onPress={handleContinue}
          >
            Siguiente
          </Button>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingTop: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 32,
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 16,
    fontSize: 16,
    color: '#a44230',
    lineHeight: 22,
  },
  loadingSubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
  headerContainer: {
    alignItems: 'center',
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
  resultsTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#a44230',
    textAlign: 'center',
    marginBottom: 20,
  },
  descriptionContainer: {
    backgroundColor: '#ffece0',
    borderRadius: 15,
    padding: 20,
    marginBottom: 30,
  },
  description: {
    fontSize: 16,
    color: '#a44230',
    lineHeight: 22,
    textAlign: 'center',
  },
  resultCard: {
    backgroundColor: '#ffece0',
    borderRadius: 20,
    marginBottom: 20,
    overflow: 'hidden',
  },
  cardHeader: {
    backgroundColor: '#d5582b',
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  cardTitle: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  cardContent: {
    padding: 20,
    alignItems: 'center',
  },
  resultBadge: {
    backgroundColor: '#a44230',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    marginBottom: 15,
  },
  resultText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  confidenceText: {
    color: '#a44230',
    fontSize: 14,
    marginBottom: 16,
    fontWeight: '600',
  },
  conditionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 16,
  },
  conditionBadge: {
    backgroundColor: '#a44230',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
  },
  conditionText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  noConditionsContainer: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  noConditionsText: {
    color: '#a44230',
    fontSize: 16,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  analysisImage: {
    width: '100%',
    height: 200,
    borderRadius: 15,
    backgroundColor: '#f1c5b3',
  },
  actionContainer: {
    marginTop: 20,
  },
  continueButton: {
    backgroundColor: '#d5582b',
    borderRadius: 12,
    paddingVertical: 8,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});