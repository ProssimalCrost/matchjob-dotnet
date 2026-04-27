import React, { useState } from 'react';
import { Alert, Text, View } from 'react-native';

import {
  AuthLayout,
  InputField,
  Label,
  Panel,
  PrimaryButton,
  SecondaryButton,
} from '../components/MatchJobUI';
import { useAuth } from '../services/AuthContext';
import { authLogin, getApiErrorMessage } from '../services/api';

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
      Alert.alert('Erro ao entrar', getApiErrorMessage(err, 'Email ou senha incorretos.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Bem-vindo de volta!"
      subtitle="Faca login para continuar e acompanhar vagas, conversas e perfis em um unico lugar."
      heroTitle="Conecte talentos as melhores oportunidades"
      heroSubtitle="Entre para comparar perfis, acompanhar conversas e seguir seus contatos profissionais."
      heroPoints={[
        'Descubra profissionais e oportunidades em poucos cliques.',
        'Organize conversas e contatos em um unico painel.',
        'Use a mesma experiencia no celular ou no desktop.',
      ]}
      compactHeroFooter={
        <View style={{ gap: 10 }}>
          <SecondaryButton title="Criar conta" onPress={() => navigation.navigate('Register')} muted />
          <Text style={{ color: 'rgba(255,255,255,0.72)', fontSize: 12 }}>
            Contas de teste: `joao@matchjob.com` ou `carlos@matchjob.com` com senha `123456`
          </Text>
        </View>
      }
    >
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
        placeholder="Digite sua senha"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <Text style={{ alignSelf: 'flex-end', color: '#6d28d9', fontSize: 13, fontWeight: '700' }}>
        Esqueceu sua senha?
      </Text>

      <View style={{ marginTop: 18, gap: 12 }}>
        <PrimaryButton title="Entrar" onPress={handleLogin} loading={loading} />
        <SecondaryButton title="Criar conta" onPress={() => navigation.navigate('Register')} />
      </View>

      <Panel style={{ marginTop: 20, padding: 18 }}>
        <Text style={{ color: '#1f2456', fontWeight: '800', fontSize: 14 }}>Acesso rapido para teste</Text>
        <Text style={{ color: '#6e74a6', marginTop: 8, lineHeight: 22 }}>
          Cliente: joao@matchjob.com
        </Text>
        <Text style={{ color: '#6e74a6', lineHeight: 22 }}>Profissional: carlos@matchjob.com</Text>
        <Text style={{ color: '#6e74a6', lineHeight: 22 }}>Senha: 123456</Text>
      </Panel>
    </AuthLayout>
  );
}
