import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Text, Surface, Chip } from 'react-native-paper';
import { SafeImagePickerAsset, Product } from '../navigation/_types';

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
  // Generate consistent color based on step and title (same logic as ProductCard)
  const colorIndex = (product.step + product.title).length % pastelColors.length;
  const backgroundColor = pastelColors[colorIndex];

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <Surface style={[styles.headerCard, { backgroundColor }]} elevation={3}>
        <View style={styles.stepContainer}>
          <Chip 
            style={styles.stepChip} 
            textStyle={styles.stepChipText}
            mode="flat"
          >
            {product.step.toUpperCase()}
          </Chip>
        </View>
        
        <View style={styles.heroSection}>
          <Image 
            source={{ uri: product.image.uri }} 
            style={styles.productImage} 
            resizeMode="cover" 
          />
          <View style={styles.titleSection}>
            <Text style={styles.productTitle}>{product.title}</Text>
            <Text style={styles.productDescription}>{product.description}</Text>
          </View>
        </View>
      </Surface>

      {/* Details Section */}
      <Surface style={styles.detailsCard} elevation={2}>
        <Text style={styles.sectionTitle}>Detalles del Producto</Text>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Paso en la rutina:</Text>
          <Text style={styles.detailValue}>{product.step}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Tipo de producto:</Text>
          <Text style={styles.detailValue}>
            {getProductType(product.step)}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Momento ideal:</Text>
          <Text style={styles.detailValue}>
            {getIdealTime(product.step)}
          </Text>
        </View>
      </Surface>

      {/* Instructions Section */}
      <Surface style={styles.instructionsCard} elevation={2}>
        <Text style={styles.sectionTitle}>Modo de Uso</Text>
        <Text style={styles.instructionsText}>
          {getUsageInstructions(product.step)}
        </Text>
      </Surface>

      {/* Benefits Section */}
      <Surface style={styles.benefitsCard} elevation={2}>
        <Text style={styles.sectionTitle}>Beneficios</Text>
        <Text style={styles.benefitsText}>
          {getBenefits(product.step, product.description)}
        </Text>
      </Surface>
    </View>
  );
}

// Helper functions to generate content based on product step
function getProductType(step: string): string {
  switch (step.toLowerCase()) {
    case 'limpiar':
      return 'Limpiador facial';
    case 'tratar':
      return 'Suero/Tratamiento';
    case 'proteger':
      return 'Protector solar';
    default:
      return 'Producto de cuidado facial';
  }
}

function getIdealTime(step: string): string {
  switch (step.toLowerCase()) {
    case 'limpiar':
      return 'Mañana y noche';
    case 'tratar':
      return 'Después de la limpieza';
    case 'proteger':
      return 'Cada mañana';
    default:
      return 'Según indicaciones';
  }
}

function getUsageInstructions(step: string): string {
  switch (step.toLowerCase()) {
    case 'limpiar':
      return 'Aplica sobre la piel húmeda, masajea suavemente en movimientos circulares y enjuaga con agua tibia. Usa mañana y noche para mantener la piel limpia y fresca.';
    case 'tratar':
      return 'Aplica unas gotas sobre la piel limpia y seca. Masajea suavemente hasta su completa absorción. Úsalo antes de tu crema hidratante.';
    case 'proteger':
      return 'Aplica generosamente sobre toda la cara y cuello 15 minutos antes de la exposición solar. Reaplica cada 2 horas o después de sudar o mojarse.';
    default:
      return 'Sigue las instrucciones del fabricante para obtener mejores resultados.';
  }
}

function getBenefits(step: string, description: string): string {
  const baseBenefit = description;
  switch (step.toLowerCase()) {
    case 'limpiar':
      return `${baseBenefit} Elimina impurezas, maquillaje y exceso de grasa, preparando la piel para los siguientes pasos de tu rutina.`;
    case 'tratar':
      return `${baseBenefit} Proporciona ingredientes activos concentrados que penetran profundamente para tratar problemas específicos de la piel.`;
    case 'proteger':
      return `${baseBenefit} Forma una barrera protectora contra los daños ambientales y previene el fotoenvejecimiento.`;
    default:
      return baseBenefit;
  }
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
    overflow: 'hidden',
  },
  stepContainer: {
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  stepChip: {
    backgroundColor: 'rgba(164, 66, 48, 0.1)',
  },
  stepChipText: {
    color: '#a44230',
    fontWeight: 'bold',
    fontSize: 12,
  },
  heroSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  productImage: {
    width: 120,
    height: 120,
    borderRadius: 16,
  },
  titleSection: {
    flex: 1,
  },
  productTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
    lineHeight: 30,
  },
  productDescription: {
    fontSize: 16,
    color: '#666666',
    lineHeight: 22,
  },
  detailsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
  },
  instructionsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
  },
  benefitsCard: {
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
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  detailLabel: {
    fontSize: 14,
    color: '#666666',
    flex: 1,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: '#2C3E50',
    flex: 1,
    textAlign: 'right',
    fontWeight: '600',
  },
  instructionsText: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 22,
  },
  benefitsText: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 22,
  },
});