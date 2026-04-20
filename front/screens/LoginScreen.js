// screens/LoginScreen.js
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { authLogin } from '../services/api';
import { useAuth } from '../services/AuthContext';

export default function LoginScreen({ navigation }) {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const { signIn } = useAuth();

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Atenção', 'Preencha email e senha.');
      return;
    }
    setLoading(true);
    try {
      const res = await authLogin(email.trim(), password);
      // res.data vem em PascalCase do .NET: { Token, UserId, Name, Email, Role }
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
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">

        {/* Logo */}
        <View style={styles.logoWrap}>
          <Text style={styles.logo}>Match<Text style={styles.accent}>Job</Text></Text>
          <Text style={styles.tagline}>Conectando talentos a oportunidades</Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Entrar</Text>

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="seu@email.com"
            placeholderTextColor="#aaa"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Text style={styles.label}>Senha</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••"
            placeholderTextColor="#aaa"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity
            style={[styles.btn, loading && styles.btnDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.btnText}>Entrar</Text>
            }
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Register')} style={styles.link}>
            <Text style={styles.linkText}>
              Não tem conta?{'  '}
              <Text style={styles.linkAccent}>Cadastre-se</Text>
            </Text>
          </TouchableOpacity>
        </View>

        {/* Dica contas de teste */}
        <View style={styles.hint}>
          <Text style={styles.hintTitle}>💡 Contas de teste</Text>
          <Text style={styles.hintText}>Cliente:      joao@matchjob.com</Text>
          <Text style={styles.hintText}>Profissional: carlos@matchjob.com</Text>
          <Text style={styles.hintText}>Senha: 123456</Text>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#f0f4ff' },
  container: { flexGrow: 1, justifyContent: 'center', padding: 24 },

  logoWrap: { alignItems: 'center', marginBottom: 32 },
  logo: { fontSize: 42, fontWeight: '900', color: '#1a1a2e' },
  accent: { color: '#4f46e5' },
  tagline: { fontSize: 14, color: '#888', marginTop: 4 },

  card: {
    backgroundColor: '#fff', borderRadius: 20, padding: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, shadowRadius: 12, elevation: 5,
  },
  cardTitle: { fontSize: 22, fontWeight: '800', color: '#1a1a2e', marginBottom: 20 },

  label: { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 6 },
  input: {
    borderWidth: 1.5, borderColor: '#e2e8f0', borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 15, color: '#1a1a2e', backgroundColor: '#fafafa', marginBottom: 16,
  },

  btn: {
    backgroundColor: '#4f46e5', borderRadius: 12,
    paddingVertical: 15, alignItems: 'center', marginTop: 4,
  },
  btnDisabled: { opacity: 0.65 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },

  link: { marginTop: 18, alignItems: 'center' },
  linkText: { fontSize: 14, color: '#666' },
  linkAccent: { color: '#4f46e5', fontWeight: '700' },

  hint: {
    marginTop: 24, backgroundColor: '#eef2ff', borderRadius: 12,
    padding: 14, borderLeftWidth: 4, borderLeftColor: '#4f46e5',
  },
  hintTitle: { fontWeight: '700', color: '#4f46e5', marginBottom: 6, fontSize: 13 },
  hintText: { fontSize: 12, color: '#555', lineHeight: 20, fontFamily: 'monospace' },
});
