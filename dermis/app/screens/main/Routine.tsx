import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Image } from 'react-native';
import { Text } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

import ProductCard from '../../components/ProductCard';
import { MainStackParamList } from '../../navigation/MainAppStack';
import { SafeImagePickerAsset } from '../../navigation/_types';

// The recommended product structure (as saved in AsyncStorage)
type RecommendedProduct = {
  step: string;
  name: string;
  ingredients: string[];
};

type RoutineNavigationProp = NativeStackNavigationProp<
  MainStackParamList,
  'DrawerNavigator'
>;

export default function RoutineScreen() {
  const [recommended, setRecommended] = useState<RecommendedProduct[]>([]);
  const navigation = useNavigation<RoutineNavigationProp>();

  useEffect(() => {
    const loadFromAsyncStorage = async () => {
      try {
        const stored = await AsyncStorage.getItem("results");
        if (stored) {
          const parsed = JSON.parse(stored) as RecommendedProduct[];
          setRecommended(parsed);
        } else {
          console.warn("No recommended products found in AsyncStorage.");
        }
      } catch (error) {
        console.error("Failed to load from AsyncStorage:", error);
      }
    };

    loadFromAsyncStorage();
  }, []);

  const capitalizeWords = (text: string) => {
    return text.replace(/\b\w/g, char => char.toUpperCase());
  };
  

  const handleProductPress = (product: RecommendedProduct) => {
    // Optional: Navigate to detail screen or show more info
    // navigation.navigate('ProductDetail', { product });
    console.log("Navigation not implemented yet");
  };

  // temporal para mostrar imágenes
  const stepToImage: Record<string, any> = {
    Limpiar: require('../../../assets/cleanser.jpg'),
    Tratar: require('../../../assets/treatment.jpg'),
    Proteger: require('../../../assets/sunscreen.jpg'),
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text variant="headlineMedium" style={styles.title}>
        Tu Rutina de Cuidado
      </Text>
      <Text style={styles.subtitle}>
        Basado en tu análisis, te recomendamos seguir utilizar estos productos para mejorar y proteger tu piel.
      </Text>

      {recommended.map((product, index) => (
        <ProductCard
          key={index}
          name={capitalizeWords(product.name)}
          ingredients={product.ingredients}
          step={product.step}
          image={{
            uri: Image.resolveAssetSource(stepToImage[product.step] || require('../../../assets/sunscreen.jpg')).uri,
            width: 100,
            height: 100,
          }}
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
