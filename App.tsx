import React, {useEffect, useState} from 'react';

import {
  StatusBar,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  useColorScheme,
  Platform,
} from 'react-native';

import {SafeAreaProvider} from 'react-native-safe-area-context';

import AppNavigator from './Navigation/AppNavigator';

import {checkRootedDevice} from './utils/rootDetection';
import {checkJailbrokenDevice} from './utils/jailbreakDetection';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  // =========================================
  // Android Root Detection State
  // =========================================

  const [isCheckingRoot, setIsCheckingRoot] = useState(
    Platform.OS === 'android',
  );

  const [isRooted, setIsRooted] = useState(false);

  // =========================================
  // iOS Jailbreak Detection State
  // =========================================

  const [isCheckingJailbreak, setIsCheckingJailbreak] = useState(
    Platform.OS === 'ios',
  );

  const [isJailbroken, setIsJailbroken] = useState(false);

  // =========================================
  // Device Security Check
  // =========================================

  useEffect(() => {
    const checkDeviceSecurity = async () => {
      // -----------------------------------------
      // Android Root Detection
      // -----------------------------------------

      if (Platform.OS === 'android') {
        try {
          const rooted = await checkRootedDevice();

          setIsRooted(rooted);
        } catch (error) {
          console.warn('Root detection failed:', error);

          /*
           * Keep the existing Android behavior.
           *
           * NOTE:
           * The native RootBeer check is the actual
           * security detection mechanism.
           */
          setIsRooted(false);
        } finally {
          setIsCheckingRoot(false);
        }

        return;
      }

      // -----------------------------------------
      // iOS Jailbreak Detection
      // -----------------------------------------

      if (Platform.OS === 'ios') {
        try {
          const jailbroken =
            await checkJailbrokenDevice();

          setIsJailbroken(jailbroken);
        } catch (error) {
          console.warn(
            'Jailbreak detection failed:',
            error,
          );

          setIsJailbroken(false);
        } finally {
          setIsCheckingJailbreak(false);
        }

        return;
      }

      // -----------------------------------------
      // Other Platforms
      // -----------------------------------------

      setIsCheckingRoot(false);
      setIsCheckingJailbreak(false);
    };

    checkDeviceSecurity();
  }, []);

  // =========================================
  // Android - Checking Root Status
  // =========================================

  if (
    Platform.OS === 'android' &&
    isCheckingRoot
  ) {
    return (
      <SafeAreaProvider>
        <StatusBar barStyle="dark-content" />

        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" />

          <Text style={styles.text}>
            Checking device security...
          </Text>
        </View>
      </SafeAreaProvider>
    );
  }

  // =========================================
  // Android - Rooted Device
  // =========================================

  if (
    Platform.OS === 'android' &&
    isRooted
  ) {
    return (
      <SafeAreaProvider>
        <StatusBar barStyle="dark-content" />

        <View style={styles.centerContainer}>
          <Text style={styles.title}>
            Security Warning
          </Text>

          <Text style={styles.message}>
            This application cannot run on a rooted
            device.
          </Text>

          <Text style={styles.message}>
            Please use a device with the original
            Android security settings.
          </Text>
        </View>
      </SafeAreaProvider>
    );
  }

  // =========================================
  // iOS - Checking Jailbreak Status
  // =========================================

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
          <ActivityIndicator size="large" />

          <Text style={styles.text}>
            Checking device security...
          </Text>
        </View>
      </SafeAreaProvider>
    );
  }

  // =========================================
  // iOS - Jailbroken Device
  // =========================================

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
            Please use a device with the original
            iOS security environment.
          </Text>
        </View>
      </SafeAreaProvider>
    );
  }

  // =========================================
  // Normal Application
  // =========================================

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

// =========================================
// Styles
// =========================================

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
