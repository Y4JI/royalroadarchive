import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import AppNavigator from './src/navigation/AppNavigator';
import { openDatabase } from './src/services/database';
import { COLORS } from './src/constants/config';

export default function App() {
  const [dbReady, setDbReady]   = useState(false);
  const [dbError, setDbError]   = useState(null);

  useEffect(() => {
    openDatabase()
      .then(() => setDbReady(true))
      .catch((e) => {
        console.error('DB init failed:', e);
        setDbError(e.message);
      });
  }, []);

  if (dbError) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Failed to open database: {dbError}</Text>
      </View>
    );
  }

  if (!dbReady) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={COLORS.accent} size="large" />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="light" />
      <AppNavigator />
    </>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    color: COLORS.danger,
    fontSize: 14,
    textAlign: 'center',
    padding: 20,
  },
});
