import { ImageBackground, View, Text, Image, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/src/shared/constants/colors';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <ImageBackground
      source={require('@/assets/logos/bg.png')}
      resizeMode="cover"
      style={{ flex: 1, backgroundColor: Colors.slate950 }}
    >
      <View className="flex-1 items-center justify-center px-6">
        <View className="w-full max-w-xl items-center">
          <Image
            source={require('@/assets/logos/logositeb.png')}
            style={{ width: 360, height: 120, marginBottom: 40 }}
            resizeMode="contain"
          />

          <Text className="mb-6 text-center text-3xl font-bold text-white">
            Encontre o profissional ideal para o seu projeto
          </Text>

          <Text
            style={{ color: Colors.slate300 }}
            className="mb-8 text-center text-base leading-6"
          >
            Uma plataforma para conectar clientes e profissionais autônomos com
            filtros, perfil completo, avaliações e match por habilidades.
          </Text>

          <View className="w-full gap-4">
            <Pressable
              onPress={() => router.push('/register')}
              style={{ borderColor: Colors.primaryLight }}
              className="rounded-lg border px-6 py-3"
            >
              <Text className="text-center font-semibold text-white">
                Registre-se
              </Text>
            </Pressable>

            <Pressable
              onPress={() => router.push('/login')}
              style={{ backgroundColor: Colors.primary }}
              className="rounded-lg px-6 py-3"
            >
              <Text className="text-center font-semibold text-white">
                Entrar
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </ImageBackground>
  );
}
