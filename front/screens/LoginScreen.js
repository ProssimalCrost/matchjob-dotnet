import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { useAuth } from '../services/AuthContext';
import { authLogin } from '../services/api';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Atencao', 'Preencha email e senha.');
      return;
    }

    setLoading(true);
    try {
      const res = await authLogin(email.trim(), password);
      await signIn(res.data);
    } catch (err) {
      const msg = err.response?.data?.message || 'Email ou senha incorretos.';
      Alert.alert('Erro ao entrar', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-indigo-50"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerClassName="flex-grow justify-center px-6 py-10"
        keyboardShouldPersistTaps="handled"
      >
        <View className="mb-8 items-center">
          <Text className="text-5xl font-black text-slate-900">
            Match<Text className="text-indigo-600">Job</Text>
          </Text>
          <Text className="mt-1 text-sm text-slate-500">
            Conectando talentos a oportunidades
          </Text>
        </View>

        <View className="rounded-3xl bg-white p-6 shadow-sm">
          <Text className="mb-5 text-2xl font-extrabold text-slate-900">Entrar</Text>

          <Text className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Email
          </Text>
          <TextInput
            className="mb-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-base text-slate-900"
            placeholder="seu@email.com"
            placeholderTextColor="#94a3b8"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Text className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Senha
          </Text>
          <TextInput
            className="mb-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-base text-slate-900"
            placeholder="••••••"
            placeholderTextColor="#94a3b8"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity
            className={`mt-1 items-center rounded-2xl bg-indigo-600 py-4 ${
              loading ? 'opacity-70' : ''
            }`}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-base font-bold text-white">Entrar</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('Register')}
            className="mt-5 items-center"
          >
            <Text className="text-sm text-slate-600">
              Nao tem conta? <Text className="font-bold text-indigo-600">Cadastre-se</Text>
            </Text>
          </TouchableOpacity>
        </View>

        <View className="mt-6 rounded-2xl border border-indigo-100 bg-indigo-100/70 p-4">
          <Text className="mb-2 text-xs font-bold uppercase tracking-wide text-indigo-700">
            Contas de teste
          </Text>
          <Text className="font-mono text-xs leading-5 text-slate-600">
            Cliente: joao@matchjob.com
          </Text>
          <Text className="font-mono text-xs leading-5 text-slate-600">
            Profissional: carlos@matchjob.com
          </Text>
          <Text className="font-mono text-xs leading-5 text-slate-600">Senha: 123456</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
