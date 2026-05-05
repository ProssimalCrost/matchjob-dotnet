import { TextInput, View } from "react-native";

type Props = {
  value: string;
  onChange: (text: string) => void;
};

export function SearchInput({ value, onChange }: Props) {
  return (
    <View className="bg-card rounded-xl px-4 py-3 mb-4">
      <TextInput
        placeholder="Buscar profissionais..."
        placeholderTextColor="#94a3b8"
        value={value}
        onChangeText={onChange}
        className="text-white"
      />
    </View>
  );
}