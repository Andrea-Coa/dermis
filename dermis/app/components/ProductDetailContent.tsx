import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Text, Surface, Chip } from 'react-native-paper';
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
  // Generate consistent color based on product name
  const colorIndex = product.name.length % pastelColors.length;
  const backgroundColor = pastelColors[colorIndex];

  // Get product steps
  const getProductSteps = (): string[] => {
    const steps = [];
    if (product.limpiar) steps.push('Limpiar');
    if (product.tratar) steps.push('Tratar');
    if (product.proteger) steps.push('Proteger');
    return steps;
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
  // console.log(product);
  console.log(product.product_id);

  return (
    <View style={styles.container}>
      {/* Header Section with Image */}
      <Surface style={[styles.headerCard, { backgroundColor }]} elevation={3}>
        <View style={styles.stepContainer}>
          {getProductSteps().map((step, index) => (
            <Chip 
              key={index}
              style={styles.stepChip} 
              textStyle={styles.stepChipText}
              mode="flat"
            >
              {step.toUpperCase()}
            </Chip>
          ))}
        </View>
        
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
          <Text style={styles.productTitle}>{product.name}</Text>
          <Text style={styles.productBrand}>{product.brand}</Text>
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

      {/* Description Section */}
      <Surface style={styles.descriptionCard} elevation={2}>
        <Text style={styles.sectionTitle}>Descripción</Text>
        <Text style={styles.descriptionText}>{product.description}</Text>
      </Surface>

      {/* Ingredients Section */}
      <Surface style={styles.ingredientsCard} elevation={2}>
        <Text style={styles.sectionTitle}>Ingredientes</Text>
        <View style={styles.ingredientsList}>
          {product.ingredients.map((ingredient, index) => (
            <View key={index} style={styles.ingredientItem}>
              <Text style={styles.ingredientBullet}>•</Text>
              <Text style={styles.ingredientText}>{ingredient}</Text>
            </View>
          ))}
        </View>
      </Surface>

      {/* Usage Instructions Section */}
      <Surface style={styles.instructionsCard} elevation={2}>
        <Text style={styles.sectionTitle}>Modo de Uso</Text>
        <Text style={styles.instructionsText}>
          {getUsageInstructions(getProductSteps())}
        </Text>
      </Surface>
    </View>
  );
}

// Helper function to generate usage instructions based on product steps
function getUsageInstructions(steps: string[]): string {
  if (steps.length === 0) return 'Sigue las instrucciones del fabricante para obtener mejores resultados.';
  
  let instructions = '';
  
  if (steps.includes('Limpiar')) {
    instructions += 'LIMPIAR: Aplica sobre la piel húmeda, masajea suavemente en movimientos circulares y enjuaga con agua tibia. ';
  }
  
  if (steps.includes('Tratar')) {
    instructions += 'TRATAR: Aplica unas gotas sobre la piel limpia y seca. Masajea suavemente hasta su completa absorción. ';
  }
  
  if (steps.includes('Proteger')) {
    instructions += 'PROTEGER: Aplica generosamente sobre toda la cara y cuello 15 minutos antes de la exposición solar. Reaplica cada 2 horas. ';
  }
  
  return instructions.trim();
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
  stepContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
    justifyContent: 'center',
  },
  stepChip: {
    backgroundColor: 'rgba(164, 66, 48, 0.1)',
  },
  stepChipText: {
    color: '#a44230',
    fontWeight: 'bold',
    fontSize: 12,
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
  instructionsCard: {
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
  ingredientsList: {
    gap: 8,
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  ingredientBullet: {
    fontSize: 16,
    color: '#a44230',
    fontWeight: 'bold',
    marginTop: 1,
  },
  ingredientText: {
    fontSize: 14,
    color: '#666666',
    flex: 1,
    lineHeight: 20,
  },
  instructionsText: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 22,
  },
});