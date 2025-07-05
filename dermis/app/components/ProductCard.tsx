import React from 'react';
import { View, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Text, Surface } from 'react-native-paper';

type Props = {
  name: string;
  brand: string;
  category: 'limpiar' | 'tratar' | 'proteger';
  imageUri: string;
  onPress?: () => void;
};

const capitalizeWords = (text: string) =>
  text.replace(/\b\w/g, (char) => char.toUpperCase());


export default function ProductCard({ name, brand, category, imageUri, onPress }: Props) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <Surface style={styles.card} elevation={2}>
        <View style={styles.contentContainer}>
          <Image 
            source={{ uri: imageUri }} 
            style={styles.productImage} 
            resizeMode="cover" 
          />
          <View style={styles.textContainer}>
          <Text style={styles.productTitle}>{capitalizeWords(name)}</Text>
          <Text style={styles.brandText}>{capitalizeWords(brand)}</Text>
            {/* <Text style={styles.categoryText}>{category.toUpperCase()}</Text> */}
          </View>
        </View>
      </Surface>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#fff',
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  productTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  brandText: {
    fontSize: 14,
    color: '#666',
  },
  categoryText: {
    marginTop: 6,
    fontSize: 12,
    color: '#a44230',
    fontWeight: '600',
  },
});
