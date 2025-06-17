import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { MotiView } from 'moti';
import { Image } from 'react-native';


const { width, height } = Dimensions.get('window');

export default function Intro() {
  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/Register'); 
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
        <Image source={require('../assets/logo_yes.png')} style={styles.logoImage} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#feece0',//fondo dermis_ nute
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoImage: {
  width: 550,
  height: 550,
  resizeMode: 'contain',
},

});
