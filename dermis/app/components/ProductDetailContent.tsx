import React, { useState } from 'react';
import { View, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Text, Surface } from 'react-native-paper';
import { Product } from '../navigation/_types';

type Props = {
  product: Product;
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

export default function ProductDetailContent({ product }: Props) {
  const [showAllIngredients, setShowAllIngredients] = useState(false);

  // Generate consistent color based on product name
  const colorIndex = product.name.length % pastelColors.length;
  const backgroundColor = pastelColors[colorIndex];

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
    const maxLength = 100; // Adjust this value as needed

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

  console.log(product.description);

  return (
    <View style={styles.container}>
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

      {/* Rating Section */}
      <Surface style={styles.ratingCard} elevation={2}>
        <View style={styles.ratingContainer}>
          <Text style={styles.starsText}>{renderStars(product.stars)}</Text>
          <Text style={styles.ratingText}>
            {product.stars.toFixed(1)} ({product.num_reviews} reseñas)
          </Text>
        </View>
      </Surface>

      {/* Description Section - Only show if description exists and is not empty */}
      {product.description && product.description.trim() !== '' && (
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    gap: 16,
  },
  headerCard: {
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    overflow: 'hidden',
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
  },
  descriptionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
  },
  ingredientsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
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
});