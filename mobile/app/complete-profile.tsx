import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Input } from '@/src/shared/components/Input';
import { Button } from '@/src/shared/components/Button';
import { Loading } from '@/src/shared/components/Loading';
import { Colors } from '@/src/shared/constants/colors';
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
    getTagsByCategory(selectedCategoryId)
      .then(setTags)
      .catch(() => setTags([]));
  }, [selectedCategoryId]);

  function toggleTag(id: string) {
    setSelectedTagIds((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id],
    );
  }

  async function handleSave() {
    if (!selectedCategoryId) {
      Alert.alert('Atenção', 'Selecione uma categoria.');
      return;
    }
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
      style={styles.flex}
      contentContainerStyle={[styles.container, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 32 }]}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>Complete seu perfil</Text>
      <Text style={styles.subtitle}>
        Todos os usuários também são profissionais. Preencha seu perfil para aparecer nas buscas.
      </Text>

      <Input label="Título profissional" value={title} onChangeText={setTitle} placeholder="Ex: Desenvolvedor Full-Stack" />
      <Input label="Bio (resumo curto)" value={bio} onChangeText={setBio} placeholder="Uma linha sobre você" />
      <Input
        label="Descrição"
        value={description}
        onChangeText={setDescription}
        placeholder="Descreva sua experiência e serviços"
        multiline
        numberOfLines={4}
        style={styles.multiline}
      />
      <Input label="Localização" value={location} onChangeText={setLocation} placeholder="Ex: São Paulo, SP" />
      <Input label="Faixa de preço" value={priceRange} onChangeText={setPriceRange} placeholder="Ex: R$ 50–200/h" />

      <Text style={styles.sectionLabel}>Categoria *</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chips}>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat.Id}
            style={[styles.chip, selectedCategoryId === cat.Id && styles.chipActive]}
            onPress={() => { setSelectedCategoryId(cat.Id); setSelectedTagIds([]); }}
          >
            <Text style={[styles.chipText, selectedCategoryId === cat.Id && styles.chipTextActive]}>
              {cat.Name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {tags.length > 0 && (
        <>
          <Text style={styles.sectionLabel}>Habilidades / Tags</Text>
          <View style={styles.tagsWrap}>
            {tags.map((tag) => (
              <TouchableOpacity
                key={tag.Id}
                style={[styles.chip, selectedTagIds.includes(tag.Id) && styles.chipActive]}
                onPress={() => toggleTag(tag.Id)}
              >
                <Text style={[styles.chipText, selectedTagIds.includes(tag.Id) && styles.chipTextActive]}>
                  {tag.Name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}

      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>Disponível para trabalhos</Text>
        <Switch
          value={available}
          onValueChange={setAvailable}
          trackColor={{ true: Colors.secondary, false: Colors.border }}
          thumbColor={Colors.surface}
        />
      </View>

      <Button label="Salvar perfil" onPress={handleSave} loading={saving} style={styles.btn} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },
  container: { paddingHorizontal: 24 },
  title: { fontSize: 24, fontWeight: '800', color: Colors.text, marginBottom: 8 },
  subtitle: { fontSize: 14, color: Colors.textSecondary, marginBottom: 24, lineHeight: 20 },
  sectionLabel: { fontSize: 14, fontWeight: '600', color: Colors.text, marginBottom: 8, marginTop: 4 },
  chips: { marginBottom: 16 },
  tagsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.surfaceAlt,
    borderWidth: 1.5,
    borderColor: Colors.border,
    marginRight: 8,
  },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: { fontSize: 13, color: Colors.textSecondary, fontWeight: '500' },
  chipTextActive: { color: Colors.textOnPrimary },
  multiline: { height: 100, textAlignVertical: 'top', paddingTop: 12 },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  switchLabel: { fontSize: 15, color: Colors.text, fontWeight: '500' },
  btn: { marginTop: 8 },
});
