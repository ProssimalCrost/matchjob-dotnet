import { useEffect } from 'react';
import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/src/core/supabase/client';
import { setToken } from '@/src/shared/utils/token';
import { getMe } from '@/src/features/auth/services/authService';
import { getMyProfessionalProfile } from '@/src/features/professionals/services/professionalService';
import { Colors } from '@/src/shared/constants/colors';

export default function AuthCallbackScreen() {
  const router = useRouter();

  useEffect(() => {
    async function handleCallback() {
      const { data, error } = await supabase.auth.getSession();

      if (error || !data.session) {
        console.error('Erro no callback:', error?.message);
        router.replace('/login');
        return;
      }

      await setToken(data.session.access_token);

      try {
        await getMe();
      } catch {
        // se /auth/me falhar, continua mesmo assim
      }

      try {
        await getMyProfessionalProfile();
        router.replace('/professionals');
      } catch {
        router.replace('/profile/setup');
      }
    }

    handleCallback();
  }, [router]);

  return (
    <View
      style={{ backgroundColor: Colors.slate950 }}
      className="flex-1 items-center justify-center"
    >
      <Text className="text-white">Finalizando login...</Text>
    </View>
  );
}
