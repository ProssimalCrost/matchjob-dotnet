import { useState } from 'react';
import {
  ImageBackground,
  View,
  Text,
  TextInput,
  Pressable,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter, Link } from 'expo-router';
import * as Linking from 'expo-linking';
import { supabase } from '@/src/core/supabase/client';
import { setToken } from '@/src/shared/utils/token';
import { syncUser } from '@/src/features/auth/services/authService';
import { getMyProfessionalProfile } from '@/src/features/professionals/services/professionalService';
import { Colors } from '@/src/shared/constants/colors';

export default function LoginScreen() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  async function handleSubmit() {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Atenção', 'Preencha e-mail e senha.');
      return;
    }
    try {
      setLoading(true);

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        Alert.alert('Erro', 'Email ou senha incorretos.');
        return;
      }
      if (!data.session) {
        Alert.alert('Atenção', 'Confirme seu e-mail antes de fazer login.');
        return;
      }

      await setToken(data.session.access_token);

      // Garante que o usuário existe na tabela local antes de qualquer operação
      await syncUser();

      try {
        await getMyProfessionalProfile();
        router.replace('/professionals');
      } catch {
        router.replace('/profile/setup');
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Erro', 'Erro ao fazer login. Verifique seus dados.');
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    try {
      setGoogleLoading(true);
      const redirectTo = Linking.createURL('/auth/callback');
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo },
      });
      if (error) {
        console.error('Erro ao entrar com Google:', error.message);
        Alert.alert('Erro', 'Erro ao entrar com Google.');
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Erro', 'Erro inesperado ao tentar entrar com Google.');
    } finally {
      setGoogleLoading(false);
    }
  }

  return (
    <ImageBackground
      source={require('@/assets/logos/bg.png')}
      resizeMode="cover"
      style={{ flex: 1, backgroundColor: Colors.slate950 }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'center',
            padding: 16,
          }}
        >
          <View
            style={{
              backgroundColor: Colors.slate900,
              borderColor: Colors.slate800,
            }}
            className="w-full self-center rounded-2xl border p-8"
          >
            <Link href="/" asChild>
              <Pressable>
                <Text
                  style={{ color: Colors.primaryLight }}
                  className="mb-6 text-sm font-semibold"
                >
                  MatchJob
                </Text>
              </Pressable>
            </Link>

            <Text className="mb-2 text-3xl font-bold text-white">Entrar</Text>
            <Text style={{ color: Colors.slate400 }} className="mb-8">
              Acesse sua conta no MatchJob.
            </Text>

            <Pressable
              onPress={handleGoogleLogin}
              disabled={googleLoading || loading}
              style={{ backgroundColor: Colors.white, opacity: googleLoading ? 0.6 : 1 }}
              className="rounded-lg py-3"
            >
              <Text
                style={{ color: Colors.slate950 }}
                className="text-center font-semibold"
              >
                {googleLoading ? 'Redirecionando...' : 'Entrar com Google'}
              </Text>
            </Pressable>

            <View className="my-6 flex-row items-center gap-3">
              <View style={{ height: 1, flex: 1, backgroundColor: Colors.slate700 }} />
              <Text style={{ color: Colors.slate500 }} className="text-xs">
                ou entre com e-mail
              </Text>
              <View style={{ height: 1, flex: 1, backgroundColor: Colors.slate700 }} />
            </View>

            <View className="gap-4">
              <View>
                <Text style={{ color: Colors.slate300 }} className="mb-1 text-sm">
                  E-mail
                </Text>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="seuemail@email.com"
                  placeholderTextColor={Colors.slate500}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  style={{
                    backgroundColor: Colors.slate800,
                    borderColor: Colors.slate700,
                    color: Colors.white,
                  }}
                  className="rounded-lg border px-4 py-3"
                />
              </View>

              <View>
                <Text style={{ color: Colors.slate300 }} className="mb-1 text-sm">
                  Senha
                </Text>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="********"
                  placeholderTextColor={Colors.slate500}
                  secureTextEntry
                  style={{
                    backgroundColor: Colors.slate800,
                    borderColor: Colors.slate700,
                    color: Colors.white,
                  }}
                  className="rounded-lg border px-4 py-3"
                />
              </View>
            </View>

            <Pressable
              onPress={handleSubmit}
              disabled={loading || googleLoading}
              style={{ backgroundColor: Colors.primary, opacity: loading ? 0.6 : 1 }}
              className="mt-6 rounded-lg py-3"
            >
              <Text className="text-center font-semibold text-white">
                {loading ? 'Entrando...' : 'Entrar'}
              </Text>
            </Pressable>

            <View className="mt-6 flex-row justify-center">
              <Text style={{ color: Colors.slate400 }} className="text-sm">
                Não tem uma conta?{' '}
              </Text>
              <Link href="/register" asChild>
                <Pressable>
                  <Text
                    style={{ color: Colors.primaryLight }}
                    className="text-sm font-semibold"
                  >
                    Criar conta
                  </Text>
                </Pressable>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}
