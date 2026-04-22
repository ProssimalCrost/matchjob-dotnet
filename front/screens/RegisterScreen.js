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
  { key: 'CLIENT', title: 'Cliente', desc: 'Quero contratar profissionais' },
  { key: 'PROFESSIONAL', title: 'Profissional', desc: 'Quero receber oportunidades' },
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
      className="flex-1 bg-[#fff7ed]"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerClassName="flex-grow px-6 pb-10 pt-12"
        keyboardShouldPersistTaps="handled"
      >
        <View className="w-full self-center" style={{ maxWidth: 980 }}>
          <TouchableOpacity onPress={() => navigation.goBack()} className="mb-4 self-start">
            <Text className="text-sm font-black uppercase tracking-[0.25em] text-orange-500">
              Voltar
            </Text>
          </TouchableOpacity>

          <View className="mb-6 rounded-[28px] bg-slate-950 px-6 pb-7 pt-8">
            <Text className="text-xs font-black uppercase tracking-[0.35em] text-orange-300">
              Nova conta
            </Text>
            <Text className="mt-3 text-4xl font-black leading-10 text-white">
              Monte seu perfil e comece agora.
            </Text>
            <Text className="mt-3 text-sm leading-6 text-slate-300">
              Escolha como quer entrar no MatchJob e finalize o cadastro em poucos passos.
            </Text>
          </View>

          <View className="rounded-[28px] border border-orange-100 bg-white px-5 py-6">
            <Text className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.25em] text-slate-400">
              Nome completo
            </Text>
            <TextInput
              className="mb-4 rounded-[18px] border border-slate-200 bg-slate-50 px-4 py-3.5 text-base text-slate-900"
              placeholder="Seu nome"
              placeholderTextColor="#94a3b8"
              value={name}
              onChangeText={setName}
            />

            <Text className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.25em] text-slate-400">
              Email
            </Text>
            <TextInput
              className="mb-4 rounded-[18px] border border-slate-200 bg-slate-50 px-4 py-3.5 text-base text-slate-900"
              placeholder="seu@email.com"
              placeholderTextColor="#94a3b8"
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
              className="mb-5 rounded-[18px] border border-slate-200 bg-slate-50 px-4 py-3.5 text-base text-slate-900"
              placeholder="Minimo 4 caracteres"
              placeholderTextColor="#94a3b8"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <Text className="mb-3 text-[11px] font-bold uppercase tracking-[0.25em] text-slate-400">
              Escolha seu lado
            </Text>

            <View className="mb-6 gap-3">
              {ROLES.map((item) => {
                const selected = role === item.key;
                return (
                  <TouchableOpacity
                    key={item.key}
                    className={`rounded-[20px] border px-4 py-4 ${
                      selected
                        ? 'border-orange-400 bg-orange-50'
                        : 'border-slate-200 bg-slate-50'
                    }`}
                    onPress={() => setRole(item.key)}
                    activeOpacity={0.85}
                  >
                    <Text
                      className={`text-base font-black ${
                        selected ? 'text-orange-600' : 'text-slate-800'
                      }`}
                    >
                      {item.title}
                    </Text>
                    <Text
                      className={`mt-1 text-sm ${
                        selected ? 'text-orange-700' : 'text-slate-500'
                      }`}
                    >
                      {item.desc}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity
              className={`items-center rounded-[20px] bg-slate-950 py-4 ${
                loading ? 'opacity-70' : ''
              }`}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-base font-black uppercase tracking-wide text-white">
                  Criar conta
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.goBack()} className="mt-5 items-center">
              <Text className="text-sm text-slate-500">
                Ja tem conta? <Text className="font-bold text-orange-500">Entrar</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
