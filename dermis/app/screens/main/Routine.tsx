import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ProductCard from '../../components/ProductCard';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, Product } from '../../navigation/_types';

const CATEGORY_LABELS: Record<'limpiar' | 'tratar' | 'proteger', string> = {
  limpiar: 'LIMPIEZA',
  tratar: 'TRATAMIENTO',
  proteger: 'PROTECCIÓN',
};

export default function RoutineScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  useEffect(() => {
    const fetchRoutine = async () => {
      try {
        const userId = await AsyncStorage.getItem('user_id');
        if (!userId) throw new Error('user_id not found');

        const response = await fetch(`https://o1f915v3gh.execute-api.us-east-1.amazonaws.com/default/routines?user_id=${userId}`);
        if (!response.ok) throw new Error(`Error fetching routine: ${response.status}`);

        const data = await response.json();
        setProducts(data.products || []);
      } catch (error) {
        console.error('Failed to fetch routine:', error);
      }
    };
    fetchRoutine();
  }, []);

  const handlePressProductCard = (product: Product) => {
    navigation.navigate('ProductDetail', { product });
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
          console.log(`📦 Ingredients for ${product.name}:`, product.ingredients);

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

  const usedProductIds = new Set<string>();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>Tu Rutina de Cuidado</Text>
      <Text style={styles.subtitle}>
        Basado en tu análisis, te recomendamos los siguientes productos:
      </Text>

      {renderCategory('limpiar', usedProductIds)}
      {renderCategory('tratar', usedProductIds)}
      {renderCategory('proteger', usedProductIds)}
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
});