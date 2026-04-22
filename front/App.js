import 'react-native-reanimated';
import './global.css';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, Text, View } from 'react-native';

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
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          height: 72,
          backgroundColor: '#f8fafc',
          borderTopWidth: 1,
          borderTopColor: '#dbe4f0',
          paddingTop: 8,
          paddingBottom: 10,
        },
        tabBarActiveTintColor: '#0f766e',
        tabBarInactiveTintColor: '#94a3b8',
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
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
                backgroundColor: focused ? '#ccfbf1' : '#e2e8f0',
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
                backgroundColor: focused ? '#fef3c7' : '#e2e8f0',
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
        headerStyle: { backgroundColor: '#0f172a' },
        headerTintColor: '#f8fafc',
        headerTitleStyle: { fontWeight: '800' },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: '#edf4f7' },
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
      <View className="flex-1 items-center justify-center bg-slate-950">
        <View className="mb-5 rounded-[28px] border border-teal-400/20 bg-white/5 px-6 py-5">
          <Text className="text-3xl font-black uppercase tracking-[0.2em] text-white">
            MatchJob
          </Text>
        </View>
        <ActivityIndicator size="large" color="#2dd4bf" />
        <Text className="mt-4 text-sm font-semibold text-slate-300">
          Preparando sua rede profissional
        </Text>
      </View>
    );
  }

  return user ? <AppStack /> : <AuthStack />;
}

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <View className="flex-1 bg-[#edf4f7]">
          <RootNavigator />
        </View>
      </NavigationContainer>
    </AuthProvider>
  );
}
