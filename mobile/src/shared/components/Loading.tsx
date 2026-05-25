import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';

interface Props {
  message?: string;
  fullscreen?: boolean;
}

export function Loading({ message, fullscreen = true }: Props) {
  return (
    <View style={[styles.container, fullscreen && styles.fullscreen]}>
      <ActivityIndicator size="large" color={Colors.primary} />
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 12,
  },
  fullscreen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  message: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
});
