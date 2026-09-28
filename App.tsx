import React, { useState } from 'react';

import {
  StatusBar,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  useColorScheme,
} from 'react-native';

import {
  SafeAreaProvider,
} from 'react-native-safe-area-context';

import AppNavigator from './Navigation/AppNavigator';

import {
  useFreeRasp,
} from 'freerasp-react-native';

function App() {
  const isDarkMode =
    useColorScheme() === 'dark';

  const [
    isCheckingSecurity,
    setIsCheckingSecurity,
  ] = useState(true);

  const [
    isJailbroken,
    setIsJailbroken,
  ] = useState(false);

  // ========================================================
  // TALSEC CONFIGURATION
  // ========================================================
  const talsecConfig = {
    iosConfig: {
      appBundleId: 'com.bmtpc.iosapp',

      // Replace with your Apple Developer Team ID
      appTeamId: 'EJC8C58G3F',
    },

    // Use true for production/audit build
    isProd: true,

    // Protect against bypass attempts
    killOnBypass: true,

    // Replace with your email
    watcherMail: 'bmtpceq@gmail.com',
  };

  // ========================================================
  // TALSEC SECURITY ACTIONS
  // ========================================================
  const talsecActions = {
    privilegedAccess: () => {
      console.warn(
        'Talsec: Jailbreak detected',
      );

      setIsJailbroken(true);
      setIsCheckingSecurity(false);
    },
  };

  // ========================================================
  // START TALSEC
  // ========================================================
  useFreeRasp(
    talsecConfig,
    talsecActions,
    {
      allChecksFinished: () => {
        setIsCheckingSecurity(false);
      },
    },
  );

  // ========================================================
  // SECURITY CHECKING
  // ========================================================
  if (isCheckingSecurity) {
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
  // JAILBREAK BLOCK
  // ========================================================
  if (isJailbroken) {
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