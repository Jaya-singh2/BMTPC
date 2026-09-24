import { NativeModules, Platform } from 'react-native';

type JailbreakDetectionModule = {
  isJailbroken: () => Promise<boolean>;
};

const { JailbreakDetection } = NativeModules as {
  JailbreakDetection?: JailbreakDetectionModule;
};

export const checkJailbrokenDevice = async (): Promise<boolean> => {
  // Jailbreak detection is only required on iOS
  if (Platform.OS !== 'ios') {
    return false;
  }

  try {
    if (!JailbreakDetection) {
      console.warn(
        'JailbreakDetection native module is not available.',
      );

      return false;
    }

    const result = await JailbreakDetection.isJailbroken();

    return Boolean(result);
  } catch (error) {
    console.error(
      'Jailbreak detection error:',
      error,
    );

    return false;
  }
};