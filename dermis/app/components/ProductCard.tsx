import React from 'react';
import { View, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Text, Surface } from 'react-native-paper';
import { SafeImagePickerAsset } from '../navigation/_types';

type Props = {
  title: string;
  description: string;
  image: SafeImagePickerAsset;
  step: string;
  onPress?: () => void;
};

// Array of pastel background colors
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

export default function ProductCard({ title, description, image, step, onPress }: Props) {
  // Generate a consistent color based on the step or title
  const colorIndex = (step + title).length % pastelColors.length;
  const backgroundColor = pastelColors[colorIndex];

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <Surface style={[styles.card, { backgroundColor }]} elevation={3}>
        {/* Step at the top, aligned left */}
        <Text style={styles.stepText}>{step.toUpperCase()}</Text>
        
        {/* Content area with image on left and text on right */}
        <View style={styles.contentContainer}>
          <Image 
            source={{ uri: image.uri }} 
            style={styles.productImage} 
            resizeMode="cover" 
          />
          <View style={styles.textContainer}>
            <Text style={styles.productTitle}>{title}</Text>
            <Text style={styles.productDescription}>{description}</Text>
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