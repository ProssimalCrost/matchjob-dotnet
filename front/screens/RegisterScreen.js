// screens/RegisterScreen.js
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { authRegister } from '../services/api';
import { useAuth } from '../services/AuthContext';

const ROLES = [
  { key: 'CLIENT',       icon: '🛍️', label: 'Cliente',       desc: 'Quero contratar' },
  { key: 'PROFESSIONAL', icon: '💼', label: 'Profissional',   desc: 'Quero trabalhar' },
];

export default function RegisterScreen({ navigation }) {
  const [name, setName]       = useState('');
  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole]       = useState('CLIENT');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password) {
      Alert.alert('Atenção', 'Preencha todos os campos.');
      return;
    }
    if (password.length < 4) {
      Alert.alert('Atenção', 'Senha deve ter pelo menos 4 caracteres.');
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
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">

        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Criar conta</Text>
          <Text style={styles.subtitle}>Junte-se ao MatchJob</Text>
        </View>

        <View style={styles.card}>

          {/* Nome */}
          <Text style={styles.label}>Nome completo</Text>
          <TextInput
            style={styles.input}
            placeholder="Seu nome"
            placeholderTextColor="#aaa"
            value={name}
            onChangeText={setName}
          />

          {/* Email */}
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

          {/* Senha */}
          <Text style={styles.label}>Senha</Text>
          <TextInput
            style={styles.input}
            placeholder="Mínimo 4 caracteres"
            placeholderTextColor="#aaa"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          {/* Tipo de conta */}
          <Text style={styles.label}>Você é...</Text>
          <View style={styles.roleRow}>
            {ROLES.map((r) => (
              <TouchableOpacity
                key={r.key}
                style={[styles.roleCard, role === r.key && styles.roleCardSelected]}
                onPress={() => setRole(r.key)}
                activeOpacity={0.8}
              >
                <Text style={styles.roleIcon}>{r.icon}</Text>
                <Text style={[styles.roleLabel, role === r.key && styles.roleLabelSelected]}>
                  {r.label}
                </Text>
                <Text style={styles.roleDesc}>{r.desc}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={[styles.btn, loading && styles.btnDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.btnText}>Criar conta</Text>
            }
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.link}>
            <Text style={styles.linkText}>
              Já tem conta?{'  '}<Text style={styles.linkAccent}>Entrar</Text>
            </Text>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#f0f4ff' },
  container: { flexGrow: 1, padding: 24, paddingTop: 56 },

  header: { marginBottom: 24 },
  backBtn: { marginBottom: 12 },
  backIcon: { fontSize: 22, color: '#4f46e5' },
  title: { fontSize: 28, fontWeight: '900', color: '#1a1a2e' },
  subtitle: { fontSize: 14, color: '#888', marginTop: 4 },

  card: {
    backgroundColor: '#fff', borderRadius: 20, padding: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, elevation: 5,
  },

  label: { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 6 },
  input: {
    borderWidth: 1.5, borderColor: '#e2e8f0', borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 15, color: '#1a1a2e', backgroundColor: '#fafafa', marginBottom: 16,
  },

  roleRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  roleCard: {
    flex: 1, borderWidth: 2, borderColor: '#e2e8f0',
    borderRadius: 14, padding: 16, alignItems: 'center', backgroundColor: '#fafafa',
  },
  roleCardSelected: { borderColor: '#4f46e5', backgroundColor: '#eef2ff' },
  roleIcon: { fontSize: 30, marginBottom: 6 },
  roleLabel: { fontSize: 14, fontWeight: '700', color: '#555' },
  roleLabelSelected: { color: '#4f46e5' },
  roleDesc: { fontSize: 11, color: '#999', marginTop: 3 },

  btn: {
    backgroundColor: '#4f46e5', borderRadius: 12,
    paddingVertical: 15, alignItems: 'center',
  },
  btnDisabled: { opacity: 0.65 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },

  link: { marginTop: 18, alignItems: 'center' },
  linkText: { fontSize: 14, color: '#666' },
  linkAccent: { color: '#4f46e5', fontWeight: '700' },
});
