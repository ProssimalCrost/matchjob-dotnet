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
import { Ionicons } from '@expo/vector-icons';
import { Input } from '@/src/shared/components/Input';
import { Button } from '@/src/shared/components/Button';
import { signUpWithEmail } from '@/src/services/authService';

export default function RegisterScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate() {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Nome é obrigatório';
    if (!email.trim()) e.email = 'E-mail é obrigatório';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'E-mail inválido';
    if (password.length < 6) e.password = 'Mínimo 6 caracteres';
    if (password !== confirm) e.confirm = 'Senhas não coincidem';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleRegister() {
    if (!validate()) return;
    setLoading(true);
    try {
      await signUpWithEmail(email.trim(), password, name.trim());
    } catch (err: any) {
      Alert.alert('Erro ao cadastrar', err.message ?? 'Tente novamente.');
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
        contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 }}
        className="px-6"
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 items-center justify-center mb-4"
        >
          <Ionicons name="arrow-back" size={24} color="#f8fafc" />
        </TouchableOpacity>

        <View className="items-center mb-7">
          <Text className="text-3xl font-bold text-white tracking-tight">MatchJob</Text>
          <Text className="text-slate-400 text-sm mt-1">Crie sua conta gratuitamente</Text>
        </View>

        <View className="bg-slate-900 rounded-3xl p-6 border border-slate-800">
          <Text className="text-2xl font-bold text-white mb-5">Criar conta</Text>

          <Input
            label="Nome completo"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            autoComplete="name"
            error={errors.name}
            placeholder="Seu nome"
          />
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
            placeholder="Mínimo 6 caracteres"
          />
          <Input
            label="Confirmar senha"
            value={confirm}
            onChangeText={setConfirm}
            isPassword
            error={errors.confirm}
            placeholder="Repita a senha"
          />

          <Button
            label="Criar conta"
            onPress={handleRegister}
            loading={loading}
            className="mt-2"
          />

          <TouchableOpacity
            onPress={() => router.push('/login')}
            className="items-center mt-4"
          >
            <Text className="text-slate-400 text-sm">
              Já tem conta?{' '}
              <Text className="text-primary font-semibold">Entrar</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
