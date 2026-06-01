import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Input } from '@/src/shared/components/Input';
import { Button } from '@/src/shared/components/Button';
import { Loading } from '@/src/shared/components/Loading';
import { getCategories, getTagsByCategory } from '@/src/services/categoryService';
import { updateMyProfile } from '@/src/services/profileService';
import { useAuth } from '@/src/features/auth/hooks/useAuth';
import type { Category, CategoryTag } from '@/src/types/category';

export default function EditProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { profile, refreshProfile } = useAuth();

  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<CategoryTag[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState(profile?.Title ?? '');
  const [bio, setBio] = useState(profile?.Bio ?? '');
  const [description, setDescription] = useState(profile?.Description ?? '');
  const [selectedCategoryId, setSelectedCategoryId] = useState(profile?.CategoryId ?? '');
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(profile?.Tags.map((t) => t.Id) ?? []);
  const [location, setLocation] = useState(profile?.Location ?? '');
  const [priceRange, setPriceRange] = useState(profile?.PriceRange ?? '');
  const [available, setAvailable] = useState(profile?.Available ?? true);

  useEffect(() => {
    getCategories().then(setCategories).catch(() => {}).finally(() => setLoadingData(false));
  }, []);

  useEffect(() => {
    if (!selectedCategoryId) { setTags([]); return; }
    getTagsByCategory(selectedCategoryId).then(setTags).catch(() => setTags([]));
  }, [selectedCategoryId]);

  function toggleTag(id: string) {
    setSelectedTagIds((prev) => prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]);
  }

  async function handleSave() {
    if (!selectedCategoryId) { Alert.alert('Atenção', 'Selecione uma categoria.'); return; }
    setSaving(true);
    try {
      await updateMyProfile({
        Title: title || undefined,
        Bio: bio || undefined,
        Description: description || undefined,
        CategoryId: selectedCategoryId,
        TagIds: selectedTagIds,
        Location: location || undefined,
        PriceRange: priceRange || undefined,
        Available: available,
      });
      await refreshProfile();
      router.back();
    } catch (err: any) {
      Alert.alert('Erro', err.response?.data?.message ?? 'Não foi possível salvar.');
    } finally { setSaving(false); }
  }

  if (loadingData) return <Loading />;

  return (
    <ScrollView
      className="flex-1 bg-slate-950"
      contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: insets.bottom + 32, paddingHorizontal: 24 }}
      keyboardShouldPersistTaps="handled"
    >
      <View className="flex-row justify-between items-center mb-6">
        <TouchableOpacity onPress={() => router.back()} className="p-1">
          <Ionicons name="arrow-back" size={24} color="#f8fafc" />
        </TouchableOpacity>
        <Text className="text-white text-lg font-bold">Editar perfil</Text>
        <View className="w-8" />
      </View>

      <Input label="Título profissional" value={title} onChangeText={setTitle} placeholder="Ex: Designer UI/UX" />
      <Input label="Bio" value={bio} onChangeText={setBio} placeholder="Resumo em uma linha" />
      <Input
        label="Descrição"
        value={description}
        onChangeText={setDescription}
        placeholder="Descreva seus serviços"
        multiline
        numberOfLines={4}
        className="h-24 pt-3"
        textAlignVertical="top"
      />
      <Input label="Localização" value={location} onChangeText={setLocation} placeholder="Ex: São Paulo, SP" />
      <Input label="Faixa de preço" value={priceRange} onChangeText={setPriceRange} placeholder="Ex: R$ 80–300/h" />

      <Text className="text-slate-300 text-sm font-medium mb-2">Categoria *</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
        <View className="flex-row gap-2 pr-2">
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.Id}
              className={`px-4 py-2 rounded-full border ${selectedCategoryId === cat.Id ? 'bg-primary border-primary' : 'bg-slate-800 border-slate-700'}`}
              onPress={() => { setSelectedCategoryId(cat.Id); setSelectedTagIds([]); }}
            >
              <Text className={`text-sm font-medium ${selectedCategoryId === cat.Id ? 'text-white' : 'text-slate-400'}`}>
                {cat.Name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {tags.length > 0 && (
        <>
          <Text className="text-slate-300 text-sm font-medium mb-2">Habilidades / Tags</Text>
          <View className="flex-row flex-wrap gap-2 mb-4">
            {tags.map((tag) => (
              <TouchableOpacity
                key={tag.Id}
                className={`px-3.5 py-2 rounded-full border ${selectedTagIds.includes(tag.Id) ? 'bg-primary border-primary' : 'bg-slate-800 border-slate-700'}`}
                onPress={() => toggleTag(tag.Id)}
              >
                <Text className={`text-sm font-medium ${selectedTagIds.includes(tag.Id) ? 'text-white' : 'text-slate-400'}`}>
                  {tag.Name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}

      <View className="flex-row justify-between items-center mb-6">
        <Text className="text-slate-200 text-[15px] font-medium">Disponível para trabalhos</Text>
        <Switch value={available} onValueChange={setAvailable} trackColor={{ true: '#7c3aed', false: '#334155' }} thumbColor="#ffffff" />
      </View>

      <Button label="Salvar alterações" onPress={handleSave} loading={saving} />
    </ScrollView>
  );
}
