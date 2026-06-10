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
import { Input } from '@/src/shared/components/Input';
import { Button } from '@/src/shared/components/Button';
import { Loading } from '@/src/shared/components/Loading';
import { getCategories, getTagsByCategory } from '@/src/services/categoryService';
import { createMyProfile } from '@/src/services/profileService';
import { useAuth } from '@/src/features/auth/hooks/useAuth';
import type { Category, CategoryTag } from '@/src/types/category';

export default function CompleteProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { refreshProfile } = useAuth();

  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<CategoryTag[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState('');
  const [bio, setBio] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [location, setLocation] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [available, setAvailable] = useState(true);

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(() => Alert.alert('Erro', 'Não foi possível carregar as categorias.'))
      .finally(() => setLoadingData(false));
  }, []);

  useEffect(() => {
    if (!selectedCategoryId) { setTags([]); return; }
    getTagsByCategory(selectedCategoryId).then(setTags).catch(() => setTags([]));
  }, [selectedCategoryId]);

  function toggleTag(id: string) {
    setSelectedTagIds((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id],
    );
  }

  async function handleSave() {
    if (!selectedCategoryId) { Alert.alert('Atenção', 'Selecione uma categoria.'); return; }
    setSaving(true);
    try {
      await createMyProfile({
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
      router.replace('/home');
    } catch (err: any) {
      Alert.alert('Erro', err.response?.data?.message ?? 'Não foi possível criar o perfil.');
    } finally {
      setSaving(false);
    }
  }

  if (loadingData) return <Loading message="Carregando categorias..." />;

  return (
    <ScrollView
      className="flex-1 bg-slate-950"
      contentContainerStyle={{ paddingTop: insets.top + 24, paddingBottom: insets.bottom + 32, paddingHorizontal: 24 }}
      keyboardShouldPersistTaps="handled"
    >
      <Text className="text-3xl font-bold text-white mb-2">Complete seu perfil</Text>
      <Text className="text-slate-400 text-sm mb-6 leading-5">
        Preencha seu perfil para aparecer nas buscas e receber pedidos de serviço.
      </Text>

      <Input label="Título profissional" value={title} onChangeText={setTitle} placeholder="Ex: Desenvolvedor Full-Stack" />
      <Input label="Bio (resumo)" value={bio} onChangeText={setBio} placeholder="Uma linha sobre você" />
      <Input
        label="Descrição"
        value={description}
        onChangeText={setDescription}
        placeholder="Descreva sua experiência e serviços"
        multiline
        numberOfLines={4}
        className="h-24 pt-3"
        textAlignVertical="top"
      />
      <Input label="Localização" value={location} onChangeText={setLocation} placeholder="Ex: São Paulo, SP" />
      <Input label="Faixa de preço" value={priceRange} onChangeText={setPriceRange} placeholder="Ex: R$ 50–200/h" />

      <Text className="text-slate-300 text-sm font-medium mb-2 mt-1">Categoria *</Text>
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
        <Switch
          value={available}
          onValueChange={setAvailable}
          trackColor={{ true: '#7c3aed', false: '#334155' }}
          thumbColor="#ffffff"
        />
      </View>

      <Button label="Salvar perfil" onPress={handleSave} loading={saving} className="mb-2" />
    </ScrollView>
  );
}
