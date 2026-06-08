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
import { supabase } from '@/src/core/supabase/client';
import { setToken } from '@/src/shared/utils/token';
import { syncUser } from '@/src/features/auth/services/authService';
import { Colors } from '@/src/shared/constants/colors';

export default function RegisterScreen() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!name.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Atenção', 'Preencha todos os campos.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Atenção', 'A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    try {
      setLoading(true);

      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: { data: { full_name: name.trim() } },
      });

      if (error) {
        Alert.alert('Erro', error.message);
        return;
      }

      if (!data.session) {
        Alert.alert('Quase lá', 'Verifique seu e-mail para confirmar o cadastro.');
        router.replace('/login');
        return;
      }

      await setToken(data.session.access_token);
      await syncUser();

      router.replace('/profile/setup');
    } catch (err) {
      console.error(err);
      Alert.alert('Erro', 'Erro ao criar conta. Verifique os dados.');
    } finally {
      setLoading(false);
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
              backgroundColor: 'rgba(255,255,255,0.03)',
              borderColor: 'rgba(255,255,255,0.1)',
            }}
            className="w-full self-center rounded-3xl border p-8"
          >
            <Link href="/" asChild>
              <Pressable>
                <Text
                  style={{ color: Colors.primaryLight }}
                  className="text-sm font-semibold"
                >
                  MatchJob
                </Text>
              </Pressable>
            </Link>

            <Text className="mt-6 text-3xl font-bold text-white">Criar conta</Text>
            <Text style={{ color: Colors.slate400 }} className="mt-3 text-sm leading-6">
              Crie sua conta para encontrar profissionais, divulgar seus serviços
              ou se conectar com novas oportunidades.
            </Text>

            <View className="mt-8 gap-5">
              <View>
                <Text style={{ color: Colors.slate300 }} className="mb-2 text-sm">
                  Nome
                </Text>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="Seu nome completo"
                  placeholderTextColor={Colors.slate500}
                  style={{
                    backgroundColor: Colors.slate800,
                    borderColor: Colors.slate700,
                    color: Colors.white,
                  }}
                  className="rounded-lg border px-4 py-3"
                />
              </View>

              <View>
                <Text style={{ color: Colors.slate300 }} className="mb-2 text-sm">
                  E-mail
                </Text>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="voce@email.com"
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
                <Text style={{ color: Colors.slate300 }} className="mb-2 text-sm">
                  Senha
                </Text>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Crie uma senha segura"
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

              <Pressable
                onPress={handleSubmit}
                disabled={loading}
                style={{ backgroundColor: Colors.primary, opacity: loading ? 0.6 : 1 }}
                className="mt-2 rounded-xl py-3"
              >
                <Text className="text-center text-sm font-semibold text-white">
                  {loading ? 'Criando conta...' : 'Criar minha conta'}
                </Text>
              </Pressable>
            </View>

            <View className="mt-6 flex-row justify-center">
              <Text style={{ color: Colors.slate400 }} className="text-sm">
                Já tem uma conta?{' '}
              </Text>
              <Link href="/login" asChild>
                <Pressable>
                  <Text
                    style={{ color: Colors.primaryLight }}
                    className="text-sm font-semibold"
                  >
                    Entrar
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
