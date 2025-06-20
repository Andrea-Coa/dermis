import React from 'react';
import { View, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Text, Surface } from 'react-native-paper';
import { SafeImagePickerAsset } from '../navigation/_types';

type Props = {
  name: string;
  ingredients: string[];
  image: SafeImagePickerAsset;
  step: string;
  onPress?: () => void;
};

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

export default function ProductCard({ name, ingredients, image, step, onPress }: Props) {
  const colorIndex = (step + name).length % pastelColors.length;
  const backgroundColor = pastelColors[colorIndex];

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <Surface style={[styles.card, { backgroundColor }]} elevation={3}>
        <Text style={styles.stepText}>{step.toUpperCase()}</Text>

        <View style={styles.contentContainer}>
          <Image 
            source={{ uri: image.uri }} 
            style={styles.productImage} 
            resizeMode="cover" 
          />
          <View style={styles.textContainer}>
            <Text style={styles.productTitle}>{name}</Text>
            <Text
              style={styles.productDescription}
              numberOfLines={3} // para que no se muestre toda la lista, y si es muy larga que ponga ...
            >
              {ingredients.join(', ')}
            </Text>
          </View>
        </View>
      </Surface>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    marginBottom: 20,
    padding: 16,
    overflow: 'hidden',
  },
  stepText: {
    color: '#a44230',
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 12,
    alignSelf: 'flex-start',
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  productImage: {
    width: 100,
    height: 100,
    borderRadius: 12,
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  productTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
    lineHeight: 22,
  },
  productDescription: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
    flexWrap: 'wrap',
  },
});
