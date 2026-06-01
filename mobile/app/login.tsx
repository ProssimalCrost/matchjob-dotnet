import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Input } from '@/src/shared/components/Input';
import { Button } from '@/src/shared/components/Button';
import { signInWithEmail } from '@/src/services/authService';

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  function validate() {
    const e: typeof errors = {};
    if (!email.trim()) e.email = 'E-mail é obrigatório';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'E-mail inválido';
    if (!password) e.password = 'Senha é obrigatória';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleLogin() {
    if (!validate()) return;
    setLoading(true);
    try {
      await signInWithEmail(email.trim(), password);
    } catch (err: any) {
      Alert.alert('Erro ao entrar', err.message ?? 'Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-slate-950"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={{ paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }}
        className="px-6"
        keyboardShouldPersistTaps="handled"
      >
        {/* Brand */}
        <View className="items-center mb-10">
          <View className="w-16 h-16 rounded-2xl bg-primary/20 border border-primary/30 items-center justify-center mb-4">
            <Text className="text-3xl font-bold text-primary">M</Text>
          </View>
          <Text className="text-4xl font-bold text-white tracking-tight">MatchJob</Text>
          <Text className="text-slate-400 text-sm mt-1">Conectando profissionais a clientes</Text>
        </View>

        {/* Form */}
        <View className="bg-slate-900 rounded-3xl p-6 border border-slate-800">
          <Text className="text-2xl font-bold text-white mb-5">Entrar</Text>

          <Input
            label="E-mail"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoComplete="email"
            error={errors.email}
            placeholder="seu@email.com"
          />

          <Input
            label="Senha"
            value={password}
            onChangeText={setPassword}
            isPassword
            error={errors.password}
            placeholder="••••••••"
          />

          <Button
            label="Entrar"
            onPress={handleLogin}
            loading={loading}
            className="mt-2"
          />

          <TouchableOpacity
            onPress={() => router.push('/register')}
            className="items-center mt-4"
          >
            <Text className="text-slate-400 text-sm">
              Não tem conta?{' '}
              <Text className="text-primary font-semibold">Cadastre-se</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
