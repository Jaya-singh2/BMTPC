import { NativeModules, Platform } from 'react-native';

const { JailbreakDetection } = NativeModules;

export const isJailbroken = async (): Promise<boolean> => {
  if (Platform.OS !== 'ios') {
    return false;
  }

  try {
    return await JailbreakDetection.isJailbroken();
  } catch (error) {
    console.log('Jailbreak detection error:', error);
    return false;
  }
};