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
import { Sidebar } from '@/src/shared/components/Sidebar';
import { Loading } from '@/src/shared/components/Loading';
import {
  getCategories,
  getTagsByCategory,
} from '@/src/features/professionals/services/categoryService';
import {
  getMyProfessionalProfile,
  updateMyProfessionalProfile,
} from '@/src/features/professionals/services/professionalService';
import type { Category } from '@/src/features/professionals/types/categoryTypes';
import type { Tag } from '@/src/features/professionals/types/tagTypes';
import type { Professional } from '@/src/features/professionals/types/professionalTypes';
import { Colors } from '@/src/shared/constants/colors';

export default function ProfileEditScreen() {
  const router = useRouter();

  const [profile, setProfile] = useState<Professional | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [price, setPrice] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [available, setAvailable] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [prof, cats] = await Promise.all([
          getMyProfessionalProfile(),
          getCategories(),
        ]);
        setProfile(prof);
        setCategories(cats);
        setTitle(prof.Title ?? '');
        setBio(prof.Bio ?? '');
        setLocation(prof.Location ?? '');
        setPriceRange(prof.PriceRange ?? '');
        setPrice(prof.Price?.toString() ?? '');
        setCategoryId(prof.CategoryId ?? '');
        setSelectedTagIds(prof.Tags.map((t) => t.Id));
        setAvailable(prof.Available);
        if (prof.CategoryId) {
          setTags(await getTagsByCategory(prof.CategoryId));
        }
      } catch {
        router.replace('/profile/setup');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [router]);

  useEffect(() => {
    if (!categoryId) {
      setTags([]);
      return;
    }
    getTagsByCategory(categoryId).then(setTags).catch(console.error);
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
    try {
      setSaving(true);
      await updateMyProfessionalProfile({
        title: title.trim() || undefined,
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
          ?.message ?? 'Erro ao atualizar perfil.';
      Alert.alert('Erro', msg);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.appBackground }}>
        <Sidebar />
        <Loading message="Carregando perfil..." />
      </View>
    );
  }

  const inputStyle = {
    backgroundColor: Colors.slate100,
    borderColor: Colors.slate200,
    color: Colors.text,
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.appBackground }}>
      <Sidebar />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
          <Text style={{ color: Colors.text }} className="text-3xl font-bold">
            Editar Perfil
          </Text>
          <Text style={{ color: Colors.textMuted }} className="mb-6 mt-1 text-sm">
            Atualize suas informações profissionais.
          </Text>

          <View
            style={{ backgroundColor: Colors.surface, borderColor: Colors.slate200 }}
            className="gap-6 rounded-3xl border p-6"
          >
            {profile && (
              <View
                style={{ borderBottomColor: Colors.slate100 }}
                className="flex-row items-center gap-4 border-b pb-6"
              >
                <View
                  style={{ backgroundColor: Colors.primary }}
                  className="h-16 w-16 items-center justify-center rounded-2xl"
                >
                  <Text className="text-2xl font-bold text-white">
                    {profile.UserName.charAt(0)}
                  </Text>
                </View>
                <View>
                  <Text style={{ color: Colors.text }} className="font-bold">
                    {profile.UserName}
                  </Text>
                  <Text style={{ color: Colors.textMuted }} className="text-sm">
                    {profile.UserEmail}
                  </Text>
                </View>
              </View>
            )}

            <View>
              <Text style={{ color: Colors.textSecondary }} className="mb-2 text-sm font-semibold">
                Título profissional
              </Text>
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="Ex: Desenvolvedor Fullstack"
                placeholderTextColor={Colors.slate400}
                style={inputStyle}
                className="rounded-xl border px-4 py-3"
              />
            </View>

            <View>
              <Text style={{ color: Colors.textSecondary }} className="mb-2 text-sm font-semibold">
                Sobre você
              </Text>
              <TextInput
                value={bio}
                onChangeText={setBio}
                placeholder="Descreva sua experiência e serviços."
                placeholderTextColor={Colors.slate400}
                multiline
                style={{ ...inputStyle, minHeight: 96, textAlignVertical: 'top' }}
                className="rounded-xl border px-4 py-3"
              />
            </View>

            <View>
              <Text style={{ color: Colors.textSecondary }} className="mb-2 text-sm font-semibold">
                Categoria
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {categories.map((cat) => {
                  const selected = categoryId === cat.Id;
                  return (
                    <Pressable
                      key={cat.Id}
                      onPress={() => setCategoryId(cat.Id)}
                      style={{
                        backgroundColor: selected ? Colors.primary : Colors.slate100,
                        borderColor: selected ? Colors.primary : Colors.slate200,
                      }}
                      className="rounded-full border px-3 py-1.5"
                    >
                      <Text
                        style={{ color: selected ? Colors.white : Colors.textSecondary }}
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
                <Text style={{ color: Colors.textSecondary }} className="mb-2 text-sm font-semibold">
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
                          backgroundColor: selected ? Colors.primary : Colors.slate100,
                          borderColor: selected ? Colors.primary : Colors.slate200,
                        }}
                        className="flex-row items-center gap-1.5 rounded-full border px-3 py-1.5"
                      >
                        {selected && (
                          <Ionicons name="checkmark" size={12} color={Colors.white} />
                        )}
                        <Text
                          style={{ color: selected ? Colors.white : Colors.textSecondary }}
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
              <Text style={{ color: Colors.textSecondary }} className="mb-2 text-sm font-semibold">
                Localização
              </Text>
              <TextInput
                value={location}
                onChangeText={setLocation}
                placeholder="Ex: Ipatinga, MG"
                placeholderTextColor={Colors.slate400}
                style={inputStyle}
                className="rounded-xl border px-4 py-3"
              />
            </View>

            <View>
              <Text style={{ color: Colors.textSecondary }} className="mb-2 text-sm font-semibold">
                Valor por hora (R$)
              </Text>
              <TextInput
                value={price}
                onChangeText={setPrice}
                placeholder="80"
                placeholderTextColor={Colors.slate400}
                keyboardType="numeric"
                style={inputStyle}
                className="rounded-xl border px-4 py-3"
              />
            </View>

            <View>
              <Text style={{ color: Colors.textSecondary }} className="mb-2 text-sm font-semibold">
                Faixa de preço
              </Text>
              <TextInput
                value={priceRange}
                onChangeText={setPriceRange}
                placeholder="Ex: R$ 50 - R$ 150/hora"
                placeholderTextColor={Colors.slate400}
                style={inputStyle}
                className="rounded-xl border px-4 py-3"
              />
            </View>

            <View className="flex-row items-center gap-3">
              <Pressable
                onPress={() => setAvailable(!available)}
                style={{
                  backgroundColor: available ? Colors.primary : Colors.slate300,
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
              <Text style={{ color: Colors.textSecondary }} className="text-sm">
                {available ? 'Disponível para contratação' : 'Indisponível no momento'}
              </Text>
            </View>

            <View className="flex-row gap-3">
              <Pressable
                onPress={() => router.back()}
                style={{ borderColor: Colors.slate200, flex: 1 }}
                className="rounded-xl border py-3"
              >
                <Text style={{ color: Colors.textSecondary }} className="text-center text-sm font-semibold">
                  Cancelar
                </Text>
              </Pressable>
              <Pressable
                onPress={handleSubmit}
                disabled={saving}
                style={{ backgroundColor: Colors.primary, flex: 1, opacity: saving ? 0.6 : 1 }}
                className="rounded-xl py-3"
              >
                <Text className="text-center text-sm font-semibold text-white">
                  {saving ? 'Salvando...' : 'Salvar alterações'}
                </Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
