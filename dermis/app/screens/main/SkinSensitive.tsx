import React, { useState } from 'react';
import { View, StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native';
import { Text, ActivityIndicator, Icon } from 'react-native-paper';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/_types';
import AsyncStorage from '@react-native-async-storage/async-storage';

type SkinSensitiveRouteProp = RouteProp<RootStackParamList, 'SkinSensitive'>;
type SkinSensitiveNavigationProp = NativeStackNavigationProp<RootStackParamList, 'SkinSensitive'>;

export default function SkinSensitive() {
  const route = useRoute<SkinSensitiveRouteProp>();
  const navigation = useNavigation<SkinSensitiveNavigationProp>();
  const { results } = route.params;
  const [selectedOption, setSelectedOption] = useState<boolean | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    const isSensitive = selectedOption === null ? true : selectedOption;
    
    try {
      setLoading(true);
      const user_id = await AsyncStorage.getItem("user_id");
      const response = await fetch('https://70i447ofic.execute-api.us-east-1.amazonaws.com/register_users_dermis', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          _user_id: user_id,
          is_sensitive: isSensitive.toString(),
          results: {
            cnn: { skinType: results.cnn.skinType },
            eff: { conditions: results.eff.conditions }
          },
        }),
      });
      
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      navigation.navigate('AnalysisResults', { results, sensitive: isSensitive });
    } catch (error) {
      console.error('Error:', error);
      navigation.navigate('AnalysisResults', { results, sensitive: isSensitive });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator animating={true} size="large" color="#D2691E" />
        <Text style={styles.loadingText}>Guardando información...</Text>
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
            <Text style={styles.stepLabel}>Condiciones</Text>
          </View>
          <View style={styles.progressLine} />
          <View style={styles.progressStep}>
            <View style={[styles.stepCircle]}>
              <Text style={styles.stepNumber}>2</Text>
            </View>
            <Text style={styles.stepLabel}>Tipo de piel</Text>
          </View>
          <View style={styles.progressLine} />
          <View style={styles.progressStep}>
            <View style={[styles.stepCircle, styles.activeStep]}>
              <Text style={styles.stepNumber}>3</Text>
            </View>
            <Text style={styles.stepLabel}>Sensibilidad</Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.headerContainer}>
          <Image source={require('../../../assets/logo_circle.png')} style={styles.logo} />
          <Text style={styles.headerTitle}>Sensibilidad de la piel</Text>
        </View>

        <View style={styles.descriptionContainer}>
          <Text style={styles.description}>
            Para completar tu análisis, necesitamos conocer si tienes piel sensible.
          </Text>
        </View>

        <View style={styles.mainSection}>
          <Text style={styles.sectionTitle}>¿Qué es la piel sensible?</Text>
          
          <TouchableOpacity 
            style={styles.explanationButton} 
            onPress={() => setShowExplanation(!showExplanation)}
          >
            <Text style={styles.explanationButtonText}>
              {showExplanation ? 'Ocultar información' : 'Ver información'}
            </Text>
            <Icon 
              source={showExplanation ? "chevron-up" : "chevron-down"} 
              size={20} 
              color="#FFFFFF" 
            />
          </TouchableOpacity>

          {showExplanation && (
            <View style={styles.explanationContainer}>
              <Text style={styles.explanationText}>
                La piel sensible es un tipo de piel que reacciona fácilmente a factores externos como:
              </Text>
              
              <View style={styles.bulletList}>
                <Text style={styles.bulletItem}>• Productos cosméticos o de cuidado</Text>
                <Text style={styles.bulletItem}>• Cambios de temperatura</Text>
                <Text style={styles.bulletItem}>• Exposición al sol</Text>
                <Text style={styles.bulletItem}>• Ciertos tejidos o materiales</Text>
                <Text style={styles.bulletItem}>• Estrés o cambios hormonales</Text>
              </View>
              
              <Text style={styles.explanationText}>
                Las personas con piel sensible pueden experimentar enrojecimiento, picazón, ardor, sequedad o irritación con mayor facilidad.
              </Text>
            </View>
          )}

          <Text style={styles.questionTitle}>¿Tu piel es sensible?</Text>
          <Text style={styles.questionSubtitle}>
            Selecciona la opción que mejor describa tu experiencia:
          </Text>
          
          <View style={styles.optionsContainer}>
            <TouchableOpacity
              style={[
                styles.optionButton,
                selectedOption === true && styles.selectedOption
              ]}
              onPress={() => setSelectedOption(true)}
            >
              <Text style={[
                styles.optionText,
                selectedOption === true && styles.selectedOptionText
              ]}>
                Sí, mi piel es sensible
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.optionButton,
                selectedOption === false && styles.selectedOption
              ]}
              onPress={() => setSelectedOption(false)}
            >
              <Text style={[
                styles.optionText,
                selectedOption === false && styles.selectedOptionText
              ]}>
                No, mi piel no es sensible
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.optionButton,
                selectedOption === null && styles.selectedOption
              ]}
              onPress={() => setSelectedOption(null)}
            >
              <Text style={[
                styles.optionText,
                selectedOption === null && styles.selectedOptionText
              ]}>
                No estoy seguro/a
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.noteText}>
            * Si no estás seguro/a, consideraremos tu piel como sensible para recomendaciones más suaves.
          </Text>

          <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
            <Text style={styles.continueButtonText}>Continuar</Text>
          </TouchableOpacity>
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
  mainSection: {
    backgroundColor: '#ffece0',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#a44230',
    marginBottom: 15,
    textAlign: 'center',
  },
  explanationButton: {
    backgroundColor: '#d5582b',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 15,
  },
  explanationButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  explanationContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    marginBottom: 25,
    width: '100%',
  },
  explanationText: {
    fontSize: 14,
    color: '#a44230',
    lineHeight: 20,
    marginBottom: 15,
    textAlign: 'justify',
  },
  bulletList: {
    marginVertical: 10,
    paddingLeft: 15,
  },
  bulletItem: {
    fontSize: 14,
    color: '#a44230',
    lineHeight: 22,
    marginBottom: 5,
  },
  questionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#a44230',
    textAlign: 'center',
    marginBottom: 10,
  },
  questionSubtitle: {
    fontSize: 14,
    color: '#a44230',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  optionsContainer: {
    width: '100%',
    gap: 15,
    marginBottom: 20,
  },
  optionButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderWidth: 2,
    borderColor: '#d5582b',
    alignItems: 'center',
  },
  selectedOption: {
    backgroundColor: '#d5582b',
  },
  optionText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#d5582b',
  },
  selectedOptionText: {
    color: '#FFFFFF',
  },
  noteText: {
    fontSize: 12,
    color: '#a44230',
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 25,
    lineHeight: 16,
  },
  continueButton: {
    backgroundColor: '#a44230',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingText: {
    color: '#a44230',
    fontSize: 16,
    marginTop: 15,
    textAlign: 'center',
  },
});