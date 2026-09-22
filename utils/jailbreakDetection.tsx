import {NativeModules, Platform} from 'react-native';

const {JailbreakDetection} = NativeModules;

export const checkJailbrokenDevice =
  async (): Promise<boolean> => {

    if (Platform.OS !== 'ios') {
      return false;
    }

    try {
      const result =
        await JailbreakDetection.isJailbroken();

      return Boolean(result);

    } catch (error) {

      console.error(
        'Jailbreak detection error:',
        error
      );

      return false;
    }
  };