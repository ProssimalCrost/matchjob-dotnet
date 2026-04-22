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
      className="flex-1 bg-slate-950"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerClassName="flex-grow justify-center px-6 py-10"
        keyboardShouldPersistTaps="handled"
      >
        <View className="w-full self-center" style={{ maxWidth: 980 }}>
          <View className="overflow-hidden rounded-[32px] border border-white/10 bg-slate-900">
            <View className="bg-teal-400 px-6 pb-8 pt-10">
              <Text className="text-xs font-black uppercase tracking-[0.35em] text-slate-900">
                MatchJob
              </Text>
              <Text className="mt-4 text-4xl font-black leading-10 text-slate-950">
                Entre e encontre o proximo trabalho certo.
              </Text>
              <Text className="mt-3 max-w-[280px] text-sm leading-6 text-slate-900/80">
                Profissionais e clientes no mesmo lugar, com conversa rapida e perfis objetivos.
              </Text>
            </View>

            <View className="px-6 pb-6 pt-6">
              <Text className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.25em] text-slate-400">
                Email
              </Text>
              <TextInput
                className="mb-4 rounded-[20px] border border-slate-800 bg-slate-950 px-4 py-3.5 text-base text-white"
                placeholder="seu@email.com"
                placeholderTextColor="#64748b"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />

              <Text className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.25em] text-slate-400">
                Senha
              </Text>
              <TextInput
                className="mb-5 rounded-[20px] border border-slate-800 bg-slate-950 px-4 py-3.5 text-base text-white"
                placeholder="******"
                placeholderTextColor="#64748b"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />

              <TouchableOpacity
                className={`items-center rounded-[20px] bg-amber-300 py-4 ${
                  loading ? 'opacity-70' : ''
                }`}
                onPress={handleLogin}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#0f172a" />
                ) : (
                  <Text className="text-base font-black uppercase tracking-wide text-slate-950">
                    Entrar
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => navigation.navigate('Register')}
                className="mt-5 items-center"
              >
                <Text className="text-sm text-slate-400">
                  Nao tem conta? <Text className="font-bold text-teal-300">Cadastre-se</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View className="mt-5 rounded-[24px] border border-white/10 bg-white/5 p-4">
            <Text className="text-[11px] font-black uppercase tracking-[0.25em] text-teal-300">
              Contas de teste
            </Text>
            <Text className="mt-3 font-mono text-xs leading-6 text-slate-300">
              Cliente: joao@matchjob.com
            </Text>
            <Text className="font-mono text-xs leading-6 text-slate-300">
              Profissional: carlos@matchjob.com
            </Text>
            <Text className="font-mono text-xs leading-6 text-slate-300">Senha: 123456</Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
