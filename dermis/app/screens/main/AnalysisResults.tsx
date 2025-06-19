import React from 'react';
import { View, StyleSheet, Image, ScrollView, Dimensions, Alert } from 'react-native';
import { Text, Card, Surface, Button, IconButton } from 'react-native-paper';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/_types';
import { useUser } from '../../../context/UserContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

type AnalysisResultsRouteProp = RouteProp<RootStackParamList, 'AnalysisResults'>;

const { width } = Dimensions.get('window');

export default function AnalysisResults() {
  const route = useRoute<AnalysisResultsRouteProp>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { results, sensitive } = route.params;
  const { setUserId, setHasCompletedOnboarding } = useUser();

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
              // Clear AsyncStorage
              await AsyncStorage.removeItem('user_id');
              // Clear context - this will automatically trigger RootNavigation to switch to AuthStack
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

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header with Logo and Logout */}
      <View style={styles.headerContainer}>
        <View style={styles.headerTop}>
          <View style={styles.logoContainer}>
            <Image 
              source={require('../../../assets/logo_yes.png')} 
              style={styles.logo}
              resizeMode="contain"
            />
            <Text variant="titleMedium" style={styles.logoText}>
              RECONOCIMIENTO{'\n'}FACIAL
            </Text>
          </View>
        </View>
      </View>

      {/* Results Title */}
      <Text variant="headlineMedium" style={styles.resultsTitle}>
        RESULTADOS
      </Text>
      
      <Text style={styles.subtitle}>
        Hemos detectado las siguientes condiciones y un tipo cosmético de piel 
        para tu rostro. Estas características serán utilizadas para crear tu rutina de cuidado de la piel.
      </Text>

      {/* Skin Type Card */}
      <Surface style={styles.resultCard} elevation={3}>
        <View style={styles.cardHeader}>
          <Text variant="titleMedium" style={styles.cardTitle}>TIPO DE PIEL</Text>
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
      </Surface>

      {/* Conditions Card */}
      <Surface style={styles.resultCard} elevation={3}>
        <View style={styles.cardHeader}>
          <Text variant="titleMedium" style={styles.cardTitle}>CONDICIONES</Text>
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
      </Surface>
      
     {/* Sensitive Skin Card */}
     <Surface style={styles.resultCard} elevation={3}>
        <View style={styles.cardHeader}>
          <Text variant="titleMedium" style={styles.cardTitle}>SENSIBILIDAD</Text>
        </View>
        <View style={styles.cardContent}>
          <View style={styles.resultBadge}>
            <Text style={styles.resultText}>
              {route.params.sensitive ? 'Piel Sensible' : 'Piel No Sensible'}
            </Text>
          </View>
        </View>
      </Surface>

      {/* Action Buttons */}
      <View style={styles.actionContainer}>

        <Button 
          mode="contained" 
          style={styles.continueButton}
          labelStyle={styles.continueButtonText}
          onPress={async () => {
            await setHasCompletedOnboarding(true);
            // RootNavigation will now detect this change and switch to MainAppStack
          }}
        >
          Siguiente
        </Button>
        
        <Button 
          mode="outlined" 
          style={styles.logoutButtonBottom}
          labelStyle={styles.logoutButtonBottomText}
          onPress={handleLogout}
          icon="logout"
        >
          Cerrar Sesión
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffece0',
  },
  contentContainer: {
    padding: 20,
    paddingTop: 40,
  },
  headerContainer: {
    marginBottom: 30,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  logoContainer: {
    alignItems: 'center',
    backgroundColor: 'transparent',
    flex: 1,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 12,
  },
  logoText: {
    color: '#6b0d29',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
  },
  // logoutButton: {
  //   marginTop: 10,
  // },
  resultsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 20,
    paddingHorizontal: 10,
  },
  resultCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginBottom: 20,
    overflow: 'hidden',
    elevation: 3,
  },
  cardHeader: {
    backgroundColor: '#a44230',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  cardTitle: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  cardContent: {
    padding: 20,
  },
  resultBadge: {
    backgroundColor: '#a44230',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  resultText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  confidenceText: {
    color: '#666666',
    fontSize: 14,
    marginBottom: 16,
  },
  conditionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  conditionBadge: {
    backgroundColor: '#a44230',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 15,
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
    color: '#666666',
    fontSize: 16,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  analysisImage: {
    width: '100%',
    height: 180,
    borderRadius: 15,
    backgroundColor: '#F5F5F5',
  },
  actionContainer: {
    marginTop: 20,
    gap: 15,
  },
  disagreeButton: {
    borderColor: '#a44230',
    borderWidth: 2,
    borderRadius: 25,
    paddingVertical: 8,
  },
  disagreeButtonText: {
    color: '#a44230',
    fontWeight: 'bold',
    fontSize: 16,
  },
  continueButton: {
    backgroundColor: '#a44230',
    borderRadius: 25,
    paddingVertical: 8,
    elevation: 3,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  logoutButtonBottom: {
    borderColor: '#6b0d29',
    borderWidth: 1,
    borderRadius: 25,
    paddingVertical: 8,
  },
  logoutButtonBottomText: {
    color: '#6b0d29',
    fontWeight: 'bold',
    fontSize: 16,
  },
});