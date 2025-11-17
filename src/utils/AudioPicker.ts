import { NativeModules, Alert } from 'react-native';
import { requestAudioPermission } from './permissions';

export interface FileDataCompatible {
  uri: string;
  name?: string;
  type?: string;
  size?: number;
  fileCopyUri?: string;
}

const { AudioPicker } = NativeModules;

export const pickAudio = async (): Promise<FileDataCompatible | null> => {
  const granted = await requestAudioPermission();
  if (!granted) {
    Alert.alert('Permission', 'Permission refusée');
    return null;
  }

  try {
    const file: FileDataCompatible = await AudioPicker.pickAudio();
    return file;
  } catch (err) {
    console.error('AudioPicker error', err);
    return null;
  }
};
