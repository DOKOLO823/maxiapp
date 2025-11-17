import { NativeModules, Platform } from 'react-native';

export const openFile = async (types: string[]): Promise<any> => {
  if (Platform.OS === 'android') {
    return await NativeModules.FileSelectorModule.pickFile(types);
  } else {
    return await NativeModules.FileSelectorModule.pickFile(types);
  }
};
