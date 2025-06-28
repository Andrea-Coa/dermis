import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Image, TouchableOpacity, Alert, ScrollView, Modal } from 'react-native';
import { Text, Surface, Button, TextInput, IconButton } from 'react-native-paper';
import { Product } from '../navigation/_types';

type Props = {
  product: Product;
  userId?: string;
};

type ExistingReview = {
  review_id: number;
  stars: number;
  review: string | null;
  created_at: string;
};

// Same pastel colors as ProductCard for consistency
const pastelColors = [
  '#FFE5E5', // Pastel Pink
  '#E5F3FF', // Pastel Blue
  '#E5FFE5', // Pastel Green
  '#FFF5E5', // Pastel Orange
  '#F0E5FF', // Pastel Purple
  '#E5FFFF', // Pastel Cyan
  '#FFFFE5', // Pastel Yellow
  '#FFE5F5', // Pastel Rose
];

export default function ProductDetailContent({ product, userId }: Props) {
  const [showAllIngredients, setShowAllIngredients] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedRating, setSelectedRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingReview, setIsLoadingReview] = useState(false);
  const [existingReview, setExistingReview] = useState<ExistingReview | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Generate consistent color based on product name
  const colorIndex = product.name.length % pastelColors.length;
  const backgroundColor = pastelColors[colorIndex];

  // Load existing review on component mount
  useEffect(() => {
    if (userId && product.product_id) {
      loadExistingReview();
    }
  }, [userId, product.product_id]);

  // Load existing review function
  const loadExistingReview = async () => {
    if (!userId) return;

    setIsLoadingReview(true);
    try {
      const response = await fetch(
        `https://hny1katz64.execute-api.us-east-1.amazonaws.com/default/product_reviews?user_id=${userId}&product_id=${product.product_id}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const reviewData = await response.json();
        setExistingReview(reviewData);
        setSelectedRating(reviewData.stars);
        setReviewText(reviewData.review || '');
      } else if (response.status === 404) {
        // No existing review found
        setExistingReview(null);
      }
    } catch (error) {
      console.error('Error loading existing review:', error);
    } finally {
      setIsLoadingReview(false);
    }
  };

  // Function to handle calificar button press
  const handleCalificarPress = () => {
    if (!userId) {
      Alert.alert('Error', 'Debes iniciar sesión para calificar este producto');
      return;
    }

    // Reset form if creating new review
    if (!existingReview) {
      setSelectedRating(0);
      setReviewText('');
      setIsEditing(false);
    } else {
      // Load existing review data for editing
      setSelectedRating(existingReview.stars);
      setReviewText(existingReview.review || '');
      setIsEditing(true);
    }

    setShowReviewModal(true);
  };

  // Format price
  const formatPrice = (price: number): string => {
    return `S/${price.toFixed(2)}`;
  };

  // Render stars
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push('★');
    }
    if (hasHalfStar) {
      stars.push('☆');
    }
    for (let i = stars.length; i < 5; i++) {
      stars.push('☆');
    }
    
    return stars.join(' ');
  };

  // Render interactive rating stars for review form
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

  // Helper function to capitalize first letter of each word (title case)
  const toTitleCase = (str: string): string => {
    return str.replace(/\w\S*/g, (txt) => 
      txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
  };

  // Helper function to capitalize first letter of sentences
  const capitalizeSentences = (str: string): string => {
    return str.replace(/(^\w|[.!?]\s*\w)/g, (match) => match.toUpperCase());
  };

  // Format ingredients with toggle functionality
  const formatIngredients = () => {
    if (!product.ingredients || product.ingredients.length === 0) {
      return 'No disponible';
    }

    const ingredientsText = product.ingredients.join(', ');
    const maxLength = 100;

    if (ingredientsText.length <= maxLength || showAllIngredients) {
      return ingredientsText;
    }

    return ingredientsText.substring(0, maxLength) + '...';
  };

  const shouldShowToggle = () => {
    if (!product.ingredients || product.ingredients.length === 0) {
      return false;
    }
    const ingredientsText = product.ingredients.join(', ');
    return ingredientsText.length > 100;
  };

  // Submit or update review function
  const submitReview = async () => {
    if (!userId) {
      Alert.alert('Error', 'Debes iniciar sesión para dejar una reseña');
      return;
    }

    if (selectedRating === 0) {
      Alert.alert('Error', 'Por favor selecciona una calificación');
      return;
    }

    setIsSubmitting(true);

    try {
      const method = existingReview ? 'PATCH' : 'POST';
      const response = await fetch('https://hny1katz64.execute-api.us-east-1.amazonaws.com/default/product_reviews', {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          product_id: product.product_id,
          stars: selectedRating,
          review: reviewText.trim() || null,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        const successMessage = existingReview ? 'Tu reseña ha sido actualizada correctamente' : 'Tu reseña ha sido enviada correctamente';
        Alert.alert('¡Éxito!', successMessage, [
          {
            text: 'OK',
            onPress: () => {
              setShowReviewModal(false);
              setIsEditing(false);
              loadExistingReview();
            },
          },
        ]);
      } else {
        Alert.alert('Error', result.error || 'No se pudo procesar la reseña');
      }
    } catch (error) {
      Alert.alert('Error', 'Error de conexión. Intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle cancel modal
  const handleCancelModal = () => {
    setShowReviewModal(false);
    if (existingReview) {
      setSelectedRating(existingReview.stars);
      setReviewText(existingReview.review || '');
    } else {
      setSelectedRating(0);
      setReviewText('');
    }
    setIsEditing(false);
  };

  // Format date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Header Section with Image */}
        <Surface style={[styles.headerCard, { backgroundColor }]} elevation={3}>
          <View style={styles.imageContainer}>
            {product.image_base64 ? (
              <Image 
                source={{ uri: `data:image/jpeg;base64,${product.image_base64}` }} 
                style={styles.productImage} 
                resizeMode="cover" 
              />
            ) : (
              <View style={styles.placeholderImage}>
                <Text style={styles.placeholderText}>Sin imagen</Text>
              </View>
            )}
          </View>
          
          <View style={styles.titleSection}>
            <Text style={styles.productTitle}>{toTitleCase(product.name)}</Text>
            <Text style={styles.productBrand}>{toTitleCase(product.brand)}</Text>
            <Text style={styles.productPrice}>{formatPrice(product.price)}</Text>
          </View>
        </Surface>

        {/* Rating Section with Calificar Button */}
        <Surface style={styles.ratingCard} elevation={2}>
          <View style={styles.ratingContainer}>
            <Text style={styles.starsText}>{renderStars(product.stars)}</Text>
            <Text style={styles.ratingText}>
              {product.stars.toFixed(1)} ({product.num_reviews} reseñas)
            </Text>
            
            {/* Calificar Button */}
            <Button
              mode="contained"
              onPress={handleCalificarPress}
              style={styles.calificarButton}
              labelStyle={styles.calificarButtonLabel}
              icon="star"
            >
              {existingReview ? 'Editar reseña' : 'Calificar'}
            </Button>
          </View>
        </Surface>

        {/* Description Section - Only show if description exists and is not empty */}
        {product.description && product.description.trim() !== 'NaN' && product.description != '' && (
          <Surface style={styles.descriptionCard} elevation={2}>
            <Text style={styles.sectionTitle}>Descripción</Text>
            <Text style={styles.descriptionText}>{capitalizeSentences(product.description)}</Text>
          </Surface>
        )}

        {/* Ingredients Section */}
        <Surface style={styles.ingredientsCard} elevation={2}>
          <Text style={styles.sectionTitle}>Ingredientes</Text>
          <Text style={styles.ingredientsText}>{formatIngredients()}</Text>
          {shouldShowToggle() && (
            <TouchableOpacity 
            style={styles.toggleButton}
            onPress={() => setShowAllIngredients(!showAllIngredients)}
            >
              <Text style={styles.toggleButtonText}>
                {showAllIngredients ? 'Ver menos' : 'Ver más'}
              </Text>
            </TouchableOpacity>
          )}
        </Surface>
        
        {/* Existing Review Display Section */}
        {userId && !isLoadingReview && existingReview && (
          <Surface style={styles.existingReviewCard} elevation={2}>
            <Text style={styles.sectionTitle}>Tu reseña</Text>
            <View style={styles.reviewContent}>
              <Text style={styles.existingStars}>{renderStars(existingReview.stars)}</Text>
              {existingReview.review && (
                <Text style={styles.existingReviewText}>{existingReview.review}</Text>
              )}
              <Text style={styles.reviewDate}>
                Publicada el {formatDate(existingReview.created_at)}
              </Text>
            </View>
          </Surface>
        )}

        {/* Loading indicator */}
        {isLoadingReview && userId && (
          <Surface style={styles.loadingCard} elevation={2}>
            <Text style={styles.loadingText}>Cargando reseña...</Text>
          </Surface>
        )}

        {/* Login prompt */}
        {!userId && (
          <Surface style={styles.loginPromptCard} elevation={2}>
            <Text style={styles.loginPromptText}>
              Inicia sesión para escribir una reseña
            </Text>
          </Surface>
        )}
      </ScrollView>

      {/* Review Modal */}
      <Modal
        visible={showReviewModal}
        transparent={true}
        animationType="slide"
        onRequestClose={handleCancelModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {isEditing ? 'Editar reseña' : 'Escribir reseña'}
            </Text>
            
            {/* Rating Stars */}
            <View style={styles.modalRatingSection}>
              <Text style={styles.ratingLabel}>Calificación:</Text>
              <View style={styles.starsContainer}>
                {renderRatingStars()}
              </View>
            </View>

            {/* Review Text Input */}
            <TextInput
              mode="outlined"
              label="Escribe tu reseña (opcional)"
              value={reviewText}
              onChangeText={setReviewText}
              multiline
              numberOfLines={4}
              style={styles.modalReviewInput}
              outlineColor="rgba(164, 66, 48, 0.3)"
              activeOutlineColor="#a44230"
            />

            {/* Action Buttons */}
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={handleCancelModal}
              >
                <Text style={styles.modalCancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalSubmitButton,
                  (isSubmitting || selectedRating === 0) && styles.modalSubmitButtonDisabled
                ]}
                onPress={submitReview}
                disabled={isSubmitting || selectedRating === 0}
              >
                <Text style={styles.modalSubmitButtonText}>
                  {isSubmitting ? 'Enviando...' : (isEditing ? 'Actualizar' : 'Enviar reseña')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
    padding: 20,
  },
  headerCard: {
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: 16,
  },
  imageContainer: {
    marginBottom: 20,
  },
  productImage: {
    width: 200,
    height: 200,
    borderRadius: 16,
  },
  placeholderImage: {
    width: 200,
    height: 200,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(164, 66, 48, 0.2)',
    borderStyle: 'dashed',
  },
  placeholderText: {
    color: '#a44230',
    fontSize: 14,
    fontWeight: '500',
  },
  titleSection: {
    alignItems: 'center',
  },
  productTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
    textAlign: 'center',
    lineHeight: 30,
  },
  productBrand: {
    fontSize: 18,
    color: '#a44230',
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  productPrice: {
    fontSize: 22,
    color: '#2C3E50',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  ratingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  ratingContainer: {
    alignItems: 'center',
  },
  starsText: {
    fontSize: 24,
    color: '#FFD700',
    marginBottom: 8,
  },
  ratingText: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
    marginBottom: 16,
  },
  calificarButton: {
    backgroundColor: '#a44230',
    borderRadius: 12,
    paddingHorizontal: 20,
  },
  calificarButtonLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  existingReviewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  reviewContent: {
    gap: 12,
  },
  existingStars: {
    fontSize: 20,
    color: '#FFD700',
  },
  existingReviewText: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  reviewDate: {
    fontSize: 12,
    color: '#999999',
    fontStyle: 'italic',
  },
  loadingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#666666',
  },
  loginPromptCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  loginPromptText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
  },
  descriptionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  ingredientsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 16,
  },
  descriptionText: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 22,
  },
  ingredientsText: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 22,
  },
  toggleButton: {
    marginTop: 12,
    alignSelf: 'flex-start',
  },
  toggleButtonText: {
    fontSize: 14,
    color: '#a44230',
    fontWeight: '600',
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
  modalReviewInput: {
    marginBottom: 24,
    backgroundColor: '#FFFFFF',
  },
  modalButtonContainer: {
    flexDirection: 'row',
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