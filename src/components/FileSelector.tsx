// src/components/FileSelector.tsx
  import React, { FC, ReactNode } from 'react';
import { View, Pressable, Text, StyleSheet, ViewStyle, StyleProp, Alert } from 'react-native';
import MaterialComIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import { launchImageLibrary, ImageLibraryOptions, Asset } from 'react-native-image-picker';
import { requestMediaPermission } from '@utils/permissions';
import { NativeModules } from 'react-native';

const { AudioPicker } = NativeModules;

export interface FileDataCompatible {
  uri: string;
  name?: string;
  type?: string;
  size?: number;
  fileCopyUri?: string;
}

interface Props {
  icon?: ReactNode;
  btnTitle?: string;
  style?: StyleProp<ViewStyle>;
  mediaType: 'photo' | 'audio';
  onSelect(file: FileDataCompatible): void;
}

const FileSelector: FC<Props> = ({ icon, btnTitle, mediaType, style, onSelect }) => {
  const handleSelect = async () => {
    try {
      // 1️⃣ Demande de permission selon le type
      if (mediaType === 'audio') {
        const granted = await requestMediaPermission(mediaType);
      if (!granted) return;

      }
      if (mediaType === 'photo') {
        // Sélection d'image
        const options: ImageLibraryOptions = {
          mediaType: 'photo',
          selectionLimit: 1,
        };
        const result = await launchImageLibrary(options);

        if (result.didCancel) return;
        if (result.errorCode) throw new Error(result.errorMessage);

        const asset: Asset | undefined = result.assets?.[0];
        if (asset && asset.uri) {
          onSelect({
            uri: asset.uri,
            name: asset.fileName,
            type: asset.type,
            size: asset.fileSize,
            fileCopyUri: asset.uri,
          });
        }
      } 
      
      else {
        // Sélection d'audio via module natif
        const file: FileDataCompatible = await AudioPicker.pickAudio();
        if (file) onSelect(file);
      }
    } catch (err) {
      console.error('FileSelector error:', err);
      Alert.alert('Erreur', 'Impossible de sélectionner le fichier.');
    }
  };

  return (
    <Pressable onPress={handleSelect} style={[styles.btnContainer, style]}>
      <View style={styles.iconContainer}>{icon}</View>
      <Text style={styles.btnTitle}>{btnTitle}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  btnContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    height: 70,
    aspectRatio: 1,
    borderWidth: 2,
    borderColor: '#ff6600',
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnTitle: {
    color: '#000',
    marginTop: 5,
  },
});

export default FileSelector;
