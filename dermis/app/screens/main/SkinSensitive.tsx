import React, { useState } from 'react';
import { View, StyleSheet, Image, ScrollView, Dimensions } from 'react-native';
import { Text, Card, Surface, Button } from 'react-native-paper';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/_types';
import AsyncStorage from '@react-native-async-storage/async-storage';

type SkinSensitiveRouteProp = RouteProp<RootStackParamList, 'SkinSensitive'>;
type SkinSensitiveNavigationProp = NativeStackNavigationProp<RootStackParamList, 'SkinSensitive'>;

const { width } = Dimensions.get('window');

export default function SkinSensitive() {
  const route = useRoute<SkinSensitiveRouteProp>();
  const navigation = useNavigation<SkinSensitiveNavigationProp>();
  const { results } = route.params;
  const [selectedOption, setSelectedOption] = useState<boolean | null>(null);

  const handleContinue = async () => {
    // If user doesn't know (null), default to true (sensitive)
    const isSensitive = selectedOption === null ? true : selectedOption;
    
    try {
      // Send data to backend
      const user_id = await AsyncStorage.getItem("user_id")
      console.log(user_id);
      const response = await fetch('https://70i447ofic.execute-api.us-east-1.amazonaws.com/register_users_dermis', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          _user_id: user_id, // Replace with actual user ID
          results: {
            cnn: {
              skinType: results.cnn.skinType
            },
            eff :{
              conditions: results.eff.conditions
            }
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();
      console.log('Backend response:', responseData);
      
      // Navigate to results after successful API call
      navigation.navigate('AnalysisResults', {
        results,
        sensitive: isSensitive,
      });
      
    } catch (error) {
      console.error('Error sending data to backend:', error);
      // You might want to show an error message to the user here
      // For now, we'll still navigate to maintain user flow
      navigation.navigate('AnalysisResults', {
        results,
        sensitive: isSensitive,
      });
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header with Logo */}
      <View style={styles.headerContainer}>
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

      {/* Title */}
      <Text variant="headlineMedium" style={styles.title}>
        PIEL SENSIBLE
      </Text>

      {/* Explanation Card */}
      <Surface style={styles.explanationCard} elevation={3}>
        <View style={styles.cardHeader}>
          <Text variant="titleMedium" style={styles.cardTitle}>¿QUÉ ES LA PIEL SENSIBLE?</Text>
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.explanationText}>
            La piel sensible es un tipo de piel que reacciona fácilmente a factores externos como:
          </Text>
          <View style={styles.bulletContainer}>
            <Text style={styles.bulletText}>• Productos cosméticos o de cuidado</Text>
            <Text style={styles.bulletText}>• Cambios de temperatura</Text>
            <Text style={styles.bulletText}>• Exposición al sol</Text>
            <Text style={styles.bulletText}>• Ciertos tejidos o materiales</Text>
            <Text style={styles.bulletText}>• Estrés o cambios hormonales</Text>
          </View>
          <Text style={styles.explanationText}>
            Las personas con piel sensible pueden experimentar enrojecimiento, picazón, ardor, sequedad o irritación con mayor facilidad.
          </Text>
        </View>
      </Surface>

      {/* Question Card */}
      <Surface style={styles.questionCard} elevation={3}>
        <View style={styles.cardHeader}>
          <Text variant="titleMedium" style={styles.cardTitle}>¿TU PIEL ES SENSIBLE?</Text>
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.questionText}>
            Selecciona la opción que mejor describa tu experiencia:
          </Text>
          
          <View style={styles.optionsContainer}>
            <Button
              mode={selectedOption === true ? "contained" : "outlined"}
              style={[
                styles.optionButton,
                selectedOption === true && styles.selectedButton
              ]}
              labelStyle={[
                styles.optionButtonText,
                selectedOption === true && styles.selectedButtonText
              ]}
              onPress={() => setSelectedOption(true)}
            >
              Sí, mi piel es sensible
            </Button>

            <Button
              mode={selectedOption === false ? "contained" : "outlined"}
              style={[
                styles.optionButton,
                selectedOption === false && styles.selectedButton
              ]}
              labelStyle={[
                styles.optionButtonText,
                selectedOption === false && styles.selectedButtonText
              ]}
              onPress={() => setSelectedOption(false)}
            >
              No, mi piel no es sensible
            </Button>

            <Button
              mode={selectedOption === null ? "contained" : "outlined"}
              style={[
                styles.optionButton,
                selectedOption === null && styles.selectedButton
              ]}
              labelStyle={[
                styles.optionButtonText,
                selectedOption === null && styles.selectedButtonText
              ]}
              onPress={() => setSelectedOption(null)}
            >
              No estoy seguro/a
            </Button>
          </View>

          <Text style={styles.defaultText}>
            * Si no estás seguro/a, consideraremos tu piel como sensible para recomendaciones más suaves.
          </Text>
        </View>
      </Surface>

      {/* Continue Button */}
      <View style={styles.actionContainer}>
        <Button 
          mode="contained" 
          style={styles.continueButton}
          labelStyle={styles.continueButtonText}
          onPress={handleContinue}
        >
          Continuar
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
    alignItems: 'center',
    marginBottom: 30,
  },
  logoContainer: {
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  logo: {
    width: 60,
    height: 60,
    marginBottom: 12,
  },
  logoText: {
    color: '#a44230',
    fontWeight: 'bold',
    fontSize: 14,
    lineHeight: 18,
    textAlign: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    textAlign: 'center',
    marginBottom: 24,
  },
  explanationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginBottom: 20,
    overflow: 'hidden',
    elevation: 3,
  },
  questionCard: {
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
  explanationText: {
    fontSize: 14,
    color: '#333333',
    lineHeight: 20,
    marginBottom: 12,
    textAlign: 'justify',
  },
  bulletContainer: {
    marginVertical: 12,
    paddingLeft: 10,
  },
  bulletText: {
    fontSize: 14,
    color: '#333333',
    lineHeight: 22,
    marginBottom: 4,
  },
  questionText: {
    fontSize: 16,
    color: '#333333',
    lineHeight: 22,
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: '500',
  },
  optionsContainer: {
    gap: 12,
    marginBottom: 16,
  },
  optionButton: {
    borderColor: '#a44230',
    borderWidth: 2,
    borderRadius: 25,
    paddingVertical: 6,
  },
  selectedButton: {
    backgroundColor: '#a44230',
  },
  optionButtonText: {
    color: '#a44230',
    fontWeight: '600',
    fontSize: 15,
  },
  selectedButtonText: {
    color: '#FFFFFF',
  },
  defaultText: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 16,
  },
  actionContainer: {
    marginTop: 20,
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
});