import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator, Alert, Image } from 'react-native';
import { Text, Surface, Button, Divider } from 'react-native-paper';
import { useUser } from '../../../context/UserContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PROFILE_ICON = require('../../../assets/profile-icon.png');

interface UserProfile {
  user_id: string;
  name: string;
  email: string;
  age: number;
  nick_name: string;
  skyn_type: string | null;
  skyn_conditions: string[];
  is_sensitive: boolean;
}

export default function ProfileScreen() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { setUserId, setHasCompletedOnboarding } = useUser();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userId = await AsyncStorage.getItem('user_id');
        if (!userId) throw new Error('No user ID found in storage.');

        const response = await fetch(
          `https://70i447ofic.execute-api.us-east-1.amazonaws.com/register_users_dermis?user_id=${userId}`
        );
        const result = await response.json();

        if (!response.ok) throw new Error(result.error || 'Failed to fetch user data.');

        result.skyn_conditions = JSON.parse(result.skyn_conditions);
        console.log(result);
        setUser(result);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleLogout = () => {
    Alert.alert('Cerrar Sesión', '¿Estás seguro de que quieres cerrar sesión?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Cerrar Sesión',
        style: 'destructive',
        onPress: async () => {
          try {
            await AsyncStorage.removeItem('user_id');
            setUserId(null);
          } catch (error) {
            console.error('Error during logout:', error);
            Alert.alert('Error', 'Ocurrió un error al cerrar sesión');
          }
        },
      },
    ]);
  };
  const handleForgetToken = async () => {
    try {
      await AsyncStorage.multiRemove(['user_id', 'has_completed_onboarding']);
      setUserId(null);
      setHasCompletedOnboarding(false);
      Alert.alert('Token olvidado', 'Se ha reiniciado el estado del usuario.');
    } catch (error) {
      console.error('Error forgetting token:', error);
      Alert.alert('Error', 'No se pudo olvidar el token.');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color="#a44230" size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
        <Button
          mode="outlined"
          style={styles.logoutButton}
          labelStyle={styles.logoutButtonText}
          onPress={handleForgetToken}
          icon="refresh"
          >
          Olvidar token
        </Button>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text variant="headlineMedium" style={styles.title}>Perfil de Usuario</Text>

      <View style={styles.avatarContainer}>
        <Image source={PROFILE_ICON} style={styles.avatar} resizeMode="cover" />
      </View>

      <Surface style={styles.card} elevation={3}>
      <View style={styles.row}>
  <Text style={styles.label}>Nombre</Text>
  <Text style={styles.value}>{user?.name}</Text>
</View>
<Divider style={styles.divider} />

<View style={styles.row}>
  <Text style={styles.label}>Apodo</Text>
  <Text style={styles.value}>{user?.nick_name}</Text>
</View>
<Divider style={styles.divider} />

<View style={styles.row}>
  <Text style={styles.label}>Correo</Text>
  <Text style={styles.value}>{user?.email}</Text>
</View>
<Divider style={styles.divider} />

<View style={styles.row}>
  <Text style={styles.label}>Edad</Text>
  <Text style={styles.value}>{user?.age}</Text>
</View>
<Divider style={styles.divider} />

<View style={styles.row}>
  <Text style={styles.label}>Tipo de piel</Text>
  <Text style={styles.value}>{user?.skyn_type || 'No especificado'}</Text>
</View>
<Divider style={styles.divider} />

<View style={styles.row}>
  <Text style={styles.label}>Condiciones</Text>
  <Text style={styles.value}>{user?.skyn_conditions?.join(', ') || 'Ninguna'}</Text>
</View>
<Divider style={styles.divider} />

<View style={styles.row}>
  <Text style={styles.label}>¿Piel sensible?</Text>
  <Text style={styles.value}>{user?.is_sensitive ? 'Sí' : 'No'}</Text>
</View>

      </Surface>

      <Button
        mode="outlined"
        style={styles.logoutButton}
        labelStyle={styles.logoutButtonText}
        onPress={handleLogout}
        icon="logout"
      >
        Cerrar Sesión
      </Button>
      <Button
        mode="outlined"
        style={styles.logoutButton}
        labelStyle={styles.logoutButtonText}
        onPress={handleForgetToken}
        icon="refresh"
        >
        Olvidar token
        </Button>
    </ScrollView>
  );
}

function renderRow(label: string, value?: string) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}:</Text>
      <Text style={styles.value}>{value || '—'}</Text>
    </View>
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
    marginBottom: 20,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#a44230',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 30,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 6,
  },
  label: {
    fontWeight: '600',
    fontSize: 16,
    color: '#a44230',
    flex: 1,
  },
  value: {
    fontSize: 16,
    color: '#2C3E50',
    flex: 2,
    textAlign: 'right',
  },
  divider: {
    marginVertical: 6,
    backgroundColor: '#f0cfc0',
  },
  logoutButton: {
    borderColor: '#6b0d29',
    borderWidth: 1,
    borderRadius: 25,
    paddingVertical: 8,
    alignSelf: 'center',
    width: '60%',
  },
  logoutButtonText: {
    color: '#6b0d29',
    fontWeight: 'bold',
    fontSize: 16,
  },
  errorText: {
    textAlign: 'center',
    color: 'red',
    marginTop: 20,
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#ffece0',
  },
});
