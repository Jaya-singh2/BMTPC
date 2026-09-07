/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */
import React, { useEffect } from 'react';
import { NewAppScreen } from '@react-native/new-app-screen';
import {
  StatusBar,
  StyleSheet,
  useColorScheme,
  View,
  Alert,
  Platform
} from 'react-native';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import EarthQuakeHazardScreen from "./screens/EarthquakeHazardScreen";
import HomeScreen from "./screens/HomeScreen"
import AppNavigator from "./Navigation/AppNavigator"
import { isJailbroken } from './utils/jailbreakDetection';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  useEffect(() => {
    const checkJailbreak = async () => {

      if (Platform.OS !== 'ios') {
        return;
      }

      const detected = await isJailbroken();

      if (detected) {
        Alert.alert(
          'Security Warning',
          'This application cannot run on a compromised device.',
          [
            {
              text: 'OK',
            },
          ],
          {
            cancelable: false,
          }
        );
      }
    };

    checkJailbreak();
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
      />

      <AppNavigator />
    </SafeAreaProvider>
  );
}

function AppContent() {
  const safeAreaInsets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <NewAppScreen
        templateFileName="App.tsx"
        safeAreaInsets={safeAreaInsets}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
