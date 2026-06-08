import { useEffect } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/src/shared/constants/colors';

// Mirrors front app/professionals/profile/edit -> redirects to /profile/edit.
export default function OldProfileEditRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/profile/edit');
  }, [router]);
  return <View style={{ flex: 1, backgroundColor: Colors.appBackground }} />;
}
