import React, {useState, useEffect} from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Alert } from 'react-native';
import { Text, IconButton } from 'react-native-paper';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ProductDetailContent from '../../components/ProductDetailContent';
import { Product, RootStackParamList } from '../../navigation/_types';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ProductDetailRouteProp = RouteProp<RootStackParamList, 'ProductDetail'>;

// Add your API endpoint here
const API_ENDPOINT = 'https://hny1katz64.execute-api.us-east-1.amazonaws.com/default/scraped_products';

export default function ProductDetailScreen() {
  const [userId, setUserId] = useState<string | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const route = useRoute<ProductDetailRouteProp>();
  const navigation = useNavigation();
  const initialProduct = route.params.product;

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem('user_id');
        if (storedUserId) {
          setUserId(storedUserId);
        }
      } catch (error) {
        console.error('Failed to fetch user_id from AsyncStorage:', error);
      }
    };

    // Initialize with the passed product
    setProduct(initialProduct);
    fetchUserId();
  }, [initialProduct]);

  const fetchProductFromAPI = async (productId: string) => {
    try {
      const response = await fetch(`${API_ENDPOINT}?id=${productId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const productData = await response.json();
      
      // Transform the API response to match your Product type
      const transformedProduct: Product = {
        product_id: productData.product_id,
        name: productData.name,
        brand: productData.brand,
        price: productData.price,
        ingredients: Array.isArray(productData.ingredients) 
          ? productData.ingredients 
          : JSON.parse(productData.ingredients || '[]'),
        description: productData.description,
        stars: productData.stars,
        num_reviews: productData.num_reviews || 0,
        limpiar: productData.limpiar,
        tratar: productData.tratar,
        proteger: productData.proteger,
        image_base64: productData.image_base64,
      };
      
      return transformedProduct;
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
  };

  const onRefresh = async () => {
    if (!product?.product_id) {
      Alert.alert('Error', 'No se puede recargar: ID del producto no disponible');
      return;
    }

    setRefreshing(true);
    try {
      const updatedProduct = await fetchProductFromAPI(product.product_id.toString());
      setProduct(updatedProduct);
      console.log("REfreshing page.");
    } catch (error) {
      Alert.alert(
        'Error de conexión', 
        'No se pudo actualizar la información del producto. Verifica tu conexión a internet.'
      );
    } finally {
      setRefreshing(false);
    }
  };

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

  if (!product) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <IconButton
            icon="arrow-left"
            size={24}
            iconColor="#2C3E50"
            style={styles.backButton}
            onPress={handleBackPress}
          />
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Cargando...</Text>
          </View>
          <View style={styles.headerSpacer} />
        </View>
      </SafeAreaView>
    );
  }

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

      {/* Scrollable Content with Pull-to-Refresh */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#a44230']} // Android
            tintColor="#a44230" // iOS
            title="Actualizando producto..."
            titleColor="#a44230"
          />
        }
      >
        <ProductDetailContent product={product} userId={userId || undefined} />
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