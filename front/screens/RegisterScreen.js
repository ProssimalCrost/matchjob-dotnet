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
import { authRegister } from '../services/api';

const ROLES = [
  { key: 'CLIENT', icon: 'Cliente', label: 'Cliente', desc: 'Quero contratar' },
  { key: 'PROFESSIONAL', icon: 'Profissional', label: 'Profissional', desc: 'Quero trabalhar' },
];

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('CLIENT');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password) {
      Alert.alert('Atencao', 'Preencha todos os campos.');
      return;
    }

    if (password.length < 4) {
      Alert.alert('Atencao', 'Senha deve ter pelo menos 4 caracteres.');
      return;
    }

    setLoading(true);
    try {
      const res = await authRegister(name.trim(), email.trim(), password, role);
      await signIn(res.data);
    } catch (err) {
      const msg = err.response?.data?.message || 'Erro ao cadastrar. Tente novamente.';
      Alert.alert('Erro no cadastro', msg);
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
        contentContainerClassName="flex-grow px-6 pb-10 pt-14"
        keyboardShouldPersistTaps="handled"
      >
        <View className="mb-6">
          <TouchableOpacity onPress={() => navigation.goBack()} className="mb-3 self-start">
            <Text className="text-xl font-semibold text-indigo-600">Voltar</Text>
          </TouchableOpacity>
          <Text className="text-3xl font-black text-slate-900">Criar conta</Text>
          <Text className="mt-1 text-sm text-slate-500">Junte-se ao MatchJob</Text>
        </View>

        <View className="rounded-3xl bg-white p-6 shadow-sm">
          <Text className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Nome completo
          </Text>
          <TextInput
            className="mb-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-base text-slate-900"
            placeholder="Seu nome"
            placeholderTextColor="#94a3b8"
            value={name}
            onChangeText={setName}
          />

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
            placeholder="Minimo 4 caracteres"
            placeholderTextColor="#94a3b8"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <Text className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Voce e...
          </Text>
          <View className="mb-6 flex-row gap-3">
            {ROLES.map((item) => {
              const selected = role === item.key;
              return (
                <TouchableOpacity
                  key={item.key}
                  className={`flex-1 rounded-2xl border-2 px-4 py-4 ${
                    selected
                      ? 'border-indigo-600 bg-indigo-50'
                      : 'border-slate-200 bg-slate-50'
                  }`}
                  onPress={() => setRole(item.key)}
                  activeOpacity={0.8}
                >
                  <Text
                    className={`text-center text-base font-bold ${
                      selected ? 'text-indigo-600' : 'text-slate-700'
                    }`}
                  >
                    {item.icon}
                  </Text>
                  <Text
                    className={`mt-2 text-center text-sm font-bold ${
                      selected ? 'text-indigo-600' : 'text-slate-700'
                    }`}
                  >
                    {item.label}
                  </Text>
                  <Text className="mt-1 text-center text-xs text-slate-400">{item.desc}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity
            className={`items-center rounded-2xl bg-indigo-600 py-4 ${
              loading ? 'opacity-70' : ''
            }`}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-base font-bold text-white">Criar conta</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.goBack()} className="mt-5 items-center">
            <Text className="text-sm text-slate-600">
              Ja tem conta? <Text className="font-bold text-indigo-600">Entrar</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
