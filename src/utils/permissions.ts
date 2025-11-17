// src/utils/permissions.ts
import { PermissionsAndroid, Platform, Alert } from 'react-native';

/**
 * Demande la permission pour accéder aux fichiers audio, images ou vidéos selon Android version.
 * @returns true si la permission est accordée, false sinon
 */
export const requestMediaPermission = async (type: 'audio' | 'image' | 'video' | 'storage' = 'audio'): Promise<boolean> => {
  if (Platform.OS !== 'android') return true; // iOS gère les permissions séparément

  try {
    let permission: string;

    if (Platform.Version >= 33) {
      // Android 13+ : permissions spécifiques par type
      switch (type) {
        case 'audio':
          permission = PermissionsAndroid.PERMISSIONS.READ_MEDIA_AUDIO;
          break;
        case 'image':
          permission = PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES;
          break;
        case 'video':
          permission = PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO;
          break;
        default:
          permission = PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE;
      }
    } else {
      // Android 6 à 12
      permission = PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE;
    }

    const granted = await PermissionsAndroid.request(permission, {
      title: 'Permission de lecture',
      message: 'L’application a besoin d’accéder à vos fichiers pour fonctionner correctement.',
      buttonPositive: 'Autoriser',
      buttonNegative: 'Refuser',
    });

    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      return true;
    } else {
      Alert.alert(
        'Permission refusée',
        'Vous devez autoriser l’accès aux fichiers pour continuer.'
      );
      return false;
    }
  } catch (error) {
    console.error('Erreur lors de la demande de permission :', error);
    return false;
  }
};
