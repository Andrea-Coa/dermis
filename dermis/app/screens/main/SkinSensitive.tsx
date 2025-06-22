import React, { useState } from 'react';
import { View, StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Button, Modal } from 'react-native-paper';
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

  const handleContinue = async () => {
    const isSensitive = selectedOption === null ? true : selectedOption;
    
    try {
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
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header with Logo */}
      <View style={styles.headerContainer}>
        <Image 
          source={require('../../../assets/logo_yes.png')} 
          style={styles.logo}
        />
        <View style={styles.titleContainer}>
          <Text style={styles.mainTitle}>RECONOCIMIENTO FACIAL</Text>
        </View>
      </View>

      {/* Main Title */}
      <Text style={styles.pageTitle}>PIEL SENSIBLE</Text>

      {/* Explanation Trigger */}
      {/* Explanation Trigger */}
<TouchableOpacity 
  style={styles.explanationTrigger}
  onPress={() => setShowExplanation(true)}
>
  <View style={styles.triggerContent}>
    <Text style={styles.explanationTriggerText}>¿QUÉ ES LA PIEL SENSIBLE?</Text>
    <Text style={styles.arrowIcon}>▼</Text>
  </View>
</TouchableOpacity>

      {/* Question Card */}
      <View style={styles.questionCard}>
        <Text style={styles.questionTitle}>¿TU PIEL ES SENSIBLE?</Text>
        <Text style={styles.questionSubtitle}>
          Selecciona la opción que mejor describa tu experiencia:
        </Text>
        
        <View style={styles.optionsContainer}>
          <Button
            mode={selectedOption === true ? "contained" : "outlined"}
            style={[
              styles.optionButton,
              selectedOption === true && styles.selectedButton
            ]}
            labelStyle={styles.optionButtonText}
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
            labelStyle={styles.optionButtonText}
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
            labelStyle={styles.optionButtonText}
            onPress={() => setSelectedOption(null)}
          >
            No estoy seguro/a
          </Button>
        </View>

        <Text style={styles.noteText}>
          * Si no estás seguro/a, consideraremos tu piel como sensible para recomendaciones más suaves.
        </Text>
      </View>

      {/* Continue Button */}
      <Button 
        mode="contained" 
        style={styles.continueButton}
        labelStyle={styles.continueButtonText}
        onPress={handleContinue}
      >
        Continuar
      </Button>

      {/* Explanation Modal */}
      <Modal
        visible={showExplanation}
        onDismiss={() => setShowExplanation(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>¿QUÉ ES LA PIEL SENSIBLE?</Text>
          
          <Text style={styles.modalText}>
            La piel sensible es un tipo de piel que reacciona fácilmente a factores externos como:
          </Text>
          
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>• Productos cosméticos o de cuidado</Text>
            <Text style={styles.bulletItem}>• Cambios de temperatura</Text>
            <Text style={styles.bulletItem}>• Exposición al sol</Text>
            <Text style={styles.bulletItem}>• Ciertos tejidos o materiales</Text>
            <Text style={styles.bulletItem}>• Estrés o cambios hormonales</Text>
          </View>
          
          <Text style={styles.modalText}>
            Las personas con piel sensible pueden experimentar enrojecimiento, picazón, ardor, sequedad o irritación con mayor facilidad.
          </Text>
          
          <Button 
            mode="contained" 
            style={styles.modalButton}
            onPress={() => setShowExplanation(false)}
          >
            Entendido
          </Button>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#ffece0',
    padding: 20,
    paddingBottom: 40,
  },
  triggerContent: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  width: '100%',
},
arrowIcon: {
  color: 'white',
  fontSize: 16,
  marginLeft: 10,
},
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    width: 120,
    height: 120,
    marginRight: -30,
    zIndex: 2,
  },
  titleContainer: {
    flex: 1,
    backgroundColor: '#eb8c84',
    borderRadius: 15,
    height: 85,
    justifyContent: 'center',
    paddingLeft: 40,
    marginLeft: -20,
  },
  mainTitle: {
    color: '#ffece0',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  pageTitle: {
    color: '#d5582b',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
  },
  explanationTrigger: {
    backgroundColor: '#a44230',
    borderRadius: 10,
    padding: 15,
    marginBottom: 25,
    alignItems: 'center',
  },
  explanationTriggerText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  questionCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 30,
    elevation: 3,
  },
  questionTitle: {
    color: '#6b0d29',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  questionSubtitle: {
    color: '#6b0d29',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  optionsContainer: {
    gap: 15,
    marginBottom: 15,
  },
  optionButton: {
    borderColor: '#a44230',
    borderWidth: 2,
    borderRadius: 25,
  },
  selectedButton: {
    backgroundColor: '#a44230',
  },
  optionButtonText: {
    color: '#a44230',
    fontWeight: 'bold',
    fontSize: 15,
  },
  selectedButtonText: {
    color: 'white',
  },
  noteText: {
    color: '#6b0d29',
    fontSize: 12,
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 10,
  },
  continueButton: {
    backgroundColor: '#a44230',
    borderRadius: 25,
    paddingVertical: 8,
    width: '80%',
    alignSelf: 'center',
  },
  continueButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalContainer: {
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
  },
  modalTitle: {
    color: '#6b0d29',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
  },
  modalText: {
    color: '#6b0d29',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 15,
    textAlign: 'justify',
  },
  bulletList: {
    marginVertical: 10,
    paddingLeft: 15,
  },
  bulletItem: {
    color: '#6b0d29',
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 5,
  },
  modalButton: {
    backgroundColor: '#a44230',
    borderRadius: 25,
    marginTop: 15,
  },
});