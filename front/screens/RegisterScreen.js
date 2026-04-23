import React, { useState } from 'react';
import { Alert, Text, TouchableOpacity, View } from 'react-native';

import {
  AuthLayout,
  InputField,
  Label,
  PrimaryButton,
  SegmentedOptions,
} from '../components/MatchJobUI';
import { useAuth } from '../services/AuthContext';
import { authRegister } from '../services/api';

const ROLES = [
  { key: 'CLIENT', title: 'Candidato', desc: 'Quero explorar vagas, conversar e acompanhar oportunidades.' },
  { key: 'PROFESSIONAL', title: 'Empresa', desc: 'Quero divulgar vagas e encontrar talentos com mais rapidez.' },
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
    <AuthLayout
      title="Criar conta"
      subtitle="Monte seu perfil inicial em poucos passos e entre no ecossistema MatchJobs."
      heroTitle="Registro guiado para web e celular"
      heroSubtitle="A interface segue a referencia com superfícies claras, blocos definidos e destaque visual no fluxo de onboarding."
      heroPoints={[
        'Escolha o tipo de conta logo no inicio.',
        'Campos amplos para toque facil no mobile.',
        'Hierarquia forte para funcionar bem em desktop com mais respiro.',
      ]}
      compactHeroFooter={
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ color: '#ffffff', fontWeight: '700', fontSize: 14 }}>Ja tem conta? Entrar</Text>
        </TouchableOpacity>
      }
    >
      <Label>Nome completo</Label>
      <InputField placeholder="Seu nome" value={name} onChangeText={setName} />

      <Label>E-mail</Label>
      <InputField
        placeholder="seu@email.com"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
      />

      <Label>Senha</Label>
      <InputField
        placeholder="Minimo 4 caracteres"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <Label>Tipo de conta</Label>
      <SegmentedOptions options={ROLES} selectedKey={role} onChange={setRole} />

      <View style={{ marginTop: 22, gap: 12 }}>
        <PrimaryButton title="Criar conta" onPress={handleRegister} loading={loading} />
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ alignItems: 'center' }}>
          <Text style={{ color: '#6e74a6', fontSize: 14 }}>
            Ja tem uma conta? <Text style={{ color: '#6d28d9', fontWeight: '700' }}>Entrar</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </AuthLayout>
  );
}
