import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, IconButton } from 'react-native-paper';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ProductDetailContent from '../../components/ProductDetailContent';
import { Product, RootStackParamList } from '../../navigation/_types';

type ProductDetailRouteProp = RouteProp<RootStackParamList, 'ProductDetail'>;

export default function ProductDetailScreen() {
  const route = useRoute<ProductDetailRouteProp>();
  const navigation = useNavigation();
  const { product } = route.params;

  const handleBackPress = () => {
    navigation.goBack();
  };

  // Get the product steps for the subtitle
  const getProductSteps = (product: Product): string => {
    const steps = [];
    if (product.limpiar) steps.push('Limpiar');
    if (product.tratar) steps.push('Tratar');
    if (product.proteger) steps.push('Proteger');
    return steps.join(' • ');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Custom Header */}
      <View style={styles.header}>
        <IconButton
          icon="arrow-left"
          size={24}
          iconColor="#2C3E50"
          style={styles.backButton}
          onPress={handleBackPress}
        />
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Detalle del Producto</Text>
          <Text style={styles.headerSubtitle}>{getProductSteps(product)}</Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      {/* Scrollable Content */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        <ProductDetailContent product={product} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffece0', // Same background as Routine screen
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#ffece0',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(44, 62, 80, 0.1)',
  },
  backButton: {
    margin: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  headerTextContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#a44230',
    fontWeight: '600',
    textTransform: 'uppercase',
    marginTop: 2,
  },
  headerSpacer: {
    width: 48, // Same width as back button to center the title
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: 32, // Extra padding at bottom for comfortable scrolling
  },
});