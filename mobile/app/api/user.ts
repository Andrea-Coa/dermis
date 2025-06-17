// api/skinData.ts
import { Alert } from 'react-native';

const API_BASE_URL = 'https://tu-ec2-public-ip-or-domain.com/api'; // Reemplaza con tu URL

export const updateUserSkinData = async (
  userId: string,
  skinType: string,
  conditions: string[]
) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/skin-data`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Aquí puedes agregar tu token de autenticación si es necesario
        // 'Authorization': `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        skin_type: skinType,
        skin_conditions: conditions,
      }),
    });

    if (!response.ok) {
      // Convertimos el error de respuesta a un tipo conocido
      const errorData = await response.json() as { message?: string };
      throw new Error(errorData.message || 'Error en la respuesta del servidor');
    }

    return await response.json();
 } catch (error) {
    // Ahora tipamos el error correctamente
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Error desconocido al actualizar datos de piel';
    
    console.error('Error en updateUserSkinData:', error);
    throw new Error(errorMessage);
  }
};