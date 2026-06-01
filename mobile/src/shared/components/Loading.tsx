import React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { cn } from '../utils/cn';

interface Props {
  message?: string;
  fullscreen?: boolean;
}

export function Loading({ message, fullscreen = true }: Props) {
  return (
    <View
      className={cn(
        'items-center justify-center p-8 gap-3',
        fullscreen && 'flex-1 bg-slate-950',
      )}
    >
      <ActivityIndicator size="large" color="#7c3aed" />
      {message && <Text className="text-slate-400 text-sm">{message}</Text>}
    </View>
  );
}
