import '@/global.css';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
        <Stack.Screen name="auth/callback" />
        <Stack.Screen name="professionals/index" />
        <Stack.Screen name="professionals/[id]" />
        <Stack.Screen name="profile/setup/index" />
        <Stack.Screen name="profile/edit" />
        <Stack.Screen name="profile/index" />
        <Stack.Screen name="favorites/index" />
        <Stack.Screen name="chat/index" />
        <Stack.Screen name="services/index" />
        <Stack.Screen name="settings/index" />
      </Stack>
    </SafeAreaProvider>
  );
}
