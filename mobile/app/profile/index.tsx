import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Sidebar } from '@/src/shared/components/Sidebar';
import { Colors } from '@/src/shared/constants/colors';

export default function ProfileScreen() {
  const router = useRouter();
  return (
    <View style={{ flex: 1, backgroundColor: Colors.appBackground }}>
      <Sidebar />
      <View className="flex-1 p-5">
        <Text style={{ color: Colors.text }} className="text-3xl font-bold">
          Perfil
        </Text>
        <View
          style={{ backgroundColor: Colors.surface, borderColor: Colors.slate200 }}
          className="mt-8 rounded-lg border p-6"
        >
          <View
            style={{ backgroundColor: Colors.slate200 }}
            className="h-16 w-16 rounded-full"
          />
          <Text style={{ color: Colors.text }} className="mt-4 text-xl font-semibold">
            Seu nome
          </Text>
          <Text style={{ color: Colors.textSecondary }} className="mt-1">
            Atualize seus dados profissionais.
          </Text>
          <Pressable
            onPress={() => router.push('/profile/edit')}
            style={{ backgroundColor: Colors.primary }}
            className="mt-6 self-start rounded-xl px-5 py-3"
          >
            <Text className="text-sm font-semibold text-white">Editar perfil</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
