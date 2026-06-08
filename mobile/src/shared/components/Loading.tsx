import { View, Text, ActivityIndicator } from 'react-native';
import { Colors } from '@/src/shared/constants/colors';

export function Loading({
  message = 'Carregando...',
  dark = false,
}: {
  message?: string;
  dark?: boolean;
}) {
  return (
    <View
      style={{ backgroundColor: dark ? Colors.slate950 : Colors.appBackground }}
      className="flex-1 items-center justify-center"
    >
      <ActivityIndicator size="large" color={Colors.primary} />
      <Text
        style={{ color: dark ? Colors.slate300 : Colors.textSecondary }}
        className="mt-4"
      >
        {message}
      </Text>
    </View>
  );
}
