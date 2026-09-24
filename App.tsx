import React, {
  useEffect,
  useState,
} from 'react';

import {
  StatusBar,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  useColorScheme,
  Platform,
} from 'react-native';

import {
  SafeAreaProvider,
} from 'react-native-safe-area-context';

import AppNavigator from './Navigation/AppNavigator';

import {
  checkRootedDevice,
} from './utils/rootDetection';

import {
  checkJailbrokenDevice,
} from './utils/jailbreakDetection';

function App() {

  const isDarkMode =
    useColorScheme() === 'dark';

  const [
    isCheckingRoot,
    setIsCheckingRoot,
  ] = useState(
    Platform.OS === 'android',
  );

  const [
    isRooted,
    setIsRooted,
  ] = useState(false);

  const [
    isCheckingJailbreak,
    setIsCheckingJailbreak,
  ] = useState(
    Platform.OS === 'ios',
  );

  const [
    isJailbroken,
    setIsJailbroken,
  ] = useState(false);

  useEffect(() => {

    const checkDeviceSecurity =
      async () => {

        // ==================================================
        // ANDROID
        // ==================================================

        if (Platform.OS === 'android') {

          try {

            const rooted =
              await checkRootedDevice();

            setIsRooted(rooted);

          } catch (error) {

            console.warn(
              'Root detection failed:',
              error,
            );

            setIsRooted(false);

          } finally {

            setIsCheckingRoot(false);
          }

          return;
        }

        // ==================================================
        // IOS
        // ==================================================

        if (Platform.OS === 'ios') {

          try {

            const jailbroken =
              await checkJailbrokenDevice();

            setIsJailbroken(
              jailbroken,
            );

          } catch (error) {

            console.warn(
              'Jailbreak detection failed:',
              error,
            );

            setIsJailbroken(false);

          } finally {

            setIsCheckingJailbreak(
              false,
            );
          }

          return;
        }

        setIsCheckingRoot(false);

        setIsCheckingJailbreak(false);
      };

    checkDeviceSecurity();

  }, []);

  // ========================================================
  // ANDROID CHECKING
  // ========================================================

  if (
    Platform.OS === 'android' &&
    isCheckingRoot
  ) {

    return (
      <SafeAreaProvider>

        <StatusBar
          barStyle="dark-content"
        />

        <View style={styles.centerContainer}>

          <ActivityIndicator
            size="large"
          />

          <Text style={styles.text}>
            Checking device security...
          </Text>

        </View>

      </SafeAreaProvider>
    );
  }

  // ========================================================
  // ANDROID BLOCK
  // ========================================================

  if (
    Platform.OS === 'android' &&
    isRooted
  ) {

    return (
      <SafeAreaProvider>

        <StatusBar
          barStyle="dark-content"
        />

        <View style={styles.centerContainer}>

          <Text style={styles.title}>
            Security Warning
          </Text>

          <Text style={styles.message}>
            This application cannot run on a
            rooted device.
          </Text>

          <Text style={styles.message}>
            Please use a device with the original
            Android security settings.
          </Text>

        </View>

      </SafeAreaProvider>
    );
  }

  // ========================================================
  // IOS CHECKING
  // ========================================================

  if (
    Platform.OS === 'ios' &&
    isCheckingJailbreak
  ) {

    return (
      <SafeAreaProvider>

        <StatusBar
          barStyle="dark-content"
        />

        <View style={styles.centerContainer}>

          <ActivityIndicator
            size="large"
          />

          <Text style={styles.text}>
            Checking device security...
          </Text>

        </View>

      </SafeAreaProvider>
    );
  }

  // ========================================================
  // IOS SECONDARY BLOCK
  // ========================================================

  if (
    Platform.OS === 'ios' &&
    isJailbroken
  ) {

    return (
      <SafeAreaProvider>

        <StatusBar
          barStyle="dark-content"
        />

        <View style={styles.centerContainer}>

          <Text style={styles.title}>
            Security Warning
          </Text>

          <Text style={styles.message}>
            This application cannot run on a
            compromised device.
          </Text>

          <Text style={styles.message}>
            Please use an iOS device with the
            original security environment.
          </Text>

        </View>

      </SafeAreaProvider>
    );
  }

  // ========================================================
  // NORMAL APPLICATION
  // ========================================================

  return (
    <SafeAreaProvider>

      <StatusBar
        barStyle={
          isDarkMode
            ? 'light-content'
            : 'dark-content'
        }
      />

      <AppNavigator />

    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({

  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },

  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },

  text: {
    marginTop: 15,
    fontSize: 16,
    textAlign: 'center',
  },

  message: {
    textAlign: 'center',
    fontSize: 16,
    marginTop: 10,
    lineHeight: 24,
  },
});

export default App;