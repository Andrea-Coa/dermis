import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { MotiView } from 'moti';
import { Image } from 'react-native';


const { width, height } = Dimensions.get('window');

export default function Intro() {
  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/Register'); // 👈 Redirige automáticamente a /register
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      
        
        <Image source={require('../assets/logo.png')} style={styles.logoImage} />
        
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FFDBB4',
  },
  logoImage: {
  width: 200,
  height: 200,
  resizeMode: 'contain',
},

});
