import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  getCategories,
  getTagsByCategory,
} from '@/src/features/professionals/services/categoryService';
import { createMyProfessionalProfile } from '@/src/features/professionals/services/professionalService';
import type { Category } from '@/src/features/professionals/types/categoryTypes';
import type { Tag } from '@/src/features/professionals/types/tagTypes';
import { Colors } from '@/src/shared/constants/colors';

export default function ProfileSetupScreen() {
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [price, setPrice] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [available, setAvailable] = useState(true);

  useEffect(() => {
    getCategories().then(setCategories).catch(console.error);
  }, []);

  useEffect(() => {
    if (!categoryId) {
      setTags([]);
      setSelectedTagIds([]);
      return;
    }
    getTagsByCategory(categoryId).then(setTags).catch(console.error);
    setSelectedTagIds([]);
  }, [categoryId]);

  function toggleTag(tagId: string) {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId],
    );
  }

  async function handleSubmit() {
    if (!categoryId) {
      Alert.alert('Atenção', 'Selecione uma categoria.');
      return;
    }
    if (!title.trim()) {
      Alert.alert('Atenção', 'Informe seu título profissional.');
      return;
    }
    try {
      setLoading(true);
      await createMyProfessionalProfile({
        title: title.trim(),
        bio: bio.trim() || undefined,
        categoryId,
        tagIds: selectedTagIds,
        location: location.trim() || undefined,
        priceRange: priceRange.trim() || undefined,
        price: price ? Number(price) : undefined,
        available,
      });
      router.replace('/professionals');
    } catch (error: unknown) {
      const msg =
        (error as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? 'Erro ao salvar perfil.';
      Alert.alert('Erro', msg);
    } finally {
      setLoading(false);
    }
  }

  const inputStyle = {
    backgroundColor: Colors.slate800,
    borderColor: Colors.slate700,
    color: Colors.white,
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.slate950 }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={{ padding: 16, paddingTop: 48, paddingBottom: 48 }}>
          <View className="mb-8 items-center">
            <View
              style={{ backgroundColor: 'rgba(139,92,246,0.1)' }}
              className="mb-4 flex-row items-center gap-2 rounded-full px-4 py-2"
            >
              <Ionicons name="sparkles" size={14} color={Colors.primaryLight} />
              <Text style={{ color: Colors.primaryLight }} className="text-sm font-medium">
                Configure seu perfil profissional
              </Text>
            </View>
            <Text className="text-3xl font-bold text-white">Bem-vindo ao MatchJob!</Text>
            <Text style={{ color: Colors.slate400 }} className="mt-3 text-center">
              Complete seu perfil para aparecer nas buscas e receber oportunidades.
            </Text>
          </View>

          <View
            style={{
              backgroundColor: 'rgba(255,255,255,0.03)',
              borderColor: 'rgba(255,255,255,0.1)',
            }}
            className="gap-6 rounded-3xl border p-6"
          >
            <View>
              <Text style={{ color: Colors.slate300 }} className="mb-2 text-sm font-medium">
                Título profissional *
              </Text>
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="Ex: Desenvolvedor Fullstack, Eletricista"
                placeholderTextColor={Colors.slate500}
                style={inputStyle}
                className="rounded-xl border px-4 py-3"
              />
            </View>

            <View>
              <Text style={{ color: Colors.slate300 }} className="mb-2 text-sm font-medium">
                Sobre você
              </Text>
              <TextInput
                value={bio}
                onChangeText={setBio}
                placeholder="Descreva sua experiência e diferencial."
                placeholderTextColor={Colors.slate500}
                multiline
                style={{ ...inputStyle, minHeight: 96, textAlignVertical: 'top' }}
                className="rounded-xl border px-4 py-3"
              />
            </View>

            <View>
              <Text style={{ color: Colors.slate300 }} className="mb-2 text-sm font-medium">
                Categoria *
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {categories.map((cat) => {
                  const selected = categoryId === cat.Id;
                  return (
                    <Pressable
                      key={cat.Id}
                      onPress={() => setCategoryId(cat.Id)}
                      style={{
                        backgroundColor: selected ? Colors.primary : Colors.slate800,
                        borderColor: selected ? Colors.primaryLight : Colors.slate700,
                      }}
                      className="rounded-full border px-3 py-1.5"
                    >
                      <Text
                        style={{ color: selected ? Colors.white : Colors.slate300 }}
                        className="text-xs font-medium"
                      >
                        {cat.Name}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {tags.length > 0 && (
              <View>
                <Text style={{ color: Colors.slate300 }} className="mb-2 text-sm font-medium">
                  Habilidades / Tags
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  {tags.map((tag) => {
                    const selected = selectedTagIds.includes(tag.Id);
                    return (
                      <Pressable
                        key={tag.Id}
                        onPress={() => toggleTag(tag.Id)}
                        style={{
                          backgroundColor: selected ? Colors.primary : Colors.slate800,
                          borderColor: selected ? Colors.primaryLight : Colors.slate700,
                        }}
                        className="flex-row items-center gap-1.5 rounded-full border px-3 py-1.5"
                      >
                        {selected && (
                          <Ionicons name="checkmark" size={12} color={Colors.white} />
                        )}
                        <Text
                          style={{ color: selected ? Colors.white : Colors.slate300 }}
                          className="text-xs font-medium"
                        >
                          {tag.Name}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            )}

            <View>
              <Text style={{ color: Colors.slate300 }} className="mb-2 text-sm font-medium">
                Localização
              </Text>
              <TextInput
                value={location}
                onChangeText={setLocation}
                placeholder="Ex: Ipatinga, MG"
                placeholderTextColor={Colors.slate500}
                style={inputStyle}
                className="rounded-xl border px-4 py-3"
              />
            </View>

            <View>
              <Text style={{ color: Colors.slate300 }} className="mb-2 text-sm font-medium">
                Faixa de preço
              </Text>
              <TextInput
                value={priceRange}
                onChangeText={setPriceRange}
                placeholder="Ex: R$ 50 - R$ 150/hora"
                placeholderTextColor={Colors.slate500}
                style={inputStyle}
                className="rounded-xl border px-4 py-3"
              />
            </View>

            <View>
              <Text style={{ color: Colors.slate300 }} className="mb-2 text-sm font-medium">
                Valor por hora (R$)
              </Text>
              <TextInput
                value={price}
                onChangeText={setPrice}
                placeholder="80"
                placeholderTextColor={Colors.slate500}
                keyboardType="numeric"
                style={inputStyle}
                className="rounded-xl border px-4 py-3"
              />
            </View>

            <View className="flex-row items-center gap-3">
              <Pressable
                onPress={() => setAvailable(!available)}
                style={{
                  backgroundColor: available ? Colors.primary : Colors.slate700,
                  width: 44,
                  height: 24,
                  borderRadius: 12,
                  justifyContent: 'center',
                  paddingHorizontal: 2,
                }}
              >
                <View
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: 8,
                    backgroundColor: Colors.white,
                    alignSelf: available ? 'flex-end' : 'flex-start',
                  }}
                />
              </Pressable>
              <Text style={{ color: Colors.slate300 }} className="text-sm">
                {available ? 'Disponível para contratação' : 'Indisponível no momento'}
              </Text>
            </View>

            <Pressable
              onPress={handleSubmit}
              disabled={loading}
              style={{ backgroundColor: Colors.primary, opacity: loading ? 0.6 : 1 }}
              className="rounded-xl py-3"
            >
              <Text className="text-center text-sm font-semibold text-white">
                {loading ? 'Salvando perfil...' : 'Criar meu perfil profissional'}
              </Text>
            </Pressable>

            <Text style={{ color: Colors.slate500 }} className="text-center text-xs">
              Você pode editar estas informações a qualquer momento no seu perfil.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
