import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Text, Modal, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ProductCard from '../../components/ProductCard';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, Product } from '../../navigation/_types';
import { useUser } from '../../../context/UserContext';
import { Button, TextInput, IconButton } from 'react-native-paper';
import UsageTextDisplay from '../../components/UsageTextDisplay';

const CATEGORY_LABELS: Record<'limpiar' | 'tratar' | 'proteger', string> = {
  limpiar: 'LIMPIEZA',
  tratar: 'TRATAMIENTO',
  proteger: 'PROTECCIÓN',
};

interface ExistingFeedback {
  feedback_id: number;
  user_id: string;
  rating: number;
  message: string;
  created_at: string;
  status: string;
  feedback_type: string;
}

export default function RoutineScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [routineId, setRoutineId] = useState<number | null>(null);
  const [usage, setUsage] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingUsage, setIsGeneratingUsage] = useState(false);
  const [showUsage, setShowUsage] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedRating, setSelectedRating] = useState(0);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [existingFeedback, setExistingFeedback] = useState<ExistingFeedback | null>(null);
  const [isEditingFeedback, setIsEditingFeedback] = useState(false);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const {setHasCompletedOnboarding} = useUser();

  useEffect(() => {
    const fetchRoutine = async () => {
      try {
        const userId = await AsyncStorage.getItem('user_id');
        if (!userId) throw new Error('user_id not found');

        const response = await fetch(`https://o1f915v3gh.execute-api.us-east-1.amazonaws.com/default/routines?user_id=${userId}`);
        if (!response.ok) throw new Error(`Error fetching routine: ${response.status}`);

        const data = await response.json();
        setProducts(data.products || []);
        setRoutineId(data.routine_id || null);
        setUsage(data.usage || null);

        // Fetch existing feedback if routine exists
        if (data.routine_id) {
          fetchExistingFeedback(data.routine_id);
        }
      } catch (error) {
        console.log('Failed to fetch routine:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRoutine();
  }, []);

  const fetchExistingFeedback = async (routineId: number) => {
    try {
      const response = await fetch(`https://o1f915v3gh.execute-api.us-east-1.amazonaws.com/default/routine_review?routine_id=${routineId}`);
      if (response.ok) {
        const feedbackData = await response.json();
        setExistingFeedback(feedbackData);
      }
    } catch (error) {
      console.log('No existing feedback found or error fetching:', error);
    }
  };

  const handlePressProductCard = (product: Product) => {
    navigation.navigate('ProductDetail', { product });
  };

  const generateUsage = async () => {
    if (!routineId || products.length === 0) return;
  
    setIsGeneratingUsage(true);
    try {
      const productIds = products.map(product => product.product_id);
  
      const response = await fetch('https://o1f915v3gh.execute-api.us-east-1.amazonaws.com/default/routine_usage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          routine_id: routineId,
          product_ids: productIds,
        }),
      });
  
      if (!response.ok) {
        const errorBody = await response.text();
        console.error('Error response:', {
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
          body: errorBody,
        });
        throw new Error(`Error generating usage: ${response.status} ${response.statusText}`);
      }
  
      const data = await response.json();
      setUsage(data.usage);
      console.log("Generating usage, ", data);
    } catch (error) {
      console.log('❌Failed to generate usage:', error);
    } finally {
      setIsGeneratingUsage(false);
    }
  };

  const handleFeedbackPress = () => {
    if (existingFeedback) {
      // Pre-populate with existing feedback
      setSelectedRating(existingFeedback.rating);
      setFeedbackMessage(existingFeedback.message);
      setIsEditingFeedback(true);
    } else {
      // New feedback
      setSelectedRating(0);
      setFeedbackMessage('');
      setIsEditingFeedback(false);
    }
    setShowFeedbackModal(true);
  };

  const renderRatingStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <TouchableOpacity
          key={i}
          onPress={() => setSelectedRating(i)}
          style={styles.starButton}
        >
          <Text style={[
            styles.starText,
            { color: i <= selectedRating ? '#FFD700' : '#E0E0E0' }
          ]}>
            ★
          </Text>
        </TouchableOpacity>
      );
    }
    return stars;
  };

  const submitFeedback = async () => {
    if (selectedRating === 0) {
      Alert.alert('Error', 'Por favor selecciona una calificación');
      return;
    }

    setIsSubmittingFeedback(true);

    try {
      const userId = await AsyncStorage.getItem('user_id');
      if (!userId) {
        Alert.alert('Error', 'No se pudo obtener el ID de usuario');
        return;
      }

      const method = isEditingFeedback ? 'PATCH' : 'POST';
      const response = await fetch('https://o1f915v3gh.execute-api.us-east-1.amazonaws.com/default/routine_review', {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          routine_id: routineId,
          rating: selectedRating,
          message: feedbackMessage.trim() || '',
        }),
      });

      const result = await response.json();

      if (response.ok) {
        const successMessage = isEditingFeedback 
          ? 'Tu feedback ha sido actualizado correctamente' 
          : 'Tu feedback ha sido enviado correctamente';
        
        Alert.alert('¡Éxito!', successMessage, [
          {
            text: 'OK',
            onPress: () => {
              setShowFeedbackModal(false);
              // Refresh existing feedback
              if (routineId) {
                fetchExistingFeedback(routineId);
              }
            },
          },
        ]);
      } else {
        Alert.alert('Error', result.error || 'No se pudo procesar el feedback');
      }
    } catch (error) {
      Alert.alert('Error', 'Error de conexión. Intenta nuevamente.');
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  const handleCancelFeedbackModal = () => {
    setShowFeedbackModal(false);
    setSelectedRating(0);
    setFeedbackMessage('');
    setIsEditingFeedback(false);
  };

  const groupByCategory = (category: keyof Pick<Product, 'limpiar' | 'tratar' | 'proteger'>, usedProductIds: Set<string>) => {
    return products.filter((p) => p[category] && !usedProductIds.has(p.product_id));
  };

  const renderCategory = (category: 'limpiar' | 'tratar' | 'proteger', usedProductIds: Set<string>) => {
    const grouped = groupByCategory(category, usedProductIds);
    if (grouped.length === 0) return null;

    // Add these product IDs to the used set
    grouped.forEach(product => usedProductIds.add(product.product_id));

    return (
      <View style={styles.categoryBox}>
        <Text style={styles.categoryTitle}>{CATEGORY_LABELS[category]}</Text>
        {grouped.map((product) => {
          return (
            <ProductCard
              key={product.product_id}
              name={product.name}
              brand={product.brand}
              category={category}
              imageUri={product.image_base64 ? `data:image/jpeg;base64,${product.image_base64}` : ''}
              onPress={() => handlePressProductCard(product)}
            />
          );
        })}
      </View>
    );
  };

  const renderExistingFeedback = () => {
    if (!existingFeedback) return null;

    const renderStars = (rating: number) => {
      return Array.from({ length: 5 }, (_, i) => (
        <Text
          key={i}
          style={[
            styles.displayStarText,
            { color: i < rating ? '#FFD700' : '#E0E0E0' }
          ]}
        >
          ★
        </Text>
      ));
    };

    return (
      <View style={styles.existingFeedbackContainer}>
        <View style={styles.existingFeedbackHeader}>
          <Text style={styles.existingFeedbackTitle}>Tu Evaluación</Text>
          {/* <TouchableOpacity
            onPress={handleFeedbackPress}
            style={styles.editFeedbackButton}
          >
            <Text style={styles.editFeedbackIcon}>✏️</Text>
          </TouchableOpacity> */}
          <IconButton
            icon="pencil"
            size={20}
            iconColor="#a44230"
            style={styles.editFeedbackButton}
            onPress={handleFeedbackPress}
          />
        </View>
        <View style={styles.existingFeedbackContent}>
          <View style={styles.existingRatingRow}>
            <Text style={styles.existingRatingLabel}>Calificación: </Text>
            <View style={styles.existingStarsContainer}>
              {renderStars(existingFeedback.rating)}
            </View>
          </View>
          {existingFeedback.message && (
            <View style={styles.existingMessageContainer}>
              <Text style={styles.existingMessageLabel}>Comentario:</Text>
              <Text style={styles.existingMessageText}>{existingFeedback.message}</Text>
            </View>
          )}
          <Text style={styles.existingFeedbackDate}>
            Enviado el {new Date(existingFeedback.created_at).toLocaleDateString('es-ES')}
          </Text>
        </View>
      </View>
    );
  };

  const usedProductIds = new Set<string>();
  const hasProducts = products.length > 0;

  // Show loading state
  if (isLoading) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <Text style={styles.title}>Tu Rutina de Cuidado</Text>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Cargando tu rutina personalizada...</Text>
        </View>
      </ScrollView>
    );
  }

  const handleLogout = () => {
    setHasCompletedOnboarding(false);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>Tu Rutina de Cuidado</Text>
      
      {hasProducts ? (
        <Text style={styles.subtitle}>
          Basado en tu análisis, te recomendamos los siguientes productos:
        </Text>
      ) : (
        <View style={styles.noProductsContainer}>
          <Text style={styles.noProductsTitle}>
            Seguimos trabajando en buscar productos para ti
          </Text>
          <Text style={styles.noProductsSubtitle}>
            Estamos analizando tu perfil de piel para encontrar los productos perfectos que se adapten a tus necesidades específicas.
          </Text>
          <Text style={styles.noProductsFooter}>
            Vuelve pronto para descubrir tu rutina personalizada ✨
          </Text>
          <Button onPress={handleLogout}>
            Volver a tomar fotos
          </Button>
        </View>
      )}

      {hasProducts && (
        <>
          {renderCategory('limpiar', usedProductIds)}
          {renderCategory('tratar', usedProductIds)}
          {renderCategory('proteger', usedProductIds)}
          
          {/* Usage Instructions Section */}
          <View style={styles.usageSection}>
            <View style={styles.usageTitleRow}>
              <Text style={styles.usageTitle}>Instrucciones de Uso</Text>
              {usage && (
                <TouchableOpacity 
                  onPress={() => setShowUsage(!showUsage)}
                  style={styles.toggleUsageButton}
                >
                  <Text style={styles.toggleUsageText}>
                    {showUsage ? 'Ocultar' : 'Mostrar'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
            
            {usage ? (
              <View style={styles.usageContent}>
                {showUsage && <UsageTextDisplay usage={usage} />}
                <Button
                  mode="outlined"
                  onPress={generateUsage}
                  loading={isGeneratingUsage}
                  disabled={isGeneratingUsage}
                  style={styles.regenerateButton}
                  textColor="#a44230"
                >
                  {isGeneratingUsage ? 'Regenerando...' : 'Regenerar Instrucciones'}
                </Button>
              </View>
            ) : (
              <View style={styles.usagePrompt}>
                <Text style={styles.usagePromptText}>
                  ¿Quieres saber cómo aplicar tu rutina de cuidado?
                </Text>
                <Button
                  mode="contained"
                  onPress={generateUsage}
                  loading={isGeneratingUsage}
                  disabled={isGeneratingUsage}
                  style={styles.generateButton}
                  buttonColor="#a44230"
                >
                  {isGeneratingUsage ? 'Generando...' : 'Generar Instrucciones'}
                </Button>
              </View>
            )}
          </View>

          {/* Existing Feedback Display */}
          {existingFeedback && renderExistingFeedback()}

          {/* Feedback Section - Only show if no existing feedback */}
          {!existingFeedback && (
            <View style={styles.feedbackSection}>
              <Text style={styles.feedbackTitle}>¿Cómo calificas tu rutina?</Text>
              <Text style={styles.feedbackSubtitle}>
                Tu opinión nos ayuda a mejorar las recomendaciones
              </Text>
              <Button
                mode="contained"
                onPress={handleFeedbackPress}
                style={styles.feedbackButton}
                buttonColor="#a44230"
                icon="star"
              >
                Enviar Feedback
              </Button>
            </View>
          )}
        </>
      )}

      {/* Feedback Modal */}
      <Modal
        visible={showFeedbackModal}
        transparent={true}
        animationType="slide"
        onRequestClose={handleCancelFeedbackModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {isEditingFeedback ? 'Editar tu evaluación' : 'Evalúa tu rutina'}
            </Text>
            
            {/* Rating Stars */}
            <View style={styles.modalRatingSection}>
              <Text style={styles.ratingLabel}>Calificación:</Text>
              <View style={styles.starsContainer}>
                {renderRatingStars()}
              </View>
            </View>

            {/* Feedback Text Input */}
            <TextInput
              mode="outlined"
              label="Comparte tu experiencia (opcional)"
              value={feedbackMessage}
              onChangeText={setFeedbackMessage}
              multiline
              numberOfLines={4}
              style={styles.modalFeedbackInput}
              outlineColor="rgba(164, 66, 48, 0.3)"
              activeOutlineColor="#a44230"
            />

            {/* Action Buttons */}
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={handleCancelFeedbackModal}
              >
                <Text style={styles.modalCancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalSubmitButton,
                  (isSubmittingFeedback || selectedRating === 0) && styles.modalSubmitButtonDisabled
                ]}
                onPress={submitFeedback}
                disabled={isSubmittingFeedback || selectedRating === 0}
              >
                <Text style={styles.modalSubmitButtonText}>
                  {isSubmittingFeedback 
                    ? (isEditingFeedback ? 'Actualizando...' : 'Enviando...') 
                    : (isEditingFeedback ? 'Actualizar' : 'Enviar Feedback')
                  }
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
    paddingHorizontal: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  noProductsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 30,
    marginHorizontal: 10,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  noProductsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#a44230',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 24,
  },
  noProductsSubtitle: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  noProductsFooter: {
    fontSize: 14,
    color: '#a44230',
    textAlign: 'center',
    fontWeight: '600',
    fontStyle: 'italic',
  },
  categoryBox: {
    marginBottom: 30,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#a44230',
    marginBottom: 12,
    marginLeft: 8,
  },
  usageSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 25,
    marginTop: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  usageTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  usageTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#a44230',
  },
  toggleUsageButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    // backgroundColor: 'rgba(164, 66, 48, 0.1)',
    // borderRadius: 15,
    // borderWidth: 1,
    // borderColor: '#a44230',
  },
  toggleUsageText: {
    fontSize: 14,
    color: '#a44230',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  usagePrompt: {
    alignItems: 'center',
  },
  usagePromptText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  generateButton: {
    marginTop: 10,
    borderRadius: 25,
  },
  usageContent: {
    alignItems: 'center',
  },
  usageText: {
    fontSize: 15,
    color: '#2C3E50',
    lineHeight: 24,
    textAlign: 'left',
    marginBottom: 20,
  },
  regenerateButton: {
    borderColor: '#a44230',
    borderWidth: 1,
    borderRadius: 25,
    marginTop: 16,
  },
  // Existing Feedback Display Styles
  existingFeedbackContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  existingFeedbackHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  existingFeedbackTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#a44230',
  },
  editFeedbackButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(164, 66, 48, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#a44230',
  },
  editFeedbackIcon: {
    fontSize: 16,
  },
  existingFeedbackContent: {
    alignItems: 'center',
  },
  existingRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  existingRatingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginRight: 8,
  },
  existingStarsContainer: {
    flexDirection: 'row',
  },
  displayStarText: {
    fontSize: 20,
    marginHorizontal: 2,
  },
  existingMessageContainer: {
    width: '100%',
    marginBottom: 12,
  },
  existingMessageLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 4,
  },
  existingMessageText: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
    fontStyle: 'italic',
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  existingFeedbackDate: {
    fontSize: 12,
    color: '#999999',
    fontStyle: 'italic',
  },
  feedbackSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 25,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  feedbackTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#a44230',
    marginBottom: 8,
    textAlign: 'center',
  },
  feedbackSubtitle: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  feedbackButton: {
    borderRadius: 25,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalRatingSection: {
    marginBottom: 20,
    alignItems: 'center',
  },
  ratingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 12,
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starButton: {
    paddingHorizontal: 4,
  },
  starText: {
    fontSize: 32,
  },
  modalFeedbackInput: {
    marginBottom: 24,
    backgroundColor: '#FFFFFF',
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#a44230',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelButtonText: {
    color: '#a44230',
    fontSize: 16,
    fontWeight: '600',
  },
  modalSubmitButton: {
    flex: 1,
    backgroundColor: '#a44230',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center', // ← Add this
  },
  modalSubmitButtonDisabled: {
    backgroundColor: '#cccccc',
  },
  modalSubmitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});