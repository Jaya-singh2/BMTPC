import React from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
} from 'react-native';

const SecurityBlockedScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>

        <View style={styles.warningCircle}>
          <Text style={styles.warningText}>!</Text>
        </View>

        <Text style={styles.title}>
          Security Warning
        </Text>

        <Text style={styles.message}>
          This application cannot run on a compromised device.
        </Text>

        <Text style={styles.details}>
          For your security, BMTPC has blocked access because
          a security risk was detected on this device.
        </Text>

        <Text style={styles.details}>
          Please use the application on a trusted and
          non-compromised device.
        </Text>

      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },

  warningCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 3,
    borderColor: '#D32F2F',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 25,
  },

  warningText: {
    fontSize: 42,
    fontWeight: '700',
    color: '#D32F2F',
  },

  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#222222',
    textAlign: 'center',
    marginBottom: 15,
  },

  message: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 15,
  },

  details: {
    fontSize: 15,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 23,
    marginTop: 8,
  },
});

export default SecurityBlockedScreen;