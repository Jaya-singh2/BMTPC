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

import {checkRootedDevice} from './utils/rootDetection';
import AppNavigator from './Navigation/AppNavigator';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  const [isCheckingRoot, setIsCheckingRoot] = useState(
    Platform.OS === 'android',
  );

  const [isRooted, setIsRooted] = useState(false);

  useEffect(() => {
    const checkDevice = async () => {
      // Root detection is only for Android.
      // iOS uses native jailbreak detection
      // in AppDelegate.swift.
      if (Platform.OS !== 'android') {
        setIsCheckingRoot(false);
        return;
      }

      try {
        const rooted = await checkRootedDevice();

        setIsRooted(rooted);
      } catch (error) {
        console.warn('Root detection failed:', error);

        // If detection itself fails, don't block the app.
        setIsRooted(false);
      } finally {
        setIsCheckingRoot(false);
      }
    };

    checkDevice();
  }, []);

  // -----------------------------------------
  // Android: checking device security
  // -----------------------------------------
  if (Platform.OS === 'android' && isCheckingRoot) {
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

  // -----------------------------------------
  // Android: rooted device detected
  // -----------------------------------------
  if (Platform.OS === 'android' && isRooted) {
    return (
      <SafeAreaProvider>
        <StatusBar barStyle="dark-content" />

        <View style={styles.centerContainer}>
          <Text style={styles.title}>
            Security Warning
          </Text>

          <Text style={styles.message}>
            This application cannot run on a rooted device.
          </Text>

          <Text style={styles.message}>
            Please use a device with the original Android
            security settings.
          </Text>
        </View>
      </SafeAreaProvider>
    );
  }

  // -----------------------------------------
  // Android non-rooted OR iOS
  // -----------------------------------------
  return (
    <SafeAreaProvider>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
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
  },
});

export default App;