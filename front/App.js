// App.js — MatchJob React Native + Expo
// Navegação completa: Auth (login/cadastro) → App (tabs + chat)

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ActivityIndicator, View, Text } from 'react-native';

import { AuthProvider, useAuth } from './services/AuthContext';

// Screens
import LoginScreen         from './screens/LoginScreen';
import RegisterScreen      from './screens/RegisterScreen';
import HomeScreen          from './screens/HomeScreen';
import ProfileScreen       from './screens/ProfileScreen';
import ChatScreen          from './screens/ChatScreen';
import ConversationsScreen from './screens/ConversationsScreen';

const Stack = createNativeStackNavigator();
const Tab   = createBottomTabNavigator();

// ─── Tab Navigator (telas principais) ────────────────────
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopColor: '#e2e8f0',
          paddingBottom: 6,
          paddingTop: 6,
          height: 60,
        },
        tabBarActiveTintColor: '#4f46e5',
        tabBarInactiveTintColor: '#aaa',
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tab.Screen
        name="Profissionais"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>🔍</Text>,
        }}
      />
      <Tab.Screen
        name="Mensagens"
        component={ConversationsScreen}
        options={{
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>💬</Text>,
        }}
      />
    </Tab.Navigator>
  );
}

// ─── Stack do app autenticado ─────────────────────────────
function AppStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle:      { backgroundColor: '#4f46e5' },
        headerTintColor:  '#fff',
        headerTitleStyle: { fontWeight: '800' },
        headerBackTitle:  'Voltar',
      }}
    >
      {/* Tabs principais — sem header próprio */}
      <Stack.Screen
        name="Main"
        component={MainTabs}
        options={{ headerShown: false }}
      />

      {/* Perfil do profissional — sem header (a tela tem o seu próprio) */}
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ headerShown: false }}
      />

      {/* Chat — header com nome do outro usuário (definido dentro da tela) */}
      <Stack.Screen
        name="Chat"
        component={ChatScreen}
        options={{ title: 'Chat' }}
      />
    </Stack.Navigator>
  );
}

// ─── Stack de autenticação (não logado) ───────────────────
function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login"    component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

// ─── Root: decide qual stack exibir ──────────────────────
function RootNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f4ff' }}>
        <ActivityIndicator size="large" color="#4f46e5" />
        <Text style={{ marginTop: 12, color: '#4f46e5', fontWeight: '600' }}>MatchJob</Text>
      </View>
    );
  }

  return user ? <AppStack /> : <AuthStack />;
}

// ─── App principal ────────────────────────────────────────
export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}
