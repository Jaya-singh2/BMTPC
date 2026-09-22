import {NativeModules} from 'react-native';

interface SSLPinningModuleType {
  get(url: string): Promise<any>;

  post(
    url: string,
    body: string,
  ): Promise<any>;
}

const {SSLPinningModule} = NativeModules;

if (!SSLPinningModule) {
  throw new Error(
    'SSLPinningModule is not available. ' +
      'Make sure the native iOS module is included ' +
      'in the application target and the app has been rebuilt.',
  );
}

const SSLPinning =
  SSLPinningModule as SSLPinningModuleType;

export default SSLPinning;


