import 'react-native-reanimated';
import './global.css';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, Text, View } from 'react-native';

import { AppBackdrop, BrandMark, palette, useResponsiveLayout } from './components/MatchJobUI';
import { AuthProvider, useAuth } from './services/AuthContext';
import ChatScreen from './screens/ChatScreen';
import ConversationsScreen from './screens/ConversationsScreen';
import HomeScreen from './screens/HomeScreen';
import LoginScreen from './screens/LoginScreen';
import ProfileScreen from './screens/ProfileScreen';
import RegisterScreen from './screens/RegisterScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  const layout = useResponsiveLayout();
  const isDesktop = layout.isDesktop;

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: isDesktop ? { display: 'none' } : {
          height: isDesktop ? 82 : 74,
          backgroundColor: '#ffffff',
          borderTopWidth: 0,
          paddingTop: 10,
          paddingBottom: 12,
          paddingHorizontal: isDesktop ? 26 : 12,
          marginHorizontal: isDesktop ? 20 : 12,
          marginBottom: isDesktop ? 16 : 10,
          borderRadius: 22,
          position: 'absolute',
          left: 0,
          right: 0,
          shadowColor: '#160f4d',
          shadowOpacity: 0.08,
          shadowRadius: 18,
          shadowOffset: { width: 0, height: 8 },
        },
        tabBarActiveTintColor: palette.primaryStrong,
        tabBarInactiveTintColor: '#8b91a8',
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
        },
        sceneStyle: {
          backgroundColor: 'transparent',
        },
      }}
    >
      <Tab.Screen
        name="Profissionais"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View
              style={{
                width: 34,
                height: 34,
                borderRadius: 17,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: focused ? '#efe7ff' : '#f3f4f6',
              }}
            >
              <Text style={{ color, fontSize: 12, fontWeight: '800' }}>JOB</Text>
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Mensagens"
        component={ConversationsScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View
              style={{
                width: 34,
                height: 34,
                borderRadius: 17,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: focused ? '#efe7ff' : '#f3f4f6',
              }}
            >
              <Text style={{ color, fontSize: 12, fontWeight: '800' }}>MSG</Text>
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

function AppStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: palette.night },
        headerTintColor: '#f8fafc',
        headerTitleStyle: { fontWeight: '800' },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: palette.surface },
      }}
    >
      <Stack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
      <Stack.Screen name="Profile" component={ProfileScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Chat" component={ChatScreen} options={{ title: 'Conversa' }} />
    </Stack.Navigator>
  );
}

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

function RootNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <AppBackdrop>
        <View className="flex-1 items-center justify-center px-6">
          <View className="mb-5 items-center">
            <BrandMark size={72} />
            <Text style={{ marginTop: 16, fontSize: 36, fontWeight: '900', color: palette.text }}>
              MatchJob
            </Text>
            <Text style={{ marginTop: 8, fontSize: 14, fontWeight: '700', color: palette.textMuted }}>
              Preparando sua rede profissional
            </Text>
          </View>
          <View style={{ borderRadius: 12, backgroundColor: '#ffffff', paddingHorizontal: 32, paddingVertical: 24 }}>
            <ActivityIndicator size="large" color={palette.primary} />
          </View>
        </View>
      </AppBackdrop>
    );
  }

  return user ? <AppStack /> : <AuthStack />;
}

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <View style={{ flex: 1, backgroundColor: palette.surface }}>
          <RootNavigator />
        </View>
      </NavigationContainer>
    </AuthProvider>
  );
}
