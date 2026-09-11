import {NativeModules} from 'react-native';

const {RootDetection} = NativeModules;

export const checkRootedDevice = async (): Promise<boolean> => {
  try {
    return await RootDetection.isRooted();
  } catch (error) {
    console.error('Root detection error:', error);
    return false;
  }
};