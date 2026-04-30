import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { View } from 'react-native';

import { AuthProvider } from '../../features/auth/presentation/context/AuthContext';
import { palette } from '../../shared/ui/MatchJobUI';
import AppNavigator from '../navigation/AppNavigator';

export default function AppProviders() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <View style={{ flex: 1, backgroundColor: palette.surface }}>
          <AppNavigator />
        </View>
      </NavigationContainer>
    </AuthProvider>
  );
}
