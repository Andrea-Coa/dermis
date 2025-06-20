import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Image } from 'react-native';
import { Text } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import ProductCard from '../../components/ProductCard';
import { MainStackParamList } from '../../navigation/MainAppStack';

import { SafeImagePickerAsset } from '../../navigation/_types';

/*
  Routine.tsx es la primera pantalla que aparece después de que el usuario haya completado
  todas las preguntas. 
  Routine.tsx AÚN NO ESTÁ CONECTADA CON LA LÓGICA DE LA APP.
  Sólo muestra cosas hardcodeadas
*/

type Product = {
  id: number;
  title: string;
  description: string;
  image: SafeImagePickerAsset;
  step: string;
};

type RoutineNavigationProp = NativeStackNavigationProp<MainStackParamList, 'DrawerNavigator'>;

export default function RoutineScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const navigation = useNavigation<RoutineNavigationProp>();

  useEffect(() => {
    // Simulated API call
    const mockData: Product[] = [
      {
        id: 1,
        title: 'Gel Limpiador Suave',
        description: 'Limpia profundamente sin resecar la piel.',
        image: {
          uri: Image.resolveAssetSource(require('../../../assets/cleanser.jpg')).uri,
          width: 100,
          height: 100,
        },
        step: 'Limpiar',
      },
      {
        id: 2,
        title: 'Suero Antioxidante',
        description: 'Reduce manchas y mejora el tono de piel.',
        image: {
          uri: Image.resolveAssetSource(require('../../../assets/treatment.jpg')).uri,
          width: 100,
          height: 100,
        },
        step: 'Tratar',
      },
      {
        id: 3,
        title: 'Protector Solar SPF50',
        description: 'Protege contra rayos UV y envejecimiento prematuro.',
        image: {
          uri: Image.resolveAssetSource(require('../../../assets/sunscreen.jpg')).uri,
          width: 100,
          height: 100,
        },
        step: 'Proteger',
      },
    ];    
    setProducts(mockData);
  }, []);

  const handleProductPress = (product: Product) => {
    // Navigate to ProductDetail screen and pass the product data
    navigation.navigate('ProductDetail', { product });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text variant="headlineMedium" style={styles.title}>
        Tu Rutina de Cuidado
      </Text>
      <Text style={styles.subtitle}>
        Basado en tu análisis, te recomendamos seguir utilizar estos productos para mejorar y proteger tu piel.
      </Text>

      {products.map(product => (
        <ProductCard
          key={product.id}
          title={product.title}
          description={product.description}
          image={product.image}
          step={product.step}
          onPress={() => handleProductPress(product)}
        />
      ))}
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
});